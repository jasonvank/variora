import { Button, Checkbox, Popover, Icon, Input, Popconfirm, Table, message, Menu, notification } from 'antd'
import { formatOpenDocumentUrl, getCookie, getUrlFormat, copyToClipboard } from 'util.js'

import React from 'react'
import axios from 'axios'
import TimeAgo from 'react-timeago'
import { validateDocumentTitle } from 'home_util.js'

const { Column } = Table
const CheckboxGroup = Checkbox.Group;

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
      createdReadlists: []
    }
    this.deleteDocument = (record) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(record.delete_url, data).then(this.updateData)
    }
    this.collectDocument = (record) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(record.collect_url, data).then(this.updateData)
      notification['success']({
        message: 'Document has been collected',
        duration: 2,
      })
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

  componentWillReceiveProps(nextProps) {
    this.setState({
      createdReadlists: nextProps.createdReadlists
    })
  }

  render() {
    const columns = [{
      title: '',
      dataIndex: 'space',
      width: '4%',
      render: (text, record) => null
    }, {
      title: '#',
      dataIndex: 'id',
      width: '6%',
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
      title: 'Upload time',
      width: '20%',
      render: (text, record) => <TimeAgo date={record.upload_time} />,
      // sorter: (a, b) => Date.parse(a.upload_time) > Date.parse(b.upload_time),
    }, {
      title: 'Action',
      key: 'action',
      width: '30%',
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
          <span className="ant-divider" />
          <a href='javascript:;' onClick={() => this.collectDocument(record)}>
            Collect
          </a>
          <span className="ant-divider" />
          <AddToReadlist createdReadlists={this.state.createdReadlists} record={record} />
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

class AddToReadlist extends React.Component {
  constructor(){
    super()
    this.state = {
      createdReadlists: [],
      checkedValues: [],
      defaultValues: [],
      visible: false,
    };
    this.onChange = (checkedValues) => {
      this.setState({
        checkedValues: checkedValues,
      })
    }

    this.updateData = () => {
      var defaultCheckedValue = []
      this.state.createdReadlists.forEach((readlist) => {
        var document_uuid = this.state.record.uuid.replace(/-/g,"")
        readlist.documents_uuids.includes(document_uuid) ? defaultCheckedValue.push(readlist.uuid) : null
      })
      this.setState({ defaultValues: defaultCheckedValue })
    }

    this.handleSubmit = () => {
      this.setState({
        visible: false,
      })

      var url = '/file_viewer/api/documents/' + this.state.record.pk + '/changereadlists'
      var data = new FormData()
      var addReadlists = []
      var removeReadlists = []
      this.state.createdReadlists.forEach(
        (readlist) => this.state.checkedValues.includes(readlist.uuid)
          ? addReadlists.push(readlist.uuid) : removeReadlists.push(readlist.uuid)
      )
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('add_readlists', addReadlists)
      data.append('remove_readlists', removeReadlists)

      axios.post(url, data).then((response) => {
        notification['success']({
          message: 'Updated',
          duration: 2,
        })
      })
      this.updateData()
    }

    this.handleVisibleChange = (visible) => {
      this.setState({ visible });
    }
  }

  componentDidMount() {
    this.setState({
      createdReadlists: this.props.createdReadlists,
      record: this.props.record
    }, () => {
      this.updateData()
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      createdReadlists: nextProps.createdReadlists,
      record: nextProps.record
    }, () => {
      this.updateData()
    })
  }

  render() {
    const readlists = this.state.createdReadlists.map(readlist => {
      return (
        <div className="add-to-readlists-wrapper" key={readlist.slug}>
          <Checkbox
            style={{ width: 150 }}
            value={readlist.uuid.replace(/-/g,"")}
          >
            <span title={readlist.name}>{readlist.name.substring(0, 18)}</span>
          </Checkbox>
          <Icon type="global" style={{ width: 20 }}/>
        </div>
      )
    })

    const readlistTitleWrapper = (
      <div className="add-to-readlists-popover">
        <div className="add-to-readlists-title-wrapper">
          Add to...
        </div>
        <CheckboxGroup
          onChange={this.onChange}
          defaultValue={this.state.defaultValues}>
          {readlists}
        </CheckboxGroup>
        <div><Button type="primary" size="default" style={{ float: 'right', margin: 12 }} onClick={this.handleSubmit}>Submit</Button></div>
      </div>
    );

    return (
      <Popover
        content={readlistTitleWrapper}
        placement="bottomLeft"
        trigger={['click']}
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <a className="ant-dropdown-link" href="#">
          Add <Icon type="down" />
        </a>
      </Popover>
    )
  }
}


export { UploadedDocumentsList }










