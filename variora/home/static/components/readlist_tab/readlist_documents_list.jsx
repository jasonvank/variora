import { Icon, Input, Popconfirm, Table, message, notification } from 'antd'
import { formatOpenCoterieDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { validateDocumentTitle } from 'home_util.js'
import TimeAgo from 'react-timeago'

const { Column } = Table


class ReadlistDocumentsList extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.updateData()
  }

  render() {
    const columns = [{
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

export { ReadlistDocumentsList }



