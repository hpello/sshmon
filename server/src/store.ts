import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import { reducer } from './reducer'
import { logMiddleware } from './log/middleware'

const makeMiddleware = () => {
  return applyMiddleware(thunk, logMiddleware)
}

export const store = createStore(
  reducer,
  makeMiddleware()
)
