import type { Action } from '@/server/types/redux'
import { types } from './actions'
import type { AutoconnectConfig } from './types'

export interface AutoconnectSubState {
  autoretryId: string | null
  numRetries: number
  timeout: number
}

export interface AutoconnectState {
  id: string
  config: AutoconnectConfig
  state: AutoconnectSubState
}

export type State = AutoconnectState[]

const initialState = (): State => []

const defaultSubState = (): AutoconnectSubState => ({
  autoretryId: null,
  numRetries: 0,
  timeout: 0,
})

export const reducer = (
  state: State = initialState(),
  action: Action
): State => {
  switch (action.type) {
    case types.AUTOCONNECT_CREATE: {
      const { id, config } = action

      const autoconnectState = {
        id,
        config,
        state: defaultSubState(),
      }

      return [...state, autoconnectState]
    }
    case types.AUTOCONNECT_EDIT: {
      const { id, config } = action
      return state.map((x) => (x.id === id ? { ...x, config } : x))
    }
    case types.AUTOCONNECT_DELETE: {
      const { id } = action
      return state.filter((x) => x.id !== id)
    }
    case types.AUTOCONNECT_LAUNCH: {
      const { id, autoretryId, numRetries, timeout } = action

      return state.map((autoconnectState) => {
        if (autoconnectState.id !== id) {
          return autoconnectState
        }

        return {
          ...autoconnectState,
          state: { autoretryId, numRetries, timeout },
        }
      })
    }
    case types.AUTOCONNECT_CANCEL: {
      const { id } = action
      return state.map((autoconnectState) => {
        if (autoconnectState.id !== id) {
          return autoconnectState
        }

        return {
          ...autoconnectState,
          state: defaultSubState(),
        }
      })
    }
    default:
      return state
  }
}
