import { join } from 'path'
import { createServer as restifyCreateServer, plugins } from 'restify'

export const createServer = () => {
  const server = restifyCreateServer()

  server.use(plugins.gzipResponse())

  server.get(
    '/assets/*',
    plugins.serveStatic({
      directory: join(__dirname, '../../../gui/dist'),
    })
  )

  server.get(
    '/',
    plugins.serveStatic({
      directory: join(__dirname, '../../../gui/dist'),
      default: 'index.html',
    })
  )

  return server
}
