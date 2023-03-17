import * as React from 'react'
import { connect } from 'react-redux'

import { CONNECT_REASON_AUTORETRY } from '../../../server/src/autoconnect/constants'
import type {
  AutoconnectState,
  AutoconnectSubState,
} from '../../../server/src/autoconnect/reducer'
import type { ForwardingState } from '../../../server/src/forward/reducer'
import type { HostStatus } from '../../../server/src/host/actions'
import type { HostState, HostSubState } from '../../../server/src/host/reducer'
import type { APIClient } from '../api/client'
import type { State } from '../types/redux'
import Forwarding from './Forwarding'
import ForwardingCreate from './ForwardingCreate'
import HostForm from './HostForm'

interface OwnProps {
  id: string
  apiClient: APIClient
}

interface StateProps {
  state: HostState | null
  forwardings: ForwardingState[]
  autoconnect: AutoconnectState | null
}

interface ComponentState {
  isCollapsed: boolean
  contentHeight: number
  editIsActive: boolean
}

interface Props extends StateProps, OwnProps {}

const makeColorClass = (status: HostStatus): string => {
  switch (status) {
    case 'connecting':
      return 'has-text-info'
    case 'connected':
      return 'has-text-success'
    case 'disconnecting':
      return 'has-text-warning'
    case 'disconnected':
      return 'has-text-grey'
    case 'error':
      return 'has-text-danger'
    default:
      return ''
  }
}

const makeStatusText = (
  state: HostSubState,
  autoconnect: AutoconnectSubState
) => {
  if (autoconnect.autoretryId && state.status !== 'connecting') {
    if (autoconnect.timeout === 0) {
      return 'Reconnecting'
    }
    return `Reconnecting in ${autoconnect.timeout / 1000}s…`
  }
  if (
    state.status === 'connecting' &&
    state.reason === CONNECT_REASON_AUTORETRY
  ) {
    return 'Reconnecting'
  }

  return <span className="is-capitalized">{state.status}</span>
}

const makeStatus = (state: HostSubState, autoconnect: AutoconnectSubState) => {
  const colorClass =
    state.status !== 'connecting' && autoconnect.autoretryId
      ? 'has-text-info'
      : makeColorClass(state.status)
  const text = makeStatusText(state, autoconnect)

  return (
    <div>
      <div className="is-hidden-mobile">
        <span className={colorClass}>{text}</span>
      </div>
      <div className="is-inline-mobile" style={{ display: 'none' }}>
        <span className={colorClass}>
          <span className="icon is-small">
            <i className="fa fa-circle" />
          </span>
        </span>
      </div>
    </div>
  )
}

const makePanelBlockStyle = (state: ComponentState) => {
  const style: React.CSSProperties = {
    overflow: 'hidden',
    transition: 'all 200ms ease-in-out',
  }

  if (state.isCollapsed) {
    style.maxHeight = 0
    style.borderBottomWidth = 0
    style.paddingBottom = 0
    style.paddingTop = 0
    style.marginBottom = 0
    style.marginTop = 0
  } else {
    style.maxHeight = state.contentHeight * 1.5 // add some more to leave space for padding/margin
  }

  return style
}

class Host extends React.Component<Props, ComponentState> {
  state = { isCollapsed: true, contentHeight: 0, editIsActive: false }
  panelBlock: HTMLDivElement | null = null

  computeContentHeight() {
    if (this.panelBlock === null) {
      return
    }
    if (this.state.isCollapsed) {
      return
    }

    const contentHeight = this.panelBlock.scrollHeight

    if (contentHeight !== this.state.contentHeight) {
      this.setState({ ...this.state, contentHeight })
    }
  }

  componentDidMount() {
    this.computeContentHeight()
  }
  componentDidUpdate() {
    this.computeContentHeight()
  }

  onClick() {
    this.setState({ ...this.state, isCollapsed: !this.state.isCollapsed })
  }

