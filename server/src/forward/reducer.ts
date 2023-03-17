import type { Action } from '../types/redux'
import type { ForwardingStatus } from './actions'
import { types } from './actions'
import type { ForwardingConfig, ForwardingParams } from './types'

export type ForwardingSubState = {
  status: ForwardingStatus
  params: ForwardingParams | null
  reason: string | null
}

export interface ForwardingState {
  id: string
  fwdId: string
  config: ForwardingConfig
  state: ForwardingSubState
}

export type State = ForwardingState[]

const initialState = (): State => []

const defaultSubState = (): ForwardingSubState => ({
  status: 'disconnected',
  params: null,
  reason: null,
})

export const reducer = (
  state: State = initialState(),
  action: Action
): State => {
  switch (action.type) {
    case types.FORWARDING_CREATE: {
      const { id, fwdId, config } = action

      const forwardingState = {
        id,
        fwdId,
        config,
        state: defaultSubState(),
      }

      return [...state, forwardingState]
    }
    case types.FORWARDING_EDIT: {
      const { id, fwdId, config } = action
      return state.map((x) =>
        x.id === id && x.fwdId === fwdId ? { ...x, config } : x
      )
    }
    case types.FORWARDING_DELETE: {
      const { id, fwdId } = action
      return state.filter((x) => x.id !== id || x.fwdId !== fwdId)
    }
    case types.FORWARDING_STATE_CHANGE: {
      const { id, fwdId, status, params, reason } = action
      return state.map((forwardingState) => {
        if (forwardingState.id !== id || forwardingState.fwdId !== fwdId) {
          return forwardingState
        }

        return {
          ...forwardingState,
          state: {
            status,
            params: params || forwardingState.state.params,
            reason: reason || forwardingState.state.reason,
          },
        }
      })
    }
    default:
      return state
  }
}
