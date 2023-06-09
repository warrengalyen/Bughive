import * as React from 'react';
import classNames from 'classnames';
import { Query } from 'react-apollo';
import { hsl } from 'polished';
import { PublicAccount } from '../../../common/types/graphql';
import { styled } from '../style';
import gql from 'graphql-tag';
import DefaultAvatar from '../icons/default-avatar.png';
import { contrastingColor } from '../lib/contrastingColor';

const avatarQuery = gql`
    query AvatarQuery($accountName: String, $id: ID) {
        account(accountName: $accountName, id: $id) { id, accountName, display, photo }
    }
`;

interface Props {
    id?: string;
    accountName?: string;
    small?: boolean;
}

/** Compute initials from user name. */
function initials(name: string): string {
    return name ? (name.match(/\b\w/g) || []).join('').slice(0, 3) : null;
}

const AvatarImg = styled.div`
  align-items: center;
  background-size: cover;
  border-radius: 50%;
  display: inline-flex;
  font-size: .9rem;
  height: 32px;
  justify-content: center;
  overflow: hidden;
  width: 32px;

  &.small {
    height: 24px;
    width: 24px;
  }

  &.loading {
    background-color: #ddd;
  }

  &.error {
    background-color: #faa;
  }
`;

export function Avatar({ id, accountName, small }: Props) {
    return (
        <Query query={avatarQuery} variables={{ id, accountName }} >
            {({ loading, error, data }) => {
                if (loading) {
                    return <AvatarImg className={classNames('avatar', 'loading', { small })} />;
                } else if (error) {
                    return <AvatarImg className={classNames('avatar', 'error', { small })} />;
                } else {
                    const account: PublicAccount = data.account;
                    if (account.photo) {
                        // Use the account photo
                        return (
                            <AvatarImg
                                className={classNames('avatar', { small })}
                                style={{ backgroundImage: `url(${account.photo})` }}
                                title={data.display}
                                data-name={account.accountName}
                                data-id={account.id}
                            />
                        );
                    } else if (account.id && account.display) {
                        // Compute a background tint
                        const hue = parseInt(account.id, 16) % 32 * 630 / 32;
                        const backgroundColor = hsl(hue, 1, 0.7);
                        const color = contrastingColor(backgroundColor);
                        // Display initials
                        return (
                            <AvatarImg
                                className={classNames('avatar', { small })}
                                title={data.display}
                                data-name={account.accountName}
                                data-id={account.id}
                                style={{ backgroundColor, color }}
                            >
                                {initials(account.display)}
                            </AvatarImg>
                        );
                    } else {
                        // Display default avatar image
                        return (
                            <AvatarImg
                                className={classNames('avatar', { small })}
                                style={{ backgroundImage: `url(${DefaultAvatar})` }}
                                title={data.display}
                                data-name={account.accountName}
                                data-id={account.id}
                            />
                        );
                    }
                }
            }}
        </Query>
    );
}
