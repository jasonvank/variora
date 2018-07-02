import 'regenerator-runtime/runtime'

import { Avatar, Input, Layout, Menu, Modal, Table, Tooltip, notification } from 'antd'
import { formatOpenDocumentUrl, getCookie, getUrlFormat } from 'util.js'

import React from 'react'
import axios from 'axios'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup
const { TextArea } = Input


class SearchResultTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resultDocuments: undefined,
      resultCoteries: undefined,
      resultUsers: undefined,
      administratedCoteries: [],
      joinedCoteries: [],
      user: undefined,
    }
  }

  componentDidMount() {
    var fullUrl = window.location.href
    var searchKey = fullUrl.slice(fullUrl.indexOf('=') + 1)
    axios.get('/api/user').then((response) => {
      var user = response.data
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
        resultCoteries: data.resultCoteries,
        resultUsers: data.resultUsers
      })
    })
  }


  render() {
    return (
      <div style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 8, margin: 0, minHeight: 280 }}>
        <div className='card' style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
          <DocumentResult resultDocuments={this.state.resultDocuments} />
        </div>
        <div className='card' style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
          <GroupResult administratedCoteries={this.state.administratedCoteries} joinedCoteries={this.state.joinedCoteries} resultCoteries={this.state.resultCoteries} user={this.state.user} />
        </div>
        <div className='card' style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}>
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
      })
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultDocuments,
    })
    this.forceUpdate()
  }

  render() {
    let sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}

    const columns = [{
      title: 'Document Name',
      dataIndex: 'title',
      width: "40%",
      render: (text, record) => <a href={formatOpenDocumentUrl(record)}>{text}</a>,
      sorter: (a, b) => a.title.localeCompare(b.title),
    }, {
      title: 'Group Owner',
      dataIndex: '',
      width: "30%",
    }, {
      title: 'Action',
      key: 'action',
      width: "30%",
    }]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={{ pageSize: 10 }}
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
      use: this.props.user,
      createApplicationModelVisible: false,
      targetedCoterie: {name: ''},
      applicationMessage: ''
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
    this.submitApplicationCoterieForm = () => {
      var data = new FormData()
      data.append('coterie_id', this.state.targetedCoterie.pk)
      data.append('application_message', this.state.applicationMessage)
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/apply', data)
      .then((response) => {
        this.setState({
          applicationMessage: this.state.applicationMessage,
          createApplicationModelVisible: false,
        })
        notification['success']({
          message: 'Application successfully sent',
          description: 'Your application has been sent to Group: ' + this.state.targetedCoterie.name + ' successfully!' + ' With message: ' + this.state.applicationMessage,
          duration: 4
        })
      })
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultCoteries,
      user: nextProps.user,
    })
    this.forceUpdate()
  }

  render() {
    let sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}

    const columns = [{
      title: 'Group Name',
      dataIndex: 'name',
      width: "40%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    }, {
      title: "Admin's Email",
      dataIndex: '',
      width: "30%",
      render: (text, record) => record.administrators.length == 0 ? '' : record.administrators[0].email_address
    }, {
      title: 'Action',
      key: 'action',
      width: "30%",
      render: (text, record) => {
        var applyLink = (
          <a href="javascript:;" onClick={() => this.onApplyClick(record)}>Apply</a>
        )
        var alreadyMemberLink = (
          <Tooltip placement="right" title={'You are a member of this group'}>
            <span><a disabled='disabled'>Apply</a></span>
          </Tooltip>
        )
        var alreadyAdminLink = (
          <Tooltip placement="right" title={'You are a admin of this group'}>
            <span><a disabled='disabled'>Apply</a></span>
          </Tooltip>
        )
        var isMember = this.props.joinedCoteries.map(c => c.pk).includes(record.pk)
        var isAdmin = this.props.administratedCoteries.map(c => c.pk).includes(record.pk)
        return isAdmin ? alreadyAdminLink : isMember ? alreadyMemberLink : applyLink
      }
    }]

    return (
      <div>
        <Table
          dataSource={this.state.data}
          columns={columns}
          pagination={{ pageSize: 10 }}
          rowKey={record => record.pk}
          onChange={this.handleChange}
        />
        <Modal
          title={"Apply to join: " + this.state.targetedCoterie.name}
          wrapClassName="vertical-center-modal"
          visible={this.state.createApplicationModelVisible}
          onOk={this.submitApplicationCoterieForm}
          onCancel={() => {this.setState({ createApplicationModelVisible: false })}}
        >
          <TextArea
            onChange={async (e) => this.setState({ applicationMessage: e.target.value })}
            value={this.state.applicationMessage}
          ></TextArea>
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

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      data: nextProps.resultUsers,
    })
    this.forceUpdate()
  }


  render() {
    let sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}
    const columns = [{
      title: 'User Name',
      dataIndex: 'nickname',
      width: "20%",
      sorter: (a, b) => a.nickname.localeCompare(b.nickname),
    }, {
      title: '',
      dataIndex: 'avatar',
      render: (text, record) => <Avatar src={ record.portrait_url } size='default' />,
    }, {
      title: 'Email Address',
      dataIndex: 'email_address',
      width: "30%",
    }, {
      title: 'Action',
      key: 'action',
      width: "30%",
    }]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        pagination={{ pageSize: 10 }}
        rowKey={record => record.email_address}
        onChange={this.handleChange}
      />
    )
  }
}

export { SearchResultTab }


