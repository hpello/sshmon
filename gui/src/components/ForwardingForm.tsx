import * as React from 'react'
import { connect } from 'react-redux'

import { APIClient } from '../api/client'
import { AutoforwardConfig } from '../../../server/src/autoforward/types'
import { ForwardingState } from '../../../server/src/forward/reducer'
import { ForwardingConfig, ForwardingSpec, fwdTypes } from '../../../server/src/forward/types'

import { State } from '../types/redux'

interface OwnProps {
  id: string,
  fwdId: string | null,
  config: ForwardingConfig | null,
  autoConfig: AutoforwardConfig | null,
  apiClient: APIClient
  onClose: () => void
}

interface StateProps {
  forwardings: ForwardingState[]
}

interface Props extends StateProps, OwnProps { }

interface ComponentState {
  readonly id: string,
  fwdId: string,
  label: string,
  autostart: boolean,
  autoretry: boolean,
  type: fwdTypes,
  bind: string,
  target: string
}

const makeSpec = (type: fwdTypes, bind: string, target: string): ForwardingSpec => {
  switch (type) {
  case fwdTypes.dynamic:
    return { type, bind }
  case fwdTypes.local:
  case fwdTypes.remote:
    return { type, bind, target }
  case fwdTypes.http:
    return { type, target }
  }
}

const extractBind = (spec: ForwardingSpec): string => {
  switch (spec.type) {
  case fwdTypes.dynamic:
  case fwdTypes.local:
  case fwdTypes.remote:
    return spec.bind
  case fwdTypes.http:
    return ''
  }
}

const extractTarget = (spec: ForwardingSpec): string => {
  switch (spec.type) {
  case fwdTypes.local:
  case fwdTypes.remote:
  case fwdTypes.http:
    return spec.target
  case fwdTypes.dynamic:
    return ''
  }
}

