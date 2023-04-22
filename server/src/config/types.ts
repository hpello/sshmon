import type { AutoconnectConfig } from '@/server/autoconnect'
import type { AutoforwardConfig } from '@/server/autoforward'
import type { ForwardingConfig } from '@/server/forward'
import type { HostConfig } from '@/server/host'

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
