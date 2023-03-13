import {
  createServer as createHTTPServer,
  IncomingMessage,
  Server,
  ServerResponse,
} from 'http'
import * as HTTPProxy from 'http-proxy'
import { Socket } from 'net'

export type ProxyTarget =
  | { host: string; port: number }
  | { socketPath: string }

type ProxyConfig = {
  pathPrefix: string
  proxyServer: HTTPProxy
}

const handleRequest =
  (server: SimpleProxyServer) =>
  (req: IncomingMessage, res: ServerResponse) => {
    const { proxies } = server
    const url = req.url as string // see IncomingMessage

    const proxy = proxies.find((p) => url.startsWith(p.pathPrefix))
    if (!proxy) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ code: 'NotFoundError', message: 'Not found' }))
      return
    }

    const { pathPrefix } = proxy
    if (pathPrefix !== '/') {
      if (!url.startsWith(`${pathPrefix}/`)) {
        res.writeHead(302, {
          Location: `${pathPrefix.slice(pathPrefix.lastIndexOf('/') + 1)}/`,
        })
        res.end()
        return
      }

      req.url = url.slice(pathPrefix.length)
    }

    proxy.proxyServer.web(req, res, {}, (err) => {
      if ('code' in err && err.code === 'ECONNRESET') {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            code: 'BadGatewayError',
            message: 'Target could not be read',
            error: err,
          })
        )
        return
      }

      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          code: 'InternalServerError',
          message: 'Internal server error',
          error: err,
        })
      )
    })
  }

const handleUpgrade =
  (server: SimpleProxyServer) =>
  (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const { proxies } = server
    const url = req.url as string // see IncomingMessage

    const proxy = proxies.find((p) => url.startsWith(p.pathPrefix))
    if (!proxy) {
      // TODO hpello notify socket?
      socket.destroy()
      return
    }

    const { pathPrefix } = proxy
    if (pathPrefix !== '/') {
      req.url = url.slice(pathPrefix.length)
    }

    proxy.proxyServer.ws(req, socket, head)
  }

export class SimpleProxyServer {
  server: Server
  proxies: ProxyConfig[]

  constructor() {
    this.proxies = []
    this.server = createHTTPServer(handleRequest(this))
    this.server.on('upgrade', handleUpgrade(this))
  }

  addTarget(pathPrefix: string, target: ProxyTarget) {
    const proxyServer = HTTPProxy.createProxyServer({
      // @ts-expect-error: we use the undocumented 'socketPath' parameter
      target,
      xfwd: true,
    })

    this.proxies = this.proxies
      .filter((p) => p.pathPrefix !== pathPrefix)
      .concat([{ pathPrefix, proxyServer }])
      .sort((a, b) => {
        // sort path prefix descending to ensure path processing order later
        if (a.pathPrefix.length < b.pathPrefix.length) {
          return 1
        }
        if (a.pathPrefix.length > b.pathPrefix.length) {
          return -1
        }
        return 0
      })
  }

  removeTarget(pathPrefix: string) {
    this.proxies = this.proxies.filter((p) => p.pathPrefix !== pathPrefix)
  }
}
