import * as React from 'react';
import classNames from 'classnames';
import { styled } from '../style';
type Props = React.InputHTMLAttributes<HTMLInputElement>;
const CheckBoxImpl = React.forwardRef(({ children, className, ...props }: Props, ref: any) => {
    const disabled = props.disabled;
    return (
        <label className={classNames(className, { disabled })}>
            <input type="checkbox" ref={ref} {...props} />
            {children && <span className="caption">{children}</span>}
        </label>
    );
});

export const CheckBox = styled(CheckBoxImpl)`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  > input {
    margin-right: 6px;
    &:last-child {
      margin-right: 0;
    }
  }
  &.disabled {
    cursor: default;
    > .caption {
      opacity: 0.7;
    }
  }
`;

const RadioButtonImpl = React.forwardRef(({ children, className, ...props }: Props, ref: any) => {
    const disabled = props.disabled;
    return (
        <label className={classNames(className, { disabled })}>
            <input type="radio" ref={ref} {...props} />
            <span className="caption">{children}</span>
        </label>
    );
});

export const RadioButton = styled(RadioButtonImpl)`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  > input {
    margin-right: 6px;
  }
  &.disabled {
    cursor: default;
    > .caption {
      opacity: 0.7;
    }
  }
`;
