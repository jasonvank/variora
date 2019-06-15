/* eslint-disable comma-dangle */
import '../../css/test_index.css'
import 'regenerator-runtime/runtime'

import {
  Avatar,
  Col,
  Icon,
  Input,
  Layout,
  Dropdown,
  Menu,
  Row,
  Modal,
} from 'antd'
import { FormattedMessage, IntlProvider, addLocaleData, injectIntl } from 'react-intl'
import { getCookie, getValFromUrlParam, groupAvatarColors } from 'util.js'
import React from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import { GroupSelectionButton } from '../group_selection_button.jsx'
import { InvitationsToggleButton } from '../invitations_toggle_button.jsx'
import { NotificationsAlertButton } from '../notifications_alert_button.jsx'
import { CreateCoterieForm, CreateReadlistForm } from './common.jsx'

const { Header, Content, Sider, Footer } = Layout
const { SubMenu } = Menu

const Search = Input.Search

class GlobalSider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  ComponentDidMount() {
    this.setState({

    })
  }

  ComponentWillReceiveProps(nextProps) {
    this.setState({

    })
  }

  render() {
    const getHighlightedMenuItems = () => {
      const pathname = window.location.pathname
      if (pathname.endsWith('/search')) {
        return []
      } else if (pathname.includes('/groups/') || pathname.includes('/readlists/')) {
        const pageElement = pathname.split('/')
        return [pageElement[1] + pageElement[2]]
      } else if (pathname.includes('/explore')) {
        return ['explore']
      } else return ['documents']
    }
    
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
          onClick={this.props.onClickCreateReadlistMenuItem}
          style={{ borderRight: 0 }}
          defaultSelectedKeys={getHighlightedMenuItems()}
        >
          <Menu.Item key='explore'>
            <Link to='/explore'>
              <span>
                <Icon type='compass' />
                <FormattedMessage id='app.explore.explore' defaultMessage='Explore' />
              </span>
            </Link>
          </Menu.Item>
          <Menu.Item key='documents' disabled={!this.props.user.is_authenticated}>
            <Link to='/'>
              <span>
                <Icon type='file' />
                <FormattedMessage id='app.document.documents' defaultMessage='Documents' />
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
              .sort((a, b) => a.name > b.name)
              .map(readlist => (
                <Menu.Item key={`readlists${readlist.slug}`} title={readlist.name}>
                  <Link
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                    to={`/readlists/${readlist.slug}`}
                  >
                    <Icon type='folder-open' />
                    <span>{readlist.name}</span>
                  </Link>
                </Menu.Item>
              ))}
            <Menu.Item
              disabled={!this.props.user.is_authenticated}
              key={this.props.create_new_readlist_menu_item_key}
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
              .sort((a, b) => a.name > b.name)
              .map(readlist => (
                <Menu.Item key={`readlists${readlist.slug}`} title={readlist.name}>
                  <Link
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                    to={`/readlists/${readlist.slug}`}
                  >
                    <Icon type='folder' />
                    <span>{readlist.name}</span>
                  </Link>
                </Menu.Item>
              ))}
          </SubMenu>
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
            <CreateReadlistForm {...this.props.fields} onChange={this.props.handleCreateReadlistFromChange} />
          </Modal>

          <Modal
            title={<FormattedMessage id='app.group.create' defaultMessage='create a new group' />}
            wrapClassName='vertical-center-modal'
            visible={this.props.createGroupModelVisible}
            onOk={this.submitCreateCoterieForm}
            onCancel={() => this.setCreateCoterieModelVisible(false)}
          >
            <CreateCoterieForm {...this.props.fields} onChange={this.props.handleCreateCoterieFromChange} />
          </Modal>
        </Menu>
      </Sider>
    )
  }
}

export { GlobalSider }
