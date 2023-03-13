import { io, Socket } from 'socket.io-client'

import { actions } from './actions'
import { APIEndpoint, apiKeys } from '../../../server/src/api/api'
import {
  SOCKET_PATH,
  socketTypes,
  SocketMessageError,
} from '../../../server/src/api/constants'
import { AutoconnectConfig } from '../../../server/src/autoconnect/types'
import { AutoforwardConfig } from '../../../server/src/autoforward/types'
import { HostConfig } from '../../../server/src/host/types'
import { ForwardingConfig } from '../../../server/src/forward/types'
import { State as APIState } from '../../../server/src/types/redux'
import { Store } from '../types/redux'

const setup = (socket: Socket, store: Store) => {
  socket.on('connect', () => {
    console.log('connected to socket server')
    store.dispatch(actions.apiStatusConnected())
    socket.emit(socketTypes.register)
  })

  socket.on('disconnect', () => {
    console.log('disconnected from socket server')
    store.dispatch(actions.apiStatusDisconnected())
  })

  socket.on(socketTypes.state, (state: APIState) => {
    store.dispatch(actions.apiStateChange(state))

    // FIXME hpello
    if (state.system.info) {
      document.title = `${state.system.info.hostName} | SSHMon`
    }
  })
}

export class APIClient {
  store: Store
  socket: Socket

  constructor(store: Store) {
    this.store = store
    this.socket = io({
      path: `${window.location.pathname}${SOCKET_PATH}`.replace(/\/{2,}/g, '/'),
    })
    setup(this.socket, store)
  }

  makeAPICall(e: APIEndpoint) {
    this.socket.emit(
      socketTypes.apiCall,
      e,
      (err: SocketMessageError | null, result: any) => {
        if (err) {
          console.error(`API call failure: ${err.message}`, e)
          return
        }
        console.log('API call success:', e, { result })
      }
    )
  }

  hostCreate(args: {
    id: string
    config: HostConfig
    autoConfig: AutoconnectConfig
  }) {
    this.makeAPICall({ key: apiKeys.hostCreate, args })
  }
  hostEdit(args: {
    id: string
    config: HostConfig
    autoConfig: AutoconnectConfig
  }) {
    this.makeAPICall({ key: apiKeys.hostEdit, args })
  }
  hostDelete(args: { id: string }) {
    this.makeAPICall({ key: apiKeys.hostDelete, args })
  }
  hostConnect(args: { id: string }) {
    this.makeAPICall({ key: apiKeys.hostConnect, args })
  }
  hostDisconnect(args: { id: string }) {
    this.makeAPICall({ key: apiKeys.hostDisconnect, args })
  }

  forwardingCreate(args: {
    id: string
    fwdId: string
    config: ForwardingConfig
    autoConfig: AutoforwardConfig
  }) {
    this.makeAPICall({ key: apiKeys.forwardingCreate, args })
  }
  forwardingEdit(args: {
    id: string
    fwdId: string
    config: ForwardingConfig
    autoConfig: AutoforwardConfig
  }) {
    this.makeAPICall({ key: apiKeys.forwardingEdit, args })
  }
  forwardingDelete(args: { id: string; fwdId: string }) {
    this.makeAPICall({ key: apiKeys.forwardingDelete, args })
  }
  forwardingConnect(args: { id: string; fwdId: string }) {
    this.makeAPICall({ key: apiKeys.forwardingConnect, args })
  }
  forwardingDisconnect(args: { id: string; fwdId: string }) {
    this.makeAPICall({ key: apiKeys.forwardingDisconnect, args })
  }
}
