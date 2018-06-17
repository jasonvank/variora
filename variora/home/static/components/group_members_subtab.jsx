import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Dropdown, Icon, Input, Layout, Menu, Modal, Popconfirm, Row, Table, Upload } from 'antd';
import { getCookie, getUrlFormat } from 'util.js'

import { GroupDocumentsList } from './group_documents_list.jsx'
import React from 'react';
import axios from 'axios'

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
    this.state = {
      coteriePk: this.props.coteriePk,
      data: this.props.members,
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
    class DropdownWrapper extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          visible: false
        }
        this.handleVisibleChange = (flag) => { this.setState({ visible: flag }); }
      }
      render() {
        var menu = (
          <Menu onClick={this.handleMenuClick}>
            <Menu.Item>
              <Popconfirm
              title="Are you sure to remove this member from the group?"
              onConfirm={ () => {
                this.props.exitGroupCallback(this.props.memberEmailAddress)
                this.setState({ visible: false });
              }}
              okText="Yes" cancelText="No"
              >
                Remove
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={ menu } trigger={['click']} onVisibleChange={this.handleVisibleChange} visible={this.state.visible}>
            <a className="ant-dropdown-link" href="#">
              Actions <Icon type="down" />
            </a>
          </Dropdown>
        )
      }
    }

    const columns = [{
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
        <DropdownWrapper exitGroupCallback={this.props.exitGroupCallback} memberEmailAddress={ record.email_address } />
      ),
    }]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
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
      coteriePk: this.props.coteriePk,
      administrators: [],
      members: [],
      coterie: undefined
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
          coterie: response.data,
          administrators: this.getMemberGroup(response.data, 'administrators'),
          members: this.getMemberGroup(response.data, 'members'),
        })
      })
      .catch(e => { message.warning(e.message) })
    }
    this.exitGroupCallback = (memberEmailAddress) => {
      var self = this
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('member_email_address', memberEmailAddress)
      axios.post(this.state.coterie.remove_member_url, data).then(function() {
        var updatedMembers = self.state.members.filter( member => member.email_address != memberEmailAddress)
        self.setState({members:updatedMembers})
      })
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
          <GroupMembersList coteriePk={this.state.coteriePk} members={this.state.members} exitGroupCallback={this.exitGroupCallback} />
        </div>
      </div>
    )
  }
}

export { GroupMembersSubtab }

