import { createLogger } from './log'
import { Action, Dispatch, Middleware } from '../types/redux'

const log = createLogger('redux')

// @ts-ignore FIXME hpello https://github.com/gaearon/redux-thunk/issues/82
export const logMiddleware: Middleware = () => (next: Dispatch) => (action: Action) => {
  if (action.type !== 'SYSTEM_ADD_STATS') {
    log.debug({ action })
  }
  next(action)
}
