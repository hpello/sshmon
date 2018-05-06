import { types } from './actions'
import { Action } from '../types/redux'
import { AutoforwardConfig } from './types'

export interface AutoforwardSubState {
  autoretryId: string | null,
  numRetries: number,
  timeout: number
}

export interface AutoforwardState {
  id: string,
  fwdId: string,
  config: AutoforwardConfig,
  state: AutoforwardSubState
}

export type State = AutoforwardState[]

const initialState = (): State => ([])

const defaultSubState = (): AutoforwardSubState => ({
  autoretryId: null,
  numRetries: 0,
  timeout: 0
})


export const reducer = (state: State = initialState(), action: Action): State => {
  switch (action.type) {
  case types.AUTOFORWARD_CREATE: {
    const { id, fwdId, config } = action

    const autoforwardState = {
      id,
      fwdId,
      config,
      state: defaultSubState()
    }

    return [...state, autoforwardState]
  }
  case types.AUTOFORWARD_EDIT: {
    const { id, fwdId, config } = action
    return state.map(x => x.id === id && x.fwdId === fwdId ? ({ ...x, config }) : x)
  }
  case types.AUTOFORWARD_DELETE: {
    const { id, fwdId } = action
    return state.filter(x => x.id !== id || x.fwdId !== fwdId)
  }
  case types.AUTOFORWARD_LAUNCH: {
    const { id, fwdId, autoretryId, numRetries, timeout } = action

    return state.map((autoforwardState) => {
      if (autoforwardState.id !== id || autoforwardState.fwdId !== fwdId) { return autoforwardState }

      return {
        ...autoforwardState,
        state: { autoretryId, numRetries, timeout }
      }
    })
  }
  case types.AUTOFORWARD_CANCEL: {
    const { id, fwdId } = action
    return state.map((autoforwardState) => {
      if (autoforwardState.id !== id || autoforwardState.fwdId !== fwdId) { return autoforwardState }

      return {
        ...autoforwardState,
        state: defaultSubState()
      }
    })
  }
  default:
    return state
  }
}
