import { createLogger as bunyanCreateLogger, stdSerializers } from 'bunyan'
import { dirname, format, isAbsolute, relative, parse } from 'path'

const log = bunyanCreateLogger({
  name: 'sshmon',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  serializers: { err: stdSerializers.err }
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
