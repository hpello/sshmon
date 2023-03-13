import { types } from './actions'
import { SystemInfo, SystemStats } from './types'
import { Action } from '../types/redux'

export interface SystemState {
  info: SystemInfo | null
  stats: SystemStats | null
}

export type State = SystemState

const initialState = (): State => ({
  info: null,
  stats: null,
})

export const reducer = (
  state: State = initialState(),
  action: Action
): State => {
  switch (action.type) {
    case types.SYSTEM_ADD_INFO: {
      const { info } = action
      return { ...state, info }
    }
    case types.SYSTEM_ADD_STATS: {
      const { stats } = action
      return { ...state, stats }
    }
    default:
      return state
  }
}
