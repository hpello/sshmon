import type { ForwardingSpec } from '../forward'
import { fwdTypes } from '../forward'

const token = '((?:\\S|(?:\\\\ ))+)'
const dynamicRegex = new RegExp(`^(?:D|dynamic) +${token}$`)
const localRegex = new RegExp(`^(?:L|local) +${token} +${token}$`)
const remoteRegex = new RegExp(`^(?:R|remote) +${token} +${token}$`)
const httpRegex = new RegExp(`^(?:H|http) +${token}$`)

export const parseForwardingSpec = (str: string): ForwardingSpec => {
  if (dynamicRegex.test(str)) {
    const [, /**/ bind] = str.match(dynamicRegex) || ['', '']
    return { type: fwdTypes.dynamic, bind }
  }
  if (localRegex.test(str)) {
    const [, /**/ bind, target] = str.match(localRegex) || ['', '', '']
    return { type: fwdTypes.local, bind, target }
  }
  if (remoteRegex.test(str)) {
    const [, /**/ bind, target] = str.match(remoteRegex) || ['', '', '']
    return { type: fwdTypes.remote, bind, target }
  }
  if (httpRegex.test(str)) {
    const [, /**/ target] = str.match(httpRegex) || ['', '', '']
    return { type: fwdTypes.http, target }
  }

  throw Error(`invalid forwarding spec: ${JSON.stringify(str)}`)
}

export const serializeForwardingSpec = (spec: ForwardingSpec): string => {
  switch (spec.type) {
    case fwdTypes.dynamic:
      return `D ${spec.bind}`
    case fwdTypes.local:
      return `L ${spec.bind} ${spec.target}`
    case fwdTypes.remote:
      return `R ${spec.bind} ${spec.target}`
    case fwdTypes.http:
      return `H ${spec.target}`
  }
}
