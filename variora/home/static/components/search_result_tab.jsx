import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Table, Upload } from 'antd';
import {
  Link,
  Route,
  BrowserRouter as Router
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { GroupDocumentsList } from './group_documents_list.jsx'
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;

class SearchResultTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resultDocuments: undefined,
      resultCoteries: undefined,
      resultUsers: undefined
    }
  }

  componentDidMount() {
    var fullUrl = window.location.href;
    var searchKey = fullUrl.slice(fullUrl.indexOf('=') + 1);
    axios.get(getUrlFormat('/api/search', {
      'key': searchKey
    })).then((response) => {
      var data = response.data;
      this.setState({
        resultDocuments: data.resultDocuments,
        resultCoteries: data.resultCoteries,
        resultUsers: data.resultUsers
      })
    })
  }


  render() {
    return (
      <div style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 8, margin: 0, minHeight: 280 }}>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <DocumentResult resultDocuments={this.state.resultDocuments} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <GroupResult resultCoteries={this.state.resultCoteries} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <UserResult resultUsers={this.state.resultUsers} />
        </div>
      </div>
    )
  }
}


class DocumentResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: this.props.resultDocuments,
    }
    this.handleChange = (sorter) => {
      this.setState({
        sortedInfo: sorter,
      });
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultDocuments,
    })
    this.forceUpdate()
  }

  render() {
    let sortedInfo = this.state.sortedInfo;
    sortedInfo = sortedInfo || {};

    const columns = [{
      title: 'Document Name',
      dataIndex: 'title',
      width: "40%",
      sorter: (a, b) => a.title.localeCompare(b.title),
    }, {
      title: 'Group Owner',
      dataIndex: '',
      width: "30%",
    }, {
      title: 'Action',
      key: 'action',
      width: "30%",
    }];

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 250 }}
        rowKey={record => record.pk}
        onChange={this.handleChange}
      />
    )
  }
}


class GroupResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: this.props.resultCoteries,
    }
    this.handleChange = (sorter) => {
      this.setState({
        sortedInfo: sorter,
      });
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultCoteries,
    })
    this.forceUpdate()
  }

  render() {
    let sortedInfo = this.state.sortedInfo;
    sortedInfo = sortedInfo || {};

    const columns = [{
      title: 'Group Name',
      dataIndex: 'name',
      width: "40%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    }, {
      title: 'Coordinator',
      dataIndex: '',
      width: "30%",
    }, {
      title: 'Action',
      key: 'action',
      width: "30%",
    }];

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 250 }}
        rowKey={record => record.pk}
        onChange={this.handleChange}
      />
    )
  }
}

class UserResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: this.props.resultUsers,
    }
    this.handleChange = (sorter) => {
      this.setState({
        sortedInfo: sorter,
      });
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultUsers,
    })
    this.forceUpdate()
  }


  render() {
    let sortedInfo = this.state.sortedInfo;
    sortedInfo = sortedInfo || {};
    const columns = [{
      title: 'User Name',
      dataIndex: 'nickname',
      width: "40%",
      sorter: (a, b) => a.nickname.localeCompare(b.nickname),
    }, {
      title: 'Email Address',
      dataIndex: 'email_address',
      width: "30%",
    }, {
      title: 'Action',
      key: 'action',
      width: "30%",
    }];

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        scroll={{ y: 250 }}
        pagination={{ pageSize: 50 }}
        rowKey={record => record.email_address}
        onChange={this.handleChange}
      />
    )
  }
}

export { SearchResultTab }



