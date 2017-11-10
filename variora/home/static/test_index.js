import 'antd/dist/antd.css';
import './css/test_index.css';
import 'regenerator-runtime/runtime';

import { Avatar, Breadcrumb, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Upload } from 'antd';
import {
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { DocumentTab } from './components/document_tab.jsx'
import { GroupTab } from './components/group_tab.jsx'
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;
const Search = Input.Search;
const CREATE_NEW_GROUP_MENU_ITEM_KEY = 'createGroupButton';


const URL_BASE = '/test'

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      createGroupModelVisible: false,
    }
    this.handleSearch = (searchKey) => {
      axios.get(getUrlFormat('/api/search', {
        'key': searchKey,
      }))
      .then(response => {
        console.log(response.data)
      })
    }
    this.setCraeteGroupModelVisible = (visibility) => {
      this.setState({ createGroupModelVisible: visibility });
    }
    this.onClickCreateGroupMenuItem = (menuItem) => {
      if (menuItem.key == CREATE_NEW_GROUP_MENU_ITEM_KEY)
        this.setCraeteGroupModelVisible(true)
    }
  }

  render() {
    return (
      <Layout style={{ height: '100%', width: '100%', position: 'absolute' }}>
        <Header className="header" style={{ backgroundColor: '#f6f6f6', diplay: 'inline' }}>
          <Row>
            <Col span={6}>
              <div className="logo" />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Search
                placeholder="input search text"
                style={{ width: 200 }}
                onSearch={this.handleSearch}
              />
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Avatar
                style={{ verticalAlign: 'middle' }}
                size={'large'}
                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8Qxzyli58fkf7yHJU-Zx07URTiLAREu1gDAsPx0YCTD9Zkflj' 
              />
            </Col>
          </Row>
        </Header>

        <Router basename={URL_BASE}>
          <Layout>
            <Sider width={200} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
              <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                onClick={this.onClickCreateGroupMenuItem}
                style={{ height: '100%', borderRight: 0 }}
              >
                <Menu.Item key="explore">
                  <Link to="/explore"><span><Icon type="compass" />explore</span></Link>
                </Menu.Item>
                <Menu.Item key="documents">
                  <Link to="/documents"><span><Icon type='file' />documents</span></Link>
                </Menu.Item>
                <Menu.Item key="document" disabled={true}>
                  <Link to="documents"><span><Icon type='file' />documents</span></Link>
                </Menu.Item>
                <SubMenu key="sub3" title={<span><Icon type="usergroup-add" />group</span>}>
                  <Menu.Item key="1">option1</Menu.Item>
                  <Menu.Item key="2">option2</Menu.Item>
                  <Menu.Item key="3">option3</Menu.Item>
                  <Menu.Item key="4">option4</Menu.Item>
                  <Menu.Item key={CREATE_NEW_GROUP_MENU_ITEM_KEY}><Icon type="plus"/></Menu.Item>
                </SubMenu>
                <Modal
                  title="create a new group"
                  wrapClassName="vertical-center-modal"
                  visible={this.state.createGroupModelVisible}
                  onOk={() => this.setCraeteGroupModelVisible(false)}
                  onCancel={() => this.setCraeteGroupModelVisible(false)}
                >
                  <p>some contents...</p>
                  <p>some contents...</p>
                  <p>some contents...</p>
                </Modal>
              </Menu>
            </Sider>

            <Layout style={{ marginLeft: 200, padding: 0 }}>
              <Switch>
                <Route exact path='/' render={() => (<Redirect to="/documents" />)} />
                <Route exact path="/documents" component={DocumentTab} />
                <Route exact path="/explore" component={GroupTab} />
              </Switch>
            </Layout>
          </Layout>
        </Router>
      </Layout>
    );
  }
}

ReactDOM.render(
  <LocaleProvider locale={enUS}>
    <App />
  </LocaleProvider>, 
  document.getElementById('main')
);







