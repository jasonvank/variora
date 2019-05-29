import React from 'react'
import './static/header.less'
import { Layout, Row, Col, Input, Icon, Avatar } from 'antd'

const { Header } = Layout
const Search = Input.Search

export default class HeaderPage extends React.PureComponent {
  render() {
    return (
      <Header className='header' style={{ backgroundColor: '#fff', diplay: 'inline' }}>
        <Row>
          <Col span={6}>
            <a href='/'>
              <img
                src='/media/logo.png'
                height={48}
                style={{ verticalAlign: 'middle', marginLeft: 28 }}
              />
            </a>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Search placeholder='input search text' style={{ width: '60%' }} />
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <Icon type='bell' style={{ fontSize: 18, marginLeft: 28, verticalAlign: 'middle' }} />
            <Icon type='team' style={{ fontSize: 18, marginLeft: 28, verticalAlign: 'middle' }} />
            <span style={{ marginRight: 12, marginLeft: 28, color: '#666' }}>Prof. Luo</span>
            <a href='/sign-off'>
              <FormattedMessage id='app.sign_off' defaultMessage='Sign Off' />
            </a>
            <Avatar
              style={{ marginLeft: 28, marginRight: 18, marginTop: -2, verticalAlign: 'middle' }}
              size={'large'}
            />
          </Col>
        </Row>
      </Header>
    )
  }
}
