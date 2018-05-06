# SSHmon

SSHmon is a program designed to manage and monitor ssh connections.
Still at an early stage of development, it has been tested on Linux and OSX with SSH &geq; 6.7.

![gui-sample.png](https://s7.postimg.cc/elzqf92gp/gui-sample.png)

## How it works

SSHmon builds on top of the SSH "Control Master" feature, that facilitates port forwarding setup.

## Disclaimer

SSHmon Features (e.g. SSH host definition and connection) are exposed through the GUI. As a consequence, extreme care should be taken to make sure it is only reachable by you. Use at your own risk.

## Features

- Nice GUI
- SSH port/socket forwarding management
- Configuration with YAML file
- Automatic start and retry of connection and port forwarding
- HTTP forwarding

## Get started

Get the [latest release](https://github.com/hpello/sshmon/releases/latest) of SSHmon for your system.

Or, build it from source.

- Install:
    ```bash
    npm run install-all
    npm run deploy
    ```

- Run:
    ```bash
    build/sshmon -h
    ```

And access the GUI at <http://localhost:8377>.

See [logging](#logging) for output options.

## Configure

You can set up SSH connections through the GUI or with a configuration file.

By default, sshmon will create a config file located at `~/.sshmon/config.yml`.
You also may specify your own configuration file.

### Hosts

SSHmon is not a replacement of your SSH config!

Actually, it is recommended you set up first your host in your SSH config file (by default `~/.ssh/config`), before adding it to your SSHmon config.

- Syntax

    ```yaml
    hosts:
      host-id-1:
        # host config
      host-id-2:
        # host config
      ...
    ```

- List of available options

    | Option | Type | Description | Required | Default |
    | ------ | ---- | ----------- | -------- | ------- |
    | label | string | Friendly name for the GUI | no | '' |
    | ssh.host | string | Host passed to ssh | no | host id |
    | ssh.config | object | Options passed to ssh as `-o key=value` | no | {} |
    | autostart | boolean | Try to connect to host at SSHmon startup | no | false |
    | autoretry | boolean | Try to reconnect to host on connection error | no | false |
    | forward | object | Forwardings for this host | no | {} |

### Forwardings

SSHmon allows you to define port/socket forwarding on your SSH connections. Here are the possible forwardings:

| Type | Bind | Target |
| ---- | ---- | ------ |
| Local | `[address:]port` or unix socket (local) | `[address:]port` or unix socket (remote) |
| Remote | `[address:]port` or unix socket (remote) | `[address:]port` or unix socket (local) |
| Dynamic | `[address:]port` (local) | |
| HTTP | | `[address:]port` or unix socket (remote) |

Please read the SSH documentation for local, remote and dynamic types.

#### HTTP forwarding

The HTTP forwarding type is specific to SSHmon.
It establishes a local port forwarding to a unix socket managed by SSHmon, and allows access to the remote port/socket through the GUI.

It was designed to allow easy access to a remote running SSHmon instance, but should also work for other HTTP services that can be mounted under an arbitrary HTTP path prefix.

#### Default address values

- For the `bind` parameter, if you do not specify an address, SSH has its own policy for the default interface it will bind to.
- For the `target` parameter, SSH normally requires you to specify an interface. With SSHmon you may specify a single port value, the default interface being `localhost`.

#### Forwarding config

- Syntax

    ```yaml
    # inside host config:
    forward:
      forward-1:
         # forwarding config
      forward-2:
         # forwarding config
    ```

- List of available options for a forwarding

    | Option | Type | Description | Required | Default |
    | ------ | ---- | ----------- | -------- | ------- |
    | label | string | Friendly name for the GUI | no | '' |
    | spec | string | Host passed to ssh | yes |  |
    | autostart | boolean | Try to forward at host connection | no | false |
    | autoretry | boolean | Retry to forward on error | no | false |

- Spec

    Similarly to the SSH forwarding syntax, the spec syntax is:
    ```bash
    Letter [bind] [target]
    ```

    Where the options are required following the given table:

    | Type | Letter | Bind | Target |
    | ---- | ------ | ---- | ------ |
    | Local | `L` | &#10003; | &#10003; |
    | Remote | `R` | &#10003; | &#10003; |
    | Dynamic | `D` | &#10003; | |
    | HTTP | `H` | | &#10003; |

- Forwarding shorthand syntax

    You may replace the whole options object with the single spec string, e.g.:

    ```yaml
    forward:
      forward-1: spec1
      forward-2: spec2
    ```

### Config

- Syntax

    ```yaml
    config:
      autosave: true
    ```

- List of available options for config

    | Option | Type | Description | Required | Default |
    | ------ | ---- | ----------- | -------- | ------- |
    | autosave | boolean | Write to this file on config change | no | false |

### Configuration file example

```yaml
hosts:

  host-1:
    label: My Favourite Host
    ssh:
      host: my.host.com
      config:
        ServerAliveInterval: 5
        ServerAliveCountMax: 3
    autostart: true
    autoretry: true
    forward:
      forwarding-1:
        label: My TCP service
        spec: L 1234 localhost:80
        autostart: true
        autoretry: true
      forwarding-2: R 8022 22 # forwarding shorthand
      sshmon: H 8377

  host-2: # host shorthand

config:

  autosave: true
```

## Logging

Logging is done using the [bunyan](https://github.com/trentm/node-bunyan) library. For pretty format, pipe `sshmon` output to `bunyan`, e.g.:

```bash
build/sshmon | server/node_modules/.bin/bunyan
```

Tip: You can set `NODE_ENV=production` for more concise logs.

## Troubleshooting

- So far, only public/private key authentication is supported.
- Before trying to connect to a host through SSHmon, make sure you can connect to it with SSH on the command line.

## Built with

SSHmon was developped thanks to the following projects (this list is not exhaustive!):

- [Typescript](https://www.typescriptlang.org/)
- [TSLint](https://palantir.github.io/tslint/)
- [React.js](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Bulma](https://bulma.io/)
- [Bulmaswatch](https://jenil.github.io/bulmaswatch/)
- [Socket.io](https://socket.io/)
- [Pkg](https://github.com/zeit/pkg)

## TODO

- Add a test suite
- Add a tutorial
- Distribute releases
- Allow to change GUI address
- Offer multiple GUI themes
- Allow custom global SSH config options
- Use BatchMode for `ProxyJump` SSH hosts
- Improve logging
