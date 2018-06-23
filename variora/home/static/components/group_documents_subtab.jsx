import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Upload } from 'antd';
import {
  Link,
  Route,
  BrowserRouter as Router
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { GroupDocumentsList } from './group_documents_list.jsx'
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;


class GroupDocumentsSubtab extends React.Component {
  constructor(props) {
    super(props);
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
      data.append('coterie_id', this.props.coteriePk)
      data.append('current_url', window.location.href)
      axios.post('/coterie/handle_coteriefile_upload', data, {
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
      data.append('coterie_id', this.props.coteriePk)
      data.append('current_url', window.location.href)
      axios.post('/coterie/handle_coteriefile_upload', data).then(() => {
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

    var uploadDocumentSection = (
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
              placeholder={ 'name of the document' }
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
              placeholder={ 'URL to the online document' }
            >
            </Input>
            <Input
              style={{ width: '60%', margin: 8 }}
              onChange={async (e) => this.setState({ onlineDocumentName: e.target.value })}
              value={this.state.onlineDocumentName}
              placeholder={ 'name of the document' }
            >
            </Input>
            <div>
              <Button type="primary" icon="upload" style={{ margin: 8 }} onClick={this.uploadOnlineDocument}>upload</Button>
            </div>
          </Col>
        </Row>
      </div>
    )

    return (
      <div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <GroupDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} coteriePk={this.props.coteriePk} isAdmin={this.props.isAdmin}/>
        </div>
        { this.props.isAdmin ? uploadDocumentSection : null }
      </div>
    )
  }
}

export { GroupDocumentsSubtab }










