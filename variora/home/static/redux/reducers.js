import {
  FETCH_LOCALE,
  SET_LOCALE,
  FETCH_USEREXPLORE_DOCS,
  FETCH_USEREXPLORE_READLISTS,
  FETCH_USER,
  FETCH_CREATED_READLISTS,
  SET_CREATED_READLISTS,
  SET_COLLECTED_READLISTS,
} from './actions.js'
import { initialStore } from './init_store.js'

const rootReducer = (store = initialStore, dispatchTarget) => {
  if (dispatchTarget.type == FETCH_LOCALE) {
    return {
      ...store,
      ...dispatchTarget.payload,
    }
  } else if (dispatchTarget.type == SET_LOCALE) {
    console.log(dispatchTarget.payload)
    return {
      ...store,
      locale: dispatchTarget.payload,
    }
  } else if (dispatchTarget.type == FETCH_USEREXPLORE_DOCS) {
    return {
      ...store,
      ...dispatchTarget.payload,
    }
  } else if (dispatchTarget.type == FETCH_USEREXPLORE_READLISTS) {
    return {
      ...store,
      ...dispatchTarget.payload,
    }
  } else if (dispatchTarget.type == FETCH_USER) {
    return {
      ...store,
      user: dispatchTarget.user,
    }
  } else if (dispatchTarget.type == FETCH_CREATED_READLISTS) {
    return {
      ...store,
      createdReadlists: dispatchTarget.createdReadlists,
    }
  } else if (dispatchTarget.type == SET_CREATED_READLISTS) {
    return {
      ...store,
      createdReadlists: dispatchTarget.createdReadlists,
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
