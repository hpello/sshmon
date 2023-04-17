import { find, flatten } from 'lodash'

import type { AutoconnectConfig } from '@/server/autoconnect'
import type { AutoforwardConfig } from '@/server/autoforward'
import type { ForwardingConfig } from '@/server/forward'
import type { HostConfig } from '@/server/host'
import { parseForwardingSpec, serializeForwardingSpec } from './forwarding-spec'
import type {
  ConfigConfigSchema,
  ConfigSchema,
  ForwardingSchema,
  HostSchema,
} from './schema'
import type { ConfigConfig, ConfigType } from './types'

// object to state
const makeForwardingState = (
  forwarding: ForwardingSchema
): ForwardingConfig => {
  if (typeof forwarding === 'string') {
    return { spec: parseForwardingSpec(forwarding), label: '' }
  }

  const spec = parseForwardingSpec(forwarding.spec)
  const label = forwarding.label || ''

  return { spec, label }
}

const makeHostState = (id: string, h: HostSchema): HostConfig => {
  const host = h === null ? {} : h

  const sshHost = host.ssh && host.ssh.host ? host.ssh.host : id
  const sshConfig = host.ssh && host.ssh.config ? host.ssh.config : {}
  const ssh = {
    host: sshHost,
    config: sshConfig,
  }
  const label = host.label || ''

  return { ssh, label }
}

const makeAutoconnectState = (h: HostSchema): AutoconnectConfig => {
  const host = h === null ? {} : h

  const start = host.autostart || false
  const retry = host.autoretry || false
  return { start, retry }
}

const makeAutoforwardState = (
  forwarding: ForwardingSchema
): AutoforwardConfig => {
  if (typeof forwarding === 'string') {
    return { start: false, retry: false }
  }

  const start = forwarding.autostart || false
  const retry = forwarding.autoretry || false
  return { start, retry }
}

const makeConfigState = (config: ConfigConfigSchema): ConfigConfig => ({
  autosave: config.autosave || false,
})

const mapKVArray = <T>(
  array: { [key: string]: T }[],
  func: (value: T, key: string) => any
) => {
  return array.map((x) => {
    const key = Object.keys(x)[0]
    const value = x[key]
    return func(value, key)
  })
}

export const configObjectToState = (config: ConfigSchema): ConfigType => {
  const defaultConfigConfig = { autosave: false }
  if (config === null) {
    return {
      hosts: [],
      forwardings: [],
      autoconnects: [],
      autoforwards: [],
      config: defaultConfigConfig,
    }
  }

  const hosts = mapKVArray(config.hosts || [], (v, id) => ({
    id,
    config: makeHostState(id, v),
  }))
  const forwardings = flatten(
    mapKVArray(config.hosts || [], (v, id) =>
      mapKVArray((v || {}).forward || [], (vv, fwdId) => ({
        id,
        fwdId,
        config: makeForwardingState(vv),
      }))
    )
  )
  const autoconnects = mapKVArray(config.hosts || [], (v, id) => ({
    id,
    config: makeAutoconnectState(v),
  }))
  const autoforwards = flatten(
    mapKVArray(config.hosts || [], (v, id) =>
      mapKVArray((v || {}).forward || [], (vv, fwdId) => ({
        id,
        fwdId,
        config: makeAutoforwardState(vv),
      }))
    )
  )
  const configConfig = config.config
    ? makeConfigState(config.config)
    : defaultConfigConfig

  return {
    hosts,
    forwardings,
    autoconnects,
    autoforwards,
    config: configConfig,
  }
}

// state to object
const makeForwardingObject = (
  forwarding: ForwardingConfig,
  autoforward: AutoforwardConfig | null
): ForwardingSchema => {
  const result: any = {}

  if (forwarding.spec) {
    result.spec = serializeForwardingSpec(forwarding.spec)
  }
  if (forwarding.label) {
    result.label = forwarding.label
  }
  if (autoforward && autoforward.start) {
    result.autostart = true
  }
  if (autoforward && autoforward.retry) {
    result.autoretry = true
  }

  if (!result.label && !result.autostart && !result.autoretry) {
    return result.spec
  }

  return result
}

const makeSSHObject = (id: string, host: HostConfig) => {
  const ssh = { ...host.ssh }
  if (ssh.host === id) {
    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete ssh.host
  }
  if (Object.keys(ssh.config).length === 0) {
    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete ssh.config
  }

  return ssh
}

const makeHostObject = (
  id: string,
  host: HostConfig,
  forwardings: { id: string; fwdId: string; config: ForwardingConfig }[],
  autoconnect: AutoconnectConfig | null,
  autoforwards: { id: string; fwdId: string; config: AutoforwardConfig }[]
): HostSchema => {
  const ssh = makeSSHObject(id, host)

  const forward = forwardings.map((forwarding) => {
    const autoforward = find(autoforwards, { id, fwdId: forwarding.fwdId })
    const result: { [key: string]: ForwardingSchema } = {}
    result[forwarding.fwdId] = makeForwardingObject(
      forwarding.config,
      autoforward ? autoforward.config : null
    )
    return result
  })

  const result: HostSchema = {}

  if (host.label) {
    result.label = host.label
  }
  if (Object.keys(ssh).length > 0) {
    result.ssh = ssh
  }
  if (Object.keys(forward).length > 0) {
    result.forward = forward
  }
  if (autoconnect && autoconnect.start) {
    result.autostart = true
  }
  if (autoconnect && autoconnect.retry) {
    result.autoretry = true
  }

  return Object.keys(result).length > 0 ? result : null
}

const makeConfigObject = (config: ConfigConfig): ConfigConfigSchema => {
  const result = { ...config }
  if (!result.autosave) {
    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete result.autosave
  }
  return config
}

export const configStateToObject = (config: ConfigType): ConfigSchema => {
  const hosts = config.hosts.map((host) => {
    const forwardings = config.forwardings.filter((x) => x.id === host.id)
    const autoconnect = find(config.autoconnects, { id: host.id })
    const result: { [key: string]: HostSchema | null } = {}
    result[host.id] = makeHostObject(
      host.id,
      host.config,
      forwardings,
      autoconnect ? autoconnect.config : null,
      config.autoforwards
    )
    return result
  })

  const c = makeConfigObject(config.config)

  const result = {
    hosts,
    config: c,
  }

  if (Object.keys(result.config).length === 0) {
    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete result.config
  }
  if (Object.keys(result.hosts).length === 0) {
    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete result.hosts
  }

  return result
}
