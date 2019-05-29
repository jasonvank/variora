import 'regenerator-runtime/runtime'

import { Avatar, Icon, Input, Layout, Menu, message, Table } from 'antd'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { GroupDocumentsSubtab } from './group_documents_subtab.jsx'
import React from 'react'
import axios from 'axios'
import TimeAgo from 'react-timeago'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup

const SUB_URL_BASE = '/groups/'

class GroupReadlistsTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: props.coteriePk,
      coterieUUI: props.coterieUUI,
      isAdmin: props.isAdmin,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      coterieUUI: nextProps.coterieUUI,
      isAdmin: nextProps.isAdmin,
    })
  }

  render() {
    const path = this.props.location.pathname
    return (
      <Content
        style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}
      >
        <Menu
          onClick={this.handleClick}
          mode='horizontal'
          style={{ padding: 0 }}
          defaultSelectedKeys={['group-readlists']}
        >
          <Menu.Item key='group-readlists'>
            <Link to={SUB_URL_BASE + this.state.coterieUUI + '/readlists'}>
              <Icon type='folder' />
              <FormattedMessage id='app.group.group_readlists' defaultMessage='Group Readlists' />
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route
            exact
            path={SUB_URL_BASE + this.state.coterieUUI + '/readlists'}
            render={() => (
              <GroupReadlistsSubtab
                isAdmin={this.state.isAdmin}
                coterieUUID={this.state.coterieUUI}
                coteriePk={this.state.coteriePk}
              />
            )}
          />
        </Switch>
      </Content>
    )
  }
}

class GroupReadlistsSubtab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: null,
      data: [],
    }

    this.handleChange = sorter => {
      this.setState({
        sortedInfo: sorter,
      })
    }

    this.updateData = () => {
      axios
        .get(getUrlFormat('/coterie/api/coteries/' + this.props.coteriePk, {}))
        .then(response => {
          this.setState({
            data: response.data.coteriereadlist_set,
          })
        })
        .catch(e => {
          message.warning(e.message)
        })
    }
  }

  componentDidMount() {
    this.updateData()
  }
  componentWillReceiveProps(nextProps) {
    this.updateData()
  }

  render() {
    let sortedInfo = this.state.sortedInfo
    sortedInfo = sortedInfo || {}

    const columns = [
      {
        title: <FormattedMessage id='app.table.readlist_name' defaultMessage='Readlist Name' />,
        dataIndex: 'name',
        width: '40%',
        render: (text, record) => (
          <Link className='document-link custom-card-text-wrapper' title={text} to={record.url}>
            {text}
          </Link>
        ),
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: <FormattedMessage id='app.table.creator' defaultMessage='Creator' />,
        render: (text, record) => (
          <span>
            <Avatar
              src={record.owner.portrait_url}
              style={{ verticalAlign: 'middle', marginRight: 12 }}
            />
            {record.owner.nickname}
          </span>
        ),
        width: '30%',
      },
      {
        title: <FormattedMessage id='app.table.create_date' defaultMessage='Create Date' />,
        width: '30%',
        render: (text, record) => <TimeAgo date={record.create_time} />,
        sorter: (a, b) => Date.parse(a.create_time) > Date.parse(b.create_time),
      },
    ]

    return (
      <Table
        dataSource={this.state.data}
        columns={columns}
        className={'card'}
        style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18 }}
        pagination={{ pageSize: 10 }}
        rowKey={record => record.uuid}
        onChange={this.handleChange}
        locale={{
          emptyText: (
            <FormattedMessage
              id='app.group.message.no_readlists'
              defaultMessage='No readlists found'
            />
          ),
        }}
      />
    )
  }
}

export { GroupReadlistsTab }
