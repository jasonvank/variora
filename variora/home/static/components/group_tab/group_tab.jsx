import 'regenerator-runtime/runtime'

import { Icon, Input, Layout, Menu } from 'antd'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { GroupDocumentsSubtab } from './group_documents_subtab.jsx'
import { GroupMembersSubtab } from './group_members_subtab.jsx'
import { GroupMemberInvitationsSubtab } from './group_member_invitations_subtab.jsx'
import { GroupSettingsSubtab } from './group_settings_subtab.jsx'
import React from 'react'

const { Header, Content, Sider } = Layout

const SUB_URL_BASE = '/groups/'

class GroupTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      coteriePk: props.coteriePk,
      coterieUUID: props.coterieUUID,
      isAdmin: props.isAdmin,
      coterieName: props.coterieName,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      coteriePk: nextProps.coteriePk,
      coterieUUID: nextProps.coterieUUID,
      isAdmin: nextProps.isAdmin,
      coterieName: nextProps.coterieName,
    })
  }

  render() {
    const path = this.props.location.pathname
    const selectedKeys = path.endsWith('invitations')
      ? ['group-member-invitations']
      : path.includes('members')
      ? ['group-members']
      : path.includes('settings') && !path.includes('readlists')
      ? ['group-settings']
      : ['group-documents']
    return (
      <Content
        style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}
      >
        <Menu
          onClick={this.handleClick}
          mode='horizontal'
          style={{ padding: 0 }}
          defaultSelectedKeys={['group-documents']}
          selectedKeys={selectedKeys}
        >
          <Menu.Item
            key='group-documents'
            style={{ display: selectedKeys.includes('group-documents') ? 'inline-block' : 'none' }}
          >
            <Link to={SUB_URL_BASE + this.state.coterieUUID + '/'}>
              <Icon type='book' />
              <FormattedMessage id='app.group.documents' defaultMessage='Group Documents' />
            </Link>
          </Menu.Item>
          <Menu.Item
            key='group-members'
            style={{
              display:
                selectedKeys.includes('group-members') ||
                selectedKeys.includes('group-member-invitations')
                  ? 'inline-block'
                  : 'none',
            }}
          >
            <Link to={SUB_URL_BASE + this.state.coterieUUID + '/members'}>
              <Icon type='team' />
              <FormattedMessage id='app.group.members' defaultMessage='Group Members' />
            </Link>
          </Menu.Item>
          {this.state.isAdmin ? (
            <Menu.Item
              key='group-member-invitations'
              style={{
                display:
                  selectedKeys.includes('group-members') ||
                  selectedKeys.includes('group-member-invitations')
                    ? 'inline-block'
                    : 'none',
              }}
            >
              <Link to={SUB_URL_BASE + this.state.coterieUUID + '/members/invitations'}>
                <Icon type='user-add' />
                <FormattedMessage
                  id='app.group.member_invitation'
                  defaultMessage='Member invitations'
                />
              </Link>
            </Menu.Item>
          ) : null}
          <Menu.Item
            key='group-settings'
            style={{ display: selectedKeys.includes('group-settings') ? 'inline-block' : 'none' }}
          >
            <Link to={SUB_URL_BASE + this.state.coterieUUID + '/settings'}>
              <Icon type='setting' />
              <FormattedMessage id='app.group.settings' defaultMessage='Group Settings' />
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route
            exact
            path={SUB_URL_BASE + this.state.coterieUUID + '/'}
            render={() => (
              <GroupDocumentsSubtab
                isAdmin={this.state.isAdmin}
                coterieUUID={this.state.coterieUUID}
                coteriePk={this.state.coteriePk}
              />
            )}
          />

          <Route
            exact
            path={SUB_URL_BASE + this.state.coterieUUID + '/members'}
            render={() => (
              <GroupMembersSubtab isAdmin={this.state.isAdmin} coteriePk={this.state.coteriePk} />
            )}
          />

          <Route
            exact
            path={SUB_URL_BASE + this.state.coterieUUID + '/members/invitations'}
            render={() => (
              <GroupMemberInvitationsSubtab
                isAdmin={this.state.isAdmin}
                coterieUUID={this.state.coterieUUID}
                coteriePk={this.state.coteriePk}
              />
            )}
          />

          <Route
            exact
            path={SUB_URL_BASE + this.state.coterieUUID + '/settings'}
            render={() => (
              <GroupSettingsSubtab
                isAdmin={this.state.isAdmin}
                coteriePk={this.state.coteriePk}
                coterieName={this.state.coterieName}
                removeCoterieCallback={this.props.removeCoterieCallback}
                updateCoterieCallback={this.props.updateCoterieCallback}
              />
            )}
          />

          <Route
            exact
            path={SUB_URL_BASE + this.state.coterieUUID + '/uploads'}
            render={() => <Redirect to={SUB_URL_BASE + this.state.coterieUUID + '/'} />}
          />
        </Switch>
      </Content>
    )
  }
}

export { GroupTab }
