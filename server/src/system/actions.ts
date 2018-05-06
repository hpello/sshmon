import { SystemInfo, SystemStats } from './types'

export enum types {
  SYSTEM_ADD_INFO = 'SYSTEM_ADD_INFO',
  SYSTEM_ADD_STATS = 'SYSTEM_ADD_STATS'
}

interface SystemAddInfoAction {
  type: types.SYSTEM_ADD_INFO,
  info: SystemInfo
}

interface SystemAddStatsAction {
  type: types.SYSTEM_ADD_STATS,
  stats: SystemStats
}

export type Action =
  | SystemAddInfoAction
  | SystemAddStatsAction

export const actions = {
  systemAddInfo: (info: SystemInfo): Action => ({ type: types.SYSTEM_ADD_INFO, info }),
  systemAddStats: (stats: SystemStats): Action => ({ type: types.SYSTEM_ADD_STATS, stats })
}
