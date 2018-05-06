import { thunks as autoconnectThunks } from '../autoconnect'
import { thunks as autoforwardThunks } from '../autoforward'
import { thunks as hostThunks } from '../host'
import { thunks as forwardThunks } from '../forward'
import { APIEndpoint, apiKeys } from './api'
import { socketTypes, SocketMessageError } from './constants'
import { AsyncThunkAction, Store } from '../types/redux'
import { createLogger } from '../utils/log'

const log = createLogger(__filename)

const CONNECT_REASON = 'api'
const FORWARD_REASON = 'api'

const makeActions = (e: APIEndpoint): AsyncThunkAction[] | null => {
  switch (e.key) {
  case apiKeys.hostCreate: return [
    hostThunks.hostCreate(e.args.id, e.args.config),
    autoconnectThunks.autoconnectCreate(e.args.id, e.args.autoConfig)
  ]
  case apiKeys.hostEdit: return [
    hostThunks.hostEdit(e.args.id, e.args.config),
    autoconnectThunks.autoconnectEdit(e.args.id, e.args.autoConfig)
  ]
  case apiKeys.hostDelete: return [
    hostThunks.hostDelete(e.args.id),
    autoconnectThunks.autoconnectDelete(e.args.id)
  ]
  case apiKeys.hostConnect: return [hostThunks.hostConnect(e.args.id, CONNECT_REASON)]
  case apiKeys.hostDisconnect: return [hostThunks.hostDisconnect(e.args.id, CONNECT_REASON)]

  case apiKeys.forwardingCreate: return [
    forwardThunks.forwardingCreate(e.args.id, e.args.fwdId, e.args.config),
    autoforwardThunks.autoforwardCreate(e.args.id, e.args.fwdId, e.args.autoConfig)
  ]
  case apiKeys.forwardingEdit: return [
    forwardThunks.forwardingEdit(e.args.id, e.args.fwdId, e.args.config),
    autoforwardThunks.autoforwardEdit(e.args.id, e.args.fwdId, e.args.autoConfig)
  ]
  case apiKeys.forwardingDelete: return [
    forwardThunks.forwardingDelete(e.args.id, e.args.fwdId),
    autoforwardThunks.autoforwardDelete(e.args.id, e.args.fwdId)
  ]
  case apiKeys.forwardingConnect: return [forwardThunks.forwardingConnect(e.args.id, e.args.fwdId, FORWARD_REASON)]
  case apiKeys.forwardingDisconnect: return [forwardThunks.forwardingDisconnect(e.args.id, e.args.fwdId, FORWARD_REASON)]
  default: return null
  }
}

export const setupSocket = (socket: SocketIO.Socket, store: Store) => {
  socket.on(socketTypes.apiCall, (e: APIEndpoint, callback: (err: SocketMessageError | null, result: any) => any) => {
    const actions = makeActions(e)

    if (actions === null) {
      const message = `unhandled api call key: ${e.key}`
      log.error({ err: new Error(message) })
      callback({ message }, null)
      return
    }

    actions.reduce((acc, val) => acc.then(() => store.dispatch(val)), Promise.resolve())
    .then((result) => {
      log.info({ apiCall: e }, 'api call success')
      callback(null, result)
    })
    .catch((err: Error) => {
      log.error({ err, apiCall: e }, 'api call failure')
      callback({ message: err.message }, null)
    })
  })
}
