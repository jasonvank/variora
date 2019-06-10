import 'regenerator-runtime/runtime'

import { Avatar, Icon, Divider, Layout, message, Popconfirm, Table } from 'antd'
import { getCookie, getUrlFormat } from 'util.js'
import { FormattedMessage } from 'react-intl'

import React from 'react'
import axios from 'axios'

const { Header, Content, Sider } = Layout

class GroupAdministratorsList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: this.props.coteriePk,
      data: this.props.administrators,
      columns: [
        {
          title: '#',
          dataIndex: 'id',
          width: '20%',
          render: (text, record) => this.state.data.indexOf(record) + 1
        }, {
          title: '',
          dataIndex: 'avatar',
          width: '20%',
          render: (text, record) => <Avatar src={record.portrait_url} size='default' />
        }, {
          title: <FormattedMessage id='app.table.title' defaultMessage='Title' />,
          dataIndex: 'nickname',
          width: '20%'
        }, {
          title: <FormattedMessage id='app.table.email_address' defaultMessage='Email Address' />,
          dataIndex: 'email_address',
          width: '40%'
        }
      ]
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
        title={() => (
          <span>
            <Icon type='solution' />
            <FormattedMessage id='app.group.admin' defaultMessage=' Group Admin' />
          </span>
        )}
        locale={{
          emptyText: (
            <FormattedMessage
              id='app.group.message.no_admin'
              defaultMessage='No administrators found'
            />
          )
        }}
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
      isAdmin: this.props.isAdmin
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: this.props.coteriePk,
      data: nextProps.members,
      isAdmin: nextProps.isAdmin
    })
    this.forceUpdate()
  }

  render() {
    const columns = [
      {
        title: '#',
        dataIndex: 'id',
        width: '20%',
        render: (text, record) => this.state.data.indexOf(record) + 1
      }, {
        title: '',
        dataIndex: 'avatar',
        width: '20%',
        render: (text, record) => <Avatar src={record.portrait_url} size='default' />
      }, {
        title: <FormattedMessage id='app.table.name' defaultMessage='Name' />,
        dataIndex: 'nickname',
        width: '20%'
      }, {
        title: <FormattedMessage id='app.table.email_address' defaultMessage='Email Address' />,
        dataIndex: 'email_address',
        width: this.state.isAdmin ? '20%' : '40%'
      }, {
        title: <FormattedMessage id='app.table.action' defaultMessage='Action' />,
        key: 'action',
        width: '20%',
        render: (text, record) => (
          <span>
            <Popconfirm
              title={
                <FormattedMessage
                  id='app.document.message.delete'
                  defaultMessage='Are you sure delete this document? It cannot be undone.'
                />
              }
              onConfirm={() => this.props.removeMemberCallback(record.email_address)}
              okText='Yes'
              cancelText='No'
            >
              <a>
                <FormattedMessage id='app.document.delete' defaultMessage='Delete' />
              </a>
            </Popconfirm>
          </span>
        )
      }
    ]

    return (
      <Table
        dataSource={this.state.data}
        rowKey={record => record.email_address}
        columns={this.state.isAdmin ? columns : columns.pop() ? columns : []}
        pagination={false}
        locale={{
          emptyText: (
            <FormattedMessage
              id='app.group.message.no_members'
              defaultMessage='No group members found'
            />
          )
        }}
        title={() => (
          <span>
            <Icon type='team' />
            <FormattedMessage id='app.group.members' defaultMessage='Group Members' />
          </span>
        )}
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
      data: this.props.applications
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      data: nextProps.applications
    })
    this.forceUpdate()
  }

  onAcceptClick(application) {
    const self = this
    const data = new FormData()
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(application.accept_url, data).then(() => {
      self.props.removeApplicationCallback(application.pk)
      self.props.addMemberCallback(application.applicant)
    })
  }

  onRejectClick(application) {
    const self = this
    const data = new FormData()
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    axios.post(application.reject_url, data).then(response => {
      self.props.removeApplicationCallback(application.pk)
    })
  }

  render() {
    const columns = [
      {
        title: '#',
        dataIndex: 'id',
        width: '15%',
        render: (text, record) => this.state.data.indexOf(record) + 1
      }, {
        title: '',
        dataIndex: 'avatar',
        width: '20%',
        render: (text, record) => <Avatar src={record.applicant.portrait_url} size='default' />
      }, {
        title: <FormattedMessage id='app.table.name' defaultMessage='Name' />,
        dataIndex: 'applicant_nickname',
        width: '20%'
      }, {
        title: <FormattedMessage id='app.table.email_address' defaultMessage='Email Address' />,
        dataIndex: 'applicant_email',
        width: '20%'
      }, {
        title: <FormattedMessage id='app.table.action' defaultMessage='Action' />,
        key: 'action',
        width: '20%',
        render: (text, applicationRecord) => (
          <span>
            <a
              onClick={e => {
                e.preventDefault()
                this.onAcceptClick(applicationRecord)
              }}
            >
              <FormattedMessage id='app.group.accept' defaultMessage='Accept' />
            </a>
            <Divider type='vertical' />
            <a
              onClick={e => {
                e.preventDefault()
                this.onRejectClick(applicationRecord)
              }}
            >
              {' '}
              <FormattedMessage id='app.group.reject' defaultMessage='Reject' />
            </a>
          </span>
        )
      }
    ]

    return (
      <Table
        rowKey={record => record.applicant_email}
        dataSource={this.state.data}
        columns={columns}
        pagination={false}
        expandedRowRender={record => (
          <p>
            <b>
              <FormattedMessage
                id='app.group.message.from_applicant'
                defaultMessage='Message from this applicant: '
              />
            </b>
            <span style={{ margin: 0 }}>{record.application_message}</span>
          </p>
        )}
        title={() => (
          <span>
            <Icon type='usergroup-add' />
            <FormattedMessage id='app.group.application' defaultMessage='Group Applications' />
          </span>
        )}
        locale={{
          emptyText: (
            <FormattedMessage
              id='app.group.message.no_applications'
              defaultMessage='No applications found'
            />
          )
        }}
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
      coterie: undefined
    }
    this.addIndexForCount = records => {
      let index = 1
      for (const record of records) document.id = index++
      return records
    }
    this.updateData = response => {
      axios
        .get(getUrlFormat(`/coterie/api/coteries/${this.state.coteriePk}`, {}))
        .then(response => {
          this.setState({
            coterie: response.data,
            administrators: this.addIndexForCount(response.data.administrators),
            members: this.addIndexForCount(response.data.members)
          })
          axios
            .get(
              getUrlFormat('/coterie/api/applications', {
                for: response.data.pk
              }),
            )
            .then(response => {
              this.setState({ applications: this.addIndexForCount(response.data) })
            })
        })
        .catch(e => {
          message.warning(e.message)
        })
    }
    this.removeMemberCallback = memberEmailAddress => {
      const self = this
      const data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('member_email_address', memberEmailAddress)
      axios.post(this.state.coterie.remove_member_url, data).then(function() {
        const updatedMembers = self.state.members.filter(
          member => member.email_address != memberEmailAddress,
        )
        self.setState({ members: updatedMembers })
      })
    }
    this.removeApplicationCallback = applicationPk => {
      const updatedApplications = this.state.applications.filter(function(application) {
        return application.pk != applicationPk
      })
      this.setState({ applications: updatedApplications })
    }
    this.addMemberCallback = applicant => {
      const alreadyMember =
        this.state.members.find(member => member.email_address == applicant.email_address) !=
        undefined
      if (!alreadyMember) {
        const updatedMembers = this.state.members.concat([applicant])
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
    const groupApplicationList = (
      <div className='card' style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
        <GroupApplicationList
          coteriePk={this.state.coteriePk}
          applications={this.state.applications}
          addMemberCallback={this.addMemberCallback}
          removeApplicationCallback={this.removeApplicationCallback}
        />
      </div>
    )
    return (
      <div>
        <div className='card' style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
          <GroupAdministratorsList
            coteriePk={this.state.coteriePk}
            administrators={this.state.administrators}
          />
        </div>
        <div className='card' style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
          <GroupMembersList
            coteriePk={this.state.coteriePk}
            members={this.state.members}
            removeMemberCallback={this.removeMemberCallback}
            isAdmin={this.props.isAdmin}
          />
        </div>
        {this.props.isAdmin ? groupApplicationList : null}
      </div>
    )
  }
}

export { GroupMembersSubtab }
