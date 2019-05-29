import { Avatar, Table } from 'antd'

import React from 'react'
import TimeAgo from 'react-timeago'
import { formatOpenDocumentUrl } from 'CommAssets/util'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'

class DocumentResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: this.props.resultDocuments,
    }
    this.handleChange = sorter => {
      this.setState({
        sortedInfo: sorter,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.resultDocuments,
    })
  }

  render() {
    let sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}

    const columns = [
      {
        title: <FormattedMessage id='app.table.document_name' defaultMessage='Document Name' />,
        dataIndex: 'title',
        width: '40%',
        render: (text, record) => (
          <a
            className='document-link custom-card-text-wrapper'
            title={text}
            href={record.viewer_url}
          >
            {text}
          </a>
        ),
        sorter: (a, b) => a.title.localeCompare(b.title),
      },
      {
        title: <FormattedMessage id='app.table.uploader' defaultMessage='Uploader' />,
        dataIndex: 'uploader_name',
        render: (text, record) => (
          <span>
            <Avatar
              src={record.uploader_portrait_url}
              style={{ verticalAlign: 'middle', marginRight: 12 }}
            />
            {text}
          </span>
        ),
        width: '20%',
      },
      {
        title: <FormattedMessage id='app.table.uploaded_time' defaultMessage='Upload time' />,
        width: '20%',
        render: (text, record) => <TimeAgo date={record.upload_time} />,
        sorter: (a, b) => Date.parse(a.upload_time) > Date.parse(b.upload_time),
      },
      {
        title: <FormattedMessage id='app.table.views_cap' defaultMessage='Views' />,
        width: '10%',
        render: (text, record) => (
          <span>
            {parseInt(record.num_visit)}{' '}
            <FormattedMessage id='app.table.views' defaultMessage='views' />
          </span>
        ),
        sorter: (a, b) => parseInt(a.num_visit) - parseInt(b.num_visit),
      },
      {
        title: '',
        width: '10%',
        render: (text, record) => null,
      },
    ]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        className={'card'}
        style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}
        pagination={{ pageSize: 10 }}
        rowKey={record => record.pk}
        onChange={this.handleChange}
        locale={{
          emptyText: (
            <FormattedMessage
              id='app.document.message.not_found'
              defaultMessage='No document found'
            />
          ),
        }}
      />
    )
  }
}

export { DocumentResult }
