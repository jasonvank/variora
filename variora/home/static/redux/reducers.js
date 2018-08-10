import { GET_EXPLORE_DOCS, GET_USER } from './actions.js'

const initialStore = {
  mostViewsDocuments: undefined,
  mostStarsDocuments: undefined,
  mostAnnotationsDocuments: undefined,
  user: undefined,
}

const rootReducer = (store = initialStore, dispatchTarget) => {
  if (dispatchTarget.type == GET_EXPLORE_DOCS) {
    return {
      ...store,
      ...dispatchTarget.payload,
    }
  } else if (dispatchTarget.type == GET_USER) {
    return {
      ...store,
      user: dispatchTarget.user,
    }
  } else {
    return store
  }
}

export { rootReducer }
