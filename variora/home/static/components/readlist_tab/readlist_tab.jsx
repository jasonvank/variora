import 'regenerator-runtime/runtime'

import { Icon, Input, message, Layout, Menu } from 'antd'
import { Link, Route, Switch } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { ReadlistDocumentsSubtab } from './readlist_documents_subtab.jsx'
import { ReadlistSettingsSubtab } from './readlist_settings_subtab.jsx'
import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedRelative } from 'react-intl'
const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup

class ReadlistTabBeforeConnect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      readlistSlug: props.match.params.readlistSlug,
      user: props.user,
      readlist: {
        name: '',
        description: '',
        documents: [],
        owner: {
          nickname: '',
          portrait_url: '',
        },
      },
      isOwner: false,
      isCollector: false,
    }
    if (this.props.coterieUUID !== undefined)
      this.state.sub_url_base = `/groups/${this.props.coterieUUID}/readlists/`
    else this.state.sub_url_base = `/readlists/`
    this.updateData = () => {
      let url = `/file_viewer/api/readlists/${this.state.readlistSlug}`
      if (this.props.coterie !== undefined) {
        if (this.props.coterie.pk === undefined) return
        url = `/coterie/api/${this.props.coterie.pk}/coteriereadlists/${this.state.readlistSlug}`
      }

      axios
        .get(url)
        .then(response => {
          this.setState({
            readlist: {
              ...response.data,
              documents: response.data.documents.sort((a, b) => a.title > b.title),
            },
            isOwner: this.state.user.email_address == response.data.owner.email_address,
          })
        })
        .catch(e => {
          message.warning(e.message)
        })

      if (
        this.props.collectedReadlists
          .map(readlist => readlist.slug)
          .includes(this.state.readlistSlug)
      )
        this.setState({ isCollector: true })
      else this.setState({ isCollector: false })
    }
  }

  componentDidMount() {
    this.updateData()
  }

  async componentWillReceiveProps(props) {
    if (this.state.readlistSlug == props.readlistSlug) return
    await this.setState({
      readlistSlug: props.match.params.readlistSlug,
      user: props.user,
    })
    this.updateData()
  }

  render() {
    var path = this.props.location.pathname
    return (
      <Content
        style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 16, margin: 0, minHeight: 280 }}
      >
        <Menu
          onClick={this.handleClick}
          mode='horizontal'
          style={{ padding: 0 }}
          defaultSelectedKeys={['readlist-documents']}
          selectedKeys={path.includes('settings') ? ['readlist-settings'] : ['readlist-documents']}
        >
          <Menu.Item key='readlist-documents'>
            <Link to={this.state.sub_url_base + this.state.readlistSlug + '/'}>
              <Icon type='book' />
              <FormattedMessage
                id='app.readlist.readlist_documents'
                defaultMessage='Readlist Documents'
              />
            </Link>
          </Menu.Item>

          {this.state.isOwner ? (
            <Menu.Item key='readlist-settings'>
              <Link to={this.state.sub_url_base + this.state.readlistSlug + '/settings'}>
                <Icon type='setting' />
                <FormattedMessage
                  id='app.readlist.readlist_setting'
                  defaultMessage='Readlist Settings'
                />
              </Link>
            </Menu.Item>
          ) : null}
        </Menu>
        <Switch>
          <Route
            exact
            path={this.state.sub_url_base + this.state.readlistSlug + '/'}
            render={() => (
              <ReadlistDocumentsSubtab
                user={this.state.user}
                readlistSlug={this.state.readlistSlug}
                readlist={this.state.readlist}
                isOwner={this.state.isOwner}
                isCollector={this.state.isCollector}
                updateData={this.updateData}
                updateReadlistsCallback={this.props.updateReadlistsCallback}
              />
            )}
          />
          <Route
            exact
            path={this.state.sub_url_base + this.state.readlistSlug + '/settings'}
            render={() => (
              <ReadlistSettingsSubtab
                coterieUUID={this.props.coterieUUID}
                readlistSlug={this.state.readlistSlug}
                readlist={this.state.readlist}
                updateReadlistsCallback={this.props.updateReadlistsCallback}
                updateReadlistsNameCallback={this.props.updateReadlistsNameCallback}
                updateData={this.updateData}
              />
            )}
          />
        </Switch>
      </Content>
    )
  }
}

const mapStoreToProps = (store, ownProps) => {
  return {
    ...ownProps,
    ...store,
  }
}
const ReadlistTab = connect(
  mapStoreToProps,
  {},
)(ReadlistTabBeforeConnect)
export { ReadlistTab }
