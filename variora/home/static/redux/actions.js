import axios from 'axios'
import { getUrlFormat } from 'util.js'
import { initializeWebPush } from '../initialize_push'

const FETCH_USEREXPLORE_DOCS = 'FETCH_USEREXPLORE_DOCS'
const FETCH_USEREXPLORE_READLISTS = 'FETCH_USEREXPLORE_READLISTS'
const FETCH_USER = 'FETCH_USER'
const FETCH_CREATED_READLISTS = 'FETCH_CREATED_READLISTS'
const SET_COLLECTED_READLISTS = 'SET_COLLECTED_READLISTS'
const SET_CREATED_READLISTS = 'SET_CREATED_READLISTS'
const FETCH_LOCALE = 'FETCH_LOCALE'
const SET_LOCALE = 'SET_LOCALE'

const fetchExploreDocs = () => dispatch => {
  axios.get(getUrlFormat('/documents/api/documents/explore')).then(response => {
    var mostViewsDocuments = response.data.filter(item => item.description == 'most_views')
    var mostStarsDocuments = response.data.filter(item => item.description == 'most_collectors')
    var mostAnnotationsDocuments = response.data.filter(
      item => item.description == 'most_annotations',
    )
    const payload = {
      mostViewsDocuments: mostViewsDocuments,
      mostStarsDocuments: mostStarsDocuments,
      mostAnnotationsDocuments: mostAnnotationsDocuments,
    }
    dispatch({
      type: FETCH_USEREXPLORE_DOCS,
      payload: payload,
    })
  })
}

const fetchExploreReadlists = () => dispatch => {
  axios.get(getUrlFormat('/documents/api/readlists/explore')).then(response => {
    var mostCollectedReadlists = response.data.most_collectors_readlists
    var newestReadlists = response.data.newest_readlists
    const payload = {
      mostCollectedReadlists: mostCollectedReadlists,
      newestReadlists: newestReadlists,
    }
    dispatch({
      type: FETCH_USEREXPLORE_READLISTS,
      payload: payload,
    })
  })
}

const fetchUser = () => dispatch => {
  axios.get('/api/user').then(response => {
    var user = response.data
    if (user.is_authenticated) {
      // initializeWebPush()
    }
    dispatch({
      type: FETCH_USER,
      user: user,
    })
  })
}

const fetchCreatedReadlists = () => dispatch => {
  axios.get('/file_viewer/api/readlists').then(response => {
    dispatch({
      type: FETCH_CREATED_READLISTS,
      createdReadlists: response.data.created_readlists,
    })
  })
}

const setCreatedReadlists = created_readlists => dispatch => {
  dispatch({
    type: SET_CREATED_READLISTS,
    createdReadlists: created_readlists,
  })
}

const setCollectedReadlists = collected_readlists => dispatch => {
  dispatch({
    type: SET_COLLECTED_READLISTS,
    collectedReadlists: collected_readlists,
  })
}

const fetchLocale = () => dispatch => {
  dispatch({
    type: FETCH_LOCALE,
    payload: locale,
  })
}

const setLocale = locale => dispatch => {
  dispatch({
    type: SET_LOCALE,
    payload: locale,
  })
}

export {
  fetchExploreDocs,
  fetchExploreReadlists,
  fetchUser,
  fetchCreatedReadlists,
  setCreatedReadlists,
  setCollectedReadlists,
  fetchLocale,
  setLocale,
  FETCH_USEREXPLORE_DOCS,
  FETCH_USEREXPLORE_READLISTS,
  FETCH_USER,
  FETCH_CREATED_READLISTS,
  SET_CREATED_READLISTS,
  SET_COLLECTED_READLISTS,
  FETCH_LOCALE,
  SET_LOCALE,
}
