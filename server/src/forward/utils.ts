import { find, flatten, some } from 'lodash'

import type { HostStatus } from '@/server/host'
import type { Dispatch, State } from '@/server/types/redux'

import { actions } from './actions'
import type { ForwardingState } from './reducer'

const getStatus = (state: State, id: string): HostStatus | null => {
  const host = find(state.hosts, { id })
  return !host ? null : host.state.status
}

const getForwardings = (state: State, id: string): ForwardingState[] => {
  return state.forwardings.filter((x) => x.id === id)
}

const hostExist = (state: State, id: string): boolean =>
  some(state.hosts, { id })

const cancelForwardings = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  flatten(
    state.hosts
      .map((x) => x.id)
      .filter((id) => getStatus(prevState, id) !== 'disconnected')
      .filter((id) => getStatus(state, id) === 'disconnected')
      .map((id) => getForwardings(state, id))
  ).forEach(({ id, fwdId }) => {
    dispatch(actions.forwardingDisconnected(id, fwdId))
  })

  flatten(
    state.hosts
      .map((x) => x.id)
      .filter((id) => getStatus(prevState, id) !== 'error')
      .filter((id) => getStatus(state, id) === 'error')
      .map((id) => getForwardings(state, id))
  ).forEach(({ id, fwdId }) => {
    dispatch(actions.forwardingDisconnected(id, fwdId))
  })
}

const cleanupForwardings = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  flatten(
    state.hosts
      .map((x) => x.id)
      .filter((id) => hostExist(prevState, id))
      .filter((id) => !hostExist(state, id))
      .map((id) => getForwardings(state, id))
  ).forEach(({ id, fwdId }) => {
    dispatch(actions.forwardingDelete(id, fwdId))
  })
}

export const onStateChange = (
  prevState: State,
  state: State,
  dispatch: Dispatch
) => {
  cancelForwardings(prevState, state, dispatch)
  cleanupForwardings(prevState, state, dispatch)
}
