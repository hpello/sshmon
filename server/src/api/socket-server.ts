import { Server } from 'socket.io'

import { SOCKET_PATH, socketTypes } from './constants'
import { setupSocket } from './socket-setup'
import { SocketNotify } from './socket-notify'
import { Store } from '../types/redux'
import { createLogger } from '../log'

const log = createLogger(__filename)

export const createIO = (store: Store, socketNotify: SocketNotify) => {
  const io = new Server({
    path: SOCKET_PATH,
    serveClient: false,
  })

  io.on('connection', (socket) => {
    const xfwdfor = socket.handshake.headers['x-forwarded-for'] as string
    const address = xfwdfor ? xfwdfor.split(',')[0] : socket.handshake.address
    log.info('client connected: %s at %s', socket.id, address)

    socket.on(socketTypes.register, () => socketNotify.register(socket))
    socket.on(socketTypes.unregister, () => socketNotify.unregister(socket))

    socket.on('disconnect', () => {
      socketNotify.unregister(socket)
      log.info('client disconnected: %s at %s', socket.id, address)
    })

    setupSocket(socket, store)
  })

  return io
}
