import * as stringify from 'json-stable-stringify'

import { access, mkdir, stat, writeFile } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { promisify } from 'util'
const accessAsync = promisify(access)
const mkdirAsync = promisify(mkdir)
const statAsync = promisify(stat)
const writeFileAsync = promisify(writeFile)

import { HostConfig, thunks as hostThunks } from '../host'
import { ForwardingConfig, thunks as forwardThunks } from '../forward'
import { AutoconnectConfig, thunks as autoconnectThunks } from '../autoconnect'
import { AutoforwardConfig, thunks as autoforwardThunks } from '../autoforward'
import { State, Store } from '../types/redux'

import { actions as configActions } from './actions'
import { configObjectToState, configStateToObject } from './convert'
import { ConfigSchema } from './schema'
import { load, save } from './serialize'
import { ConfigConfig, ConfigType } from './types'
import { createLogger } from '../log'

const log = createLogger(__filename)

const dispatchConfigActions = async (config: ConfigType, store: Store) => {
  config.hosts.forEach(({ id, config }) => {
    store.dispatch(hostThunks.hostCreate(id, config))
  })
  config.forwardings.forEach(({ id, fwdId, config }) => {
    store.dispatch(forwardThunks.forwardingCreate(id, fwdId, config))
  })
  config.autoconnects.forEach(({ id, config }) => {
    store.dispatch(autoconnectThunks.autoconnectCreate(id, config))
  })
  config.autoforwards.forEach(({ id, fwdId, config }) => {
    store.dispatch(autoforwardThunks.autoforwardCreate(id, fwdId, config))
  })
  store.dispatch(configActions.configEdit(config.config))
}

const extractConfigFromState = (state: State): ConfigType => {
  const hosts: { id: string; config: HostConfig }[] = state.hosts.map(
    ({ id, config }) => ({ id, config })
  )
  const forwardings: { id: string; fwdId: string; config: ForwardingConfig }[] =
    state.forwardings.map(({ id, fwdId, config }) => ({ id, fwdId, config }))
  const autoconnects: { id: string; config: AutoconnectConfig }[] =
    state.autoconnects.map(({ id, config }) => ({ id, config }))
  const autoforwards: {
    id: string
    fwdId: string
    config: AutoforwardConfig
  }[] = state.autoforwards.map(({ id, fwdId, config }) => ({
    id,
    fwdId,
    config,
  }))
  const config: ConfigConfig = state.config
  return { hosts, forwardings, autoconnects, autoforwards, config }
}

const saveConfigIfNeeded = async (
  state: State,
  prevState: State,
  path: string
) => {
  const config = extractConfigFromState(state)
  const prevConfig = extractConfigFromState(prevState)
  if (stringify(config) === stringify(prevConfig)) {
    return
  }

  const configObject = configStateToObject(config)
  if (config.config.autosave) {
    save(configObject, path)
  }
}

const exist = async (path: string): Promise<boolean> => {
  try {
    await accessAsync(path)
  } catch {
    return false
  }
  return true
}

const defaultConfig = (): ConfigSchema => ({
  config: {
    autosave: true,
  },
})

const ensureDefaultConfigFile = async (): Promise<string> => {
  const dir = join(homedir(), '.sshmon')
  if (!(await exist(dir))) {
    log.info('create directory at', dir)
    await mkdirAsync(dir, 0o700)
  }

  const configFile = join(dir, 'config.yml')
  if (!(await exist(configFile))) {
    log.info('create config file at', configFile)
    await writeFileAsync(configFile, '', { mode: 0o644 })
    await save(defaultConfig(), configFile)
  }
  const statFile = await statAsync(configFile)
  if ((statFile.mode & 0o022) !== 0) {
    throw new Error(`Bad permissions for config file ${configFile}`)
  }

  return configFile
}

export class Config {
  store: Store
  prevState: State
  configPath: string

  constructor(params: { store: Store }) {
    const { store } = params
    this.store = store
    this.prevState = params.store.getState()
    this.configPath = ''
  }

  async setup(params: { configPath: string | null }) {
    this.configPath =
      params.configPath !== null
        ? params.configPath
        : await ensureDefaultConfigFile()

    log.info('config file is', this.configPath)
    const config = await load(this.configPath)
    const configState = configObjectToState(config)
    log.debug({ config: JSON.stringify(configState) }, 'loaded config')

    await dispatchConfigActions(configState, this.store)
    this.store.subscribe(() => {
      const state = this.store.getState()
      saveConfigIfNeeded(state, this.prevState, this.configPath)
      this.prevState = state
    })
  }
}
