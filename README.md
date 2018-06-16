# SSHMon

SSHMon is a program designed to manage and monitor ssh connections.
It has been tested on Linux and OSX with SSH &geq; 6.7.

![gui-sample.png](https://s7.postimg.cc/elzqf92gp/gui-sample.png)

## How it works

SSHMon builds on top of the SSH "Control Master" feature, that facilitates port forwarding setup.

## Disclaimer

- SSHMon Features (e.g. SSH host definition and connection) are exposed through the GUI. As a consequence, extreme care should be taken to make sure it is only reachable by you. Use at your own risk.
- SSHMon is still at an early stage of development, as a result some things might not work and we might introduce some breaking changes... Any feedback will be greatly appreciated!

## Features

- Nice GUI
- SSH port/socket forwarding management
- Configuration with YAML file
- Automatic start and retry of connection and port forwarding
- HTTP forwarding

## Get started

Download the [latest release](https://github.com/hpello/sshmon/releases/latest) of SSHMon for your system and unpack it. Run the `sshmon` binary:

```bash
./sshmon
```

Then you can access the web GUI at <http://localhost:8377>.

Go and have a look at the [Tutorial](docs/tutorial.md) to set up your first host!

### Build from source

```bash
npm run install-all
npm run build
node server/build/cli.js
```

## Configure

You can set up SSH connections through the GUI or with a configuration file.

By default, SSHMon will create a config file located at `~/.sshmon/config.yml`.
You also may specify your own configuration file on the command line.

Head over to the [Configuration](docs/configuration.md) page for more details.

## Logging

Logging is handled by the [bunyan](https://github.com/trentm/node-bunyan) library. A `bunyan` process is launched along with SSHMon and writes logs to stderr.

By default, if stderr is a TTY, the logs are pretty-printed, else they are written in a JSON format.
You may use the `BUNYAN_OPTS` environment variable to choose which args are passed to the `bunyan` process, e.g.:

```bash
BUNYAN_OPTS='-l debug' ./sshmon
```

## Troubleshooting

- So far, only public/private key authentication is supported.
- Before trying to connect to a host through SSHMon, make sure you can connect to it with SSH on the command line.

## Built with

SSHMon was developped thanks to the following projects (this list is not exhaustive!):

- [Typescript](https://www.typescriptlang.org/)
- [TSLint](https://palantir.github.io/tslint/)
- [React.js](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Bulma](https://bulma.io/)
- [Bulmaswatch](https://jenil.github.io/bulmaswatch/)
- [Socket.io](https://socket.io/)
- [Bunyan](https://github.com/trentm/node-bunyan)
- [Pkg](https://github.com/zeit/pkg)

## TODO

- Allow to change GUI address
- Offer multiple GUI themes
- Allow custom global SSH config options
- Use BatchMode for `ProxyJump` SSH hosts
