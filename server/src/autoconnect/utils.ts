import { find, some } from 'lodash'

import type { HostStatus } from '@/server/host'
import { thunks as hostThunks } from '@/server/host'
import type { Dispatch, State } from '@/server/types/redux'
import { actions } from './actions'
import { CONNECT_REASON_AUTORETRY, CONNECT_REASON_AUTOSTART } from './constants'
import { thunks } from './thunks'

const getStatus = (state: State, id: string): HostStatus | null => {
  const host = find(state.hosts, { id })
  return !host ? null : host.state.status
}

const getConnectReason = (state: State, id: string): string | null => {
  const host = find(state.hosts, { id })
  return !host ? null : host.state.reason
}

const getAutostart = (state: State, id: string): boolean | null => {
  const autoconnect = find(state.autoconnects, { id })
  return !autoconnect ? null : autoconnect.config.start
}

const getAutoretry = (state: State, id: string): boolean | null => {
  const autoconnect = find(state.autoconnects, { id })
  return !autoconnect ? null : autoconnect.config.retry
}

const autoconnectExist = (state: State, id: string): boolean =>
  some(state.autoconnects, { id })

const hasActiveAutoretry = (state: State, id: string): boolean => {
  const autoconnect = find(state.autoconnects, { id })
  return !autoconnect ? false : autoconnect.state.autoretryId !== null
}

const includes = <T>(array: T[], x: T | null): boolean =>
  x === null ? false : array.includes(x)

const autoStartHosts = (prevState: State, state: State, dispatch: Dispatch) => {
  state.autoconnects
    .map((x) => x.id)
    .filter((id) => !autoconnectExist(prevState, id))
    .filter((id) => autoconnectExist(state, id))
    .filter((id) => getAutostart(state, id))
    .forEach((id) => {
      dispatch(hostThunks.hostConnect(id, CONNECT_REASON_AUTOSTART))
    })
}

const autoRetryHosts = (prevState: State, state: State, dispatch: Dispatch) => {
  state.autoconnects
    .map((x) => x.id)
    .filter((id) => getAutoretry(state, id))
    .filter((id) => !includes(['error'], getStatus(prevState, id)))
    .filter((id) => includes(['error'], getStatus(state, id)))
    .forEach((id) => {
      dispatch(thunks.autoretrySpawn(id))
    })
}

const cancelAutoconnects = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  state.autoconnects
    .map((x) => x.id)
    .filter((id) => getStatus(prevState, id) !== 'connected')
    .filter((id) => getStatus(state, id) === 'connected')
    .filter((id) => hasActiveAutoretry(state, id))
    .forEach((id) => {
      dispatch(actions.autoconnectCancel(id))
    })

  state.autoconnects
    .map((x) => x.id)
    .filter((id) => getStatus(prevState, id) !== 'connecting')
    .filter((id) => getStatus(state, id) === 'connecting')
    .filter(
      (id) =>
        getConnectReason(state, id) !== CONNECT_REASON_AUTOSTART &&
        getConnectReason(state, id) !== CONNECT_REASON_AUTORETRY
    )
    .filter((id) => hasActiveAutoretry(state, id))
    .forEach((id) => {
      dispatch(actions.autoconnectCancel(id))
    })

  state.autoconnects
    .map((x) => x.id)
    .filter((id) => getStatus(prevState, id) !== 'disconnecting')
    .filter((id) => getStatus(state, id) === 'disconnecting')
    .filter(
      (id) =>
        getConnectReason(state, id) !== CONNECT_REASON_AUTOSTART &&
        getConnectReason(state, id) !== CONNECT_REASON_AUTORETRY
    )
    .filter((id) => hasActiveAutoretry(state, id))
    .forEach((id) => {
      dispatch(actions.autoconnectCancel(id))
    })
}

export const onStateChange = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  autoStartHosts(prevState, state, dispatch)
  autoRetryHosts(prevState, state, dispatch)
  cancelAutoconnects(prevState, state, dispatch)
}
