import 'antd/dist/antd.css';

import { Icon, Popconfirm, Table, message } from 'antd';
import { formatOpenDocumentUrl, getCookie, getUrlFormat } from 'util.js'

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
    }
    this.updateData = (response) => {
      axios.get(getUrlFormat('/file_viewer/api/documents', {
      }))
      .then(response => {
        this.setState({
          data: response.data['collectedDocuments']
        })
      })
      .catch(e => { message.warning(e.message) })
    }
    this.onUncollectDocument = (test, collectDocument) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post(collectDocument.uncollectUrl, data).then((response) => {
        var updateCollectDocuments = this.state.data.filter(document => document.pk!= collectDocument.pk)
        this.setState({ data: updateCollectDocuments })
      })
    }
  }
  componentDidMount() {
    this.updateData()
  }
  render() {
    const columns=[{
      title: 'Id',
      dataIndex: 'id',
      width: '20%',
      render: (text, record) => this.state.data.indexOf(record) + 1
    }, {
      title: 'Title',
      dataIndex: 'title',
      width: '40%',
      render: (text, record) => <a href={formatOpenDocumentUrl(record)}>{text}</a>,
    }, {
      title: 'Action',
      key: 'action',
      width: '40%',
      render: (text, collectedDocument) => (
        <a style={{ color: '#F2784B' }} onClick={() => this.onUncollectDocument(text, collectedDocument)}>Uncollect</a>
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

export { CollectedDocumentsList };









