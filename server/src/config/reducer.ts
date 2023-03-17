import { Action } from '../types/redux'
import { types } from './actions'
import { ConfigConfig } from './types'

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
