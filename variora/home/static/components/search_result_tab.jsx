import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Upload, Table } from 'antd';
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
      var data =  response.data;
      console.log(data);
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
          <DocumentResult documentResult={this.state.resultDocuments} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <GroupResult groupResult={this.state.resultCoteries} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <UserResult userResult={this.state.resultUsers} />
        </div> 
      </div>
    )
  }
}


class DocumentResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.resultDocuments,
      columns: [{
        title: 'id',
        dataIndex: 'id',
      }, {
        title: 'Document Name',
        dataIndex: 'documentName',
      }]
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultDocuments
    })
    this.forceUpdate()
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


class GroupResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.resultCoteries,
      columns: [{

        title: 'id',
        dataIndex: 'id',
      }, {
        title: 'Group Name',
        dataIndex: 'groupName',
      }]
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultCoteries
    })
    this.forceUpdate()
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

class UserResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.resultUsers,
      columns: [{
        title: 'id',
        dataIndex: 'id',
      }, {
        title: 'User Name',
        dataIndex: 'userName',
      }]
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultUsers
    })
    this.forceUpdate()
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





export { SearchResultTab }










