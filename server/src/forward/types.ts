export enum fwdTypes {
  dynamic = 'dynamic',
  local = 'local',
  remote = 'remote',
  http = 'http',
}

export type ForwardingSpec =
  | { type: fwdTypes.dynamic; bind: string }
  | { type: fwdTypes.local | fwdTypes.remote; bind: string; target: string }
  | { type: fwdTypes.http; target: string }

export type ForwardingConfig = {
  spec: ForwardingSpec
  label: string
}

export type ForwardingParams =
  | { type: fwdTypes.dynamic; bind: string }
  | { type: fwdTypes.local | fwdTypes.remote; bind: string; target: string }
