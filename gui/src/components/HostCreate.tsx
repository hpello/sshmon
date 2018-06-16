import * as React from 'react'

import { APIClient } from '../api/client'

import HostForm from './HostForm'

interface Props {
  apiClient: APIClient
}

interface ComponentState {
  editIsActive: boolean
}

export default class HostCreate extends React.Component<Props, ComponentState> {
  state = { editIsActive: false }

  render() {
    return (<>
      <div className="buttons is-right">
        <div className="button is-primary" onClick={() => this.setState({ ...this.state, editIsActive: true })}>Add host</div>
      </div>

      {!this.state.editIsActive ? null : (
        <HostForm
          id={null}
          config={null}
          autoConfig={null}
          apiClient={this.props.apiClient}
          onClose={() => this.setState({ ...this.state, editIsActive: false })}
        />
      )}
    </>)
  }
}
