import { Icon, Popconfirm, Table, message } from 'antd'
import { formatOpenDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import axios from 'axios'
import { FormattedMessage } from 'react-intl'
import { copyToClipboard } from 'CommAssets/util'

const { Column } = Table

class CollectedDocumentsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
    }
    this.updateData = response => {
      axios
        .get(getUrlFormat('/file_viewer/api/documents', {}))
        .then(response => {
          this.setState({
            data: response.data['collectedDocuments'],
          })
        })
        .catch(e => {
          message.warning(e.message)
        })
    }
    this.onUncollectDocument = (test, collectDocument) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(collectDocument.uncollectUrl, data).then(response => {
        let updateCollectDocuments = this.state.data.filter(
          document => document.pk !== collectDocument.pk,
        )
        this.setState({ data: updateCollectDocuments })
      })
    }
    this.onClickShareDocument = document => {
      copyToClipboard(window.location.origin + formatOpenDocumentUrl(document))
      message.success(
        <FormattedMessage
          id='app.document.message.copy'
          defaultMessage='Copied to clipboard! Paste elsewhere to share this document'
        />,
      )
    }
  }

  componentDidMount() {
    this.updateData()
  }

  render() {
    const columns = [
      {
        title: '',
        dataIndex: 'space',
        width: '8%',
        render: (text, record) => null,
      },
      {
        title: '#',
        dataIndex: 'id',
        width: '12%',
        render: (text, record) => this.state.data.indexOf(record) + 1,
      },
      {
        title: <FormattedMessage id='app.table.title' defaultMessage='Title' />,
        dataIndex: 'title',
        width: '40%',
        render: (text, record) => (
          <a className='document-link' href={formatOpenDocumentUrl(record)}>
            {text}
          </a>
        ),
      },
      {
        title: <FormattedMessage id='app.table.action' defaultMessage='Action' />,
        key: 'action',
        width: '40%',
        render: (text, collectedDocument) => (
          <span>
            <a onClick={() => this.onUncollectDocument(text, collectedDocument)}>Uncollect</a>
            <span className='ant-divider' />
            <a href='javascript:;' onClick={() => this.onClickShareDocument(collectedDocument)}>
              {/*<Icon type="share-alt" />*/}
              <FormattedMessage id='app.document.share' defaultMessage='Share' />
            </a>
          </span>
        ),
      },
    ]
    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        rowKey={record => record.pk}
        locale={{
          emptyText: (
            <FormattedMessage
              id='app.document.uploaded_list'
              defaultMessage='Documents uploaded by you will be listed here'
            />
          ),
        }}
      />
    )
  }
}

export { CollectedDocumentsList }
