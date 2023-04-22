import { Server } from 'socket.io'

import { createLogger } from '@/server/log'
import type { Store } from '@/server/types/redux'

import { SOCKET_PATH, socketTypes } from './constants'
import type { SocketNotify } from './socket-notify'
import { setupSocket } from './socket-setup'

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
