import './css/test_index.css'
import 'regenerator-runtime/runtime'

import { Avatar, notification, Button, Col, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, message } from 'antd'
import {
  Link,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import { getCookie, getValFromUrlParam } from 'util.js'

import { DocumentTab } from './components/document_tab.jsx'
import { ExploreTab } from './components/explore_tab.jsx'
import { GroupTab } from './components/group_tab/group_tab.jsx'
import { ReadlistTab } from './components/readlist_tab/readlist_tab.jsx'
import { NotificationsAlertButton } from './components/notifications_alert_button.jsx'
// import { NotificationsToggleButton } from './components/notifications_toggle_button.jsx'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import { SearchResultTab } from './components/search_result_tab.jsx'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US'
import { store } from './redux/store.js'
import { fetchUser, setCollectedReadlists } from './redux/actions.js'
import { initialStore } from './redux/init_store.js'
import { connect } from 'react-redux'
import TextArea from '../../../node_modules/antd/lib/input/TextArea'

const FormItem = Form.Item


const { SubMenu } = Menu
const { Header, Content, Sider, Footer } = Layout
const MenuItemGroup = Menu.ItemGroup
const Search = Input.Search
const CREATE_NEW_GROUP_MENU_ITEM_KEY = 'createGroupButton'


const URL_BASE = ''

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
      user: initialStore.user,
      administratedCoteries: [],
      joinedCoteries: [],
      createdReadlists: [],
      collectedReadlists: [],
    }

    this.handleSearch = (searchKey) => {
      if (searchKey != '')
        window.location.href = decodeURIComponent(URL_BASE + '/search?key=' + searchKey)
    }

    this.setCreateGroupModelVisible = (visibility) => {
      this.setState({ createGroupModelVisible: visibility })
    }

    this.onClickCreateGroupMenuItem = (menuItem) => {
      if (menuItem.key == CREATE_NEW_GROUP_MENU_ITEM_KEY)
        this.setCreateGroupModelVisible(true)
    }

    this.signOff = () => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/api/signoff', data).then(response => {
        window.location.reload()
      })
    }

    this.handleCreateCoterieFromChange = (changedFields) => {
      this.setState({
        fields: { ...this.state.fields, ...changedFields },
      })
    }

    this.getHighlightedMenuItems = () => {
      var pathname = window.location.pathname
      if (pathname.endsWith('/search'))
        return []
      else if (pathname.includes('/groups/') || pathname.includes('/readlists/')) {
        var pageElement = pathname.split('/')
        return [pageElement[1] + pageElement[2]]
      } else if (pathname == '/explore') {
        return ['explore']
      } else
        return ['documents']
    }

    this.submitCreateReadlistForm = () => {
      var readlistName = this.state.fields.readlistName.value
      if (readlistName == '')
        message.warning('The name of the readlist cannot be empty', 1)
      else {
        var data = new FormData()
        data.append('readlist_name', readlistName)
        data.append('description', this.state.fields.readlistDesc.value)
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/file_viewer/api/readlists/create', data).then((response) => {
          var newCreatedReadlists = this.state.createdReadlists.slice()
          newCreatedReadlists.push(response.data)
          this.setCreateGroupModelVisible(false)
          this.setState({
            fields: { ...this.state.fields, readlistName: { value: '' } },
            createdReadlists: newCreatedReadlists
          })
        })
      }
    }

    // this.submitCreateCoterieForm = () => {
    //   var coterieName = this.state.fields.coterieName.value
    //   if (coterieName == '')
    //     message.warning('Group name cannot be empty', 1)
    //   else {
    //     var data = new FormData()
    //     data.append('coterie_name', coterieName)
    //     data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
    //     axios.post('/coterie/api/coteries/create', data).then((response) => {
    //       var newAdministratedCoteries = this.state.administratedCoteries.slice()
    //       newAdministratedCoteries.push(response.data)
    //       this.setCreateGroupModelVisible(false)
    //       this.setState({
    //         fields: { ...this.state.fields, coterieName: { value: '' } },
    //         administratedCoteries: newAdministratedCoteries
    //       })
    //     })
    //   }
    // }

    this.removeCoterieCallback = (coteriePk) => {
      var updatedAdministratedCoteries = this.state.administratedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      var updatedJoinedCoteries = this.state.joinedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      this.setState({
        administratedCoteries: updatedAdministratedCoteries,
        joinedCoteries: updatedJoinedCoteries
      })
    }

    this.updateReadlistsCallback = (readlistSlug) => {
      // var updatedCreatedReadlist = this.state.createdReadlists.filter(function(readlist) {return readlist.slug !== readlistSlug})
      // var updatedCollectedReadlist = this.state.collectedReadlists.filter(function(readlist) {return readlist.slug !== readlistSlug})
      // this.setState({
      //   createdReadlists: updatedCreatedReadlist,
      //   collectedReadlists: updatedCollectedReadlist
      // })
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
        var joinedCoteries = this.state.joinedCoteries
        var hasAlreadyJoined = joinedCoteries.find(group => group.pk == coteriePk) != undefined ? true : false
        if (!hasAlreadyJoined) {
          var updatedJoinedCoteries = this.state.joinedCoteries.concat(response.data)
          this.setState({ joinedCoteries: updatedJoinedCoteries })
        }
      })
    }

    this.renderGroupTab = (match, location) => {
      var coteriePk = parseInt(match.params.coteriePk)
      var isAdmin = this.state.administratedCoteries.map((coterie) => coterie.pk).includes(coteriePk)
      return <GroupTab removeCoterieCallback={this.removeCoterieCallback} isAdmin={isAdmin} match={match} location={location} />
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
    this.props.fetchUser()
    axios.get('/file_viewer/api/readlists').then((response) => {
      this.setState({
        createdReadlists: response.data.created_readlists,
        collectedReadlists: response.data.collected_readlists,
      })
      this.props.setCollectedReadlists(response.data.collected_readlists)
    })
  }

  componentWillReceiveProps(props) {
    this.setState({ user: props.user })
  }

  render() {
    const fields = this.state.fields
    return (
      <Layout style={{ height: '100%', width: '100%', position: 'absolute' }}>
        <Header className="header" style={{ backgroundColor: '#fff', diplay: 'inline' }}>
          <Row>
            <Col span={6}>
              {/* <div className="logo" /> */}
              <img src="/media/logo.png" height={48} style={{ verticalAlign: 'middle', marginLeft: 28 }}/>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Search
                placeholder="input search text"
                style={{ width: '60%' }}
                onSearch={this.handleSearch}
                defaultValue={window.location.pathname == '/search' ? getValFromUrlParam('key') : '' }
              />
            </Col>
            <Col span={10} style={{ textAlign: 'right' }}>
              {/* <NotificationsToggleButton user={ this.state.user } acceptInvitationCallback={ this.acceptInvitationCallback } /> */}
              <NotificationsAlertButton />
              <Icon type="team"
                onClick={() => {
                  notification.config({ top: 60 })
                  notification['info']({message: 'We are rewriting the group function, it will come soon.'})
                }}
                style={{ fontSize: 18, marginLeft: 28, verticalAlign: 'middle' }}
              />
              <span style={{ marginRight: 12, marginLeft: 28, color: '#666' }}>{ this.state.user.nickname }</span>
              { this.state.user.is_authenticated ? <a onClick={this.signOff}>sign off</a> : <a href="/sign-in">sign in</a> }
              <Avatar
                style={{ marginLeft: 28, marginRight: 18, marginTop: -2, verticalAlign: 'middle' }}
                size={'large'}
                src={this.state.user.portrait_url}
              />
            </Col>
          </Row>
        </Header>

        <Router basename={URL_BASE}>
          <Layout>
            <Sider className='sider' width={200} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
              <Menu
                mode="inline"
                defaultOpenKeys={['created_readlists', 'collected_readlists']}
                onClick={this.onClickCreateGroupMenuItem}
                style={{ height: '100%', borderRight: 0 }}
                defaultSelectedKeys={this.getHighlightedMenuItems()}
              >
                <Menu.Item key="explore" >
                  <Link to="/explore"><span><Icon type="compass" />explore</span></Link>
                </Menu.Item>
                <Menu.Item key="documents" disabled={!this.state.user.is_authenticated}>
                  <Link to="/"><span><Icon type='file' />documents</span></Link>
                </Menu.Item>

                <SubMenu key="created_readlists" title={<span><Icon type="folder-open" />created readlists</span>} disabled={!this.state.user.is_authenticated}>
                  {
                    this.state.createdReadlists.map((readlist) => {
                      return (
                        <Menu.Item key={'readlists' + readlist.slug}>
                          <Link style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} to={ '/readlists/' + readlist.slug }><span>{ readlist.name }</span></Link>
                        </Menu.Item>
                      )
                    })
                  }
                  <Menu.Item disabled={!this.state.user.is_authenticated} key={CREATE_NEW_GROUP_MENU_ITEM_KEY}><Icon type="plus"/></Menu.Item>
                </SubMenu>
                <SubMenu key="collected_readlists" title={<span><Icon type="folder" />collected readlists</span>} disabled={!this.state.user.is_authenticated}>
                  {
                    this.state.collectedReadlists.map((readlist) => {
                      return (
                        <Menu.Item key={'readlists' + readlist.slug}>
                          <Link style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} to={ '/readlists/' + readlist.slug }><span>{ readlist.name }</span></Link>
                        </Menu.Item>
                      )
                    })
                  }
                </SubMenu>
                <Modal
                  title="create a new readlist"
                  wrapClassName="vertical-center-modal"
                  visible={this.state.createGroupModelVisible}
                  onOk={this.submitCreateReadlistForm}
                  onCancel={() => this.setCreateGroupModelVisible(false)}
                >
                  <CreateReadlistForm {...fields} onChange={this.handleCreateCoterieFromChange} />
                </Modal>

                {/* <SubMenu key="admin_teams" title={<span><Icon type="solution" />admin group</span>} disabled={!this.state.user.is_authenticated}>
                  {
                    this.state.administratedCoteries.map((coterie) => {
                      return (
                        <Menu.Item key={'groups' + coterie.pk}>
                          <Link to={ '/groups/' + coterie.pk }><span>{ coterie.name }</span></Link>
                        </Menu.Item>
                      )
                    })
                  }
                  <Menu.Item disabled={!this.state.user.is_authenticated} key={CREATE_NEW_GROUP_MENU_ITEM_KEY}><Icon type="plus"/></Menu.Item>
                </SubMenu>
                <SubMenu key="member_teams" title={<span><Icon type="team" />member group</span>} disabled={!this.state.user.is_authenticated}>
                  {
                    this.state.joinedCoteries.map((coterie) => {
                      return (
                        <Menu.Item key={'groups' + coterie.pk}>
                          <Link to={ '/groups/' + coterie.pk }><span>{ coterie.name }</span></Link>
                        </Menu.Item>
                      )
                    })
                  }
                </SubMenu>
                <Modal
                  title="create a new group"
                  wrapClassName="vertical-center-modal"
                  visible={this.state.createGroupModelVisible}
                  onOk={this.submitCreateCoterieForm}
                  onCancel={() => this.setCreateGroupModelVisible(false)}
                >
                  <CustomizedForm {...fields} onChange={this.handleCreateCoterieFromChange} />
                </Modal> */}
              </Menu>
            </Sider>
            <Layout style={{ marginLeft: 200, padding: 0 }}>
              <Content>
                <Switch>
                  <Route exact path="/explore" component={ExploreTab} />
                  <Route path="/search" component={SearchResultTab} />
                  <Route path="/readlists/:readlistSlug" render={ ({match, location}) => this.renderReadlistTab(match, location) } />
                  <Route path="/groups/:coteriePk" render={ ({match, location}) => this.renderGroupTab(match, location) } />
                  <Route path="/" component={DocumentTab} />
                </Switch>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                  © 2018 Variora. Reach us via <a style={{ color: '#37b' }} href='mailto:variora@outlook.com'>variora@outlook.com</a>
              </Footer>
            </Layout>
          </Layout>
        </Router>
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
      <FormItem label="Name of the readlist">
        {getFieldDecorator('readlistName', {
          rules: [{ required: true, message: 'name is required!' }],
        })(<Input />)}
      </FormItem>
      <FormItem label="Description">
        {getFieldDecorator('readlistDesc')(<TextArea />)}
      </FormItem>
    </Form>
  )
})

// const CustomizedForm = Form.create({
//   onFieldsChange(props, changedFields) {
//     props.onChange(changedFields)
//   },
//   mapPropsToFields(props) {
//     return {
//       coterieName: {
//         ...props.coterieName,
//         value: props.coterieName.value,
//       },
//     }
//   },
// })((props) => {
//   const { getFieldDecorator } = props.form
//   return (
//     <Form layout="inline">
//       <FormItem label="group name">
//         {getFieldDecorator('coterieName', {
//           rules: [{ required: true, message: 'name is required!' }],
//         })(<Input />)}
//       </FormItem>
//     </Form>
//   )
// })

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
