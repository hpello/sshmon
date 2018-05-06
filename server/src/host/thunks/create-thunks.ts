import { find } from 'lodash'

import { actions } from '../actions'
import { HostConfig } from '../types'
import { AsyncThunkAction, Dispatch, GetState } from '../../types/redux'
import { ErrorWithCode } from '../../utils/error-with-code'
import { createLogger } from '../../utils/log'

const log = createLogger(__filename)

export const hostCreate = (id: string, config: HostConfig): AsyncThunkAction => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const host = find(state.hosts, { id })
  if (host) { throw new ErrorWithCode(409, `host already exists: ${id}`) }

  dispatch(actions.hostCreate(id, config))
}

export const hostEdit = (id: string, config: HostConfig): AsyncThunkAction => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const host = find(state.hosts, { id })
  if (!host) { throw new ErrorWithCode(404, `host not found: ${id}`) }

  dispatch(actions.hostEdit(id, config))
}

export const hostDelete = (id: string): AsyncThunkAction => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const host = find(state.hosts, { id })
  if (!host) { log.info(`host not found: ${id}`); return }
  if (!['disconnected', 'error'].includes(host.state.status)) { throw new ErrorWithCode(400, `host not down: ${id}`) }

  dispatch(actions.hostDelete(id))
}
