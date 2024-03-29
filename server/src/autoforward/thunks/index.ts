import {
  autoforwardCreate,
  autoforwardDelete,
  autoforwardEdit,
} from './create-thunks'
import { autoretrySpawn } from './retry-thunks'

export const thunks = {
  autoforwardCreate,
  autoforwardEdit,
  autoforwardDelete,
  autoretrySpawn,
}
