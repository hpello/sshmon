import * as React from 'react'
import { connect } from 'react-redux'

import type { APIClient } from '@/gui/api/client'
import type { State } from '@/gui/types/redux'
import type { AutoconnectConfig } from '@/server/autoconnect/types'
import type { HostState } from '@/server/host/reducer'
import type { HostConfig } from '@/server/host/types'

interface OwnProps {
  id: string | null
  config: HostConfig | null
  autoConfig: AutoconnectConfig | null
  apiClient: APIClient
  onClose: () => void
}

interface StateProps {
  hosts: HostState[]
}

interface Props extends StateProps, OwnProps {}

interface ComponentState {
  id: string
  label: string
  autostart: boolean
  autoretry: boolean
  sshHost: string
  sshConfig: { key: string; value: string }[]
}

class HostForm extends React.Component<Props, ComponentState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      id: props.id || '',
      label: props.config ? props.config.label : '',
      autostart: props.autoConfig ? props.autoConfig.start : false,
      autoretry: props.autoConfig ? props.autoConfig.retry : false,
      sshHost:
        props.config && props.config.ssh.host !== props.id
          ? props.config.ssh.host
          : '',
      sshConfig: props.config
        ? Object.entries(props.config.ssh.config).map((x) => ({
            key: x[0],
            value: x[1],
          }))
        : [],
    }
  }

  isCreate(): boolean {
    return this.props.id === null
  }

  checkIsValidId(): string {
    if (!this.isCreate()) {
      return ''
    }
    if (this.state.id === '') {
      return 'ID is required.'
    }
    if (this.props.hosts.map((x) => x.id).includes(this.state.id)) {
      return 'ID is already taken.'
    }
    return ''
  }

  getErrors(): string[] {
    return [this.checkIsValidId()].filter((x) => x)
  }

  submit() {
    const { id, label, sshHost, sshConfig, autostart, autoretry } = this.state
    const config = {
      label,
      ssh: {
        host: sshHost || id,
        config: sshConfig.reduce((acc, val) => {
          acc[val.key] = val.value
          return acc
        }, {} as { [key: string]: string }),
      },
    }
    const autoConfig = { start: autostart, retry: autoretry }
    if (this.isCreate()) {
      this.props.apiClient.hostCreate({ id, config, autoConfig })
    } else {
      this.props.apiClient.hostEdit({ id, config, autoConfig })
    }

    this.props.onClose()
  }

  delete() {
    if (this.props.id === null) {
      return
    }
    this.props.apiClient.hostDelete({ id: this.props.id })

    this.props.onClose()
  }

  isValid(): boolean {
    return this.getErrors().length === 0
  }

  onChangeId(event: React.ChangeEvent<{ value: string }>) {
    this.setState({ ...this.state, id: event.target.value })
  }
  onChangeLabel(event: React.ChangeEvent<{ value: string }>) {
    this.setState({ ...this.state, label: event.target.value })
  }
  onChangeAutostart(event: React.ChangeEvent<{ value: string }>) {
    this.setState({ ...this.state, autostart: event.target.value === 'on' })
  }
  onChangeAutoretry(event: React.ChangeEvent<{ value: string }>) {
    this.setState({ ...this.state, autoretry: event.target.value === 'on' })
  }
  onChangeSSHHost(event: React.ChangeEvent<{ value: string }>) {
    this.setState({ ...this.state, sshHost: event.target.value })
  }
  onChangeSSHConfigKey(
    index: number,
    event: React.ChangeEvent<{ value: string }>
  ) {
    const sshConfig = [...this.state.sshConfig, { key: '', value: '' }]
      .map((x, i) =>
        i === index ? { key: event.target.value, value: x.value } : x
      )
      .filter((x) => x.key || x.value)
    this.setState({ ...this.state, sshConfig })
  }
  onChangeSSHConfigValue(
    index: number,
    event: React.ChangeEvent<{ value: string }>
  ) {
    const sshConfig = [...this.state.sshConfig, { key: '', value: '' }]
      .map((x, i) =>
        i === index ? { key: x.key, value: event.target.value } : x
      )
      .filter((x) => x.key || x.value)
    this.setState({ ...this.state, sshConfig })
  }

  render() {
    return (
      <div className="modal is-active">
        <div className="modal-background" />
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">
              {this.isCreate() ? 'New' : 'Edit'} host
            </p>
            <button
              className="delete"
              aria-label="close"
              onClick={this.props.onClose}
            ></button>
          </header>
          <section className="modal-card-body">
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">ID</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="my-cool-server"
                      value={this.state.id}
                      onChange={this.onChangeId.bind(this)}
                      disabled={!this.isCreate()}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="help is-danger">{this.checkIsValidId()}</div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Label</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="My Cool Server"
                      value={this.state.label}
                      onChange={this.onChangeLabel.bind(this)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">Auto start</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <label className="radio">
                      <input
                        type="radio"
                        name="autostart"
                        checked={this.state.autostart}
                        value="on"
                        onChange={this.onChangeAutostart.bind(this)}
                      />{' '}
                      Yes
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="autostart"
                        checked={!this.state.autostart}
                        value="off"
                        onChange={this.onChangeAutostart.bind(this)}
                      />{' '}
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">Auto retry</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <label className="radio">
                      <input
                        type="radio"
                        name="autoretry"
                        checked={this.state.autoretry}
                        value="on"
                        onChange={this.onChangeAutoretry.bind(this)}
                      />{' '}
                      Yes
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="autoretry"
                        checked={!this.state.autoretry}
                        value="off"
                        onChange={this.onChangeAutoretry.bind(this)}
                      />{' '}
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <div className="title is-5">SSH options</div>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Host</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder={this.state.id}
                      value={this.state.sshHost}
                      onChange={this.onChangeSSHHost.bind(this)}
                    />
                  </div>
                  <div className="help">Defaults to ID if not specified.</div>
                </div>
              </div>
            </div>
            {[...this.state.sshConfig, { key: '', value: '' }].map((x, i) => (
              <div key={i} className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">{i === 0 ? 'Config' : ''}</label>
                </div>
                <div className="field-body">
                  <div className="field is-grouped">
                    <div className="control is-expanded">
                      <input
                        className="input"
                        type="text"
                        placeholder="key"
                        value={x.key}
                        onChange={(e) => this.onChangeSSHConfigKey(i, e)}
                      />
                    </div>
                    <div className="control is-expanded">
                      <input
                        className="input"
                        type="text"
                        placeholder="value"
                        value={x.value}
                        onChange={(e) => this.onChangeSSHConfigValue(i, e)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {this.isCreate() ? null : (
              <>
                <hr />

                <div className="title is-5">Delete host</div>

                <div className="field">
                  <div className="control is-expanded has-text-centered">
                    <button
                      className="button is-danger"
                      onClick={this.delete.bind(this)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="help is-expanded has-text-centered">
                    This cannot be undone.
                  </div>
                </div>
              </>
            )}
          </section>
          <footer className="modal-card-foot" style={{ display: 'block' }}>
            {/* INFO hpello .buttons modifier is-right does not seem to work without block style */}
            <div className="buttons is-right">
              <button className="button" onClick={this.props.onClose}>
                Cancel
              </button>
              <button
                className="button is-success"
                onClick={this.submit.bind(this)}
                disabled={!this.isValid()}
              >
                OK
              </button>
            </div>
          </footer>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: State, ownProps: OwnProps): Props => ({
  ...ownProps,
  hosts: state.api.state.hosts,
})

export default connect(mapStateToProps)(HostForm)
