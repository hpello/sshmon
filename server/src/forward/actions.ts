import { ForwardingConfig, ForwardingParams } from './types'

export enum types {
  FORWARDING_CREATE = 'FORWARDING_CREATE',
  FORWARDING_EDIT = 'FORWARDING_EDIT',
  FORWARDING_DELETE = 'FORWARDING_DELETE',
  FORWARDING_STATE_CHANGE = 'FORWARDING_STATE_CHANGE',
}

export type ForwardingStatus =
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'error'

interface ForwardingCreateAction {
  type: types.FORWARDING_CREATE
  id: string
  fwdId: string
  config: ForwardingConfig
}

interface ForwardingEditAction {
  type: types.FORWARDING_EDIT
  id: string
  fwdId: string
  config: ForwardingConfig
}

interface ForwardingDeleteAction {
  type: types.FORWARDING_DELETE
  id: string
  fwdId: string
}

interface ForwardingStateChangeAction {
  type: types.FORWARDING_STATE_CHANGE
  id: string
  fwdId: string
  status: ForwardingStatus
  params?: ForwardingParams
  reason?: string
}

export type Action =
  | ForwardingCreateAction
  | ForwardingEditAction
  | ForwardingDeleteAction
  | ForwardingStateChangeAction

export const actions = {
  forwardingCreate: (
    id: string,
    fwdId: string,
    config: ForwardingConfig
  ): Action => ({ type: types.FORWARDING_CREATE, id, fwdId, config }),
  forwardingEdit: (
    id: string,
    fwdId: string,
    config: ForwardingConfig
  ): Action => ({ type: types.FORWARDING_EDIT, id, fwdId, config }),
  forwardingDelete: (id: string, fwdId: string): Action => ({
    type: types.FORWARDING_DELETE,
    id,
    fwdId,
  }),

  forwardingConnecting: (
    id: string,
    fwdId: string,
    params: ForwardingParams,
    reason: string
  ): Action => ({
    type: types.FORWARDING_STATE_CHANGE,
    id,
    fwdId,
    status: 'connecting',
    params,
    reason,
  }),
  forwardingConnected: (id: string, fwdId: string): Action => ({
    type: types.FORWARDING_STATE_CHANGE,
    id,
    fwdId,
    status: 'connected',
  }),
  forwardingDisconnecting: (
    id: string,
    fwdId: string,
    reason: string
  ): Action => ({
    type: types.FORWARDING_STATE_CHANGE,
    id,
    fwdId,
    status: 'disconnecting',
    reason,
  }),
  forwardingDisconnected: (id: string, fwdId: string): Action => ({
    type: types.FORWARDING_STATE_CHANGE,
    id,
    fwdId,
    status: 'disconnected',
  }),
  forwardingError: (id: string, fwdId: string): Action => ({
    type: types.FORWARDING_STATE_CHANGE,
    id,
    fwdId,
    status: 'error',
  }),
}
