# Configuration

You can set up SSH connections through the GUI or with a configuration file.

## Configuration file example

```yaml
hosts:

  - host-1:
      label: My Favourite Host
      ssh:
        host: my.host.com
        config:
          ServerAliveInterval: 5
          ServerAliveCountMax: 3
      autostart: true
      autoretry: true
      forward:
        - forwarding-1:
            label: My HTTP server
            spec: L 1234 localhost:8080
            autostart: true
            autoretry: true
        - forwarding-2: R 8022 22 # forwarding shorthand syntax
        - sshmon: H 8377 # forwarding shorthand syntax

  - host-2: # host shorthand syntax

config:

  autosave: true
```

## Hosts

SSHmon is not a replacement of your SSH config!

Actually, it is recommended you set up first your host in your SSH config file (by default `~/.ssh/config`), before adding it to your SSHmon config.

- Syntax

    ```yaml
    hosts:
      - host-id-1:
          # host config
      - host-id-2:
          # host config
      ...
    ```

- List of available options

    | Option | Type | Description | Required | Default |
    | ------ | ---- | ----------- | -------- | ------- |
    | label | string | Friendly name for the GUI | no | '' |
    | ssh.host | string | Host passed to SSH | no | host id |
    | ssh.config | object | Options passed to SSH as `-o key=value` | no | {} |
    | autostart | boolean | Try to connect to host at SSHmon startup | no | false |
    | autoretry | boolean | Try to reconnect to host on connection error | no | false |
    | forward | object | Forwardings for this host | no | {} |

## Forwardings

SSHmon allows you to define port/socket forwarding on your SSH connections. Here are the possible forwardings:

| Type | Bind | Target |
| ---- | ---- | ------ |
| Local | `[address:]port` or unix socket (local) | `[address:]port` or unix socket (remote) |
| Remote | `[address:]port` or unix socket (remote) | `[address:]port` or unix socket (local) |
| Dynamic | `[address:]port` (local) | |
| HTTP | | `[address:]port` or unix socket (remote) |

Please read the SSH documentation for local, remote and dynamic types.

### HTTP forwarding

The HTTP forwarding type is specific to SSHmon.
It establishes a local port forwarding to a unix socket managed by SSHmon, and allows access to the remote port/socket through the GUI.

It was designed to allow easy access to a remote running SSHmon instance, but should also work for other HTTP services that can be mounted under an arbitrary HTTP path prefix.

### Default address values

- For the `bind` parameter, if you do not specify an address, SSH has its own policy for the default interface it will bind to.
- For the `target` parameter, SSH normally requires you to specify an interface. With SSHmon you may specify a single port value, the default interface being `localhost`.

### Forwarding config

- Syntax

    ```yaml
    # inside host config:
    forward:
      - forwarding-1:
           # forwarding config
      - forwarding-2:
           # forwarding config
    ```

- List of available options for a forwarding

    | Option | Type | Description | Required | Default |
    | ------ | ---- | ----------- | -------- | ------- |
    | label | string | Friendly name for the GUI | no | '' |
    | spec | string | Forwarding specifiation | yes |  |
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
      - forward-1: L localhost:1234 localhost:8080
      - forward-2: H 8377
    ```

## Config

- Syntax

    ```yaml
    config:
      autosave: true
    ```

- List of available options for config

    | Option | Type | Description | Required | Default |
    | ------ | ---- | ----------- | -------- | ------- |
    | autosave | boolean | Write to this file on config change | no | false |
