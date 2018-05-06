import { join } from 'path'
import { createServer as restifyCreateServer, plugins } from 'restify'

export const createServer = () => {
  const server = restifyCreateServer()

  server.use(plugins.gzipResponse())

  server.get(/\/fonts\/.*/, plugins.serveStatic({
    directory: join(__dirname, '../../../gui/node_modules/font-awesome/fonts'),
    appendRequestPath: false
  }))

  server.get(/\/.*/, plugins.serveStatic({
    directory: join(__dirname, '../../../gui/public'),
    default: 'index.html'
  }))

  return server
}
