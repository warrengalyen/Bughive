import * as React from 'react';
import { styled } from '../style';
import bind from 'bind-decorator';
import classNames from 'classnames';

/** Drop-down menu class. */
export const Menu = styled.div.attrs(() => ({
    role: 'menu'
}))`
  background-color: ${props => props.theme.menuBgColor};
  border: 1px solid ${props => props.theme.menuBorderColor};
  border-radius: 3px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  margin: 4px 0;
  min-width: 150px;
  overflow-x: hidden;
  position: absolute;
  padding: 4px;
  z-index: 2;
`;

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    eventKey?: string;
    onClick?: (e: any) => void;
}

export class MenuItemImpl extends React.Component<MenuItemProps> {
    public render() {
        const { onClick, active, eventKey, className, ...props } = this.props;
        return (
            <button
                {...props}
                role="menuitem"
                data-event-key={eventKey}
                className={classNames(className, { active })}
                onClick={this.onClick}
                onKeyDown={this.onKeyDown}
            />
        );
    }

    @bind
    public onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (e.key === 'Enter' || e.key === ' ') {
            if (this.props.onClick) {
                this.props.onClick(e);
            }
        }
    }

    @bind
    public onClick(e: any) {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    }
}

/** Menu item. */
export const MenuItem = styled(MenuItemImpl).attrs(() => ({
    tabIndex: -1,
}))`
  background-color: transparent;
  border: none;
  color: ${props => props.theme.menuTextColor};
  /* cursor: pointer; */
  display: flex;
  flex-direction: row;
  outline: none;
  padding: 4px;

  &:hover {
    background-color: ${props => props.theme.menuHoverBgColor};
    color: ${props => props.theme.menuHoverTextColor};
  }

  &:focus {
    background-color: ${props => props.theme.menuFocusBgColor};
    color: ${props => props.theme.menuFocusTextColor};
  }

  &.active {
    background-color: ${props => props.theme.menuActiveBgColor};
    color: ${props => props.theme.menuActiveTextColor};
    font-weight: bold;
  }
`;

/** Menu divider. */
export const MenuDivider = styled.div`
  align-self: stretch;
  border-bottom: 1px solid ${props => props.theme.menuDividerColor};
  display: block;
  margin: 2px 0;
`;
