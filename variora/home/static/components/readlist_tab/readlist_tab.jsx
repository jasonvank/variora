import 'regenerator-runtime/runtime'

import { Icon, Input, message, Layout, Menu } from 'antd'
import { Link, Route, Switch } from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { ReadlistDocumentsSubtab } from './readlist_documents_subtab.jsx'
import { ReadlistSettingsSubtab } from './readlist_settings_subtab.jsx'
import React from 'react'
import axios from 'axios'

const { SubMenu } = Menu
const { Header, Content, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup


const SUB_URL_BASE = '/readlists/'

class ReadlistTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      readlistSlug: props.match.params.readlistSlug,
      user: props.user,
      readlist: {
        documents: [],
        owner: {
          nickname: '',
          portrait_url: ''
        }
      },
      isOwner: false,
      isCollector: false,
    }

    this.updateData = () => {
      axios.get(getUrlFormat('/file_viewer/api/readlists/' + this.state.readlistSlug, {})).then(response => {
        this.setState({
          readlist: response.data,
          isOwner: this.state.user.email_address == response.data.owner.email_address
        })
      }).catch(e => { message.warning(e.message) })

      // TODO: refactor this
      axios.get('/file_viewer/api/readlists').then((response) => {
        if (response.data.collected_readlists.map(readlist => readlist.slug).includes(this.state.readlistSlug))
          this.setState({ isCollector: true })
        else
          this.setState({ isCollector: false })
      })
    }
  }

  componentDidMount() {
    this.updateData()
  }

  async componentWillReceiveProps(props) {
    if (this.state.readlistSlug == props.readlistSlug)
      return
    await this.setState({
      readlistSlug: props.match.params.readlistSlug,
      user: props.user,
    })
    this.updateData()
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
            <Link to={SUB_URL_BASE + this.state.readlistSlug + '/'}><Icon type="book" />Readlist Documents</Link>
          </Menu.Item>

          {
            this.state.isOwner ? (
              <Menu.Item key='readlist-settings'>
                <Link to={SUB_URL_BASE + this.state.readlistSlug + '/settings'}><Icon type="setting" />Readlist Settings</Link>
              </Menu.Item>
            ) : null
          }
        </Menu>
        <Switch>
          <Route
            exact
            path={SUB_URL_BASE + this.state.readlistSlug + '/'}
            render={() =>
              <ReadlistDocumentsSubtab
                user={this.state.user}
                readlistSlug={this.state.readlistSlug}
                readlist={this.state.readlist}
                isOwner={this.state.isOwner}
                isCollector={this.state.isCollector}
                updateData={this.updateData}
                updateCollectedReadlistsCallback={this.props.updateCollectedReadlistsCallback}
              />}
          />
          <Route
            exact
            path={SUB_URL_BASE + this.state.readlistSlug + '/settings'}
            render={() => <ReadlistSettingsSubtab user={this.state.user} readlistSlug={this.state.readlistSlug} removeCoterieCallback={this.props.removeCoterieCallback} />}
          />
        </Switch>
      </Content>
    )
  }
}

export { ReadlistTab }











