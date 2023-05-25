import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth2';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { AccountRecord } from '../db/types';
import { Errors } from '../../../common/types/json';
import { logger } from '../logger';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jwt-simple';
import * as passport from 'passport';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { URL } from 'url';
import { server } from '../Server';
import { sendEmailVerify } from '../mail';
import { handleAsyncErrors } from './errors';
import { ObjectID } from 'bson';

const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

function makeCallbackUrl(pathname: string, next?: string): string {
    const url = new URL(`http://placeholder`);
    if (process.env.KDT_CLIENT_HTTPS && process.env.KDT_CLIENT_HTTPS !== 'false') {
        url.protocol = 'https';
    }
    url.hostname = process.env.KDT_CLIENT_HOSTNAME;
    url.pathname = pathname;
    if (process.env.KDT_CLIENT_PORT && process.env.KDT_CLIENT_PORT !== '80') {
        url.port = process.env.KDT_CLIENT_PORT;
    }
    if (next) {
        url.search = `next=${encodeURIComponent(next)}`;
    }
    return url.toString();
}

function makeSessionUrl(session: SessionState, next?: string): string {
    const url = new URL(next || 'http://placeholder');
    if (process.env.BH_CLIENT_HTTPS && process.env.BH_CLIENT_HTTPS !== 'false') {
        url.protocol = 'https';
    }
    url.hostname = process.env.BH_CLIENT_HOSTNAME;
    // url.pathname = pathname;
    if (process.env.BH_CLIENT_PORT && process.env.BH_CLIENT_PORT !== '80') {
        url.port = process.env.BH_CLIENT_PORT;
    }
    const query: any = {
        token: jwt.encode(session, jwtOpts.secretOrKey),
    };
    if (next) {
        query.next = next;
    }
    url.search = `?${qs.stringify(query)}`;
    return url.toString();
}

interface SessionState {
    uid: ObjectID;
}

async function getOrCreateUserAccount(email: string, verified: boolean): Promise<SessionState> {
    // @ts-ignore
    const accounts = await server.db.collection('accounts').find<AccountRecord>({ email }).toArray();
    if (accounts.length > 0) {
        return { uid: accounts[0]._id };
    }
    const account: AccountRecord = {
        type: 'user',
        email,
        display: '',
        verified,
    };
    const result = await server.db.collection('accounts').insertOne(account);
    return { uid: result.insertedId };
    // return accountsTable.insert(account).run(server.conn).then(insertResult => {
    //   return { uid: insertResult.generated_keys[0] };
    // });
}

// Will use JWT strategy and fall back to anonymous if they are not logged in.
server.app.use(
    ['/auth', '/graphql'], passport.initialize());
server.app.use(
    ['/auth', '/graphql'], passport.authenticate(['jwt', 'anonymous'], { session: false }));

// Set up JWT strategy
passport.use(new JwtStrategy(jwtOpts, async (payload: SessionState, done) => {
    const account =
        await server.db.collection('accounts').findOne<AccountRecord>({ _id: payload.uid });
    done(null, account);
}));

// Set up Anonymous strategy
passport.use(new AnonymousStrategy());

// Google OAuth2 login.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: makeCallbackUrl('/auth/google/callback'),
    }, async (accessToken, refreshToken, profile, done) => {
        if (profile.emails.length > 0) {
            const session = await getOrCreateUserAccount(profile.emails[0].value, true);
            done(null, session);
        } else {
            done(Error('missing email'));
        }
    }));

    server.app.get('/auth/google', (req, res, next) => {
        const options = {
            session: false,
            scope: ['openid', 'email', 'profile'],
            callbackURL: makeCallbackUrl('/auth/google/callback', req.query.next),
        };
        passport.authenticate('google', options as passport.AuthenticateOptions)(req, res, next);
    });

    server.app.get('/auth/google/callback',
        (req, res, next) => {
            passport.authenticate('google', {
                session: false,
                failureRedirect: '/account/login',
                failureFlash: 'Login failed.',
            }, (err: any, session: SessionState) => {
                if (err) {
                    next(err);
                } else {
                    res.redirect(makeSessionUrl(session, req.query.next));
                }
            })(req, res, next);
        });
}

// Github OAuth login.
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: makeCallbackUrl('/auth/github/callback'),
    }, async (accessToken: any, refreshToken: any, profile: any, done: VerifyCallback) => {
        if (profile.emails.length > 0) {
            const session = await getOrCreateUserAccount(profile.emails[0].value, true);
            done(null, session);
        } else {
            done(Error('missing email'));
        }
    }));

    server.app.get('/auth/github', (req, res, next) => {
        const options = {
            session: false,
            // callbackURL: makeCallbackUrl('/auth/github/callback', req.query.next),
        };
        passport.authenticate('github', options as passport.AuthenticateOptions)(req, res, next);
    });

    server.app.get('/auth/github/callback',
        (req, res, next) => {
            passport.authenticate('github', {
                session: false,
                failureRedirect: '/account/login',
                failureFlash: 'Login failed.',
            }, (err: any, session: SessionState) => {
                if (err) {
                    next(err);
                    return;
                }
                res.redirect(makeSessionUrl(session, req.query.next));
            })(req, res, next);
        });
}

