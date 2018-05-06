import { find } from 'lodash'
import { join } from 'path'
import { dir } from 'tmp'

import { createLogger } from '../utils/log'

const log = createLogger(__filename)

const dirAsync = (options: any): Promise<string> => new Promise((resolve, reject) => {
  dir(options, (err, path) => {
    if (err) { reject(err); return }
    resolve(path)
  })
})
const tmpDir = dirAsync({ prefix: 'sshmon-' })
tmpDir.then(path => log.debug('temporary directory:', path))

const knownPaths: { scope: string, id: string, path: string }[] = []

// make short ids to ensure short unix paths
let numIds = 0
const nextId = () => `${numIds++}` // tslint:disable-line no-increment-decrement

export const makeTmpPath = (scopeOrFilename: string) => async (id: string): Promise<string> => {
  const scope = scopeOrFilename
  const knownPath = find(knownPaths, { scope, id })
  const path = knownPath ? knownPath.path : nextId()
  if (!knownPath) {
    knownPaths.push({ scope, id, path })
  }

  const tmpDirPath = await tmpDir
  return join(tmpDirPath, path)
}
