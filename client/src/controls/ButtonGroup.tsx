import * as React from 'react';
import classNames from 'classnames';
import { styled, ThemeProps } from '../style';

export interface ButtonGroupProps {
    children?: React.ReactNode;
    className?: string;
    vertical?: boolean;
}

function ButtonGroupImpl({ children, className, vertical, ...attrs }: ButtonGroupProps) {
    return (
        <div className={classNames(className, { vertical })} {...attrs}>
            {children}
        </div>
    );
}

export const ButtonGroup = styled(ButtonGroupImpl)`
  align-items: center;
  border: none;
  background-color: ${(props: ThemeProps) => props.theme.buttonColors.default.bg};
  display: inline-flex;
  flex-direction: row;
  &.vertical {
    flex-direction: column;
  }
  > button {
    border-radius: 0;
    margin-right: -1px;
    &:first-child {
      border-radius: 4px 0 0 4px;
    }
    &:last-child {
      border-radius: 0 4px 4px 0;
      margin-right: 0;
    }
  }
`;
