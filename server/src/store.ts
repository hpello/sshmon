import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import { reducer } from './reducer'
import { logMiddleware } from './utils/log-middleware'

const makeMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(thunk)
  } else { // tslint:disable-line no-else-after-return
    return applyMiddleware(thunk, logMiddleware)
  }
}

export const store = createStore(
  reducer,
  makeMiddleware()
)
