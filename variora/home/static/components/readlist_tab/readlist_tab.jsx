import 'regenerator-runtime/runtime'

import { Icon, Input, Layout, Menu } from 'antd'
import { Link, Route, Switch } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { ReadlistDocumentsSubtab } from './readlist_documents_subtab.jsx'
import { ReadlistSettingsSubtab } from './readlist_settings_subtab.jsx'
import React from 'react'
import axios from 'axios'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup


const SUB_URL_BASE = '/groups/'

class GroupTab extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
    })
  }

  render() {
    var path = this.props.location.pathname
    return (
      <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}>
        <Menu
          onClick={this.handleClick}
          mode="horizontal"
          style={{ padding: 0 }}
          defaultSelectedKeys={['readlist-documents']}
          selectedKeys = {
            path.includes('settings') ? ['readlist-settings'] : ['readlist-documents']
          }
        >
          <Menu.Item key='readlist-documents'>
            <Link to={SUB_URL_BASE + this.state.coteriePk + '/'}><Icon type="book" />Group Documents</Link>
          </Menu.Item>
          <Menu.Item key='readlist-settings'>
            <Link to={SUB_URL_BASE + this.state.coteriePk + '/settings'}><Icon type="setting" />Group Settings</Link>
          </Menu.Item>
        </Menu>
        <Switch>
          <Route exact path={SUB_URL_BASE + this.state.coteriePk + '/'} render={() => <ReadlistDocumentsSubtab isAdmin={this.state.isAdmin} coteriePk={this.state.coteriePk} />} />
          <Route exact path={SUB_URL_BASE + this.state.coteriePk + '/settings'} render={() => <ReadlistSettingsSubtab isAdmin={this.state.isAdmin} coteriePk={this.state.coteriePk} removeCoterieCallback={this.props.removeCoterieCallback} />} />
        </Switch>
      </Content>
    )
  }
}

export { GroupTab }











