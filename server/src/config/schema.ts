import { any, alternatives, boolean, object, string } from 'joi'

const replaceIfNull = (schema: any, defoult: any) => alternatives().try(
  schema,
  any().valid(null).empty(null).default(defoult)
)

const forwardingObject = object({
  spec: string().required(),
  label: string(),
  autostart: boolean(),
  autoretry: boolean()
})

const forwarding = alternatives().try(
  forwardingObject,
  string()
)

const host = object({
  ssh: object({
    host: string(),
    config: object().pattern(/.*/, string())
  }),
  forward: object().pattern(/.*/, forwarding),
  label: string(),
  autostart: boolean(),
  autoretry: boolean()
})

const config = object({
  autosave: boolean()
})

export const configSchema = object({
  hosts: object().pattern(/.*/, replaceIfNull(host, {})),
  config
}).default(null) // INFO hpello empty yaml file yields undefined

export type ForwardingSchema = {
  spec: string,
  label?: string,
  autostart?: boolean,
  autoretry?: boolean
} | string

export interface HostSchema {
  ssh?: {
    host?: string,
    config?: { [key: string]: string }
  },
  forward?: { [key: string]: ForwardingSchema },
  label?: string,
  autostart?: boolean,
  autoretry?: boolean
}

export interface ConfigConfigSchema {
  autosave?: boolean
}

export type ConfigSchema = {
  hosts?: { [key: string]: HostSchema },
  config?: ConfigConfigSchema
} | null
