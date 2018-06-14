import 'antd/dist/antd.css';

import { Icon, Popconfirm, Table, message } from 'antd';
import { formatOpenCoterieDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { Column } = Table;


class GroupDocumentsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: this.props.coteriePk,
      data: [],
      columns: [{
        title: 'Id',
        dataIndex: 'id',
      }, {
        title: 'Title',
        dataIndex: 'title',
        render: (text, record) => <a href={formatOpenCoterieDocumentUrl(record.pk, this.state.coteriePk)}>{text}</a>,
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
    this.parseResponseData = (responseData) => {
      var groupDocuments = responseData.coteriedocument_set
      var key = 1
      for (var document of groupDocuments)
        document.key = document.id = key++
      return groupDocuments
    }
    this.updateData = (response) => {
      axios.get(getUrlFormat('/coterie/api/coteries/' + this.state.coteriePk, {}))
      .then(response => {
        this.setState({
          data: this.parseResponseData(response.data)
        })
      })
      .catch(e => { message.warning(e.message) })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk
    })
    this.updateData()
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

export { GroupDocumentsList };










