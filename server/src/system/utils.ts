import * as os from 'os'

import { SystemInfo, SystemStats } from './types'

export const getSystemInfo = (): SystemInfo => {
  const arch = os.arch()
  const hostName = os.hostname()
  const homeDir = os.homedir()
  const totalCPUs = os.cpus().length
  const totalMemoryBytes = os.totalmem()
  const user = os.userInfo().username

  const { pid, platform } = process
  const nodeVersion = process.version

  // eslint-disable-next-line @typescript-eslint/no-var-requires -- get version dynamically
  const { version } = require('../../../package.json')

  return {
    arch,
    homeDir,
    hostName,
    nodeVersion,
    pid,
    platform,
    totalCPUs,
    totalMemoryBytes,
    user,
    version,
  }
}

const setTimeoutAsync = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout))

const CPU_USAGE_WINDOW = 1000

export const getSystemStats = async (
  startTime: number
): Promise<SystemStats> => {
  const startUsageTime = process.cpuUsage()
  await setTimeoutAsync(CPU_USAGE_WINDOW)
  const usage = process.cpuUsage(startUsageTime)

  const cpuUsage = (usage.system + usage.user) / CPU_USAGE_WINDOW
  const memoryUsageBytes = process.memoryUsage().rss
  const uptimeSeconds = (Date.now() - startTime) / 1000

  return { cpuUsage, memoryUsageBytes, uptimeSeconds }
}
