/* eslint-disable comma-dangle */
import './css/test_index.css'
import 'regenerator-runtime/runtime'

import {
  Avatar,
  Col,
  Form,
  Icon,
  Input,
  Layout,
  Dropdown,
  Menu,
  Modal,
  Row,
  message,
  notification,
  LocaleProvider,
} from 'antd'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { FormattedMessage, IntlProvider, addLocaleData, injectIntl } from 'react-intl'
import { Provider, connect } from 'react-redux'
import { getCookie, getValFromUrlParam, groupAvatarColors } from 'util.js'
import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import firebase from 'firebase'
import locale_en from 'react-intl/locale-data/en'
import locale_zh from 'react-intl/locale-data/zh'
import {
  fetchLocale,
  setLocale,
  fetchUser,
  setCollectedReadlists,
  setCreatedReadlists,
} from './redux/actions.js'
import { DocumentTab } from './components/document_tab.jsx'
import { ExploreTab } from './components/explore_tab.jsx'
import { GroupReadlistsTab } from './components/group_tab/group_readlists_tab.jsx'
import { GroupTab } from './components/group_tab/group_tab.jsx'
import { ReadlistTab } from './components/readlist_tab/readlist_tab.jsx'
import { SearchResultTab } from './components/search_result_tab/search_result_tab.jsx'
import TextArea from '../../../node_modules/antd/lib/input/TextArea'
import { initialStore } from './redux/init_store.js'
import { store } from './redux/store.js'
import { Navbar } from './components/home_page/navbar.jsx'
import messages_zh from './locales/zh.json'
import messages_en from './locales/en.json'
import enUS from 'antd/lib/locale-provider/en_US'

const messages = {
  en: messages_en,
  zh: messages_zh,
}

addLocaleData([...locale_en, ...locale_zh])

const FormItem = Form.Item

const config = {
  messagingSenderId: '241959101179',
}
firebase.initializeApp(config)

const { SubMenu } = Menu
const { Header, Content, Sider, Footer } = Layout
const Search = Input.Search
const CREATE_NEW_READLIST_MENU_ITEM_KEY = 'createReadlistButton'

const GLOBAL_URL_BASE = ''

function getCoterieUUID() {
  if (window.location.pathname.includes('/groups/')) return window.location.pathname.split('/')[2]
  return undefined
}

let groupIcon = null

