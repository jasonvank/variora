import './css/test_index.css'
import 'regenerator-runtime/runtime'

import {
  Avatar, notification,
  Button,
  Col, Form,
  Icon, Input,
  Layout, LocaleProvider, Menu,
  Modal, Row,
  message, Popover, Breadcrumb,
} from 'antd'
import {
  Link,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import { getCookie, getValFromUrlParam, groupAvatarColors } from 'util.js'

import { DocumentTab } from './components/document_tab.jsx'
import { ExploreTab } from './components/explore_tab.jsx'
import { GroupTab } from './components/group_tab/group_tab.jsx'
import { ReadlistTab } from './components/readlist_tab/readlist_tab.jsx'
import { NotificationsAlertButton } from './components/notifications_alert_button.jsx'
import { GroupSelectionButton } from './components/group_selection_button.jsx'
import { NotificationsToggleButton } from './components/notifications_toggle_button.jsx'
import { Provider, connect } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import { SearchResultTab } from './components/search_result_tab/search_result_tab.jsx'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US'
import { store } from './redux/store.js'
import { fetchUser, setCollectedReadlists } from './redux/actions.js'
import { initialStore } from './redux/init_store.js'
import TextArea from '../../../node_modules/antd/lib/input/TextArea'
// import { Home } from './components/landing_page/index.jsx'
import { initializeWebPush, invalidateToken } from './initialize_push'

const FormItem = Form.Item


const { SubMenu } = Menu
const { Header, Content, Sider, Footer } = Layout
const MenuItemGroup = Menu.ItemGroup
const Search = Input.Search
const CREATE_NEW_READLIST_MENU_ITEM_KEY = 'createReadlistButton'

const GLOBAL_URL_BASE = ''

class AppBeforeConnect extends React.Component {
  constructor() {
    super()
    this.state = {
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
    }

    this.handleSearch = (searchKey) => {
      if (searchKey.length === 0) return
      if (window.location.pathname.includes('/groups/')) {
        const coterieUUID = window.location.pathname.split('/')[2]
        window.location.href = decodeURIComponent('/groups/' + coterieUUID  + '/search?key=' + searchKey)
      } else
        window.location.href = decodeURIComponent(GLOBAL_URL_BASE + '/search?key=' + searchKey)
    }

    this.setCreateCoterieModelVisible = (visibility) => {
      this.setState({ createGroupModelVisible: visibility })
    }

    this.setCreateReadlistModelVisible = (visibility) => {
      this.setState({ createReadlistModelVisible: visibility })
    }

    this.onClickCreateReadlistMenuItem = (menuItem) => {
      if (menuItem.key == CREATE_NEW_READLIST_MENU_ITEM_KEY)
        this.setCreateReadlistModelVisible(true)
    }

    this.signOff = () => {
      invalidateToken().then(() => {
        var data = new FormData()
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/api/signoff', data).then(response => {
          window.location.reload()
        })  
      })
    }

    this.handleCreateReadlistFromChange = (changedFields) => {
      this.setState({
        fields: { ...this.state.fields, ...changedFields },
      })
    }

    this.handleCreateCoterieFromChange = (changedFields) => {
      this.setState({
        fields: { ...this.state.fields, ...changedFields },
      })
    }

    this.getHighlightedMenuItems = () => {
      const pathname = window.location.pathname
      if (pathname.endsWith('/search'))
        return []
      else if (pathname.includes('/groups/') || pathname.includes('/readlists/')) {
        const pageElement = pathname.split('/')
        return [pageElement[1] + pageElement[2]]
      } else if (pathname.includes('/explore')) {
        return ['explore']
      } else
        return ['documents']
    }

    this.submitCreateReadlistForm = () => {
      const readlistName = this.state.fields.readlistName.value
      if (readlistName == '')
        message.warning('The name of the readlist cannot be empty', 1)
      else {
        const data = new FormData()
        data.append('readlist_name', readlistName)
        data.append('description', this.state.fields.readlistDesc.value)
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/file_viewer/api/readlists/create', data).then((response) => {
          var newCreatedReadlists = this.state.createdReadlists.slice()
          newCreatedReadlists.push(response.data)
          this.setCreateReadlistModelVisible(false)
          this.setState({
            fields: { ...this.state.fields, readlistName: { value: '' } },
            createdReadlists: newCreatedReadlists
          })
        })
      }
    }

    this.submitCreateCoterieForm = () => {
      const coterieName = this.state.fields.coterieName.value
      if (coterieName == '')
        message.warning('Group name cannot be empty', 1)
      else {
        const data = new FormData()
        data.append('coterie_name', coterieName)
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/coterie/api/coteries/create', data).then((response) => {
          const newAdministratedCoteries = this.state.administratedCoteries.slice()
          newAdministratedCoteries.push(response.data)
          this.setCreateCoterieModelVisible(false)
          this.setState({
            fields: { ...this.state.fields, coterieName: { value: '' } },
            administratedCoteries: newAdministratedCoteries
          })
        })
      }
    }

    this.removeCoterieCallback = (coteriePk) => {
      const updatedAdministratedCoteries = this.state.administratedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      const updatedJoinedCoteries = this.state.joinedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      this.setState({
        administratedCoteries: updatedAdministratedCoteries,
        joinedCoteries: updatedJoinedCoteries
      })
    }

    this.updateReadlistsCallback = (readlistSlug) => {
      const updatedCreatedReadlist = this.state.createdReadlists.filter(function(readlist) {return readlist.slug !== readlistSlug})
      const updatedCollectedReadlist = this.state.collectedReadlists.filter(function(readlist) {return readlist.slug !== readlistSlug})
      this.setState({
        createdReadlists: updatedCreatedReadlist,
        collectedReadlists: updatedCollectedReadlist
      })
      axios.get('/file_viewer/api/readlists').then((response) => {
        this.setState({
          collectedReadlists: response.data.collected_readlists,
        })
        this.props.setCollectedReadlists(response.data.collected_readlists)
      })
    }

    this.updateReadlistsNameCallback = (readlistSlug, new_name) => {
      var updatedCreatedReadlist = this.state.createdReadlists.map(readlist => {
        if (readlist.slug !== readlistSlug)
          return readlist
        return Object.assign({}, readlist, {name: new_name})
      })
      this.setState({ createdReadlists: updatedCreatedReadlist })
    }

    this.acceptInvitationCallback = (coteriePk) => {
      axios.get('/coterie/api/coteries/' + coteriePk).then((response) => {
        const joinedCoteries = this.state.joinedCoteries
        const hasAlreadyJoined = joinedCoteries.find(group => group.pk == coteriePk) != undefined ? true : false
        if (!hasAlreadyJoined) {
          const updatedJoinedCoteries = this.state.joinedCoteries.concat(response.data)
          this.setState({ joinedCoteries: updatedJoinedCoteries })
        }
        window.location.href = `/groups/${response.data.uuid}/`
      })
    }

    this.renderGroupTab = (match, location) => {
      const coterieUUID = match.params.coterieUUID
      const isAdmin = this.state.administratedCoteries.map(coterie => coterie.uuid).includes(coterieUUID)
      const filtered = this.state.administratedCoteries.filter(coterie => coterie.uuid === coterieUUID).
        concat(this.state.joinedCoteries.filter(coterie => coterie.uuid === coterieUUID))
      if (filtered.length === 0)
        return null

      return (
        <GroupTab
          removeCoterieCallback={this.removeCoterieCallback}
          isAdmin={isAdmin} match={match} location={location}
          coteriePk={filtered[0].pk} coterieUUI={coterieUUID}
        />
      )
    }

    this.renderReadlistTab = (match, location) => {
      return <ReadlistTab
        user={this.state.user}
        match={match}
        location={location}
        updateReadlistsCallback={this.updateReadlistsCallback}
        updateReadlistsNameCallback={this.updateReadlistsNameCallback}
      />
    }
  }

  componentDidMount() {
    initializeWebPush()
    this.props.fetchUser()
    axios.get('/file_viewer/api/readlists').then((response) => {
      this.setState({
        createdReadlists: response.data.created_readlists,
        collectedReadlists: response.data.collected_readlists,
      })
      this.props.setCollectedReadlists(response.data.collected_readlists)
    })
    axios.get('/coterie/api/coteries').then((response) => {
      this.setState({
        administratedCoteries: response.data.administratedCoteries,
        joinedCoteries: response.data.joinedCoteries
      })
    })
  }

  componentWillReceiveProps(props) {
    this.setState({ user: props.user })
  }

  render() {
    notification.config({ top: 66 })

    const fields = this.state.fields

    const groupRouter = (coterieUUID) => {
      const pathname = window.location.pathname
      const defaultSelectedKeys = () => {
        if (pathname.endsWith('/search'))
          return []
        return pathname.includes('members') ? ['group-members'] : pathname.includes('settings') ? ['group-settings'] : ['group-documents']
      }

      // return globalRouter
      return (
        <Router basename={GLOBAL_URL_BASE}>
          <Layout>
            <Sider className='sider' width={200} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
              <Menu
                mode="inline"
                // defaultOpenKeys={['created_readlists', 'collected_readlists']}
                onClick={this.onClickCreateReadlistMenuItem}
                style={{ height: '100%', borderRight: 0 }}
                defaultSelectedKeys={defaultSelectedKeys()}
              >
                {/*<Menu.Item key="explore" >*/}
                  {/*<Link to="/explore"><span><Icon type="compass" />Explore</span></Link>*/}
                {/*</Menu.Item>*/}
                <Menu.Item key="group-documents" disabled={!this.state.user.is_authenticated}>
                  <Link to={ '/groups/' + coterieUUID + "/" }><span><Icon type='book' />Group Documents</span></Link>
                </Menu.Item>

                <Menu.Item key="group-members" disabled={!this.state.user.is_authenticated}>
                  <Link to={ '/groups/' + coterieUUID + "/members" }><span><Icon type='usergroup-add' />Group Members</span></Link>
                </Menu.Item>

                <Menu.Item key="group-settings" disabled={!this.state.user.is_authenticated}>
                  <Link to={ '/groups/' + coterieUUID + "/settings" }><span><Icon type='setting' />Group Setting</span></Link>
                </Menu.Item>
                <Modal
                  title="create a new group"
                  wrapClassName="vertical-center-modal"
                  visible={this.state.createGroupModelVisible}
                  onOk={this.submitCreateCoterieForm}
                  onCancel={() => this.setCreateCoterieModelVisible(false)}
                >
                  <CreateCoterieForm {...fields} onChange={this.handleCreateCoterieFromChange} />
                </Modal>
              </Menu>
            </Sider>
            <Layout style={{ marginLeft: 200, padding: 0 }}>
              <Content>
                <Switch>
                  <Route path={'/groups/' + coterieUUID + '/search'} component={SearchResultTab} />
                  <Route path='/groups/:coterieUUID' render={ ({match, location}) => this.renderGroupTab(match, location) } />
                </Switch>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                  © 2018 Variora. Reach us via <a style={{ color: '#37b' }} href='mailto:variora@outlook.com'>variora@outlook.com</a>
              </Footer>
            </Layout>
          </Layout>
        </Router>
      )
    }

    const globalRouter = (
      <Router basename={GLOBAL_URL_BASE}>
        <Layout>
          <Sider className='sider' width={200} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
            <Menu
              mode="inline"
              defaultOpenKeys={['created_readlists', 'collected_readlists']}
              onClick={this.onClickCreateReadlistMenuItem}
              style={{ height: '100%', borderRight: 0 }}
              defaultSelectedKeys={this.getHighlightedMenuItems()}
            >
              <Menu.Item key="explore" >
                <Link to="/explore"><span><Icon type="compass" />Explore</span></Link>
              </Menu.Item>
              <Menu.Item key="documents" disabled={!this.state.user.is_authenticated}>
                <Link to="/"><span><Icon type='file' />Documents</span></Link>
              </Menu.Item>

              <SubMenu key="created_readlists" title={<span><Icon type="folder" />Created Readlists</span>} disabled={!this.state.user.is_authenticated}>
                {
                  this.state.createdReadlists.sort((a, b) => a.name > b.name).map((readlist) => {
                    return (
                      <Menu.Item key={'readlists' + readlist.slug} title={readlist.name}>
                        <Link style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} to={ '/readlists/' + readlist.slug }><Icon type="folder-open" /><span>{ readlist.name }</span></Link>
                      </Menu.Item>
                    )
                  })
                }
                <Menu.Item disabled={!this.state.user.is_authenticated} key={CREATE_NEW_READLIST_MENU_ITEM_KEY}><Icon type="plus"/></Menu.Item>
              </SubMenu>
              <SubMenu key="collected_readlists" title={<span><Icon type="folder" />Collected Readlists</span>} disabled={!this.state.user.is_authenticated}>
                {
                  this.state.collectedReadlists.sort((a, b) => a.name > b.name).map((readlist) => {
                    return (
                      <Menu.Item key={'readlists' + readlist.slug} title={readlist.name}>
                        <Link style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} to={ '/readlists/' + readlist.slug }><Icon type="folder" /><span>{ readlist.name }</span></Link>
                      </Menu.Item>
                    )
                  })
                }
              </SubMenu>
              <Modal
                title="create a new readlist"
                wrapClassName="vertical-center-modal"
                visible={this.state.createReadlistModelVisible}
                onOk={this.submitCreateReadlistForm}
                onCancel={() => this.setCreateReadlistModelVisible(false)}
              >
                <CreateReadlistForm {...fields} onChange={this.handleCreateReadlistFromChange} />
              </Modal>

              <Modal
                title="create a new group"
                wrapClassName="vertical-center-modal"
                visible={this.state.createGroupModelVisible}
                onOk={this.submitCreateCoterieForm}
                onCancel={() => this.setCreateCoterieModelVisible(false)}
              >
                <CreateCoterieForm {...fields} onChange={this.handleCreateCoterieFromChange} />
              </Modal>
            </Menu>
          </Sider>
          <Layout style={{ marginLeft: 200, padding: 0 }}>
            <Content>
              <Switch>
                <Route path='/explore' component={ExploreTab} />
                <Route path='/search' component={SearchResultTab} />
                <Route path='/readlists/:readlistSlug' render={ ({match, location}) => this.renderReadlistTab(match, location) } />
                <Route path='/groups/:coterieUUID' render={ ({match, location}) => this.renderGroupTab(match, location) } />
                <Route path='/' component={DocumentTab} />
              </Switch>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                © 2018 Variora. Reach us via <a style={{ color: '#37b' }} href='mailto:variora@outlook.com'>variora@outlook.com</a>
            </Footer>
          </Layout>
        </Layout>
      </Router>
    )

    let groupIcon = null
    const currentCoterieUUID = window.location.pathname.includes('/groups/') ? window.location.pathname.split('/')[2] : undefined
    if (currentCoterieUUID !== undefined) {
      let currentCoterie = undefined

      let filtered = this.state.administratedCoteries.filter(c => c.uuid === currentCoterieUUID)
      if (filtered.length > 0)
        currentCoterie = filtered[0]

      filtered = this.state.joinedCoteries.filter(c => c.uuid === currentCoterieUUID)
      if (filtered.length > 0)
        currentCoterie = filtered[0]

      if (currentCoterie !== undefined) {
        const color = groupAvatarColors[currentCoterieUUID.charCodeAt(0) % 8]
        groupIcon = (
          <Avatar
            style={{ width: 18, height: 18, backgroundColor: color, top: 16, left: -6, verticalAlign: 'middle' }}
            size={'small'}
          >
            <span style={{position: 'relative', top: -3}}>{currentCoterie.name.slice(0, 2).toUpperCase()}</span>
          </Avatar>
        )
      }
    }


    return (
      <Layout style={{ height: '100%', width: '100%', position: 'absolute' }}>
        <Header className="header" style={{ backgroundColor: '#fff', diplay: 'inline' }}>
          <Row>
            <Col span={6}>
              {/* <div className="logo" /> */}
              <a href='/'><img src="/media/logo.png" height={48} style={{ verticalAlign: 'middle', marginLeft: 28 }}/></a>
              {groupIcon}
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Search
                placeholder="Search in Variora"
                style={{ width: '60%' }}
                onSearch={this.handleSearch}
                defaultValue={window.location.pathname.includes('/search') ? getValFromUrlParam('key') : '' }
              />
            </Col>
            <Col span={10} style={{ textAlign: 'right' }}>
              <GroupSelectionButton
                administratedCoteries={this.state.administratedCoteries} joinedCoteries={this.state.joinedCoteries}
                setCreateCoterieModelVisible={this.setCreateCoterieModelVisible}
                currentCoterieUUID={window.location.pathname.includes('/groups/') ? window.location.pathname.split('/')[2] : undefined}
              />
              <NotificationsAlertButton />
              <NotificationsToggleButton user={ this.state.user } acceptInvitationCallback={ this.acceptInvitationCallback } />

              <span style={{ marginRight: 12, marginLeft: 28, color: '#666' }}>{ this.state.user.nickname }</span>
              { this.state.user.is_authenticated ? <a onClick={this.signOff}>Sign Off</a> : <a href="/sign-in">sign in</a> }
              <Avatar
                style={{ marginLeft: 28, marginRight: 18, marginTop: -2, verticalAlign: 'middle' }}
                size={'large'}
                src={this.state.user.portrait_url}
              />
            </Col>
          </Row>
        </Header>

        { window.location.pathname.includes('/groups/') ? groupRouter(window.location.pathname.split('/')[2]) : globalRouter }
      </Layout>
    )
  }
}

const CreateReadlistForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields)
  },
  mapPropsToFields(props) {
    return {
      readlistName: {
        ...props.readlistName,
        value: props.readlistName.value,
      },
      readlistDesc: {
        ...props.readlistDesc,
        value: props.readlistDesc.value,
      },
    }
  },
})((props) => {
  const { getFieldDecorator } = props.form
  return (
    <Form>
      <FormItem label='Name of the readlist'>
        {getFieldDecorator('readlistName', {
          rules: [{ required: true, message: 'name is required!' }],
        })(<Input />)}
      </FormItem>
      <FormItem label='Description'>
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
      coterieName: {
        ...props.coterieName,
        value: props.coterieName.value,
      },
    }
  },
})((props) => {
  const { getFieldDecorator } = props.form
  return (
    <Form layout="inline">
      <FormItem label="group name">
        {getFieldDecorator('coterieName', {
          rules: [{ required: true, message: 'name is required!' }],
        })(<Input />)}
      </FormItem>
    </Form>
  )
})

const mapStoreToProps = (store, ownProps) => {
  return {...ownProps, user: store.user}
}
const App = connect(mapStoreToProps, {fetchUser, setCollectedReadlists})(AppBeforeConnect)

ReactDOM.render(
  <Provider store={store}>
    <LocaleProvider locale={enUS}>
      <App />
    </LocaleProvider>
  </Provider>,
  document.getElementById('main')
)
