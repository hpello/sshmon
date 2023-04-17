import type { Action } from '@/server/types/redux'
import { types } from './actions'
import type { ConfigConfig } from './types'

export type State = ConfigConfig

const initialState = (): State => ({
  autosave: false,
})

export const reducer = (
  state: State = initialState(),
  action: Action
): State => {
  switch (action.type) {
    case types.CONFIG_EDIT: {
      const { config } = action
      return { ...state, ...config }
    }
    default:
      return state
  }
}