// Signup handler
server.app.post('/auth/signup', handleAsyncErrors(async (req, res) => {
    const { email, password } = req.body;
    // TODO: Validate email, username, fullname.
    if (email.length < 3) {
        res.status(400).json({ error: Errors.INVALID_EMAIL });
    } else if (password.length < 5) {
        res.status(400).json({ error: Errors.PASSWORD_TOO_SHORT });
    } else {
        // console.log('signup', username, fullname);
        const users = await server.db.collection('accounts').find({ email }).toArray();
        if (users.length > 0) {
            // User name taken
            res.status(400).json({ error: Errors.EXISTS });
        } else {
            // Compute password hash
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    logger.error('Password hash error:', err);
                    res.status(500).json({ error: Errors.INTERNAL });
                } else {
                    // console.log(user, fullname);
                    const ur: AccountRecord = {
                        email,
                        type: 'user',
                        display: null,
                        password: hash,
                        photo: null,
                        verified: false,
                    };
                    server.db.collection('accounts').insertOne(ur).then(u => {
                        logger.info('User creation successful:', { email });
                        const session: SessionState = {
                            uid: u.insertedIds,
                        };
                        const token = jwt.encode(session, jwtOpts.secretOrKey);
                        res.json({ token });
                    }, reason => {
                        logger.error('User creation failed:', { email });
                        res.status(500).json({ error: Errors.INTERNAL });
                    });
                }
            });
        }
    }
}));

// Login handler
server.app.post('/auth/login', handleAsyncErrors(async (req, res) => {
    const { email, password } = req.body;
    if (!email || email.length < 3) {
        res.status(400).json({ error: Errors.INVALID_EMAIL });
        return;
    }

    const accounts = await server.db.collection('accounts').find<AccountRecord>({ email }).toArray();
    if (accounts.length === 0) {
        res.status(404).json({ error: Errors.NOT_FOUND });
    } else if (accounts.length > 1) {
        logger.error('Multiple users with the same email:', { email });
        res.status(500).json({ error: Errors.CONFLICT });
    } else {
        const account = accounts[0];
        if (!account.password) {
            res.status(401).json({ error: Errors.INCORRECT_PASSWORD });
            return;
        }

        // Compare user password hash with password.
        bcrypt.compare(password, account.password, (err, same) => {
            if (same) {
                logger.info('Login successful:', { email, user: account.accountName });
                const session: SessionState = {
                    uid: account._id,
                };
                const token = jwt.encode(session, jwtOpts.secretOrKey);
                res.json({ token });
            } else if (err) {
                logger.error('User login error:', err);
                res.status(500).json({ error: Errors.INTERNAL });
            } else {
                res.status(401).json({ error: Errors.INCORRECT_PASSWORD });
            }
        });
    }
}));

// Send verify email address
server.app.post('/auth/sendverify', handleAsyncErrors(async (req, res) => {
    const { email } = req.body;
    // TODO: Validate email, username, fullname.
    if (email.length < 3) {
        res.status(400).json({ error: Errors.INVALID_EMAIL });
        return;
    }

    const accounts = await server.db.collection('accounts').find<AccountRecord>({ email }).toArray();
    if (accounts.length === 0) {
        logger.error('Attempt to verify unknown email:', { email });
        res.status(404).json({ error: Errors.NOT_FOUND });
    } else if (accounts.length > 1) {
        logger.error('Multiple users with the same email:', { email });
        res.status(500).json({ error: Errors.CONFLICT });
    } else {
        const account = accounts[0];
        if (account.type !== 'user') {
            logger.error('Attempt to verify email for organization:', { email });
            res.status(404).json({ error: Errors.NOT_FOUND });
            return;
        }

        account.verificationToken = crypto.randomBytes(20).toString('hex');

        await server.db.collection('accounts')
            .updateOne({ _id: account._id }, { verificationToken: account.verificationToken });

        sendEmailVerify(account).then(() => {
            logger.info('Sent verification email to:', account.email);
            res.end();
        }, error => {
            res.status(500).json(error);
        });
    }
}));

// Send verify email address
server.app.post('/auth/verify', handleAsyncErrors(async (req, res) => {
    const { email, token } = req.body;
    // TODO: Validate email, username, fullname.
    if (email.length < 3) {
        res.status(400).json({ error: Errors.INVALID_EMAIL });
        return;
    }

    const accounts = await server.db.collection('accounts').find<AccountRecord>({ email }).toArray();
    if (accounts.length === 0) {
        logger.error('Attempt to verify unknown email:', { email });
        res.status(404).json({ error: Errors.NOT_FOUND });
    } else if (accounts.length > 1) {
        logger.error('Multiple users with the same email:', { email });
        res.status(500).json({ error: Errors.CONFLICT });
    } else {
        const account = accounts[0];
        if (account.type !== 'user') {
            logger.error('Attempt to verify email for organization:', { email });
            res.status(404).json({ error: Errors.NOT_FOUND });
            return;
        }

        if (account.verificationToken !== token) {
            await server.db.collection('accounts')
                .updateOne({ _id: account._id }, { verificationToken: null, verified: true });
            logger.info('Account verified:', { email });
            res.end();
        } else {
            logger.error('Invalid token:', { email, token });
            res.status(404).json({ error: Errors.INVALID_TOKEN });
        }
    }
}));