  render() {
    if (!this.props.state || !this.props.autoconnect) {
      return null
    }
    const { id, config, state } = this.props.state
    const { apiClient } = this.props

    return (
      <>
        <div className="panel">
          <div
            className="panel-block button"
            style={
              {
                display: 'block',
                height: 'auto',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              } /* reset styles added by 'button' */
            }
            onClick={this.onClick.bind(this)}
          >
            <div className="columns is-mobile is-gapless is-multiline is-vcentered">
              <div
                className="column is-narrow"
                style={{ marginRight: '0.5rem' }}
              >
                <span
                  className="icon is-small"
                  style={{
                    transform: `rotate(${this.state.isCollapsed ? 0 : 90}deg)`,
                    transition: 'all 200ms ease-in-out',
                  }}
                >
                  <i className="fa fa-angle-right" />
                </span>
              </div>
              <div className="column" style={{ marginRight: '0.5rem' }}>
                <div className="columns is-mobile is-gapless is-multiline is-vcentered">
                  <div
                    className="column is-narrow"
                    style={{ marginRight: '1rem' }}
                  >
                    <div className="title is-5 has-text-weight-semibold">
                      {config.label || id}
                    </div>
                  </div>
                  <div className="column">
                    <div className="tags">
                      {this.props.autoconnect.config.start ? (
                        <div className="tag" title="autostart">
                          start
                        </div>
                      ) : null}
                      {this.props.autoconnect.config.retry ? (
                        <div className="tag" title="autoretry">
                          retry
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <div className="column is-narrow">
                {makeStatus(state, this.props.autoconnect.state)}
              </div>
            </div>
          </div>
          <div
            className="panel-block"
            style={{ display: 'block', ...makePanelBlockStyle(this.state) }}
            ref={(ref) => {
              this.panelBlock = ref
            }}
          >
            <table className="table is-fullwidth is-marginless is-narrow is-hoverable">
              <tbody>
                {this.props.forwardings.map(({ fwdId }) => (
                  <tr key={fwdId}>
                    <td style={{ border: 'none' }}>
                      <Forwarding
                        id={this.props.id}
                        fwdId={fwdId}
                        apiClient={this.props.apiClient}
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ border: 'none' }}>
                    <ForwardingCreate
                      id={this.props.id}
                      apiClient={this.props.apiClient}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="panel-block" style={{ display: 'block' }}>
            {' '}
            {/* https://github.com/jgthms/bulma/issues/1563 */}
            <div className="level is-mobile">
              <div className="level-left" />
              <div className="level-right">
                <div className="buttons">
                  <button
                    disabled={!['disconnected', 'error'].includes(state.status)}
                    className="button is-small"
                    onClick={() =>
                      this.setState({ ...this.state, editIsActive: true })
                    }
                  >
                    Edit
                  </button>
                  {['disconnected', 'error'].includes(state.status) ? (
                    <button
                      className="button is-primary is-small"
                      onClick={() => apiClient.hostConnect({ id })}
                    >
                      Connect
                    </button>
                  ) : (
                    <button
                      className="button is-primary is-small is-outlined"
                      onClick={() => apiClient.hostDisconnect({ id })}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!this.state.editIsActive ? null : (
          <HostForm
            id={this.props.id}
            config={this.props.state.config}
            autoConfig={this.props.autoconnect.config}
            apiClient={this.props.apiClient}
            onClose={() =>
              this.setState({ ...this.state, editIsActive: false })
            }
          />
        )}
      </>
    )
  }
}

const mapStateToProps = (state: State, ownProps: OwnProps): Props => ({
  ...ownProps,
  state: state.api.state.hosts.find((x) => x.id === ownProps.id) || null,
  forwardings: state.api.state.forwardings.filter((x) => x.id === ownProps.id),
  autoconnect:
    state.api.state.autoconnects.find((x) => x.id === ownProps.id) || null,
})

export default connect(mapStateToProps)(Host)
