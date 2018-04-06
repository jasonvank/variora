import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Upload } from 'antd';
import {
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { GroupDocumentsSubtab } from './group_documents_subtab.jsx'
import { GroupMembersSubtab } from './group_members_subtab.jsx'
import { GroupSettingsSubtab } from './group_settings_subtab.jsx'
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;


class GroupTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      baseUrl: '/test' + props.match.url,
      coteriePk: props.match.params.pk
    }
  }
  
  async componentWillReceiveProps(nextProps) {
    await this.setState({ 
      baseUrl: '/test' + nextProps.match.url,
      coteriePk: nextProps.match.params.pk,
    })
    this.forceUpdate()
  }
  
  render() {
    return (
      <Router basename={this.state.baseUrl}>
        <Content style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 8, margin: 0, minHeight: 280 }}>
          <Menu
            onClick={this.handleClick}
            mode="horizontal"
            style={{ padding: 0 }}
            defaultSelectedKeys={['group-documents']}
          >
            <Menu.Item key="group-documents">
              <Link to="/"><Icon type="book" />Group Documents</Link>
            </Menu.Item>
            <Menu.Item key="group-members">
              <Link to="/members"><Icon type="usergroup-add" />Group Members</Link>
            </Menu.Item>
            <Menu.Item key="group-settings">
              <Link to="/settings"><Icon type="setting" />Group Settings</Link>
            </Menu.Item>
          </Menu>
          <Switch>
            <Route exact path="/" render={() => <GroupDocumentsSubtab coteriePk={this.state.coteriePk} />} />
            <Route exact path="/members" render={() => <GroupMembersSubtab coteriePk={this.state.coteriePk} />} />
            <Route exact path="/settings" render={() => <GroupSettingsSubtab coteriePk={this.state.coteriePk} />} />
          </Switch>
        </Content>
      </Router>
    );
  }
}

export { GroupTab };












