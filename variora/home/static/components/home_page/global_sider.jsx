/* eslint-disable comma-dangle */
import { Icon, Input, Layout, Menu } from 'antd';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import 'regenerator-runtime/runtime';
import '../../css/test_index.css';

const { Header, Content, Sider, Footer } = Layout
const { SubMenu } = Menu

const Search = Input.Search

class GlobalSider extends React.Component {
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
        </Menu>
      </Sider>
    )
  }
}

export { GlobalSider }
