import { hostConnect, hostDisconnect } from './connect-thunks'
import { hostCreate, hostEdit, hostDelete } from './create-thunks'

export const thunks = {
  hostCreate,
  hostEdit,
  hostDelete,
  hostConnect,
  hostDisconnect,
}
