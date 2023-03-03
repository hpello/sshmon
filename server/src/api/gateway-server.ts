import { Server } from 'http'
import { Socket } from 'net'

import { PROXY_PATH_PREFIX } from './constants'
import { ProxyTarget, SimpleProxyServer } from './simple-proxy-server'

const makeProxyPathPrefix = (pathPrefix: string, id: string, fwdId: string) => [pathPrefix, id, fwdId].join('/')

export class GatewayServer {
  server: SimpleProxyServer
  pathPrefix: string
  sockets: Set<Socket> = new Set()

  constructor(pathPrefix: string) {
    this.pathPrefix = pathPrefix
    this.server = new SimpleProxyServer()
  }

  setDefaultTarget(target: ProxyTarget) {
    this.server.addTarget('/', target)
  }

  addForwardingProxy(id: string, fwdId: string, target: ProxyTarget) {
    const fullPrefix = makeProxyPathPrefix(this.pathPrefix, id, fwdId)
    this.server.addTarget(fullPrefix, target)
  }

  removeForwardingProxy(id: string, fwdId: string) {
    const fullPrefix = makeProxyPathPrefix(this.pathPrefix, id, fwdId)
    this.server.removeTarget(fullPrefix)
  }

  listen(...args: Parameters<Server['listen']>) {
    this.server.server.listen(...args)

    // keep track of connected sockets for shutdown
    this.server.server.on('connection', (socket) => {
      this.sockets.add(socket)
      socket.on('close', () => this.sockets.delete(socket))
    })
  }

  shutdown() {
    return new Promise((resolve) => {
      this.server.server.close(resolve)
      this.sockets.forEach(socket => socket.destroy())
    })
  }
}

export const createServer = () => new GatewayServer(PROXY_PATH_PREFIX)
