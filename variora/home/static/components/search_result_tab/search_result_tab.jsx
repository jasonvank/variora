import 'regenerator-runtime/runtime'

import { Avatar, Icon, Layout, Menu, message, Table, notification, Modal, Input, Tooltip } from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import { DocumentResult } from './document_result_subtab.jsx'
import React from 'react'
import { ReadlistResult } from './readlist_result_subtab.jsx'
import TimeAgo from 'react-timeago'
import axios from 'axios'
import { getUrlFormat, getCookie } from 'util.js'

const { Content } = Layout
const { TextArea } = Input


const fullUrl = window.location.href
// TODO: refactoring this
const searchKey = fullUrl.slice(fullUrl.indexOf('=') + 1)


class SearchResultTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resultDocuments: undefined,
      resultCoteries: undefined,
      resultUsers: undefined,
      resultReadlists: undefined,
      administratedCoteries: [],
      joinedCoteries: [],
      user: undefined,
    }
  }

  componentDidMount() {
    // TODO: get user from redux
    axios.get('/api/user').then((response) => {
      const user = response.data
      if (response.data.is_authenticated)
        this.setState({ user: user })
      if (user.is_authenticated)
        axios.get('/coterie/api/coteries').then((response) => {
          this.setState({
            administratedCoteries: response.data.administratedCoteries,
            joinedCoteries: response.data.joinedCoteries
          })
        })
    })
    if (this.props.match !== undefined && this.props.match.params.coterieUUID !== undefined) {
      axios.get(getUrlFormat(`/coterie/api/coteries/${this.props.match.params.coterieUUID}/search`, {
        'key': searchKey
      })).then((response) => {
        const data = response.data
        this.setState({
          resultDocuments: data.resultDocuments,
          resultCoteries: data.resultCoteries,
          resultUsers: data.resultUsers,
          resultReadlists: data.resultReadlists,
        })
      })
    } else {
      axios.get(getUrlFormat('/api/search', {
        'key': searchKey
      })).then((response) => {
        const data = response.data
        this.setState({
          resultDocuments: data.resultDocuments,
          resultCoteries: data.resultCoteries,
          resultUsers: data.resultUsers,
          resultReadlists: data.resultReadlists,
        })
      })
    }
  }


  render() {
    var urlBase = '/search'
    const path = window.location.pathname
    if (path.includes('/groups/'))
      urlBase = '/groups/' + path.split('/')[2] + urlBase

    return (
      <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}>
        <Menu
          onClick={this.handleClick}
          className={'card'}
          mode='horizontal'
          style={{ padding: 0 }}
          defaultSelectedKeys={
            path.endsWith('/users') ? ['search-users'] : path.endsWith('/readlists') ? ['search-readlists'] : path.endsWith('/groups') ? ['search-groups'] : ['search-documents']
          }
        >
          <Menu.Item key='search-documents'>
            <Link to={urlBase + '?key=' + searchKey}><Icon type='file' />Documents</Link>
          </Menu.Item>
          <Menu.Item key='search-readlists'>
            <Link to={urlBase + '/readlists?key=' + searchKey}><Icon type='folder' />Readlists</Link>
          </Menu.Item>
          <Menu.Item key='search-users'>
            <Link to={urlBase + '/users?key=' + searchKey}><Icon type='user' />Users</Link>
          </Menu.Item>
          <Menu.Item key='search-groups'>
            <Link to={urlBase + '/groups?key=' + searchKey}><Icon type='team' />Groups</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path={urlBase} render={() =>
            <DocumentResult
              resultDocuments={this.state.resultDocuments}
            />}
          />

          <Route path={urlBase + '/users'} render={() =>
            <UserResult
              resultUsers={this.state.resultUsers}
            />}
          />

          <Route path={urlBase + '/readlists'} render={() =>
            <ReadlistResult
              resultReadlists={this.state.resultReadlists}
            />}
          />

          <Route path={urlBase + '/groups'} render={() =>
            <GroupResult
              administratedCoteries={this.state.administratedCoteries} joinedCoteries={this.state.joinedCoteries} resultCoteries={this.state.resultCoteries} user={this.state.user}
            />}
          />
        </Switch>
      </Content>
    )
  }
}


class GroupResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: this.props.resultCoteries,
      use: this.props.user,
      createApplicationModelVisible: false,
      joinWithCodeModelVisible: false,
      targetedCoterie: {name: ''},
      applicationMessage: '',
      invitationCode: '',
    }
    this.handleChange = (sorter) => {
      this.setState({
        sortedInfo: sorter,
      })
    }
    this.onApplyClick = (coterie) => {
      this.setState({
        createApplicationModelVisible: true,
        targetedCoterie: coterie,
      })
    }
    this.onJoinWithCodeClick = (coterie) => {
      this.setState({
        joinWithCodeModelVisible: true,
        targetedCoterie: coterie,
      })
    }
    this.submitApplicationCoterieForm = () => {
      var data = new FormData()
      data.append('coterie_id', this.state.targetedCoterie.pk)
      data.append('application_message', this.state.applicationMessage)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/apply', data)
      .then(response => {
        this.setState({
          applicationMessage: this.state.applicationMessage,
          createApplicationModelVisible: false,
        })
        notification['success']({
          message: 'Application successfully sent',
          description: 'Your application has been sent to Group: ' + this.state.targetedCoterie.name + ' successfully!' + ' With message: ' + this.state.applicationMessage,
          duration: 4
        })
      }).catch(err => {
        notification['warning']({
          message: 'Unsuccessful application',
          description: <span>Your need to <a href="/sign-in">log in </a> first to join a group</span>,
          duration: 3.8
        })
      })
    }

    this.joinCoterieWithCode = () => {
      const data = new FormData()
      data.append('application_message', this.state.applicationMessage)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('invitation_code', this.state.invitationCode)
      axios.post(`/coterie/api/coteries/${this.state.targetedCoterie.pk}/join_with_code`, data)
      .then(response => {
        window.location.href = `/groups/${response.data.uuid}/`
      }).catch(err => {
        notification['warning']({
          message: 'This invitation code does not exist or already expires',
          // description: <span>Your need to <a href="/sign-in">log in </a> first to join a group</span>,
          duration: 3.8
        })
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.resultCoteries,
      user: nextProps.user,
    })
  }

  render() {
    let sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}

    const columns = [{
      title: 'Group Name',
      dataIndex: 'name',
      width: '40%',
      sorter: (a, b) => a.name.localeCompare(b.name),
    }, {
      title: "Admin's Email",
      dataIndex: '',
      width: '30%',
      render: (text, record) => record.administrators.length == 0 ? '' : record.administrators[0].email_address
    }, {
      title: 'Action',
      key: 'action',
      width: '30%',
      render: (text, record) => {
        var applyLink = (
          <a href='javascript:;' onClick={() => this.onApplyClick(record)}>Apply</a>
        )
        var alreadyMemberLink = (
          <Tooltip placement='right' title={'You are a member of this group'}>
            <span><a disabled='disabled'>Apply</a></span>
          </Tooltip>
        )
        var alreadyAdminLink = (
          <Tooltip placement='right' title={'You are a admin of this group'}>
            <span><a disabled='disabled'>Apply</a></span>
          </Tooltip>
        )
        var isMember = this.props.joinedCoteries.map(c => c.pk).includes(record.pk)
        var isAdmin = this.props.administratedCoteries.map(c => c.pk).includes(record.pk)
        return (
          <span>
            {isAdmin ? alreadyAdminLink : isMember ? alreadyMemberLink : applyLink}
            <span className="ant-divider" />
            <a href='javascript:;' onClick={() => this.onJoinWithCodeClick(record)}>Join with invitation code</a>
          </span>
        )
      }
    }]

    return (
      <div>
        <Table
          dataSource={this.state.data}
          columns={columns}
          className={'card'}
          style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, padding: 18 }}
          pagination={{ pageSize: 10 }}
          rowKey={record => record.pk}
          onChange={this.handleChange}
          locale={{
            emptyText: 'No group found'
          }}
        />

        <Modal
          title={'Apply to join: ' + this.state.targetedCoterie.name}
          wrapClassName='vertical-center-modal'
          visible={this.state.createApplicationModelVisible}
          onOk={this.submitApplicationCoterieForm}
          onCancel={() => {this.setState({ createApplicationModelVisible: false })}}
        >
          <TextArea
            onChange={async (e) => this.setState({ applicationMessage: e.target.value })}
            placeholder={'Application message'}
            value={this.state.applicationMessage}
          />
        </Modal>

        <Modal
          title={<span>Join <span style={{color: '#1BA39C'}}>{this.state.targetedCoterie.name}</span> with invitation code</span>}
          wrapClassName='vertical-center-modal'
          visible={this.state.joinWithCodeModelVisible}
          onOk={this.joinCoterieWithCode}
          onCancel={() => {this.setState({ joinWithCodeModelVisible: false })}}
        >
          <Input
            onChange={async (e) => this.setState({ invitationCode: e.target.value })}
            placeholder={'Invitation code you received'}
            value={this.state.invitationCode}
          />
        </Modal>
      </div>
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
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.resultUsers,
    })
  }


  render() {
    var sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}
    const columns = [{
      title: 'User Name',
      dataIndex: 'nickname',
      width: '40%',
      sorter: (a, b) => a.nickname.localeCompare(b.nickname),
    }, {
      title: '',
      dataIndex: 'avatar',
      width: '30%',
      render: (text, record) => <Avatar src={ record.portrait_url } size='default' />,
    }, {
      title: 'Email Address',
      dataIndex: 'email_address',
      width: '30%',
    }]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        className={'card'}
        style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}
        pagination={{ pageSize: 10 }}
        rowKey={record => record.email_address}
        onChange={this.handleChange}
        locale={{
          emptyText: 'No user found'
        }}
      />
    )
  }
}

export { SearchResultTab }


