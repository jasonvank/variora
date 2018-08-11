const GET_EXPLORE_DOCS = 'GET_EXPLORE_DOCS'
const GET_USER = 'GET_USER'
import axios from 'axios'
import { getUrlFormat } from 'util.js'

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
        type: GET_EXPLORE_DOCS,
        payload: payload
      })
    })
}

const fetchUser = () => dispatch => {
  axios.get('/api/user').then((response) => {
    var user = response.data
    dispatch({
      type: GET_USER,
      user: user,
    })
  })
}

export {
  fetchExploreDocs,
  fetchUser,
  GET_EXPLORE_DOCS,
  GET_USER,
}