import * as React from 'react'
import { connect } from 'react-redux'

import { APIClient } from '../api/client'
import { State as APIState } from '../api/reducer'
import { State } from '../types/redux'

import Header from './Header'
import Host from './Host'
import HostCreate from './HostCreate'
import SystemInfo from './SystemInfo'

interface OwnProps {
  apiClient: APIClient
}

interface StateProps {
  apiState: APIState
}

interface Props extends StateProps, OwnProps { }

const APIDisconnectedModal = (props: { active: boolean }) => (
  <div className={`modal ${props.active ? 'is-active' : ''}`}>
    <div className="modal-background" />
    <div className="modal-content">
      <article className="message is-danger">
        <div className="message-header">
          <p>API unreachable</p>
        </div>
        <div className="message-body has-text-centered">
          <p>The SSHMon API appears to be down</p>
          <p>Please wait for reconnection&hellip;</p>
        </div>
      </article>
    </div>
  </div>
)

class App extends React.Component<Props> {
  render() {
    const { info } = this.props.apiState.state.system
    return (
      <div>
        <Header subtitle={!info ? null : <>
          {info.user} @ {info.hostName}
        </>} />

        <div className="container">
          <div className="columns">
            <div className="column is-10 is-offset-1">
              <section className="section">
                <h3 className="title">Hosts</h3>

                {this.props.apiState.state.hosts.map(({ id }) => {
                  return (
                    <Host
                      key={id}
                      id={id}
                      apiClient={this.props.apiClient}
                    />
                  )
                })}

                <HostCreate apiClient={this.props.apiClient} />
              </section>

              <section className="section">
                <h3 className="title">Info</h3>
                <SystemInfo />
              </section>
            </div>
          </div>
        </div>

        <APIDisconnectedModal active={this.props.apiState.status === 'disconnected'} />
      </div>
    )
  }
}

const mapStateToProps = (state: State, ownProps: OwnProps): Props => ({
  apiClient: ownProps.apiClient,
  apiState: state.api
})

export default connect<StateProps, {}, OwnProps, State>(mapStateToProps)(App)
