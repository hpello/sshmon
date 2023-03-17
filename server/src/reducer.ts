import { combineReducers } from 'redux'

import type {
  Action as AutoconnectAction,
  State as AutoconnectState,
} from './autoconnect'
import { reducer as autoconnects } from './autoconnect'
import type {
  Action as AutoforwardAction,
  State as AutoforwardState,
} from './autoforward'
import { reducer as autoforwards } from './autoforward'
import type { Action as ConfigAction, State as ConfigState } from './config'
import { reducer as config } from './config'
import type { Action as ForwardAction, State as ForwardState } from './forward'
import { reducer as forwardings } from './forward'
import type { Action as HostAction, State as HostState } from './host'
import { reducer as hosts } from './host'
import type { Action as SystemAction, State as SystemState } from './system'
import { reducer as system } from './system'

export type State = {
  hosts: HostState
  forwardings: ForwardState
  autoconnects: AutoconnectState
  autoforwards: AutoforwardState
  system: SystemState
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
  config,
} as any) // FIXME hpello https://github.com/reactjs/redux/issues/2709
