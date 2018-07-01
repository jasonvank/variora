import 'regenerator-runtime/runtime'

import { Avatar, Button, Col, Dropdown, Icon, Input, Layout, Menu, Modal, Popconfirm, Row, Table } from 'antd'
import { getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import axios from 'axios'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup


class GroupAdministratorsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: this.props.coteriePk,
      data: this.props.administrators,
      columns: [{
        title: '#',
        dataIndex: 'id',
        width: '20%',
        render: (text, record) => this.state.data.indexOf(record) + 1
      }, {
        title: '',
        dataIndex: 'avatar',
        width: '20%',
        render: (text, record) => <Avatar src={ record.portrait_url } size='default' />,
      }, {
        title: 'Name',
        dataIndex: 'nickname',
        width: '20%',
      }, {
        title: 'Email Address',
        dataIndex: 'email_address',
        width: '40%',
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
        rowKey={record => record.email_address}
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
      isAdmin: this.props.isAdmin,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: this.props.coteriePk,
      data: nextProps.members,
      isAdmin: nextProps.isAdmin,
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
        this.handleVisibleChange = (flag) => { this.setState({ visible: flag }) }
      }
      render() {
        var menu = (
          <Menu onClick={this.handleMenuClick}>
            <Menu.Item>
              <Popconfirm
                title="Are you sure to remove this member from the group?"
                onConfirm={ () => {
                  this.props.removeMemberCallback(this.props.memberEmailAddress)
                  this.setState({ visible: false })
                }}
                okText="Yes" cancelText="No"
              >
                Remove
              </Popconfirm>
            </Menu.Item>
          </Menu>
        )
        return (
          <Dropdown overlay={ menu } trigger={['click']} onVisibleChange={this.handleVisibleChange} visible={this.state.visible}>
            <a className="ant-dropdown-link" href="#">
              Actions <Icon type="down" />
            </a>
          </Dropdown>
        )
      }
    }

    var columns = [{
      title: '#',
      dataIndex: 'id',
      width: '20%',
      render: (text, record) => this.state.data.indexOf(record) + 1
    }, {
      title: '',
      dataIndex: 'avatar',
      width: '20%',
      render: (text, record) => <Avatar src={ record.portrait_url } size='default' />,
    }, {
      title: 'Name',
      dataIndex: 'nickname',
      width: '20%'
    }, {
      title: 'Email Address',
      dataIndex: 'email_address',
      width: '20%',
    }, {
      title: 'Action',
      key: 'action',
      width: '20%',
      render: (text, record) => (
        <DropdownWrapper removeMemberCallback={this.props.removeMemberCallback} memberEmailAddress={ record.email_address } />
      ),
    }]

    return (
      <Table
        dataSource={this.state.data}
        rowKey={record => record.email_address}
        columns={this.state.isAdmin ? columns : columns.pop() ? columns : []}
        pagination={false}
        title={ () => <span><Icon type="solution" /> Group Members</span> }
        size='middle'
      />
    )
  }
}


class GroupApplicationList extends React.Component {
  constructor(props) {
    super(props)
    this.onAcceptClick = this.onAcceptClick.bind(this)
    this.onRejectClick = this.onRejectClick.bind(this)
    this.state = {
      coteriePk: this.props.coteriePk,
      data: this.props.applications,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      data: nextProps.applications,
    })
    this.forceUpdate()
  }

  onAcceptClick(application) {
    var self = this
    var data = new FormData()
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(application.accept_url, data).then(() => {
      self.props.removeApplicationCallback(application.pk)
      self.props.addMemberCallback(application.applicant)
    })
  }

  onRejectClick(application) {
    var self = this
    var data = new FormData()
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(application.reject_url, data).then((response) => {
      self.props.removeApplicationCallback(application.pk)
    })
  }

  render() {
    const columns = [{
      title: '#',
      dataIndex: 'id',
      width: '15%',
      render: (text, record) => this.state.data.indexOf(record) + 1
    }, {
      title: '',
      dataIndex: 'avatar',
      width: '20%',
      render: (text, record) => <Avatar src={ record.applicant.portrait_url } size='default' />,
    }, {
      title: 'Name',
      dataIndex: 'applicant_nickname',
      width: '20%',
    }, {
      title: 'Email Address',
      dataIndex: 'applicant_email',
      width: '20%',
    }, {
      title: 'Action',
      key: 'action',
      width: '20%',
      render: (text, applicationRecord) => (
        <span>
          <a onClick={(e) => {e.preventDefault(); this.onAcceptClick(applicationRecord)}}>Accept</a>
          <span className="ant-divider" />
          <a onClick={(e) => {e.preventDefault(); this.onRejectClick(applicationRecord)}}>Reject</a>
        </span>
      )
    }]

    return (
      <Table
        rowKey={record => record.pk}
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        expandedRowRender={record => <p style={{ margin: 0 }}>{'Message from this applicant: ' + record.application_message}</p>}
        title={ () => <span><Icon type="usergroup-add" /> Group Applications</span> }
        size='middle'
      />
    )
  }
}



class GroupMembersSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: this.props.coteriePk,
      administrators: [],
      members: [],
      applications: [],
      coterie: undefined,
    }
    this.addIndexForCount = (records) => {
      var index = 1
      for (var record of records)
        document.id = index++
      return records
    }
    this.updateData = (response) => {
      axios.get(getUrlFormat('/coterie/api/coteries/' + this.state.coteriePk, {}))
        .then(response => {
          this.setState({
            coterie: response.data,
            administrators: this.addIndexForCount(response.data.administrators),
            members: this.addIndexForCount(response.data.members),
          })
          axios.get(getUrlFormat('/coterie/api/applications', {
            'for': response.data.pk
          })).then(response => {
            this.setState({ applications: this.addIndexForCount(response.data) })
          })
        })
        .catch(e => { message.warning(e.message) })
    }
    this.removeMemberCallback = (memberEmailAddress) => {
      var self = this
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('member_email_address', memberEmailAddress)
      axios.post(this.state.coterie.remove_member_url, data).then(function() {
        var updatedMembers = self.state.members.filter( member => member.email_address != memberEmailAddress)
        self.setState({members:updatedMembers})
      })
    }
    this.removeApplicationCallback = (applicationPk) => {
      var updatedApplications = this.state.applications.filter(function(application) {return application.pk != applicationPk} )
      this.setState({ applications: updatedApplications })
    }
    this.addMemberCallback = (applicant) => {
      var alreadyMember = this.state.members.find(member => member.email_address == applicant.email_address) != undefined ? true : false
      if (!alreadyMember) {
        var updatedMembers = this.state.members.concat([applicant])
        this.setState({ members: updatedMembers })
      }
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
    var groupApplicationList = (
      <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .20)' }}>
        <GroupApplicationList coteriePk={this.state.coteriePk} applications={this.state.applications} addMemberCallback={this.addMemberCallback} removeApplicationCallback={this.removeApplicationCallback}/>
      </div>
    )
    return (
      <div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .20)' }}>
          <GroupAdministratorsList coteriePk={this.state.coteriePk} administrators={this.state.administrators} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .20)' }}>
          <GroupMembersList coteriePk={this.state.coteriePk} members={this.state.members} removeMemberCallback={this.removeMemberCallback} isAdmin={this.props.isAdmin} />
        </div>
        { this.props.isAdmin ? groupApplicationList : null }
      </div>
    )
  }
}

export { GroupMembersSubtab }


