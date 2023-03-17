import { spawn } from 'child_process'

import { createLogger } from '../log'
import type { ForwardingParams } from './types'
import { fwdTypes } from './types'

const log = createLogger(__filename)

const makeForwardingString = (params: ForwardingParams): string => {
  switch (params.type) {
    case fwdTypes.dynamic:
      return `-D${params.bind}`
    case fwdTypes.local:
      return `-L${params.bind}:${params.target}`
    case fwdTypes.remote:
      return `-R${params.bind}:${params.target}`
  }
}

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

type ControlCommand = 'check' | 'forward' | 'cancel' | 'exit' | 'stop'

export function executeSshControlCommand(params: {
  sshCommand: string
  controlPath: string
  controlCommand: ControlCommand
  forwardingParams: ForwardingParams | null
}) {
  const { sshCommand, controlPath, controlCommand, forwardingParams } = params

  const args = [] as string[]
  appendMulti(args, ['-S', controlPath])
  appendMulti(args, ['-O', controlCommand])
  if (forwardingParams !== null) {
    appendMulti(args, [makeForwardingString(forwardingParams)])
  }
  args.push('sshmon-host')

  return spawnAndLog(sshCommand, args)
}
