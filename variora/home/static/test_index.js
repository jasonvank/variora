import 'antd/dist/antd.css';
import './css/test_index.css';
import 'regenerator-runtime/runtime';

import { Avatar, Breadcrumb, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Row, Upload } from 'antd';

import { DocumentsList } from './components/documents_list.jsx'
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;
const Search = Input.Search;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      message: 'awesome react',
    }
    this.handleSearch = (searchKey) => {
      console.log(searchKey)
    }
  }
  render() {
    var uploadProps = {
      accept: 'application/pdf',
      name: 'file',
      action: '//jsonplaceholder.typicode.com/posts/',
      headers: {
        authorization: 'authorization-text',
      },
      showUploadList: true,
      beforeUpload(file, fileList) {return false},
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          console.log(`${info.file.name} file uploaded successfully`)
          // message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          console.log(`${info.file.name} file upload failed.`)
          // message.error(`${info.file.name} file upload failed.`);
        }
      }
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
              </SubMenu>
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
                <DocumentsList />
              </div>
              <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, padding: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
                <Row>
                  <Col span={12} style={{ textAlign: 'left' }}>
                    <Upload {...uploadProps}>
                      <Button style={{ margin: 8 }}>
                        <Icon type="upload" /> Click to Upload
                      </Button>
                    </Upload>
                    <Input style={{ width: '60%', margin: 8 }}></Input>
                    <div>
                      <Button type="primary" icon="upload" style={{ margin: 8 }}>upload</Button>
                    </div>
                  </Col>
                  <Col span={12} style={{ textAlign: 'left' }}>
                    <Input style={{ width: '60%', margin: 8 }}></Input>
                    <Input style={{ width: '60%', margin: 8 }}></Input>
                    <div>
                      <Button type="primary" icon="upload" style={{ margin: 8 }}>upload</Button>
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
