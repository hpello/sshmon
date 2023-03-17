import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import { logMiddleware } from './log/middleware'
import { reducer } from './reducer'

const makeMiddleware = () => {
  return applyMiddleware(thunk, logMiddleware)
}

export const store = createStore(reducer, makeMiddleware())
