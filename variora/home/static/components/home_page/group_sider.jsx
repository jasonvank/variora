/* eslint-disable comma-dangle */
import { Icon, Input, Layout, Menu } from 'antd'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import 'regenerator-runtime/runtime'
import '../../css/test_index.css'

const Search = Input.Search
const { SubMenu } = Menu

const { Header, Content, Sider, Footer } = Layout

class GroupSider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      administratedCoteries: {},
      joinedCoteries: {},
      locale: 'en',
      fields  : props.fields,
      user: props.user,
      collectedReadlists: props.collectedReadlists,
      createReadlistModelVisible: props.createReadlistModelVisible,
      createdReadlists: props.createdReadlists,
      createGroupModelVisible: props.createGroupModelVisible
    }
  }

  ComponentDidMount() {
    this.setState({
      user: this.props.user,
      administratedCoteries: this.props.administratedCoteries,
      joinedCoteries: this.props.joinedCoteries,
      locale: this.props.locale,
      fields: this.props.fields,
      collectedReadlists: this.props.collectedReadlists,
      createReadlistModelVisible: this.props.createReadlistModelVisible,
      createdReadlists: this.props.createdReadlists,
      createGroupModelVisible: this.props.createGroupModelVisible
    })
  }

  ComponentWillReceiveProps(nextProps) {
    this.setState({
      user: nextProps.user,
      administratedCoteries: nextProps.administratedCoteries,
      joinedCoteries: nextProps.joinedCoteries,
      locale: nextProps.locale,
      fields: nextProps.fields,
      collectedReadlists: nextProps.collectedReadlists,
      createReadlistModelVisible: nextProps.createReadlistModelVisible,
      createdReadlists: nextProps.createdReadlists,
      createGroupModelVisible: nextProps.createGroupModelVisible
    })
  }

  render() {
    const fields = this.props.fields
  
    const pathname = window.location.pathname
    const defaultSelectedKeys = () => {
      if (pathname.endsWith('/search')) return []
      if (pathname.includes('members')) return ['group-members']
      if (pathname.includes('settings') && !pathname.includes('readlists'))
        return ['group-settings']
      if (pathname.includes('readlists')) {
        const pageElement = pathname.split('/')
        return [pageElement[3] + pageElement[4]]
      }
      return ['group-documents']
    }

    return (
      <Sider
        className='sider'
        width={200}
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'fixed',
          left: 0,
          top: 64,
          background: '#fff',
          height: '100%',
        }}
      >
        <Menu
          mode='inline'
          defaultOpenKeys={['created_readlists', 'collected_readlists']}
          onClick={this.onClickCreateReadlistMenuItem}
          style={{ borderRight: 0 }}
          defaultSelectedKeys={defaultSelectedKeys()}
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
                    to={`/groups/${this.props.coterieUUID}/readlists/${readlist.slug}`}
                  >
                    <Icon type='folder' />
                    <span>{readlist.name}</span>
                  </Link>
                </Menu.Item>
              ))}
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
        </Menu>
      </Sider>
    )
  }
}

export { GroupSider }
