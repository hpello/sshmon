import * as React from 'react'

import { APIClient } from '../api/client'

import ForwardingForm from './ForwardingForm'

interface Props {
  id: string,
  apiClient: APIClient
}

interface ComponentState {
  editIsActive: boolean
}

export default class ForwardingCreate extends React.Component<Props, ComponentState> {
  state = { editIsActive: false }

  render() {
    return (<>
      <div className="columns is-mobile is-gapless is-multiline is-vcentered">
        <div className="column is-narrow" style={{ marginRight: '0.5rem' }}>
          <div className="button is-primary is-small" onClick={() => this.setState({ ...this.state, editIsActive: true })}>
            <span className="icon is-small">
              <i className="fa fa-plus"></i>
            </span>
          </div>
        </div>
        <div className="column is-narrow">
          New forwarding&hellip;
        </div>
      </div>

      {!this.state.editIsActive ? null : (
        <ForwardingForm
          id={this.props.id}
          fwdId={null}
          config={null}
          autoConfig={null}
          apiClient={this.props.apiClient}
          onClose={() => this.setState({ ...this.state, editIsActive: false })}
        />
      )}
    </>)
  }
}
