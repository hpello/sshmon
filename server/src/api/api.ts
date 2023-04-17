import type { AutoconnectConfig } from '@/server/autoconnect'
import type { AutoforwardConfig } from '@/server/autoforward'
import type { ForwardingConfig } from '@/server/forward'
import type { HostConfig } from '@/server/host'

export enum apiKeys {
  hostCreate = 'hostCreate',
  hostEdit = 'hostEdit',
  hostDelete = 'hostDelete',
  hostConnect = 'hostConnect',
  hostDisconnect = 'hostDisconnect',

  forwardingCreate = 'forwardingCreate',
  forwardingEdit = 'forwardingEdit',
  forwardingDelete = 'forwardingDelete',
  forwardingConnect = 'forwardingConnect',
  forwardingDisconnect = 'forwardingDisconnect',
}

export type APIEndpoint =
  | {
      key: apiKeys.hostCreate
      args: { id: string; config: HostConfig; autoConfig: AutoconnectConfig }
    }
  | {
      key: apiKeys.hostEdit
      args: { id: string; config: HostConfig; autoConfig: AutoconnectConfig }
    }
  | { key: apiKeys.hostDelete; args: { id: string } }
  | { key: apiKeys.hostConnect; args: { id: string } }
  | { key: apiKeys.hostDisconnect; args: { id: string } }
  | {
      key: apiKeys.forwardingCreate
      args: {
        id: string
        fwdId: string
        config: ForwardingConfig
        autoConfig: AutoforwardConfig
      }
    }
  | {
      key: apiKeys.forwardingEdit
      args: {
        id: string
        fwdId: string
        config: ForwardingConfig
        autoConfig: AutoforwardConfig
      }
    }
  | { key: apiKeys.forwardingDelete; args: { id: string; fwdId: string } }
  | { key: apiKeys.forwardingConnect; args: { id: string; fwdId: string } }
  | { key: apiKeys.forwardingDisconnect; args: { id: string; fwdId: string } }
