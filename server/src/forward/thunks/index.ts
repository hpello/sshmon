import { forwardingConnect, forwardingDisconnect } from './connect-thunks'
import {
  forwardingCreate,
  forwardingEdit,
  forwardingDelete,
} from './create-thunks'

export const thunks = {
  forwardingCreate,
  forwardingEdit,
  forwardingDelete,
  forwardingConnect,
  forwardingDisconnect,
}
