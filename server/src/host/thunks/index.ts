import { hostConnect, hostDisconnect } from './connect-thunks'
import { hostCreate, hostDelete, hostEdit } from './create-thunks'

export const thunks = {
  hostCreate,
  hostEdit,
  hostDelete,
  hostConnect,
  hostDisconnect,
}
