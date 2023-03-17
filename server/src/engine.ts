import { API } from './api'
import { Autoconnector } from './autoconnect'
import { Autoforwarder } from './autoforward'
import { Config } from './config'
import { Forwarder } from './forward'
import { createLogger } from './log'
import { store } from './store'
import { System } from './system'
import { disconnectAllHosts } from './utils/disconnect-all-hosts'
import { setupGracefulShutdown } from './utils/graceful-shutdown'

const log = createLogger(__filename)

export interface EngineOptions {
  configFile?: string
}

export class Engine {
  system = new System({ store })
  forwarder = new Forwarder({ store })
  autoconnector = new Autoconnector({ store })
  autoforwarder = new Autoforwarder({ store })
  config = new Config({ store })
  api = new API({ store })

  async start(options: EngineOptions) {
    this.system.setup()
    this.forwarder.setup()
    this.autoconnector.setup()
    this.autoforwarder.setup()
    await this.config.setup({ configPath: options.configFile || null })

    this.api.setup()
    this.api.listen(8377, 'localhost')
  }

  async stop() {
    log.info('shutting down api...')
    await this.api.shutdown()
    log.info('disconnecting all hosts...')
    await disconnectAllHosts(store)
    log.info('engine stopped')
  }
}

export const start = (options: EngineOptions) => {
  const engine = new Engine()
  engine.start(options)
  setupGracefulShutdown(() => engine.stop())
}
