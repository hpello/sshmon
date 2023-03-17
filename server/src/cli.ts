import * as yargs from 'yargs'

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

import { EngineOptions, start } from './engine'

const argv = yargs
  .usage('Usage: $0 [options]')
  .options({
    c: {
      alias: 'config-file',
      describe: 'Path to SSHMon config file',
      type: 'string',
    },
  })
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .parse(process.argv)

start((<any>argv) as EngineOptions)
