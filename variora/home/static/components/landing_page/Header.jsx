import React from 'react';
// import { Link } from 'bisheng/router';
import './static/header.less';
import { Avatar, notification, Button, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Col, message } from 'antd'

const { Header } = Layout

export default class HeaderPage extends React.PureComponent {
  render() {
    return (
      <Header className="header" style={{ backgroundColor: '#fff', diplay: 'inline' }}>
        <Row>
          <Col span={6}>
            {/* <div className="logo" /> */}
            <a href='/'><img src="/media/logo.png" height={48} style={{ verticalAlign: 'middle', marginLeft: 28 }}/></a>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            {/* <Search
              placeholder="input search text"
              style={{ width: '60%' }}
            /> */}
          </Col>
        </Row>
      </Header>
    );
  }
}
