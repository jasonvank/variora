import {Avatar, Table} from 'antd'

import React from 'react'
import TimeAgo from 'react-timeago'

class ReadlistResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: props.resultReadlists,
    }
    this.handleChange = (sorter) => {
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

    const columns = [{
      title: 'Readlist Name',
      dataIndex: 'name',
      width: '40%',
      render: (text, record) => <a className='document-link custom-card-text-wrapper' title={text} href={record.url}>{text}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    }, {
      title: 'Creator',
      render: (text, record) => <span><Avatar src={record.owner.portrait_url} style={{ verticalAlign: 'middle', marginRight: 12}} />{record.owner.nickname}</span>,
      width: '30%',
    }, {
      title: 'Create date',
      width: '30%',
      render: (text, record) => <TimeAgo date={record.create_time} />
    }]

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
          emptyText: 'No readlist found'
        }}
      />
    )
  }
}

export { ReadlistResult }
