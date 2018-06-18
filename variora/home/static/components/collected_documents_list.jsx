import 'antd/dist/antd.css';

import { Icon, Popconfirm, Table, message } from 'antd';
import { formatOpenDocumentUrl, getUrlFormat } from 'util.js'

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { Column } = Table;


class CollectedDocumentsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      columns: [{
        title: 'Id',
        dataIndex: 'id',
      }, {
        title: 'Title',
        dataIndex: 'title',
        render: (text, record) => <a href={formatOpenDocumentUrl(record)}>{text}</a>,
      }, {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <span>
            <span className="ant-divider" />
            <a href="#" className="ant-dropdown-link">
              More actions <Icon type="down" />
            </a>
          </span>
        ),
      }]
    }
    this.parseResponse = (response) => {
      var uploadedDocuments = response['collectedDocuments']
      var key = 1
      for (var document of uploadedDocuments) {
        document.key = document.id = key++
      }
      return uploadedDocuments
    }
    this.updateData = (response) => {
      axios.get(getUrlFormat('/file_viewer/api/documents', {
      }))
      .then(response => {
        this.setState({
          data: this.parseResponse(response.data)
        })
      })
      .catch(e => { message.warning(e.message) })
    }
  }
  componentDidMount() {
    this.updateData()
  }
  render() {
    return (
      <Table
        dataSource={this.state.data}
        columns={this.state.columns}
        pagination={false}
      />
    )
  }
}

export { CollectedDocumentsList };









