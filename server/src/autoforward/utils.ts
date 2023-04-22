import { find } from 'lodash'

import type { ForwardingStatus } from '@/server/forward'
import { thunks as forwardThunks } from '@/server/forward'
import type { HostStatus } from '@/server/host'
import type { Dispatch, State } from '@/server/types/redux'

import { actions } from './actions'
import { FORWARD_REASON_AUTORETRY, FORWARD_REASON_AUTOSTART } from './constants'
import { thunks } from './thunks'

const getHostStatus = (state: State, id: string): HostStatus | null => {
  const host = find(state.hosts, { id })
  return !host ? null : host.state.status
}

const getForwardingStatus = (
  state: State,
  id: string,
  fwdId: string
): ForwardingStatus | null => {
  const forwarding = find(state.forwardings, { id, fwdId })
  return !forwarding ? null : forwarding.state.status
}

const getForwardReason = (
  state: State,
  id: string,
  fwdId: string
): string | null => {
  const forwarding = find(state.forwardings, { id, fwdId })
  return !forwarding ? null : forwarding.state.reason
}

const getAutostart = (
  state: State,
  id: string,
  fwdId: string
): boolean | null => {
  const autoforward = find(state.autoforwards, { id, fwdId })
  return !autoforward ? null : autoforward.config.start
}

const getAutoretry = (
  state: State,
  id: string,
  fwdId: string
): boolean | null => {
  const autoforward = find(state.autoforwards, { id, fwdId })
  return !autoforward ? null : autoforward.config.retry
}

const hasActiveAutoretry = (
  state: State,
  id: string,
  fwdId: string
): boolean => {
  const autoforward = find(state.autoforwards, { id, fwdId })
  return !autoforward ? false : autoforward.state.autoretryId !== null
}

const includes = <T>(array: T[], x: T | null): boolean =>
  x === null ? false : array.includes(x)

const autoStartForwardings = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  state.autoforwards
    .map((x) => ({ id: x.id, fwdId: x.fwdId }))
    .filter(({ id }) => getHostStatus(prevState, id) !== 'connected')
    .filter(({ id }) => getHostStatus(state, id) === 'connected')
    .filter(({ id, fwdId }) => getAutostart(state, id, fwdId))
    .forEach(({ id, fwdId }) => {
      dispatch(
        forwardThunks.forwardingConnect(id, fwdId, FORWARD_REASON_AUTOSTART)
      )
    })
}

const autoRetryForwardings = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  state.autoforwards
    .map((x) => ({ id: x.id, fwdId: x.fwdId }))
    .filter(({ id, fwdId }) => getAutoretry(state, id, fwdId))
    .filter(
      ({ id, fwdId }) =>
        !includes(['error'], getForwardingStatus(prevState, id, fwdId))
    )
    .filter(({ id, fwdId }) =>
      includes(['error'], getForwardingStatus(state, id, fwdId))
    )
    .forEach(({ id, fwdId }) => {
      dispatch(thunks.autoretrySpawn(id, fwdId))
    })
}

const cancelAutoforwards = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  state.autoforwards
    .map((x) => ({ id: x.id, fwdId: x.fwdId }))
    .filter(
      ({ id, fwdId }) =>
        getForwardingStatus(prevState, id, fwdId) !== 'connected'
    )
    .filter(
      ({ id, fwdId }) => getForwardingStatus(state, id, fwdId) === 'connected'
    )
    .filter(({ id, fwdId }) => hasActiveAutoretry(state, id, fwdId))
    .forEach(({ id, fwdId }) => {
      dispatch(actions.autoforwardCancel(id, fwdId))
    })

  state.autoforwards
    .map((x) => ({ id: x.id, fwdId: x.fwdId }))
    .filter(
      ({ id, fwdId }) =>
        getForwardingStatus(prevState, id, fwdId) !== 'connecting'
    )
    .filter(
      ({ id, fwdId }) => getForwardingStatus(state, id, fwdId) === 'connecting'
    )
    .filter(
      ({ id, fwdId }) =>
        getForwardReason(state, id, fwdId) !== FORWARD_REASON_AUTOSTART &&
        getForwardReason(state, id, fwdId) !== FORWARD_REASON_AUTORETRY
    )
    .filter(({ id, fwdId }) => hasActiveAutoretry(state, id, fwdId))
    .forEach(({ id, fwdId }) => {
      dispatch(actions.autoforwardCancel(id, fwdId))
    })

  state.autoforwards
    .map((x) => ({ id: x.id, fwdId: x.fwdId }))
    .filter(
      ({ id, fwdId }) =>
        getForwardingStatus(prevState, id, fwdId) !== 'disconnecting'
    )
    .filter(
      ({ id, fwdId }) =>
        getForwardingStatus(state, id, fwdId) === 'disconnecting'
    )
    .filter(
      ({ id, fwdId }) =>
        getForwardReason(state, id, fwdId) !== FORWARD_REASON_AUTOSTART &&
        getForwardReason(state, id, fwdId) !== FORWARD_REASON_AUTORETRY
    )
    .filter(({ id, fwdId }) => hasActiveAutoretry(state, id, fwdId))
    .forEach(({ id, fwdId }) => {
      dispatch(actions.autoforwardCancel(id, fwdId))
    })
}

export const onStateChange = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  autoStartForwardings(prevState, state, dispatch)
  autoRetryForwardings(prevState, state, dispatch)
  cancelAutoforwards(prevState, state, dispatch)
}
