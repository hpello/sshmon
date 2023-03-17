import { find } from 'lodash'

import { thunks as hostThunks } from '../../host'
import { Dispatch, GetState } from '../../types/redux'
import { actions } from '../actions'
import { CONNECT_REASON_AUTORETRY } from '../constants'
import { AutoconnectState } from '../reducer'

const MIN_TIMEOUT_MS = 100
const MAX_TIMEOUT_MS = 5000
const NEXT_TIMEOUT_FACTOR = 2

const makeNextTimeout = (autoconnect: AutoconnectState): number => {
  if (autoconnect.state.timeout === 0) {
    return MIN_TIMEOUT_MS
  }

  const timeout = autoconnect.state.timeout * NEXT_TIMEOUT_FACTOR
  if (timeout > MAX_TIMEOUT_MS) {
    return MAX_TIMEOUT_MS
  }

  return timeout
}

const makeAutoretryId = (): string => process.hrtime().join('-')

export const autoretrySpawn =
  (id: string) => async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()

    const autoconnect = find(state.autoconnects, { id })
    if (!autoconnect) {
      return
    }

    const autoretryId = makeAutoretryId()
    const numRetries = autoconnect.state.numRetries + 1
    const timeout = makeNextTimeout(autoconnect)

    dispatch(actions.autoconnectLaunch(id, autoretryId, numRetries, timeout))

    setTimeout(() => {
      const a = find(getState().autoconnects, { id })
      if (a && a.state.autoretryId === autoretryId) {
        dispatch(hostThunks.hostConnect(id, CONNECT_REASON_AUTORETRY))
      }
    }, timeout)
  }
