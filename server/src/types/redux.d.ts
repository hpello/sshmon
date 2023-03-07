import {
  Dispatch as ReduxDispatch,
  Middleware as ReduxMiddleware,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Unsubscribe
} from 'redux'
import {
  ThunkAction as ReduxThunkAction,
  ThunkDispatch as ReduxThunkDispatch
} from 'redux-thunk'

import { Action as _Action, State as _State } from '../reducer'

export type Action = _Action
export type State = _State
// export interface Dispatch extends ReduxDispatch<Action> {}
export interface Dispatch extends ReduxThunkDispatch<State, any, Action> {}

export interface ThunkAction extends ReduxThunkAction<any, State, any, Action> {}
export interface AsyncThunkAction extends ReduxThunkAction<Promise<void>, State, any, Action> {}


export type GetState = () => State
export interface Middleware extends ReduxMiddleware {
  (api: MiddlewareAPI): (next: Dispatch) => Dispatch
}
export interface MiddlewareAPI extends ReduxMiddlewareAPI<Dispatch> {}
export interface Store {
  dispatch: Dispatch
  getState(): State
  subscribe(listener: () => void): Unsubscribe
}
