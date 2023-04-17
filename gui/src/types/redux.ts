import type { Store as ReduxStore } from 'redux'

import type { Action as _Action, State as _State } from '@/gui/reducer'

export type Action = _Action
export type State = _State

export type Store = ReduxStore<State>
