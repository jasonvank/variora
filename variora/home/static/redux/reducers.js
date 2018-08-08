import { GET_EXPLORE_DOCS } from './actions.js'
import { getUrlFormat } from 'util.js'
import axios from 'axios'

const initialStore = {
  mostViewsDocuments: undefined,
  mostStarsDocuments: undefined,
  mostAnnotationsDocuments: undefined,
}

const rootReducer = (store = initialStore, dispatchTarget) => {
  if (dispatchTarget.type == GET_EXPLORE_DOCS) {
    return {
      ...store,
      ...dispatchTarget.payload,
    }
  } else {
    return store
  }
}

export { rootReducer }
