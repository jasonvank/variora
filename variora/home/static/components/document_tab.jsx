import 'regenerator-runtime/runtime'

import { Button, Col, Icon, Input, Layout, Menu, Modal, Row, Upload, notification } from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { fetchCreatedReadlists, setCreatedReadlists } from '../redux/actions.js'
import { validateDocumentSize, validateDocumentTitle } from 'home_util.js'
import { FormattedMessage } from 'react-intl'

import { CollectedDocumentsList } from './document_tab/collected_documents_list.jsx'
import React from 'react'
import { UploadedDocumentsList } from './document_tab/uploaded_documents_list.jsx'
import axios from 'axios'
import { connect } from 'react-redux'
import { getCookie } from 'util.js'
import { initialStore } from '../redux/init_store.js'

const { Content } = Layout

class DocumentTab extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    let defaultSelectedKeys =
      window.location.pathname == '/collected' ? ['collected-documents'] : ['uploaded-documents']
    if (window.location.pathname == '/subscribed') defaultSelectedKeys = ['subscribed-documents']

    return (
      <Content
        style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}
      >
        <Menu
          onClick={this.handleClick}
          className={'card'}
          mode='horizontal'
          style={{ padding: 0 }}
          defaultSelectedKeys={defaultSelectedKeys}
        >
          <Menu.Item key='uploaded-documents'>
            <Link to='/'>
              <Icon type='file' />
              <FormattedMessage
                id='app.document.uploaded_documents'
                defaultMessage='Uploaded Documents'
              />
            </Link>
          </Menu.Item>
          <Menu.Item key='collected-documents'>
            <Link to='/collected'>
              <Icon type='heart-o' />
              <FormattedMessage
                id='app.document.collected_documents'
                defaultMessage='Collected Documents'
              />
            </Link>
          </Menu.Item>
          {/*<Menu.Item key="subscribed-documents">*/}
          {/*<Link to="/subscribed"><Icon type="eye-o" />Subscribed Documents</Link>*/}
          {/*</Menu.Item>*/}
        </Menu>
        <Switch>
          <Route exact path='/' component={UploadedDocuments} />
          <Route exact path='/collected' component={CollectedDocuments} />
          {/*<Route exact path="/subscribed" component={SubscribedDocuments}/>*/}
        </Switch>
      </Content>
    )
  }
}

