import * as React from 'react';
import classNames from 'classnames';
import { styled } from '../style';
import { darken } from 'polished';
import { ButtonStyle } from './Button';

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    small?: boolean;
    kind?: ButtonStyle;
    disabled?: boolean;
}

function LinkButtonImpl({ children, className, kind, small, ...attrs }: LinkButtonProps) {
    return (
        <a className={classNames(className, kind, { small })} {...attrs}>
            {children}
        </a>
    );
}

/** Looks like a button, but is actually an anchor tag. */
export const LinkButton = styled(LinkButtonImpl)`
  align-items: center;
  border: ${props => props.theme.buttonColors[props.kind].border
    ? `1px solid ${props.theme.buttonColors[props.kind].border}` : 'none'};
  border-radius: 4px;
  background-color: ${props => props.theme.buttonColors[props.kind].bg};
  color: ${props => props.theme.buttonColors[props.kind].text};
  display: inline-flex;
  padding: 0 12px;
  height: 32px;
  outline: none;
  text-decoration: none;
  &[disabled] {
    opacity: 0.7;
    pointer-events: none;
  }
  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.focusColor};
    z-index: 1;
  }
  &:hover:not([disabled]) {
    background-color: ${props => darken(0.05, props.theme.buttonColors[props.kind].bg)};
  }
  &:active:not([disabled]) {
    background-color: ${props => darken(0.15, props.theme.buttonColors[props.kind].bg)};
  }
  &.small {
    height: 24px;
    font-size: 90%;
  }
  > svg {
    margin-right: 4px;
    margin-left: -5px;
    fill: ${props => props.theme.buttonColors[props.kind].text};
  }
`;

LinkButton.defaultProps = { kind: 'default' };
