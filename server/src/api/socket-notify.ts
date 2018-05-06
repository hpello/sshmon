import { socketTypes } from './constants'
import { State } from '../types/redux'
import { createLogger } from '../utils/log'

const log = createLogger(__filename)

export class SocketNotify {
  state: State | null
  sockets: Set<SocketIO.Socket> = new Set()

  constructor(state: State) {
    this.state = state
  }

  register(socket: SocketIO.Socket) {
    if (!this.sockets.has(socket)) { log.debug('register socket %s', socket.id) }
    this.sockets.add(socket)
    if (this.state !== null) {
      socket.emit(socketTypes.state, this.state)
    }
  }

  unregister(socket: SocketIO.Socket) {
    if (this.sockets.has(socket)) { log.debug('unregister socket %s', socket.id) }
    this.sockets.delete(socket)
  }

  onStateChange(state: State) {
    this.state = state
    this.sockets.forEach((socket) => {
      socket.emit(socketTypes.state, this.state)
    })
  }
}
