import { Server } from 'http'

export const formatURL = (server: Server): string => {
  const a = server.address()
  if (typeof a === 'string') {
    return a
  }

  // @ts-expect-error apparently address can be null
  const { address, port, family } = a

  const host = family === 'IPv6' ? `[${address}]` : address
  return `http://${host}:${port}`
}
