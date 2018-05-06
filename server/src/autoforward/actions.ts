import { AutoforwardConfig } from './types'

export enum types {
  AUTOFORWARD_CREATE = 'AUTOFORWARD_CREATE',
  AUTOFORWARD_EDIT = 'AUTOFORWARD_EDIT',
  AUTOFORWARD_DELETE = 'AUTOFORWARD_DELETE',
  AUTOFORWARD_LAUNCH = 'AUTOFORWARD_LAUNCH',
  AUTOFORWARD_CANCEL = 'AUTOFORWARD_CANCEL'
}

interface AutoforwardCreateAction {
  type: types.AUTOFORWARD_CREATE, id: string, fwdId: string, config: AutoforwardConfig
}

interface AutoforwardEditAction {
  type: types.AUTOFORWARD_EDIT, id: string, fwdId: string, config: AutoforwardConfig
}

interface AutoforwardDeleteAction {
  type: types.AUTOFORWARD_DELETE, id: string, fwdId: string
}

interface AutoforwardLaunchAction {
  type: types.AUTOFORWARD_LAUNCH,
  id: string,
  fwdId: string,
  autoretryId: string,
  numRetries: number,
  timeout: number
}

interface AutoforwardCancelAction {
  type: types.AUTOFORWARD_CANCEL, id: string, fwdId: string
}

export type Action =
  | AutoforwardCreateAction
  | AutoforwardEditAction
  | AutoforwardDeleteAction
  | AutoforwardLaunchAction
  | AutoforwardCancelAction

export const actions = {
  autoforwardCreate: (id: string, fwdId: string, config: AutoforwardConfig): Action => ({ type: types.AUTOFORWARD_CREATE, id, fwdId, config }),
  autoforwardEdit: (id: string, fwdId: string, config: AutoforwardConfig): Action => ({ type: types.AUTOFORWARD_EDIT, id, fwdId, config }),
  autoforwardDelete: (id: string, fwdId: string): Action => ({ type: types.AUTOFORWARD_DELETE, id, fwdId }),
  autoforwardLaunch: (id: string, fwdId: string, autoretryId: string, numRetries: number, timeout: number): Action => ({ type: types.AUTOFORWARD_LAUNCH, id, fwdId, autoretryId, numRetries, timeout }),
  autoforwardCancel: (id: string, fwdId: string): Action => ({ type: types.AUTOFORWARD_CANCEL, id, fwdId })
}
