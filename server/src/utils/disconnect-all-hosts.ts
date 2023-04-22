import { thunks as hostThunks } from '@/server/host'
import type { Store } from '@/server/types/redux'

const DISCONNECT_REASON = 'shutdown'

export const disconnectAllHosts = async (store: Store) => {
  store
    .getState()
    .hosts.forEach((host) =>
      store.dispatch(hostThunks.hostDisconnect(host.id, DISCONNECT_REASON))
    )
  const allDisconnected = () => {
    return store
      .getState()
      .hosts.map((host) =>
        ['disconnected', 'error'].includes(host.state.status)
      )
      .reduce((acc, hostIsDown) => acc && hostIsDown, true)
  }

  return new Promise<void>((resolve) => {
    let done = false
    const listener = () => {
      if (!done && allDisconnected()) {
        done = true
        resolve()
      }
    }

    listener()
    store.subscribe(listener)
  })
}
