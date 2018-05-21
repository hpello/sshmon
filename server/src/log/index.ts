import { createLogger as bunyanCreateLogger, stdSerializers } from 'bunyan'
import { spawn } from 'child_process'
import { join, dirname, format, isAbsolute, relative, parse } from 'path'

// spawn a bunyan process
const bunyanBin = join(__dirname, '../../node_modules/bunyan/bin/bunyan')
const bunyanOpts = [
  '--level', 'info'
]
if (process.stderr.isTTY) {
  bunyanOpts.push('--color')
} else {
  bunyanOpts.push('-0')
}
// optionally override bunyan args
if (process.env.BUNYAN_OPTS !== undefined) {
  Array.prototype.push.apply(bunyanOpts, process.env.BUNYAN_OPTS.split(/\s/))
}

const bunyan = spawn(
  process.execPath,
  [bunyanBin].concat(bunyanOpts),
  { detached: true, stdio: ['pipe', process.stderr, process.stderr] }
)
bunyan.on('error', err => console.error('bunyan process error:', err)) // tslint:disable-line no-console

const log = bunyanCreateLogger({
  name: 'sshmon',
  level: 'trace',
  serializers: { err: stdSerializers.err },
  stream: bunyan.stdin
})

// find basename of a file relative to root dir
const makeScope = (scopeOrFilename: string): string => {
  if (!isAbsolute(scopeOrFilename)) {
    return scopeOrFilename
  }

  const rootDir = dirname(__dirname)
  const relativeFilename = relative(rootDir, scopeOrFilename)

  const { dir, name } = parse(relativeFilename)
  return format({ dir, name })
}

export const createLogger = (scopeOrFilename: string) => {
  const scope = makeScope(scopeOrFilename)
  return log.child({ scope })
}
