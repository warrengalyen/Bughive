export { Context } from './Context';
import * as accounts from './account';
import * as comments from './comments';
import * as issues from './issues';
import * as issueChanges from './issueChanges';
import * as labels from './labels';
import * as memberships from './memberships';
import * as projects from './projects';
import * as projectPrefs from './projectPrefs';
import * as templates from './template';

export const resolverMap = {
    Query: {
        ...accounts.queries,
        ...comments.queries,
        ...issues.queries,
        ...issueChanges.queries,
        ...labels.queries,
        ...projects.queries,
        ...projectPrefs.queries,
        ...templates.queries,
    },
    Mutation: {
        ...accounts.mutations,
        ...issues.mutations,
        ...labels.mutations,
        ...projects.mutations,
        ...projectPrefs.mutations,
        ...templates.mutations,
    },
    Subscription: {
        ...issues.subscriptions,
        ...labels.subscriptions,
        ...projects.subscriptions,
        ...projectPrefs.subscriptions,
    },
    ...accounts.types,
    ...comments.types,
    ...issues.types,
    ...issueChanges.types,
    ...labels.types,
    ...memberships.types,
    ...projects.types,
    ...projectPrefs.types,
    ...templates.types,
};
