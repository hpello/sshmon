import { find } from 'lodash'

import { actions } from '@/server/autoconnect/actions'
import type { AutoconnectConfig } from '@/server/autoconnect/types'
import { createLogger } from '@/server/log'
import type { AsyncThunkAction, Dispatch, GetState } from '@/server/types/redux'
import { ErrorWithCode } from '@/server/utils/error-with-code'

const log = createLogger(__filename)

export const autoconnectCreate =
  (id: string, config: AutoconnectConfig): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      log.info(`host not found: ${id}`)
      return
    }

    const autoconnect = find(state.autoconnects, { id })
    if (autoconnect) {
      throw new ErrorWithCode(409, `autoconnect already exists: ${id}`)
    }

    dispatch(actions.autoconnectCreate(id, config))
  }

export const autoconnectEdit =
  (id: string, config: AutoconnectConfig): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      log.info(`host not found: ${id}`)
      return
    }

    const autoconnect = find(state.autoconnects, { id })
    if (!autoconnect) {
      throw new ErrorWithCode(404, `autoconnect not found: ${id}`)
    }

    dispatch(actions.autoconnectEdit(id, config))
  }

export const autoconnectDelete =
  (id: string): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const autoconnect = find(state.autoconnects, { id })
    if (!autoconnect) {
      log.info(`autoconnect not found: ${id}`)
      return
    }

    dispatch(actions.autoconnectDelete(id))
  }
