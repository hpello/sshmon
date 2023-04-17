import type { Server } from 'http'
import { promisify } from 'util'

import { createLogger } from '@/server/log'
import type { State, Store } from '@/server/types/redux'
import { formatURL } from '@/server/utils/server-url'
import { makeTmpPath } from '@/server/utils/tmp'
import { createServer as createAPIServer } from './api-server'
import type { GatewayServer } from './gateway-server'
import { createServer as createGatewayServer } from './gateway-server'
import type { ProxyTarget } from './simple-proxy-server'
import { SocketNotify } from './socket-notify'
import { onStateChange } from './utils'

const log = createLogger(__filename)

export class API {
  store: Store
  prevState: State
  apiServer: Server
  gatewayServer: GatewayServer
  socketNotify: SocketNotify

  constructor(params: { store: Store }) {
    this.store = params.store
    const state = params.store.getState()

    this.prevState = state
    this.socketNotify = new SocketNotify(state)
    this.apiServer = createAPIServer(params.store, this.socketNotify)
    this.gatewayServer = createGatewayServer()
  }

  setup() {
    this.store.subscribe(() => {
      const state = this.store.getState()

      process.nextTick(() => {
        // prevent recursion
        onStateChange(
          this.prevState,
          state,
          (id: string, fwdId: string, target: ProxyTarget) =>
            this.gatewayServer.addForwardingProxy(id, fwdId, target),
          (id: string, fwdId: string) =>
            this.gatewayServer.removeForwardingProxy(id, fwdId)
        )

        this.socketNotify.onStateChange(state)

        this.prevState = state
      })
    })
  }

  async shutdown() {
    await this.gatewayServer.shutdown()
  }

  async listen(...args: any[]) {
    const apiSocketPath = await makeTmpPath(__filename)('api-server')
    const apiListen = promisify(
      this.apiServer.listen.bind(this.apiServer, apiSocketPath)
    )
    await apiListen()
    log.debug('api socket listening at %s', formatURL(this.apiServer))

    this.gatewayServer.setDefaultTarget({ socketPath: apiSocketPath })
    const gatewayListen = promisify(
      this.gatewayServer.listen.bind(this.gatewayServer, ...args)
    )
    await gatewayListen()
    log.info('api listening at %s', formatURL(this.gatewayServer.server.server))
  }
}
