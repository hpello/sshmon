import {
  Middleware as ReduxMiddleware,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Unsubscribe,
} from 'redux'
import {
  ThunkAction as ReduxThunkAction,
  ThunkDispatch as ReduxThunkDispatch,
} from 'redux-thunk'

import { Action as _Action, State as _State } from '../reducer'

export type Action = _Action
export type State = _State
export type Dispatch = ReduxThunkDispatch<State, any, Action>
export type ThunkAction = ReduxThunkAction<any, State, any, Action>
export type AsyncThunkAction = ReduxThunkAction<
  Promise<void>,
  State,
  any,
  Action
>

export type GetState = () => State
export interface Middleware extends ReduxMiddleware {
  (api: MiddlewareAPI): (next: Dispatch) => Dispatch
}
export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch>
export interface Store {
  dispatch: Dispatch
  getState(): State
  subscribe(listener: () => void): Unsubscribe
}