class ForwardingForm extends React.Component<Props, ComponentState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      id: props.id,
      fwdId: props.fwdId || '',
      label: props.config ? props.config.label : '',
      autostart: props.autoConfig ? props.autoConfig.start : false,
      autoretry: props.autoConfig ? props.autoConfig.retry : false,
      type: props.config ? props.config.spec.type : fwdTypes.local,
      bind: props.config ? extractBind(props.config.spec) : '',
      target: props.config ? extractTarget(props.config.spec) : ''
    }
  }

  isCreate(): boolean {
    return this.props.fwdId === null
  }

  checkIsValidFwdId(): string {
    if (!this.isCreate()) { return '' }
    if (this.state.fwdId === '') { return 'Forwarding ID is required.' }
    if (this.props.forwardings
      .filter(x => x.id === this.props.id)
      .map(x => x.fwdId)
      .includes(this.state.fwdId)) { return 'Forwarding ID is already taken.' }

    return ''
  }

  getErrors(): string[] {
    return [
      this.checkIsValidFwdId()
    ].filter(x => x)
  }

  submit() {
    const { id, fwdId, label, type, bind, target, autostart, autoretry } = this.state
    const spec = makeSpec(type, bind, target)
    const config = {
      label,
      spec
    }
    const autoConfig = { start: autostart, retry: autoretry }
    if (this.isCreate()) {
      this.props.apiClient.forwardingCreate({ id, fwdId, config, autoConfig })
    } else {
      this.props.apiClient.forwardingEdit({ id, fwdId, config, autoConfig })
    }

    this.props.onClose()
  }

  delete() {
    if (this.props.fwdId === null) { return }
    this.props.apiClient.forwardingDelete({ id: this.props.id, fwdId: this.props.fwdId })

    this.props.onClose()
  }

  isValid(): boolean {
    return this.getErrors().length === 0
  }

  onChangeFwdId(event: React.ChangeEvent<{ value: string }>) { this.setState({ ...this.state, fwdId: event.target.value }) }
  onChangeLabel(event: React.ChangeEvent<{ value: string }>) { this.setState({ ...this.state, label: event.target.value }) }
  onChangeAutostart(event: React.ChangeEvent<{ value: string }>) { this.setState({ ...this.state, autostart: event.target.value === 'on' }) }
  onChangeAutoretry(event: React.ChangeEvent<{ value: string }>) { this.setState({ ...this.state, autoretry: event.target.value === 'on' }) }
  onChangeType(event: React.ChangeEvent<{ value: string }>) { this.setState({ ...this.state, type: event.target.value as fwdTypes, bind: '', target: '' }) }
  onChangeBind(event: React.ChangeEvent<{ value: string }>) { this.setState({ ...this.state, bind: event.target.value }) }
  onChangeTarget(event: React.ChangeEvent<{ value: string }>) { this.setState({ ...this.state, target: event.target.value }) }

  render() {
    return (
      <div className="modal is-active">
        <div className="modal-background" />
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{this.isCreate() ? 'New' : 'Edit'} forwarding</p>
            <button className="delete" aria-label="close" onClick={this.props.onClose}></button>
          </header>
          <section className="modal-card-body">

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Host ID</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input className="input" type="text" value={this.state.id} disabled style={{ fontFamily: 'monospace' }}/>
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Forwarding ID</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input className="input" type="text" placeholder="my-cool-forwarding" value={this.state.fwdId} onChange={this.onChangeFwdId.bind(this)} disabled={!this.isCreate()} style={{ fontFamily: 'monospace' }} />
                  </div>
                  <div className="help is-danger">{this.checkIsValidFwdId()}</div>
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
                    <input className="input" type="text" placeholder="My Cool Forwarding" value={this.state.label} onChange={this.onChangeLabel.bind(this)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Type</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <div className="select">
                      <select value={this.state.type} onChange={this.onChangeType.bind(this)}>
                        <option value={fwdTypes.local}>Local</option>
                        <option value={fwdTypes.remote}>Remote</option>
                        <option value={fwdTypes.dynamic}>Dynamic</option>
                        <option value={fwdTypes.http}>HTTP</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Bind</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input className="input" type="text" placeholder="[address:]port, /path/to/sock&hellip;" value={this.state.bind} onChange={this.onChangeBind.bind(this)} disabled={this.state.type === fwdTypes.http} style={{ fontFamily: 'monospace' }}/>
                  </div>
                  <div className="help">{/* TODO hpello add some help here? */}</div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Target</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input className="input" type="text" placeholder="[address:]port, /path/to/sock&hellip;" value={this.state.target} onChange={this.onChangeTarget.bind(this)} disabled={this.state.type === fwdTypes.dynamic} style={{ fontFamily: 'monospace' }}/>
                  </div>
                  <div className="help">{/* TODO hpello add some help here? */}</div>
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
                      /> Yes
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="autostart"
                        checked={!this.state.autostart}
                        value="off"
                        onChange={this.onChangeAutostart.bind(this)}
                        /> No
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
                      /> Yes
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="autoretry"
                        checked={!this.state.autoretry}
                        value="off"
                        onChange={this.onChangeAutoretry.bind(this)}
                      /> No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {this.isCreate() ? null : (<>
              <hr />

              <div className="title is-5">Delete forwarding</div>

              <div className="field">
                <div className="control is-expanded has-text-centered">
                  <button className="button is-danger" onClick={this.delete.bind(this)}>Delete</button>
                </div>
                <div className="help is-expanded has-text-centered">This cannot be undone.</div>
              </div>
            </>)}
          </section>
          <footer className="modal-card-foot" style={{ display: 'block' }}>{/* INFO hpello .buttons modifier is-right does not seem to work without block style */}
            <div className="buttons is-right">
              <button className="button" onClick={this.props.onClose}>Cancel</button>
              <button className="button is-success" onClick={this.submit.bind(this)} disabled={!this.isValid()}>OK</button>
            </div>
          </footer>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: State, ownProps: OwnProps): Props => ({
  ...ownProps,
  forwardings: state.api.state.forwardings
})

export default connect<StateProps, {}, OwnProps, State>(mapStateToProps)(ForwardingForm)
