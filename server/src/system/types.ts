export type SystemInfo = {
  arch: string,
  homeDir: string,
  hostName: string,
  nodeVersion: string,
  pid: number,
  platform: string,
  totalCPUs: number
  totalMemoryBytes: number
  user: string,
  version: string
}

export type SystemStats = {
  cpuUsage: number,
  memoryUsageBytes: number
  uptimeSeconds: number
}
