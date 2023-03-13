export enum socketTypes {
  // from client
  register = 'register',
  unregister = 'unregister',
  apiCall = 'apiCall',

  // from server
  state = 'state',
}

export interface SocketMessageError {
  message: string
}

export const PROXY_PATH_PREFIX = '/proxy'
export const SOCKET_PATH = '/socket'
