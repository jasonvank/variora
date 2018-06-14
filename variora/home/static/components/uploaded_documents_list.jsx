import 'antd/dist/antd.css';

import { Icon, Popconfirm, Table, message } from 'antd';
import { formatOpenDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { Column } = Table;


class UploadedDocumentsList extends React.Component {
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
        render: (text, record) => <a href={formatOpenDocumentUrl(record.pk)}>{text}</a>,
      }, {
        title: 'Action',
        key: 'action',
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
            <a href="#" className="ant-dropdown-link">
              More actions <Icon type="down" />
            </a>
          </span>
        ),
      }]
    }
    this.deleteDocument = (record) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(record.delete_url, data).then(this.updateData)
    }
    this.parseResponse = (response) => {
      var uploadedDocuments = response['uploadedDocuments']
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

export { UploadedDocumentsList };









