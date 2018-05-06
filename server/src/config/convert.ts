import { find, flatten, map } from 'lodash'
import { ConfigConfig, ConfigType } from './types'
import { parseForwardingSpec, serializeForwardingSpec } from './forwarding-spec'
import { ConfigConfigSchema, ConfigSchema, HostSchema, ForwardingSchema } from './schema'
import { HostConfig } from '../host'
import { ForwardingConfig } from '../forward'
import { AutoconnectConfig } from '../autoconnect'
import { AutoforwardConfig } from '../autoforward'

// object to state
const makeForwardingState = (forwarding: ForwardingSchema): ForwardingConfig => {
  if (typeof forwarding === 'string') {
    return { spec: parseForwardingSpec(forwarding), label: '' }
  }

  const spec = parseForwardingSpec(forwarding.spec)
  const label = forwarding.label || ''

  return { spec, label }
}

const makeHostState = (id: string, host: HostSchema): HostConfig => {
  const sshHost = host.ssh && host.ssh.host ? host.ssh.host : id
  const sshConfig = host.ssh && host.ssh.config ? host.ssh.config : {}
  const ssh = {
    host: sshHost,
    config: sshConfig
  }
  const label = host.label || ''

  return { ssh, label }
}

const makeAutoconnectState = (host: HostSchema): AutoconnectConfig => {
  const start = host.autostart || false
  const retry = host.autoretry || false
  return { start, retry }
}

const makeAutoforwardState = (forwarding: ForwardingSchema): AutoforwardConfig => {
  if (typeof forwarding === 'string') {
    return { start: false, retry: false }
  }

  const start = forwarding.autostart || false
  const retry = forwarding.autoretry || false
  return { start, retry }
}

const makeConfigState = (config: ConfigConfigSchema): ConfigConfig => ({
  autosave: config.autosave || false
})

export const configObjectToState = (config: ConfigSchema): ConfigType => {
  const defaultConfigConfig = { autosave: false }
  if (config === null) {
    return { hosts: [], forwardings: [], autoconnects: [], autoforwards: [], config: defaultConfigConfig }
  }

  const hosts = map(config.hosts || {}, (v, id) => ({ id, config: makeHostState(id, v) }))
  const forwardings = flatten(map(config.hosts || {}, (v, id) =>
    map(v.forward || {}, (vv, fwdId) => ({ id, fwdId, config: makeForwardingState(vv) })
  )))
  const autoconnects = map(config.hosts || {}, (v, id) => ({ id, config: makeAutoconnectState(v) }))
  const autoforwards = flatten(map(config.hosts || {}, (v, id) =>
    map(v.forward || {}, (vv, fwdId) => ({ id, fwdId, config: makeAutoforwardState(vv) })
  )))
  const configConfig = config.config ? makeConfigState(config.config) : defaultConfigConfig

  return { hosts, forwardings, autoconnects, autoforwards, config: configConfig }
}

// state to object
const makeForwardingObject = (forwarding: ForwardingConfig, autoforward: AutoforwardConfig | null): ForwardingSchema => {
  const result: any = {}

  if (forwarding.spec) { result.spec = serializeForwardingSpec(forwarding.spec) }
  if (forwarding.label) { result.label = forwarding.label }
  if (autoforward && autoforward.start) { result.autostart = true }
  if (autoforward && autoforward.retry) { result.autoretry = true }

  if (!result.label && !result.autostart && !result.autoretry) {
    return result.spec
  }

  return result
}

const makeSSHObject = (id: string, host: HostConfig) => {
  const ssh = { ...(host.ssh) }
  if (ssh.host === id) { delete ssh.host }
  if (Object.keys(ssh.config).length === 0) { delete ssh.config }

  return ssh
}

const makeHostObject = (id: string, host: HostConfig, forwardings: { id: string, fwdId: string, config: ForwardingConfig }[], autoconnect: AutoconnectConfig | null, autoforwards: { id: string, fwdId: string, config: AutoforwardConfig }[]): HostSchema => {
  const ssh = makeSSHObject(id, host)

  const forward = forwardings.reduce((acc, forwarding) => {
    const autoforward = find(autoforwards, { id, fwdId: forwarding.fwdId })
    acc[forwarding.fwdId] = makeForwardingObject(forwarding.config, autoforward ? autoforward.config : null)
    return acc
  }, {} as { [key: string]: ForwardingSchema })

  const result: any = {}

  if (host.label) { result.label = host.label }
  if (Object.keys(ssh).length > 0) { result.ssh = ssh }
  if (Object.keys(forward).length > 0) { result.forward = forward }
  if (autoconnect && autoconnect.start) { result.autostart = true }
  if (autoconnect && autoconnect.retry) { result.autoretry = true }

  return Object.keys(result).length > 0 ? result : null
}

const makeConfigObject = (config: ConfigConfig): ConfigConfigSchema => {
  const result = { ...config }
  if (!result.autosave) {
    delete result.autosave
  }
  return config
}

export const configStateToObject = (config: ConfigType): ConfigSchema => {
  const hosts = config.hosts.reduce((acc, host) => {
    const forwardings = config.forwardings.filter(x => x.id === host.id)
    const autoconnect = find(config.autoconnects, { id: host.id })
    acc[host.id] = makeHostObject(host.id, host.config, forwardings, autoconnect ? autoconnect.config : null, config.autoforwards)
    return acc
  }, {} as { [key: string]: HostSchema })

  const c = makeConfigObject(config.config)

  const result = {
    hosts,
    config: c
  }

  if (Object.keys(result.config).length === 0) { delete result.config }
  if (Object.keys(result.hosts).length === 0) { delete result.hosts }

  return result
}
