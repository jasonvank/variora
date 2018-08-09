import { Icon, Input, Popconfirm, Table, message, notification } from 'antd'
import { formatOpenDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { validateDocumentTitle } from 'home_util.js'
import TimeAgo from 'react-timeago'

const { Column } = Table


class ReadlistDocumentsSubtab extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      user: props.user,
      readlist: {
        documents: []
      },
      isOwner: false,
      readlistSlug: props.readlistSlug,
    }

    this.updateData = () => {
      axios.get(getUrlFormat('/file_viewer/api/readlists/' + this.state.readlistSlug, {}))
        .then(response => {
          this.setState({
            readlist: response.data,
            isOwner: this.state.user.email_address = response.data.owner.email_address
          })
        })
        .catch(e => { message.warning(e.message) })
    }

    this.removeDocument = (record) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      // TODO: change url and form content
      axios.post(record.delete_url, data).then(this.updateData())
    }
  }

  componentDidMount() {
    this.updateData()
  }

  async componentWillReceiveProps(props) {
    await this.setState({
      user: props.user,
      readlist: {
        documents: []
      },
      isOwner: false,
      readlistSlug: props.readlistSlug
    })
    this.updateData()
  }

  render() {
    var documentRemoveAction = ((text, document) => (
      <span>
        <Popconfirm
          title="Are you sure delete this document? It cannot be undone."
          onConfirm={() => this.removeDocument(document)}
          okText="Yes" cancelText="No"
        >
          <a>Remove</a>
        </Popconfirm>
      </span>
    ))

    var documentUploadDate = ((text, document) => (
      <TimeAgo date={document.upload_time} />
    ))

    const columns = [{
      title: '#',
      dataIndex: 'id',
      width: '20%',
      render: (text, record) => this.state.readlist.documents.indexOf(record) + 1
    }, {
      title: 'Title',
      dataIndex: 'title',
      width: '40%',
      render: (text, record) => <a className='document-link' href={formatOpenDocumentUrl(record)}>{text}</a>,
    }, {
      title: this.props.isAdmin ? 'Action' : 'Upload Time',
      key: 'action',
      width: '40%',
      render: (text, document) => (
        this.props.isAdmin ? documentRemoveAction(text, document) : documentUploadDate(text, document)
      ),
    }]
    return (
      <div className={'card'} style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
        <Table
          dataSource={this.state.readlist.documents}
          columns={columns}
          pagination={false}
          rowKey={record => record.pk}
        />
      </div>
    )
  }
}

export { ReadlistDocumentsSubtab }



