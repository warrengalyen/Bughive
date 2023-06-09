import * as React from 'react';
import { styled } from '../style';
import { Switch, Route } from 'react-router';
import { SignInLink } from './SignInLink';
import { UserMenuButton } from './UserMenuButton';
import { ViewContext } from '../models';
import { NewIssueButton } from './NewIssueButton';

const HeaderLayout = styled.header`
  align-items: center;
  background-color: ${props => props.theme.headerBgColor};
  color: ${props => props.theme.headerTitleColor};
  display: flex;
  grid-area: header;
  padding: 5px 5px 5px 8px;

  > button {
    margin-right: 4px;
  }
`;

const HeaderTitle = styled.span`
  font-family: 'Russo One';
  font-size: 1.7rem;
  margin-right: .4rem;
`;

const HeaderSubTitle = styled.span`
  color: ${props => props.theme.headerSubTitleColor};
  flex: 1;
`;

interface Props {
    context: ViewContext;
}

export function Header({ context }: Props) {
    return (
        <HeaderLayout>
            <HeaderTitle className="title">Bughive</HeaderTitle>
            <HeaderSubTitle className="subtitle">

            </HeaderSubTitle>
            <Route path="/" render={props => <NewIssueButton context={context} {...props} />} />
            <Switch>
                <Route path="/account" />
                <Route path="/" component={UserMenuButton} />
            </Switch>
            <Switch>
                <Route path="/account" />
                <Route path="/settings" />
                <Route path="/" component={SignInLink} />
            </Switch>
        </HeaderLayout>
    );
}
