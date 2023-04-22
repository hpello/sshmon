import { forwardingConnect, forwardingDisconnect } from './connect-thunks'
import {
  forwardingCreate,
  forwardingDelete,
  forwardingEdit,
} from './create-thunks'

export const thunks = {
  forwardingCreate,
  forwardingEdit,
  forwardingDelete,
  forwardingConnect,
  forwardingDisconnect,
}
