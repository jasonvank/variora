import 'antd/dist/antd.css';

import { Icon, Input, Popconfirm, Table, message } from 'antd';
import { formatOpenCoterieDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'

const { Column } = Table;


class ChangeDocumentName extends React.Component {
  state = {
    value: this.props.anchor.props.children,
    editable: false,
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value })
  }
  check = () => {
    this.setState({ editable: false })
    var data = new FormData()
    data.append('new_title', this.state.value)
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(this.props.coterieDocument.renameUrl, data).then((response) => {
      this.props.onChange(this.state.value)
    })
  }
  edit = () => {
    this.setState({ editable: true })
  }
  render() {
    var { value, editable } = this.state;
    var editInput = (
      <div className="editable-cell-input-wrapper">
        <Input
          value={value}
          onChange={this.handleChange}
          onPressEnter={this.check}
          suffix={
            <Icon
              type="check"
              className="editable-cell-icon-check"
              onClick={this.check}
            />
          }
        />
      </div>
    )
    var link = (
      <div className="editable-cell-text-wrapper">
        <a href={formatOpenCoterieDocumentUrl(this.props.coterieDocument, this.props.coteriePk)}>{value || ' '}</a>
        <Icon
          type="edit"
          className="editable-cell-icon"
          onClick={this.edit}
        />
      </div>
    )
    return (
      <div className="editable-cell">
        { editable ? editInput : link }
      </div>
    );
  }
}

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
        render: (text, record) => <a href={formatOpenCoterieDocumentUrl(record, this.state.coteriePk)}>{text}</a>,
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
    this.onCoterieDocumentRename = (key, dataIndex) => {
      return (value) => {
        var data = this.state.data;
        var target = data.find(item => item.pk === key);
        if (target) {
          target[dataIndex] = value;
          console.log(data)
          console.log(this.state.data)
          this.setState({ data: data });
        }
      };
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      coteriePk: nextProps.coteriePk
    })
    this.updateData()
  }

  componentDidMount() {
    this.updateData()
  }

  render() {
    const columns = [{
      title: 'Id',
      dataIndex: 'id',
    }, {
      title: 'Title',
      dataIndex: 'title',
      render: (text, coterieDocument) => (
        <ChangeDocumentName
          coterieDocument={coterieDocument}
          anchor={ <a href={formatOpenCoterieDocumentUrl(coterieDocument, this.state.coteriePk)}>{text}</a> }
          onChange={this.onCoterieDocumentRename(coterieDocument.pk, 'title')}
          coteriePk={this.state.coteriePk}
        />),
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
        </span>
      ),
    }]
    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
      />
    )
  }
}

export { GroupDocumentsList };




