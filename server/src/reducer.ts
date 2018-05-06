import { combineReducers } from 'redux'

import { Action as HostAction, reducer as hosts, State as HostState } from './host'
import { Action as ForwardAction, reducer as forwardings, State as ForwardState } from './forward'
import { Action as AutoconnectAction, reducer as autoconnects, State as AutoconnectState } from './autoconnect'
import { Action as AutoforwardAction, reducer as autoforwards, State as AutoforwardState } from './autoforward'
import { Action as SystemAction, reducer as system, State as SystemState } from './system'
import { Action as ConfigAction, reducer as config, State as ConfigState } from './config'

export type State = {
  hosts: HostState,
  forwardings: ForwardState,
  autoconnects: AutoconnectState,
  autoforwards: AutoforwardState,
  system: SystemState,
  config: ConfigState
}

export type Action =
  | HostAction
  | ForwardAction
  | AutoconnectAction
  | AutoforwardAction
  | SystemAction
  | ConfigAction
  | { type: '__any_other_action_type__' }

export const reducer = combineReducers<State>({
  hosts,
  forwardings,
  autoconnects,
  autoforwards,
  system,
  config
} as any) // FIXME hpello https://github.com/reactjs/redux/issues/2709
