import 'regenerator-runtime/runtime'

import { Avatar, Icon, Layout, Menu, Table, notification } from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import { DocumentResult } from './document_result_subtab.jsx'
import React from 'react'
import { ReadlistResult } from './readlist_result_subtab.jsx'
import TimeAgo from 'react-timeago'
import axios from 'axios'
import { getUrlFormat } from 'util.js'

const { Content } = Layout

const SUB_URL_BASE = '/search'
var fullUrl = window.location.href
// TODO: refactoring this
var searchKey = fullUrl.slice(fullUrl.indexOf('=') + 1)

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
    axios.get(getUrlFormat('/api/search', {
      'key': searchKey
    })).then((response) => {
      var data = response.data
      this.setState({
        resultDocuments: data.resultDocuments,
        // resultCoteries: data.resultCoteries,
        resultUsers: data.resultUsers,
        resultReadlists: data.resultReadlists,
      })
    })
  }


  render() {
    const path = window.location.href
    return (
      <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}>
        <Menu
          onClick={this.handleClick}
          className={'card'}
          mode='horizontal'
          style={{ padding: 0 }}
          defaultSelectedKeys={['search-documents']}
          selectedKeys = {
            path.includes('/users') ? ['search-users'] : path.includes('/readlists') ? ['search-readlists'] : ['search-documents']
          }
        >
          <Menu.Item key='search-documents'>
            <Link to={SUB_URL_BASE + '?key=' + searchKey}><Icon type='file' />Documents</Link>
          </Menu.Item>
          <Menu.Item key='search-readlists'>
            <Link to={SUB_URL_BASE + '/readlists?key=' + searchKey}><Icon type='folder' />Readlists</Link>
          </Menu.Item>
          <Menu.Item key='search-users'>
            <Link to={SUB_URL_BASE + '/users?key=' + searchKey}><Icon type='user' />Users</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path={SUB_URL_BASE} render={() =>
            <DocumentResult
              resultDocuments={this.state.resultDocuments}
            />}
          />

          <Route path={SUB_URL_BASE + '/users'} render={() =>
            <UserResult
              resultUsers={this.state.resultUsers}
            />}
          />

          <Route path={SUB_URL_BASE + '/readlists'} render={() =>
            <ReadlistResult
              resultReadlists={this.state.resultReadlists}
            />}
          />
        </Switch>
      </Content>
    )
  }
}


// class GroupResult extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       sortedInfo: null,
//       data: this.props.resultCoteries,
//       use: this.props.user,
//       createApplicationModelVisible: false,
//       targetedCoterie: {name: ''},
//       applicationMessage: ''
//     }
//     this.handleChange = (sorter) => {
//       this.setState({
//         sortedInfo: sorter,
//       })
//     }
//     this.onApplyClick = (coterie) => {
//       this.setState({
//         createApplicationModelVisible: true,
//         targetedCoterie: coterie,
//       })
//     }
//     this.submitApplicationCoterieForm = () => {
//       var data = new FormData()
//       data.append('coterie_id', this.state.targetedCoterie.pk)
//       data.append('application_message', this.state.applicationMessage)
//       data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
//       axios.post('/coterie/api/apply', data)
//       .then((response) => {
//         this.setState({
//           applicationMessage: this.state.applicationMessage,
//           createApplicationModelVisible: false,
//         })
//         notification['success']({
//           message: 'Application successfully sent',
//           description: 'Your application has been sent to Group: ' + this.state.targetedCoterie.name + ' successfully!' + ' With message: ' + this.state.applicationMessage,
//           duration: 4
//         })
//       })
//     }
//   }
//
//   componentWillReceiveProps(nextProps) {
//     this.setState({
//       data: nextProps.resultCoteries,
//       user: nextProps.user,
//     })
//   }
//
//   render() {
//     let sortedInfo = this.state.sortedInfo
//     sortedInfo = sortedInfo || {}
//
//     const columns = [{
//       title: 'Group Name',
//       dataIndex: 'name',
//       width: '40%',
//       sorter: (a, b) => a.name.localeCompare(b.name),
//     }, {
//       title: "Admin's Email",
//       dataIndex: '',
//       width: '30%',
//       render: (text, record) => record.administrators.length == 0 ? '' : record.administrators[0].email_address
//     }, {
//       title: 'Action',
//       key: 'action',
//       width: '30%',
//       render: (text, record) => {
//         var applyLink = (
//           <a href='javascript:;' onClick={() => this.onApplyClick(record)}>Apply</a>
//         )
//         var alreadyMemberLink = (
//           <Tooltip placement='right' title={'You are a member of this group'}>
//             <span><a disabled='disabled'>Apply</a></span>
//           </Tooltip>
//         )
//         var alreadyAdminLink = (
//           <Tooltip placement='right' title={'You are a admin of this group'}>
//             <span><a disabled='disabled'>Apply</a></span>
//           </Tooltip>
//         )
//         var isMember = this.props.joinedCoteries.map(c => c.pk).includes(record.pk)
//         var isAdmin = this.props.administratedCoteries.map(c => c.pk).includes(record.pk)
//         return isAdmin ? alreadyAdminLink : isMember ? alreadyMemberLink : applyLink
//       }
//     }]
//
//     return (
//       <div>
//         <Table
//           dataSource={this.state.data}
//           columns={columns}
//           className={'card'}
//           style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, padding: 18 }}
//           pagination={{ pageSize: 10 }}
//           rowKey={record => record.pk}
//           onChange={this.handleChange}
//         />
//         <Modal
//           title={'Apply to join: ' + this.state.targetedCoterie.name}
//           wrapClassName='vertical-center-modal'
//           visible={this.state.createApplicationModelVisible}
//           onOk={this.submitApplicationCoterieForm}
//           onCancel={() => {this.setState({ createApplicationModelVisible: false })}}
//         >
//           <TextArea
//             onChange={async (e) => this.setState({ applicationMessage: e.target.value })}
//             value={this.state.applicationMessage}
//           ></TextArea>
//         </Modal>
//       </div>
//     )
//   }
// }

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
      />
    )
  }
}

export { SearchResultTab }


