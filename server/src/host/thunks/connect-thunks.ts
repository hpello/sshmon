import { watch } from 'chokidar'
import { access } from 'fs'
import { find } from 'lodash'
import { promisify } from 'util'

import { createLogger } from '../../log'
import type { AsyncThunkAction, Dispatch, GetState } from '../../types/redux'
import { ErrorWithCode } from '../../utils/error-with-code'
import { makeTmpPath } from '../../utils/tmp'
import { actions } from '../actions'
import { spawnSshMaster } from '../ssh'
import type { HostConfig } from '../types'

const log = createLogger(__filename)

const extractConfigControlPath = (hostConfig: HostConfig): string | null => {
  const sshConfig = hostConfig.ssh.config
  const key = Object.keys(sshConfig).find(
    (k) => k.toLowerCase() === 'controlpath'
  )
  return key ? sshConfig[key] : null
}

const accessAsync = promisify(access)
const fileExists = (path: string): Promise<boolean> =>
  accessAsync(path)
    .then(() => true)
    .catch(() => false)

export const hostConnect =
  (id: string, reason: string): AsyncThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      throw new ErrorWithCode(404, `host not found: ${id}`)
    }

    if (!['disconnected', 'error'].includes(host.state.status)) {
      log.info(`host not down: ${id}`)
      return
    }

    const controlPath =
      extractConfigControlPath(host.config) ||
      (await makeTmpPath(__filename)(id))

    if (await fileExists(controlPath)) {
      log.error(`control path already exists: ${controlPath}`)
      dispatch(actions.hostStateError(id))
      return
    }

    const process = spawnSshMaster({
      sshCommand: 'ssh',
      controlPath,
      sshParams: host.config.ssh,
    })
    // @ts-expect-error Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
    dispatch(actions.hostStateConnecting(id, process.pid, controlPath, reason))

    const watcher = watch(controlPath, { useFsEvents: false })
      .on('error', (err) => log.error({ err }, 'watcher error'))
      .once('add', () => {
        watcher.close()
        dispatch(actions.hostStateConnected(id, new Date()))
      })

    process.on('exit', (code) => {
      watcher.close()
      dispatch(
        code === 0 || code === null
          ? actions.hostStateDisconnected(id)
          : actions.hostStateError(id)
      )
    })
  }

export const hostDisconnect =
  (id: string, reason: string): AsyncThunkAction =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const host = find(state.hosts, { id })
    if (!host) {
      throw new ErrorWithCode(404, `host not found: ${id}`)
    }

    if (!['connecting', 'connected'].includes(host.state.status)) {
      log.info('host is not connected:', id)
      return Promise.resolve()
    }
    if (host.state.pid === null) {
      throw new ErrorWithCode(
        500,
        `bad state: ${id} (${JSON.stringify(host.state)})`
      )
    }

    process.kill(host.state.pid)
    dispatch(actions.hostStateDisconnecting(id, reason))

    return Promise.resolve()
  }
