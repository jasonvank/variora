import React from 'react'
import './static/header.less'
import { Layout, Row, Col, Input } from 'antd'

const { Header } = Layout
const Search = Input.Search

export default class HeaderPage extends React.PureComponent {
  render() {
    return (
      <Header className='header' style={{ backgroundColor: '#fff', diplay: 'inline' }}>
        <Row>
          <Col span={6}>
            <a href='/'><img src='/media/logo.png' height={48} style={{ verticalAlign: 'middle', marginLeft: 28 }}/></a>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Search
              placeholder='input search text'
              style={{ width: '60%' }}
            />
          </Col>
        </Row>
      </Header>
    )
  }
}
