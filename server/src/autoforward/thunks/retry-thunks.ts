import { find } from 'lodash'

import { thunks as forwardTunks } from '../../forward'
import type { Dispatch, GetState } from '../../types/redux'
import { actions } from '../actions'
import { FORWARD_REASON_AUTORETRY } from '../constants'
import type { AutoforwardState } from '../reducer'

const MIN_TIMEOUT_MS = 100
const MAX_TIMEOUT_MS = 5000
const NEXT_TIMEOUT_FACTOR = 2

const makeNextTimeout = (autoforward: AutoforwardState): number => {
  if (autoforward.state.timeout === 0) {
    return MIN_TIMEOUT_MS
  }

  const timeout = autoforward.state.timeout * NEXT_TIMEOUT_FACTOR
  if (timeout > MAX_TIMEOUT_MS) {
    return MAX_TIMEOUT_MS
  }

  return timeout
}

const makeAutoretryId = (): string => process.hrtime().join('-')

export const autoretrySpawn =
  (id: string, fwdId: string) =>
  async (dispatch: Dispatch, getState: GetState) => {
    const state = getState()

    const autoforward = find(state.autoforwards, { id, fwdId })
    if (!autoforward) {
      return
    }

    const autoretryId = makeAutoretryId()
    const numRetries = autoforward.state.numRetries + 1
    const timeout = makeNextTimeout(autoforward)

    dispatch(
      actions.autoforwardLaunch(id, fwdId, autoretryId, numRetries, timeout)
    )

    setTimeout(() => {
      const a = find(getState().autoforwards, { id, fwdId })
      if (a && a.state.autoretryId === autoretryId) {
        dispatch(
          forwardTunks.forwardingConnect(id, fwdId, FORWARD_REASON_AUTORETRY)
        )
      }
    }, timeout)
  }
