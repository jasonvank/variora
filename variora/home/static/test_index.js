import 'antd/dist/antd.css';
import './css/test_index.css';
import 'regenerator-runtime/runtime';

import { Avatar, Breadcrumb, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Upload } from 'antd';
import { getCookie, getUrlFormat } from 'util.js'

import { DocumentsList } from './components/documents_list.jsx'
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;
const Search = Input.Search;
const CREATE_NEW_GROUP_MENU_ITEM_KEY = 'createGroupButton';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      createGroupModelVisible: false,
      uploadedDocumentFileList: [],
      uploadedDocumentName: undefined,
      onlineDocumentUrl: undefined,
      onlineDocumentName: undefined,
    }
    this.uploadedDocumentTable = undefined
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
    this.uploadLocalDocument = () => {
      var data = new FormData()
      data.append('title', this.state.uploadedDocumentName)
      data.append('file_upload', this.state.uploadedDocumentFileList[0])
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/user_dashboard/handle_file_upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        this.setState({ uploadedDocumentFileList: [] })
        this.setState({ uploadedDocumentName: '' })
        this.uploadedDocumentTable.updateData() 
      })
    }
    this.uploadOnlineDocument = () => {
      var data = new FormData()
      data.append('title', this.state.onlineDocumentName)
      data.append('external_url', this.state.onlineDocumentUrl)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/user_dashboard/handle_file_upload', data)
      .then(() => {
        this.setState({ onlineDocumentName: '' })
        this.setState({ onlineDocumentUrl: '' })
        this.uploadedDocumentTable.updateData() 
      })
    }
  }

  render() {
    self = this;
    var uploadProps = {
      accept: 'application/pdf',
      showUploadList: true,
      beforeUpload(file, fileList) { self.setState({ uploadedDocumentFileList: [file] }); return false },
      fileList: this.state.uploadedDocumentFileList,
    }
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
                <span><Icon type="compass" />explore</span>
              </Menu.Item>
              <Menu.Item key="documents" disabled={true}>
                <span><Icon type='file' />documents</span>
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
            <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 8, margin: 0, minHeight: 280 }}>
              <Menu
                onClick={this.handleClick}
                selectedKeys={[this.state.current]}
                mode="horizontal"
                style={{ padding: 0 }}
              >
                <Menu.Item key="mail">
                  <Icon type="mail" />Navigation One
                </Menu.Item>
                <Menu.Item key="app" disabled>
                  <Icon type="appstore" />Navigation Two
                </Menu.Item>
                <SubMenu title={<span><Icon type="setting" />Navigation Three - Submenu</span>}>
                  <MenuItemGroup title="Item 1">
                    <Menu.Item key="setting:1">Option 1</Menu.Item>
                    <Menu.Item key="setting:2">Option 2</Menu.Item>
                  </MenuItemGroup>
                  <MenuItemGroup title="Item 2">
                    <Menu.Item key="setting:3">Option 3</Menu.Item>
                    <Menu.Item key="setting:4">Option 4</Menu.Item>
                  </MenuItemGroup>
                </SubMenu>
                <Menu.Item key="alipay">
                  <a href="https://ant.design" target="_blank" rel="noopener noreferrer">Navigation Four - Link</a>
                </Menu.Item>
              </Menu>
              <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
                <DocumentsList ref={(ele) => this.uploadedDocumentTable = ele} />
              </div>
              <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, padding: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
                <Row>
                  <Col span={12} style={{ textAlign: 'left' }}>
                    <Upload {...uploadProps}>
                      <Button style={{ margin: 8 }}>
                        <Icon type="file-add" /> Click to Choose File
                      </Button>
                    </Upload>
                    <Input 
                      style={{ width: '60%', margin: 8 }} 
                      onChange={ async (e) => this.setState({ uploadedDocumentName: e.target.value }) }
                      value={ this.state.uploadedDocumentName }
                    ></Input>
                    <div>
                      <Button type="primary" icon="upload" style={{ margin: 8 }} onClick={this.uploadLocalDocument}>upload</Button>
                    </div>
                  </Col>
                  <Col span={12} style={{ textAlign: 'left' }}>
                    <Input 
                      style={{ width: '60%', margin: 8 }} 
                      onChange={ async (e) => this.setState({ onlineDocumentUrl: e.target.value }) }
                      value={ this.state.onlineDocumentUrl }
                    >
                    </Input>
                    <Input 
                      style={{ width: '60%', margin: 8 }} 
                      onChange={ async (e) => this.setState({ onlineDocumentName: e.target.value }) }
                      value={ this.state.onlineDocumentName }
                    >
                    </Input>
                    <div>
                      <Button type="primary" icon="upload" style={{ margin: 8 }} onClick={this.uploadOnlineDocument}>upload</Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Content>
          </Layout>
        </Layout>
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
