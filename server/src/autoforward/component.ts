import type { State, Store } from '@/server/types/redux'

import { onStateChange } from './utils'

export class Autoforwarder {
  store: Store
  prevState: State

  constructor(params: { store: Store }) {
    this.store = params.store
    this.prevState = params.store.getState()
  }

  setup() {
    this.store.subscribe(() => {
      const state = this.store.getState()

      process.nextTick(() => {
        // prevent recursion
        onStateChange(this.prevState, state, this.store.dispatch)
        this.prevState = state
      })
    })
  }
}
