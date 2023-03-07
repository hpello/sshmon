import * as Joi from 'joi'

const replaceIfNull = (schema: any, defoult: any) => Joi.alternatives().try(
  schema,
  Joi.any().valid(null).empty(null).default(defoult)
)

const forwardingObject = Joi.object({
  spec: Joi.string().required(),
  label: Joi.string(),
  autostart: Joi.boolean(),
  autoretry: Joi.boolean()
})

const forwarding = Joi.alternatives().try(
  forwardingObject,
  Joi.string()
)

const host = Joi.object({
  ssh: Joi.object({
    host: Joi.string(),
    config: Joi.object().pattern(/.*/, Joi.string())
  }),
  forward: Joi.array().items(Joi.object().pattern(/.*/, forwarding).length(1))
    .unique((a, b) => Object.keys(a)[0] === Object.keys(b)[0]),
  label: Joi.string(),
  autostart: Joi.boolean(),
  autoretry: Joi.boolean()
})

const config = Joi.object({
  autosave: Joi.boolean()
})

export const configSchema = Joi.object({
  hosts: Joi.array().items(Joi.object().pattern(/.*/, replaceIfNull(host, {})).length(1))
    .unique((a, b) => Object.keys(a)[0] === Object.keys(b)[0]),
  config
}).default(null) // INFO hpello empty yaml file yields undefined

export type ForwardingSchema = {
  spec: string,
  label?: string,
  autostart?: boolean,
  autoretry?: boolean
} | string

export type HostSchema = {
  ssh?: {
    host?: string,
    config?: { [key: string]: string }
  },
  forward?: { [key: string]: ForwardingSchema }[],
  label?: string,
  autostart?: boolean,
  autoretry?: boolean
} | null

export interface ConfigConfigSchema {
  autosave?: boolean
}

export type ConfigSchema = {
  hosts?: { [key: string]: HostSchema }[],
  config?: ConfigConfigSchema
} | null
