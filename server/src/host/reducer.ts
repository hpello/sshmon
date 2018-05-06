import { HostStatus, types } from './actions'
import { HostConfig } from './types'
import { Action } from '../types/redux'

export interface HostSubState {
  status: HostStatus,
  pid: number | null,
  controlPath: string | null,
  time: Date | null,
  reason: string | null
}

export interface HostState {
  id: string,
  config: HostConfig,
  state: HostSubState
}

export type State = HostState[]

const initialState = (): State => ([])

const defaultSubState = (): HostSubState => ({
  status: 'disconnected',
  pid: null,
  controlPath: null,
  time: null,
  reason: null
})

export const reducer = (state: State = initialState(), action: Action): State => {
  switch (action.type) {
  case types.HOST_CREATE: {
    const { id, config } = action

    const hostState = {
      id,
      config,
      state: defaultSubState()
    }

    return [...state, hostState]
  }
  case types.HOST_EDIT: {
    const { id, config } = action
    return state.map(x => x.id === id ? ({ ...x, config }) : x)
  }
  case types.HOST_DELETE: {
    const { id } = action
    return state.filter(x => x.id !== id)
  }
  case types.HOST_STATE_CHANGE: {
    const { id, status, pid, controlPath, time, reason } = action

    return state.map((hostState) => {
      if (hostState.id !== id) { return hostState }

      return {
        ...hostState,
        state: {
          status,
          pid: pid || hostState.state.pid,
          controlPath: controlPath || hostState.state.controlPath,
          time: time || hostState.state.time,
          reason: reason || hostState.state.reason
        }
      }
    })
  }
  default:
    return state
  }
}
