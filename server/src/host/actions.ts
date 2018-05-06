import { HostConfig } from './types'

export enum types {
  HOST_CREATE = 'HOST_CREATE',
  HOST_EDIT = 'HOST_EDIT',
  HOST_DELETE = 'HOST_DELETE',
  HOST_STATE_CHANGE = 'HOST_STATE_CHANGE'
}

export type HostStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error'

interface HostCreateAction {
  type: types.HOST_CREATE,
  id: string,
  config: HostConfig
}

interface HostEditAction {
  type: types.HOST_EDIT,
  id: string,
  config: HostConfig
}

interface HostDeleteAction {
  type: types.HOST_DELETE,
  id: string
}

interface HostStateChangeAction {
  type: types.HOST_STATE_CHANGE,
  id: string,
  status: HostStatus,
  pid?: number,
  controlPath?: string,
  time?: Date,
  reason?: string
}

export type Action =
  | HostCreateAction
  | HostEditAction
  | HostDeleteAction
  | HostStateChangeAction

export const actions = {
  hostCreate: (id: string, config: HostConfig): Action => ({ type: types.HOST_CREATE, id, config }),
  hostEdit: (id: string, config: HostConfig): Action => ({ type: types.HOST_EDIT, id, config }),
  hostDelete: (id: string): Action => ({ type: types.HOST_DELETE, id }),

  hostStateConnecting: (id: string, pid: number, controlPath: string, reason: string): Action => ({ type: types.HOST_STATE_CHANGE, id, status: 'connecting', pid, controlPath, reason }),
  hostStateConnected: (id: string, time: Date): Action => ({ type: types.HOST_STATE_CHANGE, id, status: 'connected', time }),
  hostStateDisconnecting: (id: string, reason: string): Action => ({ type: types.HOST_STATE_CHANGE, id, status: 'disconnecting', reason }),
  hostStateDisconnected: (id: string): Action => ({ type: types.HOST_STATE_CHANGE, id, status: 'disconnected' }),
  hostStateError: (id: string): Action => ({ type: types.HOST_STATE_CHANGE, id, status: 'error' })
}
