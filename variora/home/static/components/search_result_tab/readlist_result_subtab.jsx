import { Avatar, Table } from 'antd'

import React from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import { FormattedMessage, FormattedRelative } from 'react-intl'
class ReadlistResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: props.resultReadlists,
    }
    this.handleChange = sorter => {
      this.setState({
        sortedInfo: sorter,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.resultReadlists,
    })
  }

  render() {
    let sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}

    const columns = [
      {
        title: <FormattedMessage id='app.table.readlist_name' defaultMessage='Readlist Name' />,
        dataIndex: 'name',
        width: '40%',
        render: (text, record) => (
          <Link className='document-link custom-card-text-wrapper' title={text} to={record.url}>
            {text}
          </Link>
        ),
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: <FormattedMessage id='app.table.creator' defaultMessage='Creator' />,
        render: (text, record) => (
          <span>
            <Avatar
              src={record.owner.portrait_url}
              style={{ verticalAlign: 'middle', marginRight: 12 }}
            />
            {record.owner.nickname}
          </span>
        ),
        width: '30%',
      },
      {
        title: <FormattedMessage id='app.table.create_date' defaultMessage='Create date' />,
        width: '30%',
        render: (text, record) => <FormattedRelative value={record.create_time} />,
        sorter: (a, b) => Date.parse(a.create_time) > Date.parse(b.create_time),
      },
    ]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        className={'card'}
        style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}
        pagination={{ pageSize: 10 }}
        rowKey={record => record.uuid}
        onChange={this.handleChange}
        locale={{
          emptyText: (
            <FormattedMessage
              id='app.group.message.no_readlists'
              defaultMessage='No readlists found'
            />
          ),
        }}
      />
    )
  }
}

export { ReadlistResult }
