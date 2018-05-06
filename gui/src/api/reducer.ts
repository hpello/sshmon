import { APIStatus, types } from './actions'
import { State as APIState } from '../../../server/src/types/redux'
import { Action } from '../types/redux'

export type State = {
  state: APIState,
  status: APIStatus
}

const initialState = (): State => ({
  state: {
    hosts: [],
    forwardings: [],
    autoconnects: [],
    autoforwards: [],
    system: {
      info: null,
      stats: null
    },
    config: {
      autosave: false
    }
  },
  status: 'disconnected'
})

export const reducer = (state: State = initialState(), action: Action): State => {
  switch (action.type) {
  case types.API_STATE_CHANGE: return { ...state, state: action.state }
  case types.API_STATUS_CHANGE: return { ...state, status: action.status }
  default: return state
  }
}
