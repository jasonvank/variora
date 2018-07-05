import './css/test_index.css'
import 'regenerator-runtime/runtime'

import { Avatar, Breadcrumb, Button, Col, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, message } from 'antd'
import {
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { DocumentTab } from './components/document_tab.jsx'
import { GroupTab } from './components/group_tab.jsx'
import { NotificationsToggleButton } from './components/notifications_toggle_button.jsx'
import { NotificationsAlertButton } from './components/notifications_alert_button.jsx'

import React from 'react'
import ReactDOM from 'react-dom'
import { SearchResultTab } from './components/search_result_tab.jsx'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US'

const FormItem = Form.Item


const { SubMenu } = Menu
const { Header, Content, Sider, Footer } = Layout
const MenuItemGroup = Menu.ItemGroup
const Search = Input.Search
const CREATE_NEW_GROUP_MENU_ITEM_KEY = 'createGroupButton'


const URL_BASE = ''

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      fields: {
        coterieName: {
          value: '',
        },
      },
      createGroupModelVisible: false,
      administratedCoteries: [],
      joinedCoteries: [],
      user: {
        nickname: '',
        is_authenticated: false,
        portrait_url: '/media/portrait/default_portrait.png',
      },
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
      else if (pathname.includes('/groups/')) {
        var pageElement = pathname.split('/')
        return [pageElement[1] + pageElement[2]]
      } else
        return ['documents']
    }
    this.submitCreateCoterieForm = () => {
      var coterieName = this.state.fields.coterieName.value
      if (coterieName == '')
        message.warning('Group name cannot be empty', 1)
      else {
        var data = new FormData()
        data.append('coterie_name', coterieName)
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/coterie/api/coteries/create', data).then((response) => {
          var newAdministratedCoteries = this.state.administratedCoteries.slice()
          newAdministratedCoteries.push(response.data)
          this.setCreateGroupModelVisible(false)
          this.setState({
            fields: { ...this.state.fields, coterieName: { value: '' } },
            administratedCoteries: newAdministratedCoteries
          })
        })
      }
    }
    this.removeCoterieCallback = (coteriePk) => {
      var updatedAdministratedCoteries = this.state.administratedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      var updatedJoinedCoteries = this.state.joinedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      this.setState({
        administratedCoteries: updatedAdministratedCoteries,
        joinedCoteries: updatedJoinedCoteries
      })
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
  }

  componentDidMount() {
    axios.get('/api/user').then((response) => {
      var user = response.data
      if (user.is_authenticated)
        this.setState({ user: response.data })
    })
    axios.get('/coterie/api/coteries').then((response) => {
      this.setState({
        administratedCoteries: response.data.administratedCoteries,
        joinedCoteries: response.data.joinedCoteries
      })
    })
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
              />
            </Col>
            <Col span={10} style={{ textAlign: 'right' }}>
              <NotificationsToggleButton user={ this.state.user } acceptInvitationCallback={ this.acceptInvitationCallback } />
              <NotificationsAlertButton />
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
                defaultOpenKeys={['admin_teams', 'member_teams']}
                onClick={this.onClickCreateGroupMenuItem}
                style={{ height: '100%', borderRight: 0 }}
                defaultSelectedKeys={this.getHighlightedMenuItems()}
              >
                <Menu.Item key="explore">
                  <Link to="/"><span><Icon type="compass" />explore</span></Link>
                </Menu.Item>
                <Menu.Item key="documents" disabled={!this.state.user.is_authenticated}>
                  <Link to="/"><span><Icon type='file' />documents</span></Link>
                </Menu.Item>
                <SubMenu key="admin_teams" title={<span><Icon type="solution" />admin group</span>} disabled={!this.state.user.is_authenticated}>
                  {
                    this.state.administratedCoteries.map((coterie) => {
                      return (
                        <Menu.Item key={'groups' + coterie.pk}>
                          <Link to={ '/groups/' + coterie.pk }><span>{ coterie.name }</span></Link>
                        </Menu.Item>
                      )
                    })
                  }
                  <Menu.Item key={CREATE_NEW_GROUP_MENU_ITEM_KEY}><Icon type="plus"/></Menu.Item>
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
                </Modal>
              </Menu>
            </Sider>
            <Layout style={{ marginLeft: 200, padding: 0 }}>
              <Content>
                <Switch>
                  <Route exact path="/explore" component={GroupTab} />
                  <Route path="/search" component={SearchResultTab} />
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

const CustomizedForm = Form.create({
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

ReactDOM.render(
  <LocaleProvider locale={enUS}>
    <App />
  </LocaleProvider>,
  document.getElementById('main')
)
