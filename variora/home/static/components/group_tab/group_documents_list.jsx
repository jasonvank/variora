import { Icon, Input, Popconfirm, Table, message, notification } from 'antd'
import { formatOpenCoterieDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { validateDocumentTitle } from 'home_util.js'
import TimeAgo from 'react-timeago'

const { Column } = Table


class ChangeDocumentName extends React.Component {
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
      axios.post(this.props.coterieDocument.renameUrl, data).then((response) => {
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
      <div className="editable-cell-input-wrapper">
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
        <a className='document-link' href={formatOpenCoterieDocumentUrl(this.props.coterieDocument, this.props.coteriePk)}>{value || ' '}</a>
        <Icon
          type="edit"
          className="editable-cell-icon"
          onClick={this.edit}
        />
      </div>
    )
    return (
      <div className="editable-cell" title={value}>
        { editable ? editInput : link }
      </div>
    )
  }
}

class GroupDocumentsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: this.props.coteriePk,
      data: [],
    }
    this.deleteDocument = (record) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(record.delete_url, data).then(this.updateData())
    }
    this.updateData = () => {
      axios.get(getUrlFormat('/coterie/api/coteries/' + this.state.coteriePk, {}))
      .then(response => {
        this.setState({
          data: response.data.coteriedocument_set
        })
      })
      .catch(e => { message.warning(e.message) })
    }
    this.onCoterieDocumentRename = (key, dataIndex) => {
      return (value) => {
        var data = this.state.data
        var target = data.find(item => item.pk === key)
        if (target) {
          target[dataIndex] = value
          this.setState({ data: data })
        }
      }
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      coteriePk: nextProps.coteriePk
    })
    this.updateData()
  }

  componentDidMount() {
    this.updateData()
  }

  render() {
    var changeDocumentName = ((text, coterieDocument) => (
      <ChangeDocumentName
        coterieDocument={coterieDocument}
        anchor={ <a className='document-link' href={formatOpenCoterieDocumentUrl(coterieDocument, this.state.coteriePk)}>{text}</a> }
        onChange={this.onCoterieDocumentRename(coterieDocument.pk, 'title')}
        coteriePk={this.state.coteriePk}
      />)
    )

    var documentDeleteAction = ((text, coterieDocument) => (
      <span>
        <Popconfirm
          title="Are you sure delete this document? It cannot be undone."
          onConfirm={() => this.deleteDocument(coterieDocument)}
          okText="Yes" cancelText="No"
        >
          <a>Delete</a>
        </Popconfirm>
      </span>
    ))

    var documentUploadDate = ((text, coterieDocument) => (
      <TimeAgo date={coterieDocument.upload_time} />
    ))

    const columns = [{
        title: '#',
        dataIndex: 'id',
        width: '20%',
        render: (text, record) => this.state.data.indexOf(record) + 1
      }, {
        title: 'Title',
        dataIndex: 'title',
        width: '40%',
        render: (text, coterieDocument) => (
          this.props.isAdmin ? changeDocumentName(text, coterieDocument) :
                              <a href={formatOpenCoterieDocumentUrl(coterieDocument, this.state.coteriePk)}>{text}</a>
        )
      }, {
      title: this.props.isAdmin ? 'Action' : 'Upload Time',
      key: 'action',
      width: '40%',
      render: (text, coterieDocument) => (
        this.props.isAdmin ? documentDeleteAction(text, coterieDocument) :
                            documentUploadDate(text, coterieDocument)
      ),
    }]
    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        rowKey={record => record.pk}
      />
    )
  }
}

export { GroupDocumentsList }


