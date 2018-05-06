import { applyMiddleware, createStore } from 'redux'
import { createLogger } from 'redux-logger'

import reducer from './reducer'

const makeMiddleware = () => {
  return applyMiddleware(createLogger({
    level: {
      prevState: false,
      action: 'log',
      nextState: false,
      error: 'error'
    }
  }))
}

export const store = createStore(
  reducer,
  makeMiddleware()
)
