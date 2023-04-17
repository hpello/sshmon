import type { Socket } from 'socket.io'

import { createLogger } from '@/server/log'
import type { State } from '@/server/types/redux'
import { socketTypes } from './constants'

const log = createLogger(__filename)

export class SocketNotify {
  state: State | null
  sockets: Set<Socket> = new Set()

  constructor(state: State) {
    this.state = state
  }

  register(socket: Socket) {
    if (!this.sockets.has(socket)) {
      log.debug('register socket %s', socket.id)
    }
    this.sockets.add(socket)
    if (this.state !== null) {
      socket.emit(socketTypes.state, this.state)
    }
  }

  unregister(socket: Socket) {
    if (this.sockets.has(socket)) {
      log.debug('unregister socket %s', socket.id)
    }
    this.sockets.delete(socket)
  }

  onStateChange(state: State) {
    this.state = state
    this.sockets.forEach((socket) => {
      socket.emit(socketTypes.state, this.state)
    })
  }
}
