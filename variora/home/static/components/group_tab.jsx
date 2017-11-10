import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Breadcrumb, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Upload } from 'antd';
import {
  Link,
  Route,
  BrowserRouter as Router
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import ReactDOM from 'react-dom';
import { UploadedDocumentsList } from './uploaded_documents_list.jsx'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;


class GroupTab extends React.Component {
  constructor() {
    super();
    this.state = {
      uploadedDocumentFileList: [],
      uploadedDocumentName: undefined,
      onlineDocumentUrl: undefined,
      onlineDocumentName: undefined,
    }
    this.uploadedDocumentTable = undefined
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
      <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 8, margin: 0, minHeight: 280 }}>
        <Menu
          onClick={this.handleClick}
          selectedKeys={[this.state.current]}
          mode="horizontal"
          style={{ padding: 0 }}
        >
          <Menu.Item key="group-documents">
            <Icon type="book" />Group Documents
          </Menu.Item>
          <Menu.Item key="group-members">
            <Icon type="usergroup-add" />Group Members
          </Menu.Item>
          <Menu.Item key="group-settings">
            <Icon type="setting" />Group Settings
          </Menu.Item>
        </Menu>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <UploadedDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} />
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
                onChange={async (e) => this.setState({ uploadedDocumentName: e.target.value })}
                value={this.state.uploadedDocumentName}
              ></Input>
              <div>
                <Button type="primary" icon="upload" style={{ margin: 8 }} onClick={this.uploadLocalDocument}>upload</Button>
              </div>
            </Col>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Input
                style={{ width: '60%', margin: 8 }}
                onChange={async (e) => this.setState({ onlineDocumentUrl: e.target.value })}
                value={this.state.onlineDocumentUrl}
              >
              </Input>
              <Input
                style={{ width: '60%', margin: 8 }}
                onChange={async (e) => this.setState({ onlineDocumentName: e.target.value })}
                value={this.state.onlineDocumentName}
              >
              </Input>
              <div>
                <Button type="primary" icon="upload" style={{ margin: 8 }} onClick={this.uploadOnlineDocument}>upload</Button>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    );
  }
}

export { GroupTab };


