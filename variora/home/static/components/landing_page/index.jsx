import React from 'react'
import ReactDOM from 'react-dom'
import DocumentTitle from 'react-document-title';
import { enquireScreen } from 'enquire-js';
// import HeaderPage from './components/landing_page/Header.jsx';
import Banner from 'Banner.jsx';
import Page1 from 'Page1.jsx';
import Page2 from 'Page2.jsx';
import Page3 from 'Page3.jsx';
import Footer from 'Footer.jsx';

import {
  Link,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import './components/landing_page/static/style';

let isMobile = false;
enquireScreen((b) => {
  isMobile = b;
});

class Home extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isFirstScreen: true,
    };
  }

  componentDidMount() {
    enquireScreen((b) => {
      this.setState({
        isMobile: !!b,
      });
    });
  }

  onEnterChange = (mode) => {
    this.setState({
      isFirstScreen: mode === 'enter',
    });
  }
  render() {
    return (
      [
        // <HeaderPage key="header" isFirstScreen={this.state.isFirstScreen} />,
        <Banner key="banner" onEnterChange={this.onEnterChange} />,
        <Page1 key="page1" />,
        <Page2 key="page2" />,
        <Page3 key="page3" />,
        <Footer key="footer" />,
        <DocumentTitle title="Variora" key="title" />,
      ]
    );
  }
}

export { Home }
