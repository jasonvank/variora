import 'regenerator-runtime/runtime'

import { Button, Col, Icon, Input, Layout, Menu, Modal, Row, Upload, notification } from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { CollectedDocumentsList } from './collected_documents_list.jsx'
import React from 'react'
import { UploadedDocumentsList } from './uploaded_documents_list.jsx'
import axios from 'axios'
import { validateDocumentTitle, validateDocumentSize } from 'home_util.js'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup


class DocumentTab extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    return (
      <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}>
        <Menu
          onClick={this.handleClick}
          className={'card'}
          mode="horizontal"
          style={{ padding: 0 }}
          defaultSelectedKeys={['uploaded-documents']}
          selectedKeys = { this.props.location.pathname == '/collected' ? ["collected-documents"] : ['uploaded-documents'] }
        >
          <Menu.Item key="uploaded-documents">
            <Link to="/"><Icon type="file" />Uploaded Documents</Link>
          </Menu.Item>
          <Menu.Item key="collected-documents">
            <Link to="/collected"><Icon type="heart-o" />Collected Documents</Link>
          </Menu.Item>
        </Menu>
        <Switch>
          <Route exact path="/" component={UploadedDocuments}/>
          <Route exact path="/collected" component={CollectedDocuments}/>
        </Switch>
      </Content>
    )
  }
}

class UploadedDocuments extends React.Component {
  constructor() {
    super()
    this.state = {
      uploadedDocumentFileList: [],
      uploadedDocumentName: '',
      onlineDocumentUrl: '',
      onlineDocumentName: '',
      uploadBtnLoading: false,
    }
    this.uploadedDocumentTable = undefined
    this.uploadLocalDocument = () => {
      var title = this.state.uploadedDocumentName

      if (!validateDocumentTitle(title))
        return false
      if (!validateDocumentSize(this.state.uploadedDocumentFileList[0]))
        return false

      var data = new FormData()
      data.append('title', title)
      data.append('file_upload', this.state.uploadedDocumentFileList[0])
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      this.setState({ uploadBtnLoading: true })
      axios.post('/user_dashboard/handle_file_upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        this.setState({
          uploadedDocumentFileList: [],
          uploadedDocumentName: '',
          uploadBtnLoading: false
        })
        this.uploadedDocumentTable.updateData()
      }).catch(() => {
        this.setState({ uploadBtnLoading: false })
      })
    }
    this.uploadOnlineDocument = () => {
      var title = this.state.onlineDocumentName
      var externalUrl = this.state.onlineDocumentUrl
      if (!validateDocumentTitle(title))
        return false
      if (externalUrl == undefined || externalUrl == '') {
        notification['warning']({
          message: 'URL cannot be empty',
          duration: 1.8,
        })
        return false
      }
      var data = new FormData()
      data.append('title', title)
      data.append('external_url', externalUrl)
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
    var self = this
    var uploadProps = {
      accept: 'application/pdf',
      showUploadList: true,
      beforeUpload(file, fileList) {
        self.setState({
          uploadedDocumentFileList: [file],
          uploadedDocumentName: file.name.endsWith('.pdf') ? file.name.slice(0, file.name.length - 4) : file.name
        })
        return false
      },
      fileList: this.state.uploadedDocumentFileList,
    }
    return (
      <div>
        <div className={'card'} style={{ overflow: 'auto', marginTop: 16 }}>
          <UploadedDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} />
        </div>
        <div className={'card'} style={{ overflow: 'auto', marginTop: 16, padding: 18 }}>
          <Row>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Upload {...uploadProps}>
                <Button style={{ margin: 8 }}>
                  <Icon type="file-add" /> Click to Choose Local File
                </Button>
              </Upload>
              <Input
                style={{ width: '60%', margin: 8 }}
                value={this.state.uploadedDocumentName}
                onChange={async (e) => this.setState({ uploadedDocumentName: e.target.value })}
                placeholder={ 'Give a title to this document' }
              ></Input>
              <div>
                <Button type="primary" icon="upload" style={{ margin: 8 }} loading={this.state.uploadBtnLoading} onClick={this.uploadLocalDocument}>upload</Button>
              </div>
            </Col>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Input
                style={{ width: '60%', margin: 8 }}
                onChange={async (e) => this.setState({ onlineDocumentUrl: e.target.value })}
                value={this.state.onlineDocumentUrl}
                placeholder={ 'URL to an online document' }
              >
              </Input>
              <Input
                style={{ width: '60%', margin: 8 }}
                onChange={async (e) => this.setState({ onlineDocumentName: e.target.value })}
                value={this.state.onlineDocumentName}
                placeholder={ 'Give a title to this document' }
              >
              </Input>
              <div>
                <Button type="primary" icon="upload" style={{ margin: 8 }} onClick={this.uploadOnlineDocument}>upload</Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

class CollectedDocuments extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div>
        <div className={'card'} style={{ overflow: 'auto', marginTop: 18 }}>
          <CollectedDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} />
        </div>
      </div>
    )
  }
}

export { DocumentTab }
