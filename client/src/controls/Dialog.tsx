import * as React from 'react';
import classNames from 'classnames';
import { styled, ThemeProps } from '../style';
import { Modal } from 'react-overlays';
import { CSSTransition } from 'react-transition-group';
import { darken, lighten } from 'polished';
import IconClose from '../svg-compiled/icons/IcClose';

type CloseHandler = () => any;
const CloseContext = React.createContext<CloseHandler>(null);

interface HeaderProps {
    children?: React.ReactNode;
    className?: string;
    hasClose?: boolean;
}

const DialogTransition = (props: any) =>
    <CSSTransition {...props} classNames="dialog" timeout={300} />;

const CloseButton = styled.button`
  border: none;
  background: none;
  outline: none;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  > svg {
    fill: ${(props: ThemeProps) => props.theme.dialogHeaderTextColor};
  }
  &:hover > svg {
    fill: ${(props: ThemeProps) => lighten(0.2, props.theme.dialogHeaderTextColor)};
  }
`;

// Header component
function HeaderImpl({ children, className, hasClose }: HeaderProps) {
    return (
        <header className={classNames(className)}>
            {children}
            {hasClose && (
                <div>
                    <CloseContext.Consumer>
                        {onClose => <CloseButton><IconClose onClick={onClose} /></CloseButton>}
                    </CloseContext.Consumer>
                </div>
            )}
        </header>
    );
}

const Header = styled(HeaderImpl)`
  align-items: center;
  background-color: ${(props: ThemeProps) => props.theme.dialogHeaderBgColor};
  color: ${(props: ThemeProps) => props.theme.dialogHeaderTextColor};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: bold;
  min-height: 32px;
  padding: 0 4px 0 12px;
`;

// Body component
const Body = styled.section`
  display: flex;
  flex-direction: column;
  padding: 12px;

  > p {
    margin-top: 0;
  }
`;

// Footer component
const Footer = styled.footer`
  border-top: 1px solid ${(props: ThemeProps) => darken(0.1, props.theme.dialogBgColor)};
  display: flex;
  flex-direction: row;
  padding: 8px;
  justify-content: flex-end;
  > * {
    margin-left: 8px;
  }
`;

// Backdrop component
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  /* z-index: 6; */
  opacity: 0;
  background-color: ${(props: ThemeProps) => props.theme.dialogBackdropColor};
  transition: opacity .3s ease;
  &.dialog-appear-active, &.dialog-enter, &.dialog-enter-done {
    opacity: 0.2;
  }
`;

const ModalFrameEl = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 7;
  outline: none;
`;

const DialogEl = styled.div`
  background-color: ${(props: ThemeProps) => props.theme.dialogBgColor};
  border: ${(props: ThemeProps) => props.theme.dialogBorder};
  border-radius: 6px;
  box-shadow: ${(props: ThemeProps) => props.theme.dialogShadow};
  overflow: hidden;
  max-height: 95%;
  max-width: 95%;
  min-width: 15em;
  position: relative;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity .2s ease, transform .2s ease;
  .dialog-appear-active &, .dialog-enter &, .dialog-enter-done & {
    opacity: 1;
    transform: scale(1);
  }
`;

interface Props {
    children?: React.ReactNode;
    className?: string;
    frameClassName?: string;
    keyboard?: boolean;
    open?: boolean;
    style?: any;

    /** Called when the dialog first opens. */
    onShow?: () => void;

    /** Indicates that the dialog wants to close. */
    onClose: () => void;

    /** Indicates that the dialog has finished closing. */
    onExited?: () => void;
}

/** Modal dialog class */
export class Dialog extends React.Component<Props> {
    public static Header = Header;
    public static Body = Body;
    public static Footer = Footer;

    public render() {
        const {
            open,
            onShow,
            onClose,
            onExited,
            keyboard = true,
            className,
            style,
            frameClassName,
            children,
        } = this.props;

        return (
            <Modal
                show={open}
                backdrop={true}
                transition={DialogTransition}
                backdropTransition={DialogTransition}
                onShow={onShow}
                onHide={onClose}
                onExited={onExited}
                onEscapeKeyDown={onClose}
                keyboard={keyboard}
                renderBackdrop={() => <Backdrop />}
            >
                <ModalFrameEl className={frameClassName}>
                    <div style={{ flex: 2 }} />
                    <DialogEl className={className} style={style}>
                        <CloseContext.Provider value={onClose}>
                            {children}
                        </CloseContext.Provider>
                    </DialogEl>
                    <div style={{ flex: 3 }} />
                </ModalFrameEl>
            </Modal>
        );
    }
}
