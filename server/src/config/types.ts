import { AutoconnectConfig } from '../autoconnect'
import { AutoforwardConfig } from '../autoforward'
import { ForwardingConfig } from '../forward'
import { HostConfig } from '../host'

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
