import { API } from './api'
import { Config } from './config'
import { Forwarder } from './forward'
import { Autoconnector } from './autoconnect'
import { Autoforwarder } from './autoforward'
import { store } from './store'
import { System } from './system'
import { disconnectAllHosts } from './utils/disconnect-all-hosts'
import { setupGracefulShutdown } from './utils/graceful-shutdown'
import { createLogger } from './log'

const log = createLogger(__filename)

export interface EngineOptions {
  configFile?: string
}

export class Engine {
  system: System
  forwarder: Forwarder
  autoconnector: Autoconnector
  autoforwarder: Autoforwarder
  config: Config
  api: API

  constructor(options: EngineOptions) {
    this.system = new System({ store })
    this.forwarder = new Forwarder({ store })
    this.autoconnector = new Autoconnector({ store })
    this.autoforwarder = new Autoforwarder({ store })
    this.config = new Config({ store, configPath: options.configFile || null })
    this.api = new API({ store })
  }

  async start() {
    this.system.setup()
    this.forwarder.setup()
    this.autoconnector.setup()
    this.autoforwarder.setup()
    await this.config.setup()

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
  const engine = new Engine(options)
  engine.start()
  setupGracefulShutdown(() => engine.stop())
}
