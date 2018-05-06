import { ConfigConfig } from './types'

export enum types {
  CONFIG_EDIT = 'CONFIG_EDIT'
}

interface ConfigEditAction {
  type: types.CONFIG_EDIT, config: ConfigConfig
}

export type Action =
  | ConfigEditAction

export const actions = {
  configEdit: (config: ConfigConfig): Action => ({ type: types.CONFIG_EDIT, config })
}
