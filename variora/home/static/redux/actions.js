import axios from 'axios'
import { getUrlFormat } from 'util.js'
import { initializeWebPush } from '../initialize_push'


const FETCH_USEREXPLORE_DOCS = 'FETCH_USEREXPLORE_DOCS'
const FETCH_USEREXPLORE_READLISTS = 'FETCH_USEREXPLORE_READLISTS'
const FETCH_USER = 'FETCH_USER'
const SET_COLLECTED_READLISTS = 'SET_COLLECTED_READLISTS'

const fetchExploreDocs = () => dispatch => {
  axios.get(getUrlFormat('/documents/api/documents/explore'))
    .then(response => {
      var mostViewsDocuments = response.data.filter(item => item.description == 'most_views')
      var mostStarsDocuments = response.data.filter(item => item.description == 'most_collectors')
      var mostAnnotationsDocuments = response.data.filter(item => item.description == 'most_annotations')
      const payload = {
        mostViewsDocuments: mostViewsDocuments,
        mostStarsDocuments: mostStarsDocuments,
        mostAnnotationsDocuments: mostAnnotationsDocuments,
      }
      dispatch({
        type: FETCH_USEREXPLORE_DOCS,
        payload: payload
      })
    })
}

const fetchExploreReadlists = () => dispatch => {
  axios.get(getUrlFormat('/documents/api/readlists/explore'))
    .then(response => {
      var mostCollectedReadlists = response.data.most_collectors_readlists
      var newestReadlists = response.data.newest_readlists
      const payload = {
        mostCollectedReadlists: mostCollectedReadlists,
        newestReadlists: newestReadlists,
      }
      dispatch({
        type: FETCH_USEREXPLORE_READLISTS,
        payload: payload
      })
    })
}

const fetchUser = () => dispatch => {
  axios.get('/api/user').then((response) => {
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

const setCollectedReadlists = (collectedReadlists) => dispatch => {
  dispatch({
    type: SET_COLLECTED_READLISTS,
    collectedReadlists: collectedReadlists
  })
}

export {
  fetchExploreDocs,
  fetchExploreReadlists,
  fetchUser,
  setCollectedReadlists,
  FETCH_USEREXPLORE_DOCS,
  FETCH_USEREXPLORE_READLISTS,
  FETCH_USER,
  SET_COLLECTED_READLISTS,
}
