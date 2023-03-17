import type { AutoconnectConfig } from '../autoconnect'
import type { AutoforwardConfig } from '../autoforward'
import type { ForwardingConfig } from '../forward'
import type { HostConfig } from '../host'

export type ConfigConfig = {
  autosave: boolean
}

export type ConfigType = {
  hosts: { id: string; config: HostConfig }[]
  forwardings: { id: string; fwdId: string; config: ForwardingConfig }[]
  autoconnects: { id: string; config: AutoconnectConfig }[]
  autoforwards: { id: string; fwdId: string; config: AutoforwardConfig }[]
  config: ConfigConfig
}
