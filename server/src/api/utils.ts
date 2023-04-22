import { find } from 'lodash'

import type { ForwardingStatus } from '@/server/forward'
import { fwdTypes } from '@/server/forward'
import type { State } from '@/server/types/redux'

import type { ProxyTarget } from './simple-proxy-server'

const getForwardingStatus = (
  state: State,
  id: string,
  fwdId: string
): ForwardingStatus | null => {
  const forwarding = find(state.forwardings, { id, fwdId })
  return !forwarding ? null : forwarding.state.status
}

const getForwardingBind = (
  state: State,
  id: string,
  fwdId: string
): string | null => {
  const forwarding = find(state.forwardings, { id, fwdId })
  if (!forwarding) {
    return null
  }
  if (!forwarding.state.params) {
    return null
  }
  return forwarding.state.params.bind
}

type AddForwardingProxy = (
  id: string,
  fwdId: string,
  target: ProxyTarget
) => void
type RemoveForwardingProxy = (id: string, fwdId: string) => void

const makeProxyTarget = (address: string): ProxyTarget | null => {
  if (address.includes('/')) {
    return { socketPath: address }
  }
  if ((address.match(/:/g) || []).length !== 1) {
    return null
  }
  const [host, portStr] = address.split(':')
  const port = parseInt(portStr, 10)
  return { host, port }
}

const addForwardingProxies = (
  prevState: State,
  state: State,
  addForwardingProxy: AddForwardingProxy
) => {
  state.forwardings
    .filter(({ config }) => config.spec.type === fwdTypes.http)
    .filter(
      ({ id, fwdId }) =>
        getForwardingStatus(prevState, id, fwdId) !== 'connected'
    )
    .filter(
      ({ id, fwdId }) => getForwardingStatus(state, id, fwdId) === 'connected'
    )
    .forEach(({ id, fwdId }) => {
      const bind = getForwardingBind(state, id, fwdId)
      if (bind === null) {
        return
      }
      const target = makeProxyTarget(bind)
      if (target === null) {
        return
      }
      addForwardingProxy(id, fwdId, target)
    })
}

const removeForwardingProxies = (
  prevState: State,
  state: State,
  removeForwardingProxy: RemoveForwardingProxy
) => {
  state.forwardings
    .filter(({ config }) => config.spec.type === fwdTypes.http)
    .filter(
      ({ id, fwdId }) =>
        getForwardingStatus(prevState, id, fwdId) === 'connected'
    )
    .filter(
      ({ id, fwdId }) => getForwardingStatus(state, id, fwdId) !== 'connected'
    )
    .forEach(({ id, fwdId }) => {
      removeForwardingProxy(id, fwdId)
    })
}

export const onStateChange = (
  prevState: State,
  state: State,
  addForwardingProxy: AddForwardingProxy,
  removeForwardingProxy: RemoveForwardingProxy
) => {
  addForwardingProxies(prevState, state, addForwardingProxy)
  removeForwardingProxies(prevState, state, removeForwardingProxy)
}
