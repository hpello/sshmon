import { Store } from '../types/redux'
import { SocketNotify } from './socket-notify'
import { createIO } from './socket-server'
import { createServer as createStaticServer } from './static-server'

export const createServer = (store: Store, socketNotify: SocketNotify) => {
  const server = createStaticServer()
  const io = createIO(store, socketNotify)
  io.attach(server.server)

  return server
}
