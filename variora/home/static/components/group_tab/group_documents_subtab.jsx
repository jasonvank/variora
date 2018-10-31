import 'regenerator-runtime/runtime'

import { Button, Card, Col, Icon, Input, Layout, Menu, Row, Tooltip, Upload, notification } from 'antd'
import {
  Link,
  Route,
  BrowserRouter as Router
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { GroupDocumentsList } from './group_documents_list.jsx'
import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US'
import { validateDocumentTitle, validateDocumentSize } from 'home_util.js'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup


class GroupDocumentsSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      uploadedDocumentFileList: [],
      uploadedDocumentName: undefined,
      onlineDocumentUrl: undefined,
      onlineDocumentName: undefined,
      uploadBtnLoading: false,
    }

    this.uploadedDocumentTable = undefined

    this.uploadLocalDocument = () => {
      const title = this.state.uploadedDocumentName

      if (!validateDocumentTitle(title))
        return false
      if (!validateDocumentSize(this.state.uploadedDocumentFileList[0]))
        return false

      const data = new FormData()
      data.append('title', title)
      data.append('file_upload', this.state.uploadedDocumentFileList[0])
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('coterie_pk', this.props.coteriePk)
      data.append('current_url', window.location.href)
      this.setState({ uploadBtnLoading: true })
      axios.post('/coterie/api/coteriedocuments/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        this.setState({ uploadedDocumentFileList: [] })
        this.setState({ uploadedDocumentName: '' })
        this.setState({ uploadBtnLoading: false })
        this.uploadedDocumentTable.updateData()
      }).catch(() => {
        this.setState({ uploadBtnLoading: false })
      })
    }

    this.uploadOnlineDocument = () => {
      const title = this.state.onlineDocumentName
      const externalUrl = this.state.onlineDocumentUrl
      if (!validateDocumentTitle(title))
        return false
      if (externalUrl == undefined || externalUrl == '') {
        notification['warning']({
          message: 'URL cannot be empty',
          duration: 1.8,
        })
        return false
      }
      const data = new FormData()
      data.append('title', title)
      data.append('external_url', externalUrl)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('coterie_id', this.props.coteriePk)
      data.append('current_url', window.location.href)
      axios.post('/coterie/handle_coteriefile_upload', data).then(() => {
          this.setState({ onlineDocumentName: '' })
          this.setState({ onlineDocumentUrl: '' })
          this.uploadedDocumentTable.updateData()
        })
    }

    this.handleDefaultDocumentName = this.handleDefaultDocumentName.bind(this)
    this.handleUserInputDocumentName = this.handleUserInputDocumentName.bind(this)
  }

  handleDefaultDocumentName(event) {
    const defaultDocumentName = this.state.uploadedDocumentFileList[0] ? this.state.uploadedDocumentFileList[0].name : 'undefined'
    this.setState({ uploadedDocumentName: defaultDocumentName })
  }

  handleUserInputDocumentName(event) {
    this.setState({ uploadedDocumentName: event.target.value })
  }


  render() {
    self = this
    const uploadProps = {
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

    const cardTitle = (
      <span style={{fontSize: '12px'}}>
        Upload Document
        <Tooltip title={'Documents only visible to admins and members'} >
          <a href="#">
            <Icon type="info-circle-o" style={{marginLeft: 6}} />
          </a>
        </Tooltip>
      </span>
    )

    const uploadDocumentSection = (
      <Card title={cardTitle} className={'card'} bordered={false} style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }} noHovering>
        <Row>
          <Col span={12} style={{ textAlign: 'left' }}>
            <Upload {...uploadProps}>
              <Button style={{ margin: 8 }}>
                <Icon type="file-add" /> Click to Choose File
              </Button>
            </Upload>
            <Input
              style={{ width: '60%', margin: 8 }}
              value={this.state.uploadedDocumentName}
              onChange={this.handleDefaultDocumentName}
              onChange={this.handleUserInputDocumentName}
              placeholder={ 'name of the document' }
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
      </Card>
    )

    return (
      <div>
        <div className={'card'} style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
          <GroupDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} coteriePk={this.props.coteriePk} isAdmin={this.props.isAdmin}/>
        </div>
        { this.props.isAdmin ? uploadDocumentSection : null }
      </div>
    )
  }
}

export { GroupDocumentsSubtab }










