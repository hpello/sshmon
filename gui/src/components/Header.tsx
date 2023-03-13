import * as React from 'react'

type Props = {
  subtitle: React.ReactNode | null
}

const Header = (props: Props) => (
  <section className="hero is-primary">
    <div className="hero-body">
      <div className="container">
        <h1 className="title">SSHMon</h1>
        <h2 className="subtitle">{props.subtitle}</h2>
      </div>
    </div>
  </section>
)
export default Header
