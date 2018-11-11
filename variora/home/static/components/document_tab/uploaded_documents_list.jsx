import { Icon, Input, Popconfirm, Table, message, notification } from 'antd'
import { formatOpenDocumentUrl, getCookie, getUrlFormat, copyToClipboard } from 'util.js'

import React from 'react'
import axios from 'axios'
import { validateDocumentTitle } from 'home_util.js'

const { Column } = Table

class ChangeOpenDocumentName extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      value: this.props.anchor.props.children,
      editable: false,
    }
    this.handleChange = (e) => {
      this.setState({ value: e.target.value })
    }
    this.check = () => {
      var newTitle = this.state.value
      if (!validateDocumentTitle(newTitle))
        return false
      this.setState({ editable: false })
      var data = new FormData()
      data.append('new_title', newTitle)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(this.props.openDocument.renameUrl, data).then((response) => {
        this.props.onChange(this.state.value)
      })
    }
    this.edit = () => {
      this.setState({ editable: true })
    }
  }
  render() {
    var { value, editable } = this.state
    var editInput = (
      <div className="editable-cell-input-wrapper" title={value}>
        <Input
          value={value}
          onChange={this.handleChange}
          onPressEnter={this.check}
          suffix={
            <Icon
              type="check"
              className="editable-cell-icon-check"
              onClick={this.check}
            />
          }
        />
      </div>
    )
    var link = (
      <div className="editable-cell-text-wrapper" title={value}>
        <a className='document-link' href={formatOpenDocumentUrl(this.props.openDocument)}>{value || ' '}</a>
        <Icon
          type="edit"
          className="editable-cell-icon"
          onClick={this.edit}
        />
      </div>
    )
    return (
      <div className="editable-cell">
        { editable ? editInput : link }
      </div>
    )
  }
}

class UploadedDocumentsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
    }
    this.deleteDocument = (record) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(record.delete_url, data).then(this.updateData)
    }
    this.updateData = (response) => {
      axios.get(getUrlFormat('/file_viewer/api/documents', {
      }))
        .then(response => {
          this.setState({
            data: response.data['uploadedDocuments'].sort((a, b) => a.title > b.title)
          })
        })
        .catch(e => { message.warning(e.message) })
    }
    this.onOpenDocumentRename = (key, dataIndex) => {
      return (value) => {
        var data = this.state.data
        var target = data.find(item => item.pk === key)
        if (target) {
          target[dataIndex] = value
          this.setState({ data: data })
        }
      }
    }
    this.updateCollectDocumentCallback = () => {}

    this.onClickShareDocument = (document) => {
      copyToClipboard(window.location.origin + formatOpenDocumentUrl(document))
      message.success('Copied to clipboard! Paste elsewhere to share this document')
    }
  }

  componentDidMount() {
    this.updateData()
  }

  render() {
    const columns = [{
      title: '',
      dataIndex: 'space',
      width: '5%',
      render: (text, record) => null
    },
    {
      title: '#',
      dataIndex: 'id',
      width: '15%',
      render: (text, record) => this.state.data.indexOf(record) + 1
    },
    // {
    //   title: '',
    //   dataIndex: 'thumbnail',
    //   width: '10%',
    //   render: (text, record) => <img height={28} width={24} src={record.thumbnail_url} alt=""/>
    // },
    {
      title: 'Title',
      dataIndex: 'title',
      width: '40%',
      render: (text, openDocument) => (
        <ChangeOpenDocumentName
          openDocument={openDocument}
          anchor={ <a className='document-link' href={formatOpenDocumentUrl(openDocument)}>{text}</a> }
          onChange={this.onOpenDocumentRename(openDocument.pk, 'title')}
        />
      ),
    }, {
      title: 'Action',
      key: 'action',
      width: '40%',
      render: (text, record) => (
        <span>
          <Popconfirm
            title="Are you sure delete this document? It cannot be undone."
            onConfirm={() => this.deleteDocument(record)}
            okText="Yes" cancelText="No"
          >
            <a>Delete</a>
          </Popconfirm>
          <span className="ant-divider" />
          <a href='javascript:;' onClick={() => this.onClickShareDocument(record)}>
            {/*<Icon type="share-alt" />*/}
            Share
          </a>
        </span>
      ),
    }]
    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        rowKey={record => record.pk}
        locale={{
          emptyText: 'Documents uploaded by you will be listed here'
        }}
      />
    )
  }
}

export { UploadedDocumentsList }










