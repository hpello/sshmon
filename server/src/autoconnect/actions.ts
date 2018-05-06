import { AutoconnectConfig } from './types'

export enum types {
  AUTOCONNECT_CREATE = 'AUTOCONNECT_CREATE',
  AUTOCONNECT_EDIT = 'AUTOCONNECT_EDIT',
  AUTOCONNECT_DELETE = 'AUTOCONNECT_DELETE',
  AUTOCONNECT_LAUNCH = 'AUTOCONNECT_LAUNCH',
  AUTOCONNECT_CANCEL = 'AUTOCONNECT_CANCEL'
}

interface AutoconnectCreateAction {
  type: types.AUTOCONNECT_CREATE, id: string, config: AutoconnectConfig
}

interface AutoconnectEditAction {
  type: types.AUTOCONNECT_EDIT, id: string, config: AutoconnectConfig
}

interface AutoconnectDeleteAction {
  type: types.AUTOCONNECT_DELETE, id: string
}

interface AutoconnectLaunchAction {
  type: types.AUTOCONNECT_LAUNCH,
  id: string,
  autoretryId: string,
  numRetries: number,
  timeout: number
}

interface AutoconnectCancelAction {
  type: types.AUTOCONNECT_CANCEL, id: string
}

export type Action =
  | AutoconnectCreateAction
  | AutoconnectEditAction
  | AutoconnectDeleteAction
  | AutoconnectLaunchAction
  | AutoconnectCancelAction

export const actions = {
  autoconnectCreate: (id: string, config: AutoconnectConfig): Action => ({ type: types.AUTOCONNECT_CREATE, id, config }),
  autoconnectEdit: (id: string, config: AutoconnectConfig): Action => ({ type: types.AUTOCONNECT_EDIT, id, config }),
  autoconnectDelete: (id: string): Action => ({ type: types.AUTOCONNECT_DELETE, id }),
  autoconnectLaunch: (id: string, autoretryId: string, numRetries: number, timeout: number): Action => ({ type: types.AUTOCONNECT_LAUNCH, id, autoretryId, numRetries, timeout }),
  autoconnectCancel: (id: string): Action => ({ type: types.AUTOCONNECT_CANCEL, id })
}
