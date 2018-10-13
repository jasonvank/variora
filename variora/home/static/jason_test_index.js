import './css/test_index.css'
import 'regenerator-runtime/runtime'

import { Avatar, notification, Button, Col, Form, Icon, Input, Layout, LocaleProvider, Menu, Modal, Row, message } from 'antd'
import { getCookie, getValFromUrlParam } from 'util.js'

import { Provider, connect } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import { SearchResultTab } from './components/search_result_tab/search_result_tab.jsx'
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US'
import { store } from './redux/store.js'
import { fetchUser, fetchExploreDocs, fetchExploreReadlists } from './redux/actions.js'
import { initialStore } from './redux/init_store.js'
import TextArea from '../../../node_modules/antd/lib/input/TextArea'

import DocumentTitle from 'react-document-title';
import { enquireScreen } from 'enquire-js';
import { HeaderPage } from './components/landing_page/Header.jsx';
import { Banner } from './components/landing_page/Banner.jsx';
import { Page1 } from './components/landing_page/Page1.jsx';
import { Page2 } from './components/landing_page/Page2.jsx';
import { Page3 } from './components/landing_page/Page3.jsx';
import { Footer } from './components/landing_page/Footer.jsx';
const FormItem = Form.Item
import './components/landing_page/static/style';

const CREATE_NEW_GROUP_MENU_ITEM_KEY = 'createGroupButton'

const URL_BASE = ''

class HomeBeforeConnect extends React.Component {
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
      mostViewsDocuments: [],
      mostCollectedReadlists: []
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


    this.updateReadlistsNameCallback = (readlistSlug, new_name) => {
      var updatedCreatedReadlist = this.state.createdReadlists.map(readlist => {
        if (readlist.slug !== readlistSlug)
          return readlist
        return Object.assign({}, readlist, {name: new_name})
      })
      this.setState({ createdReadlists: updatedCreatedReadlist })
    }
  }

  componentDidMount() {
    this.props.fetchUser()
    if (this.props.mostViewsDocuments == undefined) {
      alert("hey")
      this.props.fetchExploreDocs()
    }

    if (this.props.mostCollectedReadlists == undefined)
      this.props.fetchExploreReadlists()
    // axios.get('/file_viewer/api/readlists').then((response) => {
    //   this.setState({
    //     createdReadlists: response.data.created_readlists,
    //     collectedReadlists: response.data.collected_readlists,
    //   })
    //   this.props.setCollectedReadlists(response.data.collected_readlists)
    // })
  }

  componentWillReceiveProps(props) {
    this.setState({
      user: props.user,
      mostViewsDocuments: props.mostViewsDocuments,
      mostCollectedReadlists: props.mostCollectedReadlists
    })
  }

  render() {
    return (
      <div>
        <HeaderPage key="header" isFirstScreen={this.state.isFirstScreen} />
        <Banner key="banner" onEnterChange={this.onEnterChange} />
        <Page1 key="page1" />
        <Page2 key="page2" />
        <Page3 key="page3" />
        <Footer key="footer" />
        <DocumentTitle title="Variora" key="title" />
      </div>
    )
  }
}



const mapStoreToProps = (store, ownProps) => {
  return {...ownProps, user: store.user}
}
const Home = connect(mapStoreToProps, {fetchUser, fetchExploreDocs, fetchExploreReadlists})(HomeBeforeConnect)

ReactDOM.render(
  <Provider store={store}>
    <LocaleProvider locale={enUS}>
      <Home />
    </LocaleProvider>
  </Provider>,
  document.getElementById('main')
)
