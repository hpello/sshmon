import { Action, Dispatch, Middleware } from '../types/redux'
import { createLogger } from '.'

const log = createLogger('redux')

// @ts-expect-error FIXME hpello https://github.com/gaearon/redux-thunk/issues/82
export const logMiddleware: Middleware =
  () => (next: Dispatch) => (action: Action) => {
    if (action.type !== 'SYSTEM_ADD_STATS') {
      log.debug({ action })
    }
    next(action)
  }
