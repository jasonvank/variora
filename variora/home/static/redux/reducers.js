import { FETCH_USEREXPLORE_DOCS, FETCH_USER, SET_COLLECTED_READLISTS } from './actions.js'
import { initialStore } from './init_store.js'

const rootReducer = (store = initialStore, dispatchTarget) => {
  if (dispatchTarget.type == FETCH_USEREXPLORE_DOCS) {
    return {
      ...store,
      ...dispatchTarget.payload,
    }
  } else if (dispatchTarget.type == FETCH_USER) {
    return {
      ...store,
      user: dispatchTarget.user,
    }
  } else if (dispatchTarget.type == SET_COLLECTED_READLISTS) {
    return {
      ...store,
      collectedReadlists: dispatchTarget.collectedReadlists,
    }
  } else {
    return store
  }
}

export { rootReducer }
