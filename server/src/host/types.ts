export type HostConfig = {
  ssh: {
    host: string
    config: { [key: string]: string }
  }
  label: string
}
