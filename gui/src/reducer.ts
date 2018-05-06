import { combineReducers } from 'redux'

import { reducer as api, State as APIState } from './api/reducer'
import { Action as APIAction } from './api/actions'

export type State = {
  api: APIState
}

export type Action =
  | APIAction
  | { type: '__any_other_action_type__' }

export default combineReducers<State>({
  api
} as any) // FIXME hpello https://github.com/reactjs/redux/issues/2709
