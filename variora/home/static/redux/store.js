import { createStore, applyMiddleware } from 'redux'
import { rootReducer } from './reducers.js'
import thunk from 'redux-thunk'

const store = createStore(rootReducer, applyMiddleware(...[thunk]))

console.log(JSON.stringify(store))

export { store }
