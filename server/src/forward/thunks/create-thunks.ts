import { find } from 'lodash'

import { actions } from '../actions'
import { ForwardingConfig } from '../types'
import { AsyncThunkAction, Dispatch, GetState } from '../../types/redux'
import { ErrorWithCode } from '../../utils/error-with-code'
import { createLogger } from '../../utils/log'

const log = createLogger(__filename)

export const forwardingCreate = (id: string, fwdId: string, config: ForwardingConfig): AsyncThunkAction => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const h = find(state.hosts, { id })
  if (!h) { log.info(`host not found: ${id}`); return }

  const forwarding = find(state.forwardings, { id, fwdId })
  if (forwarding) { throw new ErrorWithCode(409, `forwarding already exists: ${id}/${fwdId}`) }

  dispatch(actions.forwardingCreate(id, fwdId, config))
}

export const forwardingEdit = (id: string, fwdId: string, config: ForwardingConfig): AsyncThunkAction => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const h = find(state.hosts, { id })
  if (!h) { log.info(`host not found: ${id}`); return }

  const forwarding = find(state.forwardings, { id, fwdId })
  if (!forwarding) { throw new ErrorWithCode(404, `forwarding not found: ${id}/${fwdId}`) }

  dispatch(actions.forwardingEdit(id, fwdId, config))
}

export const forwardingDelete = (id: string, fwdId: string): AsyncThunkAction => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const forwarding = find(state.forwardings, { id, fwdId })
  if (!forwarding) { log.info(`forwarding not found: ${id}/${fwdId}`); return }

  dispatch(actions.forwardingDelete(id, fwdId))
}
