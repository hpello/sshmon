import * as React from 'react'
import { connect } from 'react-redux'

import { SystemState } from '../../../server/src/system/reducer'
import { SystemInfo as SystemInfoType } from '../../../server/src/system/types'
import { State } from '../types/redux'

const largesp = <span style={{ wordSpacing: '0.5em' }}> </span>
const thinnbsp = <span style={{ whiteSpace: 'nowrap' }}>&thinsp;</span>

const formatDuration = (secs: number): React.ReactNode => {
  if (secs < 60) {
    return (
      <>
        &lt;{thinnbsp}1{thinnbsp}min
      </>
    )
  }

  let seconds = secs
  const weeks = Math.floor(seconds / (7 * 24 * 60 * 60))
  if (weeks > 0) {
    seconds -= weeks * 7 * 24 * 60 * 60
  }

  const days = Math.floor(seconds / (24 * 60 * 60))
  if (days > 0) {
    seconds -= days * 24 * 60 * 60
  }

  const hours = Math.floor(seconds / (60 * 60))
  if (hours > 0) {
    seconds -= hours * 60 * 60
  }

  const minutes = Math.floor(seconds / 60)

  return (
    <>
      {weeks > 0 ? (
        <>
          {weeks}
          {thinnbsp}w{' '}
        </>
      ) : null}
      {days > 0 ? (
        <>
          {days}
          {thinnbsp}d{' '}
        </>
      ) : null}
      {hours > 0 ? (
        <>
          {hours}
          {thinnbsp}h{' '}
        </>
      ) : null}
      {minutes}
      {thinnbsp}min
    </>
  )
}

const formatMemory = (bytes: number): React.ReactNode => {
  const g = bytes / 2 ** 30
  if (Math.floor(g * 10) > 0) {
    return (
      <>
        {(bytes / 2 ** 30).toFixed(2)}
        {thinnbsp}GB
      </>
    )
  }

  const m = bytes / 2 ** 20
  if (Math.floor(m * 10) > 0) {
    return (
      <>
        {(bytes / 2 ** 20).toFixed(2)}
        {thinnbsp}MB
      </>
    )
  }

  return (
    <>
      {(bytes / 2 ** 10).toFixed(2)}
      {thinnbsp}kB
    </>
  )
}

const formatPercentage = (value: number): React.ReactNode => {
  return (
    <>
      {value.toFixed(2)}
      {thinnbsp}%
    </>
  )
}

const makeSystemSummary = (info: SystemInfoType): React.ReactNode => {
  return (
    <>
      {info.platform} ({info.arch}){largesp}|{largesp}
      {info.totalCPUs}
      {thinnbsp}CPU{info.totalCPUs > 1 ? 's' : ''}
      {largesp}|{largesp}
      {formatMemory(info.totalMemoryBytes)}
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- left for clarity
interface OwnProps {}

interface StateProps {
  system: SystemState
}

interface Props extends StateProps, OwnProps {}

class SystemInfo extends React.Component<Props> {
  render() {
    const { info, stats } = this.props.system

    return (
      <div className="panel">
        <div className="panel-block">
          <table
            className="table is-fullwidth is-marginless is-narrow is-striped is-hoverable"
            style={{ border: 'none' }}
          >
            <tbody>
              <tr>
                <th style={{ border: 'none' }}>System</th>
                <td className="has-text-right" style={{ border: 'none' }}>
                  {info ? makeSystemSummary(info) : ''}
                </td>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Version</th>
                <td className="has-text-right" style={{ border: 'none' }}>
                  {info ? (
                    <>
                      SSHMon {info.version}
                      {largesp}|{largesp}Node.js {info.nodeVersion}
                    </>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Uptime</th>
                <td className="has-text-right" style={{ border: 'none' }}>
                  {stats ? formatDuration(stats.uptimeSeconds) : ''}
                </td>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>CPU usage</th>
                <td className="has-text-right" style={{ border: 'none' }}>
                  {stats ? formatPercentage(stats.cpuUsage) : ''}
                </td>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Memory usage</th>
                <td className="has-text-right" style={{ border: 'none' }}>
                  {stats ? formatMemory(stats.memoryUsageBytes) : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: State, ownProps: OwnProps): Props => ({
  ...ownProps,
  system: state.api.state.system,
})

export default connect(mapStateToProps)(SystemInfo)
