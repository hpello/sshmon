import { createLogger } from '../log'

const log = createLogger(__filename)

export const setupGracefulShutdown = (cleanup: () => Promise<any>) => {
  let exiting = false
  const gracefulExit = async (code: number) => {
    try {
      if (exiting) { log.error('shutdown already requested'); return }
      exiting = true
      await cleanup()
    } catch (err) {
      log.error({ err }, 'error during shutdown')
    }

    process.exit(code)
  }

  process.on('unhandledRejection', (reason) => {
    log.error('unhandled rejection:', reason)
    gracefulExit(1)
  })

  process.on('uncaughtException', (err) => {
    log.error({ err }, 'uncaught exception')
    gracefulExit(1)
  })

  process.on('SIGTERM', () => { log.info('received SIGTERM'); gracefulExit(128 + 15) })
  process.on('SIGINT', () => { log.info('received SIGINT'); gracefulExit(128 + 2) })
}
