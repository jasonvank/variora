/* eslint-disable comma-dangle */
import '../../css/test_index.css'
import { Avatar, Col, Icon, Input, Layout, Modal, Dropdown, Menu, Row } from 'antd'
import React from 'react'
import { FormattedMessage, IntlProvider, addLocaleData, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import 'regenerator-runtime/runtime'
import { getCookie, getValFromUrlParam, groupAvatarColors } from 'util.js'

import { CreateCoterieForm, CreateReadlistForm, defaultSelectedKeys } from './utils.jsx'

const Search = Input.Search
const { SubMenu } = Menu

const { Header, Content, Sider, Footer } = Layout

class GroupSider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      administratedCoteries: {},
      joinedCoteries: {},
      locale: 'en',
      fields: props.fields,
      user: props.user,
      collectedReadlists: props.collectedReadlists,
      createReadlistModelVisible: props.createReadlistModelVisible,
      createdReadlists: props.createdReadlists,
      createGroupModelVisible: props.createGroupModelVisible,
    }
  }

  ComponentDidMount() {
    this.setState({
      user: this.props.user,
      administratedCoteries: this.props.administratedCoteries,
      joinedCoteries: this.props.joinedCoteries,
      locale: this.props.locale,
      fields: this.props.fields,
      createdReadlists: this.props.createdReadlists,
      createReadlistModelVisible: this.props.createReadlistModelVisible,
      collectedReadlists: this.props.collectedReadlists,
      createGroupModelVisible: this.props.createGroupModelVisible,
    })
  }

  ComponentWillReceiveProps(nextProps) {
    this.setState({
      user: nextProps.user,
      administratedCoteries: nextProps.administratedCoteries,
      joinedCoteries: nextProps.joinedCoteries,
      locale: nextProps.locale,
      fields: nextProps.fields,
      createdReadlists: nextProps.createdReadlists,
      createReadlistModelVisible: nextProps.createReadlistModelVisible,
      collectedReadlists: nextProps.collectedReadlists,
      createGroupModelVisible: nextProps.createGroupModelVisible,
    })
  }

  render() {
    const fields = this.props.fields

    return (
      <Sider
        className='sider'
        width={200}
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          height: 'calc(100% - 64px)',
          position: 'fixed',
          left: 0,
          top: 64,
          background: '#fff',
        }}
      >
        <Menu
          mode='inline'
          defaultOpenKeys={['created_readlists', 'collected_readlists']}
          onClick={this.onClickCreateReadlistMenuItem}
          style={{ borderRight: 0 }}
          selectedKeys={defaultSelectedKeys()}
        >
          {/* <Menu.Item key="explore" > */}
          {/* <Link to="/explore"><span><Icon type="compass" />Explore</span></Link> */}
          {/* </Menu.Item> */}
          <Menu.Item key='group-documents' disabled={!this.props.user.is_authenticated}>
            <Link to={`/groups/${this.props.coterieUUID}/`}>
              <span>
                <Icon type='book' />
                <FormattedMessage id='app.group.documents' defaultMessage='Group Documents' />
              </span>
            </Link>
          </Menu.Item>

          <Menu.Item key='group-readlists' disabled={!this.props.user.is_authenticated}>
            <Link to={`/groups/${this.props.coterieUUID}/readlists`}>
              <span>
                <Icon type='folder' />
                <FormattedMessage id='app.group.readlists' defaultMessage='Group Readlists' />
              </span>
            </Link>
          </Menu.Item>

          <SubMenu
            key='created_readlists'
            title={
              <span>
                <Icon type='folder' />
                <FormattedMessage id='app.readlists.create' defaultMessage='Created Readlists' />
              </span>
            }
            disabled={!this.props.user.is_authenticated}
          >
            {this.props.createdReadlists
              ? this.props.createdReadlists
                  .sort((a, b) => a.name > b.name)
                  .map(readlist => (
                    <Menu.Item key={`readlists${readlist.slug}`} title={readlist.name}>
                      <Link
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        to={`/groups/${this.props.coterieUUID}/readlists/${readlist.slug}`}
                      >
                        <Icon type='folder-open' />
                        <span>{readlist.name}</span>
                      </Link>
                    </Menu.Item>
                  ))
              : null}
            <Menu.Item
              disabled={!this.props.user.is_authenticated}
              key={this.props.create_new_readlist_menu_item_key}
              onClick={() => this.props.setCreateReadlistModelVisible(true)}
            >
              <Icon type='plus' />
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key='collected_readlists'
            title={
              <span>
                <Icon type='folder' />
                <FormattedMessage
                  id='app.readlists.collect_readlist'
                  defaultMessage='Collected Readlists'
                />
              </span>
            }
            disabled={!this.props.user.is_authenticated}
          >
            {this.props.collectedReadlists
              ? this.props.collectedReadlists
                  .sort((a, b) => a.name > b.name)
                  .map(readlist => (
                    <Menu.Item key={`readlists${readlist.slug}`} title={readlist.name}>
                      <Link
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        to={`/groups/${this.props.coterieUUID}/readlists/${readlist.slug}`}
                      >
                        <Icon type='folder' />
                        <span>{readlist.name}</span>
                      </Link>
                    </Menu.Item>
                  ))
              : null}
          </SubMenu>

          <Menu.Item key='group-members' disabled={!this.props.user.is_authenticated}>
            <Link to={`/groups/${this.props.coterieUUID}/members`}>
              <span>
                <Icon type='team' />
                <FormattedMessage id='app.group.members' defaultMessage='Group Members' />
              </span>
            </Link>
          </Menu.Item>

          <Menu.Item key='group-settings' disabled={!this.props.user.is_authenticated}>
            <Link to={`/groups/${this.props.coterieUUID}/settings`}>
              <span>
                <Icon type='setting' />
                <FormattedMessage id='app.group.settings' defaultMessage='Group Settings' />
              </span>
            </Link>
          </Menu.Item>

          <Modal
            title={
              <FormattedMessage
                id='app.readlists.message.create'
                defaultMessage='create a new readlist'
              />
            }
            wrapClassName='vertical-center-modal'
            visible={this.props.createReadlistModelVisible}
            onOk={this.props.submitCreateReadlistForm}
            onCancel={() => this.props.setCreateReadlistModelVisible(false)}
          >
            <CreateReadlistForm
              {...this.props.fields}
              onChange={this.props.handleCreateReadlistFromChange}
            />
          </Modal>
          <Modal
            title={<FormattedMessage id='app.group.create' defaultMessage='create a new group' />}
            wrapClassName='vertical-center-modal'
            visible={this.props.createGroupModelVisible}
            onOk={this.props.submitCreateCoterieForm}
            onCancel={() => this.props.setCreateCoterieModelVisible(false)}
          >
            <CreateCoterieForm
              {...this.props.fields}
              onChange={this.props.handleCreateCoterieFromChange}
            />
          </Modal>
        </Menu>
      </Sider>
    )
  }
}

export { GroupSider }
