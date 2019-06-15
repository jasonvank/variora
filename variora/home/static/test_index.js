/* eslint-disable comma-dangle */
import { Form, Icon, Input, Layout, LocaleProvider, Menu, message, Modal, notification } from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'
import axios from 'axios'
import firebase from 'firebase'
import React from 'react'
import ReactDOM from 'react-dom'
import { addLocaleData, FormattedMessage, IntlProvider } from 'react-intl'
import locale_en from 'react-intl/locale-data/en'
import locale_zh from 'react-intl/locale-data/zh'
import { connect, Provider } from 'react-redux'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import 'regenerator-runtime/runtime'
import { getCookie } from 'util.js'
import { DocumentTab } from './components/document_tab.jsx'
import { ExploreTab } from './components/explore_tab.jsx'
import { GroupReadlistsTab } from './components/group_tab/group_readlists_tab.jsx'
import { GroupTab } from './components/group_tab/group_tab.jsx'
import { Navbar } from './components/home_page/navbar.jsx'
import { ReadlistTab } from './components/readlist_tab/readlist_tab.jsx'
import { SearchResultTab } from './components/search_result_tab/search_result_tab.jsx'
import './css/test_index.css'
import messages_en from './locales/en.json'
import messages_zh from './locales/zh.json'
import {
  fetchLocale,
  fetchUser,
  setCollectedReadlists,
  setCreatedReadlists,
  setLocale,
} from './redux/actions.js'
import { initialStore } from './redux/init_store.js'
import { store } from './redux/store.js'
import { GlobalSider } from './components/home_page/global_sider.jsx'
import { GroupSider } from './components/home_page/group_sider.jsx'

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
const { TextArea } = Input

const GLOBAL_URL_BASE = ''

function getCoterieUUID() {
  if (window.location.pathname.includes('/groups/')) return window.location.pathname.split('/')[2]
  return undefined
}

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
      coterieUUID: getCoterieUUID(),
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

    this.updateUUIDCallback = coterieUUID => {
      this.setState({ coterieUUID: coterieUUID })
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
          coterieUUID={getCoterieUUID()}
          coterieName={filtered[0].name}
        />
      )
    }

    this.renderReadlistTab = (match, location) => (
      <ReadlistTab
        user={this.state.user}
        match={match}
        coterieUUID={getCoterieUUID()}
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
          coterieUUID={this.state.coterieUUID}
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
    console.log('uuid: ', this.state.coterieUUID)
    return (
      <IntlProvider locale={this.state.locale} messages={messages[this.state.locale]}>
        <Router basename={GLOBAL_URL_BASE}>
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
              signOff={this.signOff}
              updateUUIDCallback={this.updateUUIDCallback}
            />

            <Layout style={{ minHeight: '100vh' }}>
                {getCoterieUUID() !== undefined ?
                  <GroupSider
                    coterieUUID={getCoterieUUID()}
                    fields = {this.state.fields}
                    user={this.state.user}
                    collectedReadlists={this.state.collectedReadlists}
                    createReadlistModelVisible={this.state.createReadlistModelVisible}
                    create_new_readlist_menu_item_key={CREATE_NEW_READLIST_MENU_ITEM_KEY}
                    submitCreateCoterieForm={this.submitCreateCoterieForm}
                    setCreateCoterieModelVisible={this.setCreateCoterieModelVisible}
                    handleCreateCoterieFromChange={this.handleCreateCoterieFromChange}
                    submitCreateReadlistForm={this.submitCreateReadlistForm}
                    createdReadlists={this.state.createdReadlists}
                    setCreateReadlistModelVisible={this.setCreateReadlistModelVisible}
                    handleCreateReadlistFromChange={this.handleCreateReadlistFromChange}
                  />
                  : <GlobalSider
                    fields = {this.state.fields}
                    user={this.state.user}
                    collectedReadlists={this.state.collectedReadlists}
                    createReadlistModelVisible={this.state.createReadlistModelVisible}
                    create_new_readlist_menu_item_key={CREATE_NEW_READLIST_MENU_ITEM_KEY}
                    submitCreateCoterieForm={this.submitCreateCoterieForm}
                    setCreateCoterieModelVisible={this.setCreateCoterieModelVisible}
                    handleCreateCoterieFromChange={this.handleCreateCoterieFromChange}
                    submitCreateReadlistForm={this.submitCreateReadlistForm}
                    createdReadlists={this.state.createdReadlists}
                    createGroupModelVisible={this.state.createGroupModelVisible}
                    handleCreateReadlistFromChange={this.handleCreateReadlistFromChange}
                    setCreateReadlistModelVisible={this.setCreateReadlistModelVisible}
                    onClickCreateReadlistMenuItem={this.onClickCreateReadlistMenuItem}
                  />}
              <Layout
                style={{
                  marginLeft: '200px',
                  marginTop: '64px',
                }}
              >
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
                      render={({ match, location }) =>
                        this.renderGroupReadlistsTab(match, location)
                      }
                    />
                    <Route
                      path='/groups/:coterieUUID'
                      render={({ match, location }) => this.renderGroupTab(match, location)}
                    />
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
          </Layout>
        </Router>
      </IntlProvider>
    )
  }
}

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
