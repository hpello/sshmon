import { spawn } from 'child_process'

import { createLogger } from '../log'

const log = createLogger(__filename)

interface SSHParams {
  host: string
  config: { [key: string]: string }
}

const defaultMasterOptions = [
  '-N',
  '-T',
  '-M',
  '-o',
  'ControlPersist=no',
  '-o',
  'BatchMode=yes',
  '-o',
  'StreamLocalBindUnlink=yes',
  '-o',
  'ServerAliveInterval=5',
  '-o',
  'ServerAliveCountMax=3',
]

function appendMulti<T>(array1: T[], array2: T[]) {
  Array.prototype.push.apply(array1, array2)
}

// FIXME hpello duplicated code
function spawnAndLog(sshCommand: string, args: string[]) {
  const process = spawn(sshCommand, args, { detached: true })

  const processLog = log.child({ childPid: process.pid })
  processLog.debug([sshCommand].concat(args).join(' '))
  process.stdout.on('data', (data) =>
    processLog.debug({ stream: 'stdout' }, data.toString().trim())
  )
  process.stderr.on('data', (data) =>
    processLog.error({ stream: 'stderr' }, data.toString().trim())
  )
  process.on('error', (err) => processLog.error({ err, event: 'error' }))
  process.on('exit', (code, signal) =>
    processLog.debug({ event: 'exit', code, signal }, 'process exited')
  )

  return process
}

export function spawnSshMaster(params: {
  sshCommand: string
  controlPath: string
  sshParams: SSHParams
}) {
  const { sshCommand, controlPath, sshParams } = params

  const args = defaultMasterOptions.concat()
  appendMulti(args, ['-S', controlPath])

  const { host, config } = sshParams
  Object.keys(config)
    .filter((k) => k.toLowerCase() !== 'controlpath')
    .forEach((key) => {
      appendMulti(args, ['-o', `${key}=${config[key]}`])
    })
  args.push(host)

  return spawnAndLog(sshCommand, args)
}
