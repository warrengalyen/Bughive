import * as FormData from 'form-data';
import * as qs from 'qs';
import { URL } from 'url';
import { AccountRecord } from '../db/types';
import { sendEmail } from './sendEmail';

export function sendEmailVerify(account: AccountRecord): Promise<any> {
    const email = process.env.OVERRIDE_EMAIL_ADDR || account.email;
    const resetUrl = new URL(process.env.BH_CLIENT_HTTPS === 'true' ? 'https://p' : 'http://');
    resetUrl.hostname = process.env.BH_CLIENT_HOSTNAME;
    resetUrl.port = process.env.BH_CLIENT_PORT;
    resetUrl.pathname = `/account/verify`;
    resetUrl.search = qs.stringify({
        email: account.email,
        token: account.verificationToken,
    }, { addQueryPrefix: true });

    // Text body
    const textBody = `
    Account verification for: ${account.display || account.email}.
    Please confirm that you want to use this email address for your Bughive account.
    Use this link to verify your email address: ${resetUrl.toString()}
    If you did not sign up for Bughive, you can ignore this message.
  `;

    const htmlBody = `
<section>
  <p>Account verificatiton for: ${account.display || account.email}.</p>
  <p>Please confirm that you want to use this email address for your Bughive account.</p>
  <a href="${resetUrl.toString()}">Click here to verify your email address.</a>
  <p>If you did not sign up for Bughive, you can ignore this message.</p>
</section>
  `;

    // HTML email
    const form = new FormData();
    form.append('from', 'Bughive <noreply@mail.bughive.io>');
    form.append('to', email);
    form.append('subject', 'Bughive Email Verification');
    form.append('text', textBody);
    form.append('html', htmlBody);
    return sendEmail(form);
}
