import 'antd/dist/antd.css';
import './css/test_index.css';
import 'regenerator-runtime/runtime';

import { Avatar, Breadcrumb, Button, Col, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, Upload, message } from 'antd';
import {
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import { getCookie, getUrlFormat } from 'util.js'

import { AvatarWithNotifications } from './components/avatar_with_notifications.jsx'
import { DocumentTab } from './components/document_tab.jsx'
import { GroupTab } from './components/group_tab.jsx'
import React from 'react';
import ReactDOM from 'react-dom';
import { SearchResultTab } from './components/search_result_tab.jsx'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const FormItem = Form.Item;


const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;
const Search = Input.Search;
const CREATE_NEW_GROUP_MENU_ITEM_KEY = 'createGroupButton';


const URL_BASE = '/test'

class App extends React.Component {
  constructor() {
    super();
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
      window.location.href = decodeURIComponent(URL_BASE + '/search?key=' + searchKey);
    }
    this.setCreateGroupModelVisible = (visibility) => {
      this.setState({ createGroupModelVisible: visibility });
    }
    this.onClickCreateGroupMenuItem = (menuItem) => {
      if (menuItem.key == CREATE_NEW_GROUP_MENU_ITEM_KEY)
        this.setCreateGroupModelVisible(true)
    }
    this.signOff = () => {
      axios.get('/api/signoff').then(response => {
        window.location.reload()
      })
    }
    this.handleCreateCoterieFromChange = (changedFields) => {
      this.setState({
        fields: { ...this.state.fields, ...changedFields },
      });
    }
    this.submitCreateCoterieForm = () => {
      var coterieName = this.state.fields.coterieName.value
      if (coterieName == '')
        message.warning('Group name cannot be empty', 1)
      else {
        var data = new FormData()
        data.append('coterie_name', coterieName)
        data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
        axios.post('/coterie/api/coteries/create', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((response) => {
          var newAdministratedCoteries = this.state.administratedCoteries.slice()
          newAdministratedCoteries.push(response.data)
          this.setCreateGroupModelVisible(false)
          this.setState({
            fields: { ...this.state.fields, coterieName: { value: '' } },
            administratedCoteries: newAdministratedCoteries
          });
        })
      }
    }
    this.deleteCoterieCallback = (coteriePk) => {
      var updatedAdministratedCoteries = this.state.administratedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      var updatedJoinedCoteries = this.state.joinedCoteries.filter(function(coterie) {return coterie.pk != coteriePk})
      this.setState({
        administratedCoteries: updatedAdministratedCoteries,
        joinedCoteries: updatedJoinedCoteries
      })
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
    const fields = this.state.fields;
    return (
      <Layout style={{ height: '100%', width: '100%', position: 'absolute' }}>
        <Header className="header" style={{ backgroundColor: '#f6f6f6', diplay: 'inline' }}>
          <Row>
            <Col span={6}>
              <div className="logo" />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Search
                placeholder="input search text"
                style={{ width: 200 }}
                onSearch={this.handleSearch}
              />
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              { this.state.user.is_authenticated ? <a onClick={this.signOff}>sign off</a> : <a href="/sign-in">sign in</a> }
              <span style={{ margin: 18 }}>{ this.state.user.nickname }</span>
              <AvatarWithNotifications avatarSrc={this.state.user.portrait_url} />
            </Col>
          </Row>
        </Header>

        <Router basename={URL_BASE}>
          <Layout>
            <Sider width={200} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
              <Menu
                mode="inline"
                defaultOpenKeys={['teams']}
                onClick={this.onClickCreateGroupMenuItem}
                style={{ height: '100%', borderRight: 0 }}
                defaultSelectedKeys={window.location.pathname.endsWith('search') ? [] : ['documents']}
              >
                <Menu.Item key="explore">
                  <Link to="/"><span><Icon type="compass" />explore</span></Link>
                </Menu.Item>
                <Menu.Item key="documents" disabled={!this.state.user.is_authenticated}>
                  <Link to="/"><span><Icon type='file' />documents</span></Link>
                </Menu.Item>
                <SubMenu key="teams" title={<span><Icon type="team" />group</span>} disabled={!this.state.user.is_authenticated}>
                  {
                    this.state.administratedCoteries.map((coterie) => {
                      return (
                        <Menu.Item key={coterie.pk}>
                          <Link to={ '/groups/' + coterie.pk }><span>{ coterie.name }</span></Link>
                        </Menu.Item>
                      )
                    })
                  }
                  {
                    this.state.joinedCoteries.map((coterie) => {
                      return (
                        <Menu.Item key={coterie.pk}>
                          <Link to={ '/groups/' + coterie.pk }><span>{ coterie.name }</span></Link>
                        </Menu.Item>
                      )
                    })
                  }
                  <Menu.Item key={CREATE_NEW_GROUP_MENU_ITEM_KEY}><Icon type="plus"/></Menu.Item>
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
              <Switch>
                <Route exact path="/" component={DocumentTab} />
                <Route exact path="/explore" component={GroupTab} />
                <Route path="/search" component={SearchResultTab} />
                <Route path="/groups/:pk" render={({match, location}) => <GroupTab deleteCoterieCallback={this.deleteCoterieCallback} match={match} location={location} />} />
              </Switch>
            </Layout>
          </Layout>
        </Router>
      </Layout>
    );
  }
}

const CustomizedForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    return {
      coterieName: {
        ...props.coterieName,
        value: props.coterieName.value,
      },
    };
  },
})((props) => {
  const { getFieldDecorator } = props.form;
  return (
    <Form layout="inline">
      <FormItem label="group name">
        {getFieldDecorator('coterieName', {
          rules: [{ required: true, message: 'name is required!' }],
        })(<Input />)}
      </FormItem>
    </Form>
  );
});

ReactDOM.render(
  <LocaleProvider locale={enUS}>
    <App />
  </LocaleProvider>,
  document.getElementById('main')
);

