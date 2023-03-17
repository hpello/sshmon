import { find } from 'lodash'

import { createLogger } from '../../log'
import { AsyncThunkAction, Dispatch, GetState } from '../../types/redux'
import { ErrorWithCode } from '../../utils/error-with-code'
import { actions } from '../actions'
import { AutoforwardConfig } from '../types'

const log = createLogger(__filename)

export const autoforwardCreate =
  (id: string, fwdId: string, config: AutoforwardConfig): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      log.info(`host not found: ${id}`)
      return
    }

    const autoforward = find(state.autoforwards, { id, fwdId })
    if (autoforward) {
      throw new ErrorWithCode(409, `autoforward already exists: ${id}/${fwdId}`)
    }

    dispatch(actions.autoforwardCreate(id, fwdId, config))
  }

export const autoforwardEdit =
  (id: string, fwdId: string, config: AutoforwardConfig): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      log.info(`host not found: ${id}`)
      return
    }

    const autoforward = find(state.autoforwards, { id, fwdId })
    if (!autoforward) {
      throw new ErrorWithCode(404, `autoforward not found: ${id}/${fwdId}`)
    }

    dispatch(actions.autoforwardEdit(id, fwdId, config))
  }

export const autoforwardDelete =
  (id: string, fwdId: string): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const autoforward = find(state.autoforwards, { id, fwdId })
    if (!autoforward) {
      log.info(`autoforward not found: ${id}/${fwdId}`)
      return
    }

    dispatch(actions.autoforwardDelete(id, fwdId))
  }
