import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Dropdown, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Table, Upload } from 'antd';
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
      data: this.props.administrators,
      columns: [{
        title: 'Id',
        dataIndex: 'id',
        width: "20%",
      }, {
        title: '',
        dataIndex: 'avatar',
        width: "20%",
        render: (text, record) => <Avatar src={ record.portrait_url } size='default' />,
      }, {
        title: 'Name',
        dataIndex: 'nickname',
        width: "20%",
      }, {
        title: 'Email Address',
        dataIndex: 'email_address',
        width: "40%",
      }]
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: this.props.coteriePk,
      data: nextProps.administrators
    })
    this.forceUpdate()
  }

  render() {
    return (
      <Table
        dataSource={this.state.data}
        columns={this.state.columns}
        pagination={false}
        title={ () => <span><Icon type="team" />  Group Admin</span> }
        size='middle'
      />
    )
  }
}


class GroupMembersList extends React.Component {
  constructor(props) {
    super(props)
    const menu = (
      <Menu>
        <Menu.Item>Remove</Menu.Item>
      </Menu>
    );
    this.state = {
      coteriePk: this.props.coteriePk,
      data: this.props.members,
      columns: [{
        title: 'Id',
        dataIndex: 'id',
        width: "20%",
      }, {
        title: '',
        dataIndex: 'avatar',
        width: "20%",
        render: (text, record) => <Avatar src={ record.portrait_url } size='default' />,
      }, {
        title: 'Name',
        dataIndex: 'nickname',
        width: "20%",
      }, {
        title: 'Email Address',
        dataIndex: 'email_address',
        width: "20%",
      }, {
        title: 'Action',
        key: 'action',
        width: "20%",
        render: (text, record) => (
          <Dropdown overlay={menu}>
            <a className="ant-dropdown-link" href="#">
              Actions <Icon type="down" />
            </a>
          </Dropdown>
        ),
      }
      ]
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: this.props.coteriePk,
      data: nextProps.members
    })
    this.forceUpdate()
  }

  render() {
    return (
      <Table
        dataSource={this.state.data}
        columns={this.state.columns}
        pagination={false}
        title={ () => <span><Icon type="solution" /> Group Members</span> }
        size='middle'
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
    this.getMemberGroup = (responseData, userType) => {
      var administrators = responseData[userType]
      var key = 1
      for (var document of administrators)
        document.key = document.id = key++
      return administrators
    }
    this.updateData = (response) => {
      axios.get(getUrlFormat('/coterie/api/coteries/' + this.state.coteriePk, {}))
      .then(response => {
        this.setState({
          administrators: this.getMemberGroup(response.data, 'administrators'),
          members: this.getMemberGroup(response.data, 'members'),
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
      <div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .20)' }}>
          <GroupAdministratorsList coteriePk={this.state.coteriePk} administrators={this.state.administrators} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .20)' }}>
          <GroupMembersList coteriePk={this.state.coteriePk} members={this.state.members} />
        </div>
      </div>
    )
  }
}

export { GroupMembersSubtab }







