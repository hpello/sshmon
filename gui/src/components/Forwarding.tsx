import * as React from 'react'
import { connect } from 'react-redux'

import { State } from '../types/redux'

import { PROXY_PATH_PREFIX } from '../../../server/src/api/constants'
import { AutoforwardState } from '../../../server/src/autoforward/reducer'
import { ForwardingStatus } from '../../../server/src/forward/actions'
import {
  ForwardingState,
  ForwardingSubState,
} from '../../../server/src/forward/reducer'
import {
  ForwardingConfig,
  ForwardingSpec,
  fwdTypes,
} from '../../../server/src/forward/types'

import { APIClient } from '../api/client'

import ForwardingForm from './ForwardingForm'

interface OwnProps {
  id: string
  fwdId: string
  apiClient: APIClient
}

interface StateProps {
  state: ForwardingState | null
  autoforward: AutoforwardState | null
  hostIsUp: boolean
}

interface Props extends StateProps, OwnProps {}

interface ComponentState {
  editIsActive: boolean
}

const makeColorClass = (status: ForwardingStatus): string => {
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

const makeStatusText = (status: ForwardingStatus) => {
  switch (status) {
    case 'connecting':
      return 'activating'
    case 'connected':
      return 'active'
    case 'disconnecting':
      return 'canceling'
    case 'disconnected':
      return 'inactive'
    case 'error':
      return 'error'
    default:
      return ''
  }
}

const makeStatus = (state: ForwardingSubState) => {
  const colorClass = makeColorClass(state.status)
  const text = makeStatusText(state.status)

  return (
    <div style={{ position: 'relative' }}>
      <div className="is-hidden-mobile">
        <span style={{ visibility: 'hidden' }}>forwarding</span>
        {/* force width of maximum contents */}
        <span className={colorClass} style={{ position: 'absolute', right: 0 }}>
          {text}
        </span>
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

const makeForwardingHref = (spec: ForwardingSpec): string => {
  switch (spec.type) {
    case fwdTypes.local:
    case fwdTypes.dynamic:
      if (spec.bind.includes('/')) {
        return `unix://${spec.bind}`
      }
      if (`${parseInt(spec.bind, 10)}` === spec.bind) {
        return `//localhost:${spec.bind}`
      }
      return `//${spec.bind}`
    default:
      return ''
  }
}

const makeCodeElement = (child: React.ReactNode): React.ReactNode => {
  return (
    <code
      className="is-paddingless has-text-centered is-size-6"
      style={{ minWidth: '5ch' }}
    >
      {/* min width to match 5 digit ports */}
      {child}
    </code>
  )
}

const makeForwardingDescription = (
  config: ForwardingConfig,
  isConnected: boolean,
  id: string,
  fwdId: string
) => {
  const { spec } = config
  switch (spec.type) {
    case fwdTypes.dynamic:
      return (
        <span className="tags has-addons">
          <span className="tag" title="bind (local)">
            {makeCodeElement(
              isConnected ? (
                <a href={makeForwardingHref(spec)}>{spec.bind}</a>
              ) : (
                spec.bind
              )
            )}
          </span>
        </span>
      )
    case fwdTypes.local:
      return (
        <span className="tags has-addons">
          <span className="tag" title="bind (local)">
            {makeCodeElement(
              isConnected ? (
                <a href={makeForwardingHref(spec)}>{spec.bind}</a>
              ) : (
                spec.bind
              )
            )}
          </span>
          <span className="tag is-paddingless">:</span>
          <span className="tag" title="target (remote)">
            {makeCodeElement(spec.target)}
          </span>
        </span>
      )
    case fwdTypes.remote:
      return (
        <span className="tags has-addons">
          <span className="tag" title="bind (remote)">
            {makeCodeElement(spec.bind)}
          </span>
          <span className="tag is-paddingless">:</span>
          <span className="tag" title="target (local)">
            {makeCodeElement(spec.target)}
          </span>
        </span>
      )
    case fwdTypes.http:
      return (
        <span className="tags has-addons">
          <span className="tag">
            {makeCodeElement(
              isConnected ? (
                <a
                  className="icon"
                  href={[PROXY_PATH_PREFIX, id, fwdId].join('/').slice(1)}
                  style={{ padding: '0 3ch' } /* increase hitbox */}
                >
                  <i className="fa fa-link" />
                </a>
              ) : (
                <span className="icon">
                  <i className="fa fa-link" />
                </span>
              )
            )}
          </span>
          <span className="tag is-paddingless">:</span>
          <span className="tag" title="target (remote)">
            {makeCodeElement(spec.target)}
          </span>
        </span>
      )
  }
}

class Forwarding extends React.Component<Props, ComponentState> {
  state = { editIsActive: false }

  render() {
    if (!this.props.state || !this.props.autoforward) {
      return null
    }
    const { id, fwdId, config, state } = this.props.state
    const { apiClient } = this.props

    return (
      <>
        <div className="columns is-mobile is-gapless is-multiline is-vcentered">
          <div className="column is-narrow" style={{ marginRight: '0.5rem' }}>
            <div className="columns is-mobile is-gapless is-multiline is-vcentered">
              <div
                className="column is-narrow"
                style={{ marginRight: '0.5rem' }}
              >
                {['disconnected', 'error'].includes(state.status) ? (
                  <button
                    disabled={!this.props.hostIsUp}
                    className="button is-small is-primary"
                    onClick={() => apiClient.forwardingConnect({ id, fwdId })}
                  >
                    <span className="icon is-small">
                      <i className="fa fa-play" />
                    </span>
                  </button>
                ) : (
                  <button
                    disabled={!this.props.hostIsUp}
                    className="button is-small is-primary is-outlined"
                    onClick={() =>
                      apiClient.forwardingDisconnect({ id, fwdId })
                    }
                  >
                    <span className="icon is-small">
                      <i className="fa fa-stop" />
                    </span>
                  </button>
                )}
              </div>
              <div className="column is-narrow">
                <button
                  disabled={!['disconnected', 'error'].includes(state.status)}
                  className="button is-small"
                  onClick={() =>
                    this.setState({ ...this.state, editIsActive: true })
                  }
                >
                  <span className="icon is-small">
                    <i className="fa fa-edit" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="column" style={{ marginRight: '0.5rem' }}>
            <div className="columns is-mobile is-gapless is-multiline is-vcentered">
              <div className="column is-4" style={{ marginRight: '0.5rem' }}>
                <div className="columns is-mobile is-gapless is-multiline is-vcentered">
                  <div
                    className="column is-narrow"
                    style={{ marginRight: '1rem' }}
                  >
                    <span title={fwdId} className="has-text-weight-semibold">
                      {config.label || fwdId}
                    </span>
                  </div>
                  <div className="column is-narrow">
                    <div className="tags">
                      {this.props.autoforward.config.start ? (
                        <div className="tag" title="autostart">
                          start
                        </div>
                      ) : null}
                      {this.props.autoforward.config.retry ? (
                        <div className="tag" title="autoretry">
                          retry
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="columns is-mobile is-gapless is-multiline is-vcentered">
                  <div
                    className="column is-hidden-mobile is-narrow"
                    style={{ marginRight: '0.5rem', position: 'relative' }}
                  >
                    <span className="tag">
                      <span style={{ visibility: 'hidden' }}>dynamic</span>
                      {/* force width of maximum contents */}
                      <span
                        style={{
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {config.spec.type}
                      </span>
                    </span>
                  </div>
                  <div
                    className="column is-flex-mobile is-narrow"
                    style={{ display: 'none', marginRight: '0.5rem' }}
                  >
                    <span
                      className="tag is-uppercase"
                      title={config.spec.type}
                      style={{ width: '4ch' }}
                    >
                      {config.spec.type.charAt(0)}
                    </span>
                  </div>
                  <div className="column">
                    {makeForwardingDescription(
                      config,
                      state.status === 'connected',
                      id,
                      fwdId
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="column is-narrow">{makeStatus(state)}</div>
        </div>

        {!this.state.editIsActive ? null : (
          <ForwardingForm
            id={this.props.id}
            fwdId={this.props.fwdId}
            config={this.props.state.config}
            autoConfig={this.props.autoforward.config}
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

const makeHostIsUp = (state: State, id: string): boolean => {
  const host = state.api.state.hosts.find((x) => x.id === id)
  return host ? host.state.status === 'connected' : false
}

const mapStateToProps = (state: State, ownProps: OwnProps): Props => {
  const hostIsUp = makeHostIsUp(state, ownProps.id)
  const forwarding =
    state.api.state.forwardings.find(
      (x) => x.id === ownProps.id && x.fwdId === ownProps.fwdId
    ) || null
  const autoforward =
    state.api.state.autoforwards.find(
      (x) => x.id === ownProps.id && x.fwdId === ownProps.fwdId
    ) || null
  return {
    ...ownProps,
    state: forwarding,
    autoforward,
    hostIsUp,
  }
}

export default connect<StateProps, {}, OwnProps, State>(mapStateToProps)(
  Forwarding
)
