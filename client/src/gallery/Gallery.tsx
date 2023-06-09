import * as React from 'react';
import {hot} from 'react-hot-loader';
import {NavLink, BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {Normalize} from 'styled-normalize';
import {themeDefault, styled, ThemeProvider, GlobalStyle} from '../style';
import {registry} from './registry';
import {lighten} from 'polished';

import './pages/autocomplete';
import './pages/buttons';
import './pages/cards';
import './pages/chips';
import './pages/colors';
import './pages/dialogs';
import './pages/dropdowns';
import './pages/forms';
import './pages/tabs';
import './pages/toggles';

const GalleryPage = styled.section`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: grid;
  /* flex-direction: column; */
  flex: 1;
  overflow-x: hidden;
  color: ${props => props.theme.textDark};
  background-color: ${props => props.theme.pageBgColor};
  grid-template-rows: 32px auto;
  grid-template-columns: 12em auto;
  grid-template-areas:
    "header header"
    "index preview";

  > header {
    display: flex;
    align-items: center;
    padding: 0 12px;
    font-weight: bold;
    color: ${props => props.theme.headerTitleColor};
    background-color: ${props => props.theme.headerBgColor};
    grid-area: header;
  }

  > aside {
    display: flex;
    flex-direction: column;

    color: ${props => props.theme.leftNavTextColor};
    background-color: ${props => props.theme.leftNavBgColor};

    > a {
      display: block;
      padding: 6px 12px;
      font-weight: bold;
      text-decoration: none;
      color: ${props => props.theme.leftNavTextColor};

      &.selected {
        background-color: ${props => lighten(0.1, props.theme.leftNavBgColor)};
      }
    }
  }

  > .preview {
    padding: 8px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    > header {
      font-weight: bold;
      font-size: 120%;
      margin-bottom: 8px;
      margin-top: 8px;

      &:first-child {
        margin-top: 0;
      }
    }

    > * {
      flex-shrink: 0;
    }
  }
`;

function Gallery() {
    const keys = Object.getOwnPropertyNames(registry);
    keys.sort((a, b) => ('' + a).localeCompare(b));
    return (
        <ThemeProvider theme={themeDefault}>
            <Router>
                <React.Fragment>
                    <Normalize />
                    <GlobalStyle />
                    <GalleryPage>
                        <header>Bughive Component Gallery</header>
                        <aside>
                            {keys.map(key => (
                                <NavLink to={`/${key}`} key={key} activeClassName="selected">{key}</NavLink>
                            ))}
                        </aside>
                        <section className="preview">
                            <Switch>
                                {keys.map(key => (<Route key={key} path={`/${key}`} render={registry[key]} />))}
                            </Switch>
                        </section>
                    </GalleryPage>
                </React.Fragment>
            </Router>
        </ThemeProvider>
    );
}

export default hot(module)(Gallery);
