import { HostConfig } from '../host'
import { ForwardingConfig } from '../forward'
import { AutoconnectConfig } from '../autoconnect'
import { AutoforwardConfig } from '../autoforward'

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
