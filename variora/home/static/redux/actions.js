import axios from 'axios'
import { getUrlFormat } from 'util.js'


const FETCH_USEREXPLORE_DOCS = 'FETCH_USEREXPLORE_DOCS'
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

const fetchUser = () => dispatch => {
  axios.get('/api/user').then((response) => {
    var user = response.data
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
  fetchUser,
  setCollectedReadlists,
  FETCH_USEREXPLORE_DOCS,
  FETCH_USER,
  SET_COLLECTED_READLISTS,
}
