import 'antd/dist/antd.css';

import { Icon, Input, Popconfirm, Table, message } from 'antd';
import { formatOpenDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react';
import axios from 'axios';
import enUS from 'antd/lib/locale-provider/en_US';

const { Column } = Table;

class ChangeOpenDocumentName extends React.Component {
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
    axios.post(this.props.openDocument.renameUrl, data).then((response) => {
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
        <a href={formatOpenDocumentUrl(this.props.openDocument, this.props.pk)}>{value || ' '}</a>
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

class UploadedDocumentsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pk: this.props.pk,
      data: [],
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
    this.onOpenDocumentRename = (key, dataIndex) => {
      return (value) => {
        var data = this.state.data;
        var target = data.find(item => item.pk === key);
        if (target) {
          target[dataIndex] = value;
          this.setState({ data: data });
        }
      };
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      pk: nextProps.pk
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
      render: (text, openDocument) => (
        <ChangeOpenDocumentName
          openDocument={openDocument}
          anchor={ <a href={formatOpenDocumentUrl(openDocument, this.state.pk)}>{text}</a> }
          onChange={this.onOpenDocumentRename(openDocument.pk, 'title')}
          pk={this.state.pk}
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

export { UploadedDocumentsList };