class UploadedDocumentsBeforeConnect extends React.Component {
  constructor() {
    super()
    this.state = {
      uploadedDocumentFileList: [],
      uploadedDocumentName: '',
      onlineDocumentUrl: '',
      onlineDocumentName: '',
      uploadBtnLoading: false,
      createdReadlists: initialStore.createdReadlists,
    }
    this.uploadedDocumentTable = undefined
    this.uploadLocalDocument = () => {
      var title = this.state.uploadedDocumentName

      if (!validateDocumentTitle(title)) return false
      const user = this.props.user
      if (
        (user == undefined || !user.is_superuser) &&
        !validateDocumentSize(this.state.uploadedDocumentFileList[0])
      )
        return false

      var data = new FormData()
      data.append('title', title)
      data.append('file_upload', this.state.uploadedDocumentFileList[0])
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      this.setState({ uploadBtnLoading: true })
      axios
        .post('/user_dashboard/handle_file_upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          this.setState({
            uploadedDocumentFileList: [],
            uploadedDocumentName: '',
            uploadBtnLoading: false,
          })
          this.uploadedDocumentTable.updateData()
        })
        .catch(() => {
          this.setState({ uploadBtnLoading: false })
        })
    }
    this.uploadOnlineDocument = () => {
      var title = this.state.onlineDocumentName
      var externalUrl = this.state.onlineDocumentUrl
      if (!validateDocumentTitle(title)) return false
      if (externalUrl == undefined || externalUrl == '') {
        notification['warning']({
          message: (
            <FormattedMessage
              id='app.document.message.url_empty'
              defaultMessage='URL cannot be empty'
            />
          ),
          duration: 1.8,
        })
        return false
      }
      var data = new FormData()
      data.append('title', title)
      data.append('external_url', externalUrl)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/user_dashboard/handle_file_upload', data).then(() => {
        this.setState({ onlineDocumentName: '' })
        this.setState({ onlineDocumentUrl: '' })
        this.uploadedDocumentTable.updateData()
      })
    }
  }

  componentDidMount() {
    this.props.fetchCreatedReadlists()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ createdReadlists: nextProps.createdReadlists })
  }

  render() {
    var self = this
    var uploadProps = {
      accept: 'application/pdf',
      showUploadList: true,
      beforeUpload(file, fileList) {
        self.setState({
          uploadedDocumentFileList: [file],
          uploadedDocumentName: file.name.endsWith('.pdf')
            ? file.name.slice(0, file.name.length - 4)
            : file.name,
        })
        return false
      },
      fileList: this.state.uploadedDocumentFileList,
    }
    return (
      <div>
        <div className={'card'} style={{ overflow: 'auto', marginTop: 16 }}>
          <UploadedDocumentsList
            ref={ele => (this.uploadedDocumentTable = ele)}
            createdReadlists={this.state.createdReadlists}
          />
        </div>
        <div className={'card'} style={{ overflow: 'auto', marginTop: 16, padding: 18 }}>
          <Row>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Upload {...uploadProps}>
                <Button style={{ margin: 8 }}>
                  <Icon type='file-add' />{' '}
                  <FormattedMessage
                    id='app.document.upload_local'
                    defaultMessage='Click to Choose Local File'
                  />
                </Button>
              </Upload>
              <Input
                style={{ width: '60%', margin: 8 }}
                value={this.state.uploadedDocumentName}
                onChange={async e => this.setState({ uploadedDocumentName: e.target.value })}
                placeholder={
                  <FormattedMessage
                    id='app.document.set_title'
                    defaultMessage='Give a title to this document'
                  />
                }
              />
              <div>
                <Button
                  type='primary'
                  icon='upload'
                  style={{ margin: 8 }}
                  loading={this.state.uploadBtnLoading}
                  onClick={this.uploadLocalDocument}
                >
                  <FormattedMessage id='app.document.upload' defaultMessage='upload' />
                </Button>
              </div>
              <div style={{ margin: '8px 8px 0px 8px' }}>
                <a href='/make-pdf' target='_blank'>
                  <FormattedMessage
                    id='app.document.message.convert'
                    defaultMessage='convert image(s) to PDF'
                  />
                </a>
              </div>
            </Col>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Input
                style={{ width: '60%', margin: 8 }}
                onChange={async e => this.setState({ onlineDocumentUrl: e.target.value })}
                value={this.state.onlineDocumentUrl}
                placeholder={
                  <FormattedMessage
                    id='app.document.upload_url'
                    defaultMessage='URL to an online document'
                  />
                }
              />
              <Input
                style={{ width: '60%', margin: 8 }}
                onChange={async e => this.setState({ onlineDocumentName: e.target.value })}
                value={this.state.onlineDocumentName}
                placeholder={
                  <FormattedMessage
                    id='app.document.set_title'
                    defaultMessage='Give a title to this document'
                  />
                }
              />
              <div>
                <Button
                  type='primary'
                  icon='upload'
                  style={{ margin: 8 }}
                  onClick={this.uploadOnlineDocument}
                >
                  <FormattedMessage id='app.document.upload' defaultMessage='upload' />
                </Button>
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
          <CollectedDocumentsList ref={ele => (this.uploadedDocumentTable = ele)} />
        </div>
      </div>
    )
  }
}

class SubscribedDocuments extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div>
        <div
          className={'card'}
          style={{ overflow: 'auto', marginTop: 18, textAlign: 'center', padding: 38 }}
        >
          <span>
            <FormattedMessage
              id='app.document.message.subscription_dev'
              defaultMessage='Subscription feature is currently under development.'
            />
          </span>
        </div>
      </div>
    )
  }
}

const mapStoreToProps = (store, ownProps) => {
  return { ...ownProps, user: store.user, createdReadlists: store.createdReadlists }
}
const UploadedDocuments = connect(
  mapStoreToProps,
  { fetchCreatedReadlists, setCreatedReadlists },
)(UploadedDocumentsBeforeConnect)

export { DocumentTab }
