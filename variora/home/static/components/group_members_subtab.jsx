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


class GroupAdministratorsList extends React.Component {
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
        render: (text, record) => <a href={formatOpenDocumentUrl(record.pk, this.state.coteriePk)}>{text}</a>,
      }]
    }
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


class GroupMembersSubtab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'coteriePk': this.props.coteriePk 
    }
  }

  render() {
    self = this;
    var uploadProps = {
      accept: 'application/pdf',
      showUploadList: true,
      beforeUpload(file, fileList) { self.setState({ uploadedDocumentFileList: [file] }); return false },
      fileList: this.state.uploadedDocumentFileList,
    }
    return (
      <div> 
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <GroupDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} coteriePk={this.state.coteriePk} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <GroupDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} coteriePk={this.state.coteriePk} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .25)' }}>
          <GroupDocumentsList ref={(ele) => this.uploadedDocumentTable = ele} coteriePk={this.state.coteriePk} />
        </div>
      </div> 
    )
  }
}

export { GroupMembersSubtab }










