import {
  autoconnectCreate,
  autoconnectEdit,
  autoconnectDelete,
} from './create-thunks'
import { autoretrySpawn } from './retry-thunks'

export const thunks = {
  autoconnectCreate,
  autoconnectEdit,
  autoconnectDelete,
  autoretrySpawn,
}
