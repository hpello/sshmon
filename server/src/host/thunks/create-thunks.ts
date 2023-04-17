import { find } from 'lodash'

import { createLogger } from '@/server/log'
import type { AsyncThunkAction, Dispatch, GetState } from '@/server/types/redux'
import { ErrorWithCode } from '@/server/utils/error-with-code'
import { actions } from '@/server/host/actions'
import type { HostConfig } from '@/server/host/types'

const log = createLogger(__filename)

export const hostCreate =
  (id: string, config: HostConfig): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (host) {
      throw new ErrorWithCode(409, `host already exists: ${id}`)
    }

    dispatch(actions.hostCreate(id, config))
  }

export const hostEdit =
  (id: string, config: HostConfig): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      throw new ErrorWithCode(404, `host not found: ${id}`)
    }

    dispatch(actions.hostEdit(id, config))
  }

export const hostDelete =
  (id: string): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      log.info(`host not found: ${id}`)
      return
    }
    if (!['disconnected', 'error'].includes(host.state.status)) {
      throw new ErrorWithCode(400, `host not down: ${id}`)
    }

    dispatch(actions.hostDelete(id))
  }
