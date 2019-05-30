import { createStore, applyMiddleware } from 'redux'
import { rootReducer } from './reducers.js'
import thunk from 'redux-thunk'
import { initialStore } from './init_store.js'

const store = createStore(rootReducer, initialStore, applyMiddleware(...[thunk]))

console.log('inside: ' + JSON.stringify(store))

export { store }