class AppBeforeConnect extends React.Component {
  constructor() {
    super()
    this.state = {
      locale: 'en',
      fields: {
        coterieName: {
          value: '',
        },
        readlistName: {
          value: '',
        },
        readlistDesc: {
          value: '',
        },
      },
      createGroupModelVisible: false,
      createReadlistModelVisible: false,
      user: initialStore.user,
      administratedCoteries: [],
      joinedCoteries: [],
      createdReadlists: [],
      collectedReadlists: [],
      coterieUUID: undefined,
      currentCoterie: {},
    }

    this.handleLanguageChange = menuItem => {
      this.setState({ locale: menuItem.key })
      this.props.setLocale(menuItem.key)
    }

    this.handleSearch = searchKey => {
      if (searchKey.length === 0) return
      const coterieUUID = getCoterieUUID()
      if (coterieUUID !== undefined)
        window.location.href = decodeURIComponent(`/groups/${coterieUUID}/search?key=${searchKey}`)
      else window.location.href = decodeURIComponent(`${GLOBAL_URL_BASE}/search?key=${searchKey}`)
    }

    this.setCreateCoterieModelVisible = visibility => {
      this.setState({ createGroupModelVisible: visibility })
    }

    this.setCreateReadlistModelVisible = visibility => {
      this.setState({ createReadlistModelVisible: visibility })
    }

    this.onClickCreateReadlistMenuItem = menuItem => {
      if (menuItem.key == CREATE_NEW_READLIST_MENU_ITEM_KEY)
        this.setCreateReadlistModelVisible(true)
    }

    this.signOff = () => {
      // invalidateToken().then(() => {
      //   var data = new FormData()
      //   data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      //   axios.post('/api/signoff', data).then(response => {
      //     window.location.reload()
      //   })
      // })
      const data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/api/signoff', data).then(() => {
        window.location.reload()
      })
    }

    this.handleCreateReadlistFromChange = changedFields => {
      this.setState({
        fields: { ...this.state.fields, ...changedFields },
      })
    }

    this.handleCreateCoterieFromChange = changedFields => {
      this.setState({
        fields: { ...this.state.fields, ...changedFields },
      })
    }

    this.getHighlightedMenuItems = () => {
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

    this.submitCreateReadlistForm = () => {
      let url = '/file_viewer/api/readlists/create'
      if (this.state.currentCoterie.pk !== undefined)
        url = `/coterie/api/${this.state.currentCoterie.pk}/coteriereadlists/create`

      const readlistName = this.state.fields.readlistName.value
      if (readlistName == '') {
        message.warning(
          <FormattedMessage
            id='app.readlists.message.empty_name'
            defaultMessage='The name of the readlist cannot be empty!'
          />,
          1,
        )
      } else {
        const data = new FormData()
        data.append('readlist_name', readlistName)
        data.append('description', this.state.fields.readlistDesc.value)
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post(url, data).then(response => {
          const newCreatedReadlists = this.state.createdReadlists.slice()
          newCreatedReadlists.push(response.data)
          this.setCreateReadlistModelVisible(false)
          this.setState({
            fields: { ...this.state.fields, readlistName: { value: '' } },
            createdReadlists: newCreatedReadlists,
          })
          this.props.setCreatedReadlists(newCreatedReadlists)
        })
      }
    }

    this.submitCreateCoterieForm = () => {
      const coterieName = this.state.fields.coterieName.value
      if (coterieName == '') {
        message.warning(
          <FormattedMessage
            id='app.group.message.empty_name'
            defaultMessage='Group name cannot be empty!'
          />,
          1,
        )
      } else {
        const data = new FormData()
        data.append('coterie_name', coterieName)
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/coterie/api/coteries/create', data).then(response => {
          const newAdministratedCoteries = this.state.administratedCoteries.slice()
          newAdministratedCoteries.push(response.data)
          this.setCreateCoterieModelVisible(false)
          this.setState({
            fields: { ...this.state.fields, coterieName: { value: '' } },
            administratedCoteries: newAdministratedCoteries,
          })
        })
      }
    }

    this.removeCoterieCallback = coteriePk => {
      const updatedAdministratedCoteries = this.state.administratedCoteries.filter(
        coterie => coterie.pk != coteriePk,
      )
      const updatedJoinedCoteries = this.state.joinedCoteries.filter(
        coterie => coterie.pk != coteriePk,
      )
      this.setState({
        administratedCoteries: updatedAdministratedCoteries,
        joinedCoteries: updatedJoinedCoteries,
      })
    }

    this.updateReadlistsCallback = readlistSlug => {
      const newCreatedReadlists = this.state.createdReadlists.filter(
        readlist => readlist.slug !== readlistSlug,
      )
      const newCollectedReadlists = this.state.collectedReadlists.filter(
        readlist => readlist.slug !== readlistSlug,
      )
      this.setState({
        createdReadlists: newCreatedReadlists,
        collectedReadlists: newCollectedReadlists,
      })
      let url = '/file_viewer/api/readlists'
      if (this.state.coterieUUID !== undefined)
        url = `/coterie/api/coteries/${this.state.coterieUUID}/members/me/coteriereadlists`

      axios.get(url).then(response => {
        this.setState({ collectedReadlists: response.data.collected_readlists })
        this.props.setCollectedReadlists(response.data.collected_readlists)
        this.props.setCreatedReadlists(newCreatedReadlists)
      })
    }

    this.updateCoterieCallback = (coteriePk, new_name) => {
      const updatedAdministratedCoteries = this.state.administratedCoteries.map(coterie => {
        if (coterie.pk !== coteriePk) return coterie
        return Object.assign({}, coterie, { name: new_name })
      })
      this.setState({ administratedCoteries: updatedAdministratedCoteries })
    }

    this.updateReadlistsNameCallback = (readlistSlug, new_name) => {
      const updatedCreatedReadlist = this.state.createdReadlists.map(readlist => {
        if (readlist.slug !== readlistSlug) return readlist
        return Object.assign({}, readlist, { name: new_name })
      })
      this.setState({ createdReadlists: updatedCreatedReadlist })
    }

    this.acceptInvitationCallback = coteriePk => {
      axios.get(`/coterie/api/coteries/${coteriePk}`).then(response => {
        const joinedCoteries = this.state.joinedCoteries
        const hasAlreadyJoined = joinedCoteries.find(group => group.pk == coteriePk) != undefined
        if (!hasAlreadyJoined) {
          const updatedJoinedCoteries = this.state.joinedCoteries.concat(response.data)
          this.setState({ joinedCoteries: updatedJoinedCoteries })
        }
        window.location.href = `/groups/${response.data.uuid}/`
      })
    }

    this.renderGroupTab = (match, location) => {
      const coterieUUID = match.params.coterieUUID
      const isAdmin = this.state.administratedCoteries
        .map(coterie => coterie.uuid)
        .includes(coterieUUID)
      const filtered = this.state.administratedCoteries
        .filter(coterie => coterie.uuid === coterieUUID)
        .concat(this.state.joinedCoteries.filter(coterie => coterie.uuid === coterieUUID))
      if (filtered.length === 0) return null

      return (
        <GroupTab
          removeCoterieCallback={this.removeCoterieCallback}
          updateCoterieCallback={this.updateCoterieCallback}
          isAdmin={isAdmin}
          match={match}
          location={location}
          coteriePk={filtered[0].pk}
          coterieUUI={coterieUUID}
          coterieName={filtered[0].name}
        />
      )
    }

    this.renderReadlistTab = (match, location) => (
      <ReadlistTab
        user={this.state.user}
        match={match}
        coterieUUID={match.params.coterieUUID}
        coterie={match.params.coterieUUID === undefined ? undefined : this.state.currentCoterie}
        location={location}
        updateReadlistsCallback={this.updateReadlistsCallback}
        updateReadlistsNameCallback={this.updateReadlistsNameCallback}
      />
    )

    this.renderGroupReadlistsTab = (match, location) => {
      const coterieUUID = match.params.coterieUUID
      const isAdmin = this.state.administratedCoteries
        .map(coterie => coterie.uuid)
        .includes(coterieUUID)
      const filtered = this.state.administratedCoteries
        .filter(coterie => coterie.uuid === coterieUUID)
        .concat(this.state.joinedCoteries.filter(coterie => coterie.uuid === coterieUUID))
      if (filtered.length === 0) return null

      return (
        <GroupReadlistsTab
          removeCoterieCallback={this.removeCoterieCallback}
          isAdmin={isAdmin}
          match={match}
          location={location}
          coteriePk={filtered[0].pk}
          coterieUUI={coterieUUID}
        />
      )
    }

    this.renderSearchTab = (match, location) => (
      <SearchResultTab user={this.state.user} match={match} location={location} />
    )

    this.updateReadlist = data => {
      this.setState({
        createdReadlists: data.created_readlists,
        collectedReadlists: data.collected_readlists,
      })
      this.props.setCollectedReadlists(data.collected_readlists)
    }
  }

  componentDidMount() {
    this.props.fetchUser()
    this.props.fetchLocale()
    axios.get('/coterie/api/coteries').then(response => {
      this.setState(
        {
          administratedCoteries: response.data.administratedCoteries,
          joinedCoteries: response.data.joinedCoteries,
        },
        () => {
          if (getCoterieUUID() !== undefined) {
            const coterieUUID = getCoterieUUID()
            const filtered = this.state.administratedCoteries
              .concat(this.state.joinedCoteries)
              .filter(c => c.uuid === coterieUUID)
            if (filtered.length === 0) return null
            const coterie = filtered[0]
            this.setState({ coterieUUID, currentCoterie: coterie })

            axios
              .get(`/coterie/api/coteries/${coterieUUID}/members/me/coteriereadlists`)
              .then(response => this.updateReadlist(response.data))
          } else {
            axios
              .get('/file_viewer/api/readlists')
              .then(response => this.updateReadlist(response.data))
          }
        },
      )
    })
  }

  componentWillReceiveProps(props) {
    this.setState({ user: props.user, locale: props.locale })
  }

  render() {
    notification.config({ top: 66 })

    const fields = this.state.fields

    const groupRouter = coterieUUID => {
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
        <Router basename={GLOBAL_URL_BASE}>
          <Layout>
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
                defaultSelectedKeys={defaultSelectedKeys()}
              >
                {/* <Menu.Item key="explore" > */}
                {/* <Link to="/explore"><span><Icon type="compass" />Explore</span></Link> */}
                {/* </Menu.Item> */}
                <Menu.Item key='group-documents' disabled={!this.state.user.is_authenticated}>
                  <Link to={`/groups/${coterieUUID}/`}>
                    <span>
                      <Icon type='book' />
                      <FormattedMessage id='app.group.documents' defaultMessage='Group Documents' />
                    </span>
                  </Link>
                </Menu.Item>

                <Menu.Item key='group-readlists' disabled={!this.state.user.is_authenticated}>
                  <Link to={`/groups/${coterieUUID}/readlists`}>
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
                      <FormattedMessage
                        id='app.readlists.create'
                        defaultMessage='Created Readlists'
                      />
                    </span>
                  }
                  disabled={!this.state.user.is_authenticated}
                >
                  {this.state.createdReadlists
                    .sort((a, b) => a.name > b.name)
                    .map(readlist => (
                      <Menu.Item key={`readlists${readlist.slug}`} title={readlist.name}>
                        <Link
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                          to={`/groups/${coterieUUID}/readlists/${readlist.slug}`}
                        >
                          <Icon type='folder-open' />
                          <span>{readlist.name}</span>
                        </Link>
                      </Menu.Item>
                    ))}
                  <Menu.Item
                    disabled={!this.state.user.is_authenticated}
                    key={CREATE_NEW_READLIST_MENU_ITEM_KEY}
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
                  disabled={!this.state.user.is_authenticated}
                >
                  {this.state.collectedReadlists
                    .sort((a, b) => a.name > b.name)
                    .map(readlist => (
                      <Menu.Item key={`readlists${readlist.slug}`} title={readlist.name}>
                        <Link
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                          to={`/groups/${coterieUUID}/readlists/${readlist.slug}`}
                        >
                          <Icon type='folder' />
                          <span>{readlist.name}</span>
                        </Link>
                      </Menu.Item>
                    ))}
                </SubMenu>

                <Menu.Item key='group-members' disabled={!this.state.user.is_authenticated}>
                  <Link to={`/groups/${coterieUUID}/members`}>
                    <span>
                      <Icon type='team' />
                      <FormattedMessage id='app.group.members' defaultMessage='Group Members' />
                    </span>
                  </Link>
                </Menu.Item>

                <Menu.Item key='group-settings' disabled={!this.state.user.is_authenticated}>
                  <Link to={`/groups/${coterieUUID}/settings`}>
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
                  visible={this.state.createReadlistModelVisible}
                  onOk={this.submitCreateReadlistForm}
                  onCancel={() => this.setCreateReadlistModelVisible(false)}
                >
                  <CreateReadlistForm {...fields} onChange={this.handleCreateReadlistFromChange} />
                </Modal>
                <Modal
                  title={
                    <FormattedMessage id='app.group.create' defaultMessage='create a new group' />
                  }
                  wrapClassName='vertical-center-modal'
                  visible={this.state.createGroupModelVisible}
                  onOk={this.submitCreateCoterieForm}
                  onCancel={() => this.setCreateCoterieModelVisible(false)}
                >
                  <CreateCoterieForm {...fields} onChange={this.handleCreateCoterieFromChange} />
                </Modal>
              </Menu>
            </Sider>
            <Layout style={{ marginLeft: '200px', minHeight: '100vh' }}>
              <Content>
                <Switch>
                  <Route
                    path='/groups/:coterieUUID/readlists/:readlistSlug'
                    render={({ match, location }) => this.renderReadlistTab(match, location)}
                  />
                  <Route
                    path='/groups/:coterieUUID/search'
                    render={({ match, location }) => this.renderSearchTab(match, location)}
                  />
                  <Route
                    path='/groups/:coterieUUID/readlists'
                    render={({ match, location }) => this.renderGroupReadlistsTab(match, location)}
                  />
                  <Route
                    path='/groups/:coterieUUID'
                    render={({ match, location }) => this.renderGroupTab(match, location)}
                  />
                </Switch>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                © {new Date().getFullYear()} Variora. Reach us via{' '}
                <a style={{ color: '#37b' }} href='mailto:variora@outlook.com'>
                  variora@outlook.com
                </a>
              </Footer>
            </Layout>
          </Layout>
        </Router>
      )
    }

    const globalRouter = (
      <Router basename={GLOBAL_URL_BASE}>
        <Layout>
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
              defaultSelectedKeys={this.getHighlightedMenuItems()}
            >
              <Menu.Item key='explore'>
                <Link to='/explore'>
                  <span>
                    <Icon type='compass' />
                    <FormattedMessage id='app.explore.explore' defaultMessage='Explore' />
                  </span>
                </Link>
              </Menu.Item>
              <Menu.Item key='documents' disabled={!this.state.user.is_authenticated}>
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
                    <FormattedMessage
                      id='app.readlists.create'
                      defaultMessage='Created Readlists'
                    />
                  </span>
                }
                disabled={!this.state.user.is_authenticated}
              >
                {this.state.createdReadlists
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
                  disabled={!this.state.user.is_authenticated}
                  key={CREATE_NEW_READLIST_MENU_ITEM_KEY}
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
                disabled={!this.state.user.is_authenticated}
              >
                {this.state.collectedReadlists
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
                visible={this.state.createReadlistModelVisible}
                onOk={this.submitCreateReadlistForm}
                onCancel={() => this.setCreateReadlistModelVisible(false)}
              >
                <CreateReadlistForm {...fields} onChange={this.handleCreateReadlistFromChange} />
              </Modal>

              <Modal
                title={
                  <FormattedMessage id='app.group.create' defaultMessage='create a new group' />
                }
                wrapClassName='vertical-center-modal'
                visible={this.state.createGroupModelVisible}
                onOk={this.submitCreateCoterieForm}
                onCancel={() => this.setCreateCoterieModelVisible(false)}
              >
                <CreateCoterieForm {...fields} onChange={this.handleCreateCoterieFromChange} />
              </Modal>
            </Menu>
          </Sider>
          <Layout style={{ marginLeft: '200px', minHeight: '100vh' }}>
            <Content>
              <Switch>
                <Route path='/explore' component={ExploreTab} />
                <Route path='/search' component={SearchResultTab} />
                <Route
                  path='/readlists/:readlistSlug'
                  render={({ match, location }) => this.renderReadlistTab(match, location)}
                />
                <Route
                  path='/groups/:coterieUUID'
                  render={({ match, location }) => this.renderGroupTab(match, location)}
                />
                <Route path='/' component={DocumentTab} />
              </Switch>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              © {new Date().getFullYear()} Variora. Reach us via{' '}
              <a style={{ color: '#37b' }} href='mailto:variora@outlook.com'>
                variora@outlook.com
              </a>
            </Footer>
          </Layout>
        </Layout>
      </Router>
    )

    return (
      <IntlProvider locale={this.state.locale} messages={messages[this.state.locale]}>
        <Layout>
          <Navbar
            user={this.state.user}
            administratedCoteries={this.state.administratedCoteries}
            joinedCoteries={this.state.joinedCoteries}
            locale={this.state.locale}
            handleSearch={this.handleSearch}
            handleLanguageChange={this.handleLanguageChange}
            setCreateCoterieModelVisible={this.setCreateCoterieModelVisible}
            acceptInvitationCallback={this.acceptInvitationCallback}
            signOff={this.props.signOff}
          />
          {getCoterieUUID() !== undefined ? groupRouter(getCoterieUUID()) : globalRouter}
        </Layout>
      </IntlProvider>
    )
  }
}

const CreateReadlistForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields)
  },
  mapPropsToFields(props) {
    return {
      readlistName: Form.createFormField({
        ...props.readlistName,
        value: props.readlistName.value,
      }),
      readlistDesc: Form.createFormField({
        ...props.readlistDesc,
        value: props.readlistDesc.value,
      }),
    }
  },
})(props => {
  const { getFieldDecorator } = props.form
  return (
    <Form>
      <FormItem
        label={
          <FormattedMessage
            id='app.readlists.name_readlist'
            defaultMessage='Name of the readlist'
          />
        }
      >
        {getFieldDecorator('readlistName', {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage
                  id='app.readlists.message.empty_name'
                  defaultMessage='The name of the readlist cannot be empty!'
                />
              ),
            },
          ],
        })(<Input />)}
      </FormItem>
      <FormItem
        label={<FormattedMessage id='app.readlists.description' defaultMessage='Description' />}
      >
        {getFieldDecorator('readlistDesc')(<TextArea />)}
      </FormItem>
    </Form>
  )
})

const CreateCoterieForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields)
  },
  mapPropsToFields(props) {
    return {
      coterieName: Form.createFormField({
        ...props.coterieName,
        value: props.coterieName.value,
      }),
    }
  },
})(props => {
  const { getFieldDecorator } = props.form
  return (
    <Form layout='inline'>
      <FormItem label={<FormattedMessage id='app.group.name' defaultMessage='group name' />}>
        {getFieldDecorator('coterieName', {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage
                  id='app.group.message.empty_name'
                  defaultMessage='Group name cannot be empty!'
                />
              ),
            },
          ],
        })(<Input />)}
      </FormItem>
    </Form>
  )
})

const mapStoreToProps = (store, ownProps) => ({
  ...ownProps,
  user: store.user,
  locale: store.locale,
})
const App = connect(
  mapStoreToProps,
  { fetchLocale, setLocale, fetchUser, setCollectedReadlists, setCreatedReadlists },
)(AppBeforeConnect)

ReactDOM.render(
  <Provider store={store}>
    <LocaleProvider locale={enUS}>
      <App />
    </LocaleProvider>
  </Provider>,
  document.getElementById('main'),
)
