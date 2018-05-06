import * as yargs from 'yargs'
import { start, EngineOptions } from './engine'

const argv = yargs
  .usage('Usage: $0 [options]')
  .options({
    c: {
      alias: 'config-file',
      describe: 'Path to sshmon config file',
      type: 'string'
    }
  })
  .help().alias('h', 'help')
  .version().alias('v', 'version')
  .parse(process.argv)

start(<any>argv as EngineOptions)
