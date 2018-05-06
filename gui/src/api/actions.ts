import { State as APIState } from '../../../server/src/types/redux'

export enum types {
  API_STATE_CHANGE = 'API_STATE_CHANGE',
  API_STATUS_CHANGE = 'API_STATUS_CHANGE'
}

export type APIStatus = 'connected' | 'disconnected'

export type Action =
  | { type: types.API_STATE_CHANGE, state: APIState }
  | { type: types.API_STATUS_CHANGE, status: APIStatus }

export const actions = {
  apiStateChange: (state: APIState): Action => ({ type: types.API_STATE_CHANGE, state }),
  apiStatusConnected: (): Action => ({ type: types.API_STATUS_CHANGE, status: 'connected' }),
  apiStatusDisconnected: (): Action => ({ type: types.API_STATUS_CHANGE, status: 'disconnected' })
}
