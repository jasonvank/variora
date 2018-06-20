import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Icon, Input, Layout, Menu } from 'antd';
import { Link, Route, Switch } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { GroupDocumentsSubtab } from './group_documents_subtab.jsx'
import { GroupMembersSubtab } from './group_members_subtab.jsx'
import { GroupSettingsSubtab } from './group_settings_subtab.jsx'
import React from 'react';
import axios from 'axios'

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;


const SUB_URL_BASE = '/groups/'

class GroupTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: props.match.params.coteriePk,
      isAdmin: props.isAdmin,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.match.params.coteriePk,
      isAdmin: nextProps.isAdmin,
    })
  }

  render() {
    var path = this.props.location.pathname;
    return (
      <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 8, margin: 0, minHeight: 280 }}>
        <Menu
          onClick={this.handleClick}
          mode="horizontal"
          style={{ padding: 0 }}
          defaultSelectedKeys={['group-documents']}
          selectedKeys = {
            path.includes('members') ? ["group-members"] : path.includes('settings') ? ["group-settings"] : ['group-documents']
          }
        >
          <Menu.Item key="group-documents">
            <Link to={SUB_URL_BASE + this.state.coteriePk + '/'}><Icon type="book" />Group Documents</Link>
          </Menu.Item>
          <Menu.Item key="group-members">
            <Link to={SUB_URL_BASE + this.state.coteriePk + '/members'}><Icon type="usergroup-add" />Group Members</Link>
          </Menu.Item>
          <Menu.Item key="group-settings">
            <Link to={SUB_URL_BASE + this.state.coteriePk + '/settings'}><Icon type="setting" />Group Settings</Link>
          </Menu.Item>
        </Menu>
        <Switch>
          <Route exact path={SUB_URL_BASE + this.state.coteriePk + '/'} render={() => <GroupDocumentsSubtab isAdmin={this.state.isAdmin} coteriePk={this.state.coteriePk} />} />
          <Route exact path={SUB_URL_BASE + this.state.coteriePk + '/members'} render={() => <GroupMembersSubtab isAdmin={this.state.isAdmin} coteriePk={this.state.coteriePk} />} />
          <Route exact path={SUB_URL_BASE + this.state.coteriePk + '/settings'} render={() => <GroupSettingsSubtab isAdmin={this.state.isAdmin} coteriePk={this.state.coteriePk} removeCoterieCallback={this.props.removeCoterieCallback} />} />
        </Switch>
      </Content>
    );
  }
}

export { GroupTab };











