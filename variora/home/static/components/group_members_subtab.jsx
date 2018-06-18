import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Dropdown, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Table, Upload } from 'antd';
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
    function DropdownWrapper(props) {
      var menu = (
        <Menu onClick={ () => props.removeMemberCallback(props.memberEmailAddress) }>
          <Menu.Item>Remove</Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={ menu } trigger={['click']}>
          <a className="ant-dropdown-link" href="#">
            Actions <Icon type="down" />
          </a>
        </Dropdown>
      )
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
        <DropdownWrapper removeMemberCallback={this.props.removeMemberCallback} memberEmailAddress={ record.email_address } />
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
    });
  }

  onRejectClick(application) {
    var self = this
    var data = new FormData()
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(application.reject_url, data).then((response) => {
      self.props.updateApplicationListCallback(application.applicant_email)
    });
  }

  render() {
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
      dataIndex: 'applicant_nickname',
      width: "20%",
    }, {
      title: 'Email Address',
      dataIndex: 'applicant_email',
      width: "20%",
    }, {
      title: 'Action',
      key: 'action',
      width: "40%",
      render: (text, applicationRecord) => (
        <span>
          <a href="#" onClick={() => this.onAcceptClick(applicationRecord)}>Accept</a>
          <span className="ant-divider" />
          <a href="#" onClick={() => this.onRejectClick(applicationRecord)}>Reject</a>
        </span>
      )
    }]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        expandedRowRender={record => <p style={{ margin: 0 }}>{"Message from this applicant: " + record.application_message}</p>}
        title={ () => <span><Icon type="usergroup-add" /> Group Applications</span> }
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
      applications: [],
      coterie: undefined
    }
    this.addIndexKey = (responseData) => {
      var administrators = responseData
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
          administrators: this.addIndexKey(response.data.administrators),
          members: this.addIndexKey(response.data.members),
        })
        axios.get(getUrlFormat('/coterie/api/applications', {
          'for': response.data.pk
        })).then(response => {
          this.setState({ applications: this.addIndexKey(response.data) })
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
    this.updateApplicationListCallback = (applicantEmail) => {
      var updatedApplications = this.state.applications.filter(function(application) {return application.applicant_email != applicantEmail} )
      this.setState({ applications: updatedApplications })
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
          <GroupMembersList coteriePk={this.state.coteriePk} members={this.state.members} removeMemberCallback={this.removeMemberCallback} />
        </div>
        <div style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, boxShadow: '2px 3px 8px rgba(0, 0, 0, .20)' }}>
          <GroupApplicationList coteriePk={this.state.coteriePk} applications={this.state.applications} updateApplicationListCallback={this.updateApplicationListCallback}/>
        </div>
      </div>
    )
  }
}

export { GroupMembersSubtab }







