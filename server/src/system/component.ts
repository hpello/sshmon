import type { Store } from '../types/redux'
import { actions } from './actions'
import { getSystemInfo, getSystemStats } from './utils'

const SYSTEM_GET_STATS_INTERVAL = 10 * 1000

export class System {
  store: Store

  constructor(params: { store: Store }) {
    this.store = params.store
  }

  setup() {
    const info = getSystemInfo()
    this.store.dispatch(actions.systemAddInfo(info))

    const startTime = Date.now()
    getSystemStats(startTime).then((stats) =>
      this.store.dispatch(actions.systemAddStats(stats))
    )
    setInterval(
      () =>
        getSystemStats(startTime).then((stats) =>
          this.store.dispatch(actions.systemAddStats(stats))
        ),
      SYSTEM_GET_STATS_INTERVAL
    )
  }
}
