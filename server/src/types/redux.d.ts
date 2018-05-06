import {
  Dispatch as ReduxDispatch,
  Middleware as ReduxMiddleware,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore
} from 'redux'
import { ThunkAction as ReduxThunkAction } from 'redux-thunk'

import { Action as _Action, State as _State } from '../reducer'

export type Action = _Action
export type State = _State

export interface Dispatch extends ReduxDispatch<State> {}
export type GetState = () => State
export interface Middleware extends ReduxMiddleware {
  (api: MiddlewareAPI): (next: Dispatch) => Dispatch
}
export interface MiddlewareAPI extends ReduxMiddlewareAPI<State> {}
export interface Store extends ReduxStore<State> {}
export interface ThunkAction extends ReduxThunkAction<any, State, any> {}
export interface AsyncThunkAction extends ReduxThunkAction<Promise<void>, State, any> {}
