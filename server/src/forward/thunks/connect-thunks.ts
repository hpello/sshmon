import { find } from 'lodash'

import { actions } from '../actions'
import { executeSshControlCommand } from '../ssh'
import { ForwardingSpec, ForwardingParams, fwdTypes } from '../types'
import { AsyncThunkAction, Dispatch, GetState } from '../../types/redux'
import { ErrorWithCode } from '../../utils/error-with-code'
import { createLogger } from '../../utils/log'
import { makeTmpPath } from '../../utils/tmp'

const log = createLogger(__filename)

// FIXME hpello put this outside and add some tests
const defaultLocalHost = 'localhost'
const defaultRemoteHost = 'localhost'

const makeAddress = (address: string, defaultHost: string) => {
  // unix socket
  if (address.includes('/')) { return address }

  // host:port
  if (address.includes(':')) { return address }

  const port = parseInt(address, 10)
  if (!isNaN(port)) { return `${defaultHost}:${port}` }

  return null
}

const makeForwardingParams = async (id: string, fwdId: string, spec: ForwardingSpec): Promise<ForwardingParams> => {
  switch (spec.type) {
  case fwdTypes.dynamic: return spec
  case fwdTypes.local: {
    const target = makeAddress(spec.target, defaultRemoteHost)
    if (target === null) { throw new ErrorWithCode(400, `invalid forwarding spec: ${JSON.stringify(spec)}`) }
    return { ...spec, target }
  }
  case fwdTypes.remote: {
    const target = makeAddress(spec.target, defaultLocalHost)
    if (target === null) { throw new ErrorWithCode(400, `invalid forwarding spec: ${JSON.stringify(spec)}`) }
    return { ...spec, target }
  }
  case fwdTypes.http: {
    const bind = await makeTmpPath(__filename)(JSON.stringify({ id, fwdId }))
    const target = makeAddress(spec.target, defaultRemoteHost)
    if (target === null) { throw new ErrorWithCode(400, `invalid forwarding spec: ${JSON.stringify(spec)}`) }
    return { type: fwdTypes.local, bind, target }
  }
  }
}

export const forwardingConnect = (id: string, fwdId: string, reason: string): AsyncThunkAction => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const forwarding = find(state.forwardings, { id, fwdId })
  if (!forwarding) { throw new ErrorWithCode(404, `forwarding not found: ${id}/${fwdId}`) }

  const h = find(state.hosts, { id })
  if (!h) { throw new ErrorWithCode(404, `host not found: ${id}`) }

  if (h.state.status !== 'connected') { throw new ErrorWithCode(400, `host is not connected: ${id}`) }
  if (h.state.controlPath === null) { throw new ErrorWithCode(500, `bad state: ${id} (${JSON.stringify(h.state)})`) }

  const params = await makeForwardingParams(id, fwdId, forwarding.config.spec)

  const process = executeSshControlCommand({ sshCommand: 'ssh', controlPath: h.state.controlPath, controlCommand: 'forward', forwardingParams: params })
  dispatch(actions.forwardingConnecting(id, fwdId, params, reason))

  process.on('exit', (code) => {
    dispatch((code === 0) ? actions.forwardingConnected(id, fwdId) : actions.forwardingError(id, fwdId))
  })
}

export const forwardingDisconnect = (id: string, fwdId: string, reason: string): AsyncThunkAction => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const forwarding = find(state.forwardings, { id, fwdId })
  if (!forwarding) { throw new ErrorWithCode(404, `forwarding not found: ${id}/${fwdId}`) }

  const h = find(state.hosts, { id })
  if (!h) { throw new ErrorWithCode(404, `host not found: ${id}`) }

  if (h.state.status !== 'connected') { throw new ErrorWithCode(400, `host is not connected: ${id}`) }
  if (h.state.controlPath === null) { throw new ErrorWithCode(500, `bad state: ${id} (${JSON.stringify(h.state)})`) }

  if (!['connecting', 'connected'].includes(forwarding.state.status)) { log.info(`forwarding is not connected: ${id}/${fwdId}`); return Promise.resolve() }
  if (forwarding.state.params === null) { throw new ErrorWithCode(500, `bad state: ${id}/${fwdId} (${JSON.stringify(forwarding.state)})`) }

  const process = executeSshControlCommand({ sshCommand: 'ssh', controlPath: h.state.controlPath, controlCommand: 'cancel', forwardingParams: forwarding.state.params })
  dispatch(actions.forwardingDisconnecting(id, fwdId, reason))

  process.on('exit', (code) => {
    dispatch((code === 0) ? actions.forwardingDisconnected(id, fwdId) : actions.forwardingError(id, fwdId))
  })

  return Promise.resolve()
}
