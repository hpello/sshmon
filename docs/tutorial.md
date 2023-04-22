# Tutorial

This tutorial will guide you in the setup of your first host with SSHMon!

## Knowing your SSH connection

Imagine you want to connect to an SSH server:

- running on host `host.example.com`
- listening on port `8022`
- with user name `ubuntu`
- using a private key file `/path/to/key`

Then your SSH command line looks something like:

```bash
ssh -i /path/to/key -p 8022 ubuntu@host.example.com
```

_Info:_ SSHMon does not support other authentication types than private key.

### The SSH config

To make things easier, SSH allows you to define your own connections or _hosts_ in a config file, usually located at `~/.ssh/config`. All the available options are detailed in `man ssh_config`.

In our case, imagine we want to name our connection `my-host`, you could create the following entry in your config file:

```bash
Host my-host
    Hostname host.example.com
    Port 8022
    User ubuntu
    IdentityFile /path/to/key
```

And now you can connect with:

```bash
ssh my-host

# ^ this is equivalent to:
# ssh -o Port=8022 -o User=ubuntu -o Identityfile=/path/to/key host.example.com
```

## Add your host to SSHMon

If you have declared a host in your SSH config like in the previous section, then your SSHMon setup is straightforward: in the SSHMon GUI, add a new Host with ID `my-host`.

If you did not declare it in your SSH config: in the SSHMon GUI, add a new host with ID `my-host`, and set its SSH host to `host.example.com` and config to:

- `Port`: `8022`
- `User`: `ubuntu`
- `IdentityFile`: `/path/to/key`

_Tip:_ Your host ID is the default value for your SSH host. As a result, in the second case you may as well choose `host.example.com` as your host ID and omit the SSH host option.

And you are all set! Now you can click on the Connect button to establish a connection to your remote host!

## Forward a port

### With SSH

A very powerful feature of SSH is the availability to do port or UNIX socket forwarding. SSH offers 3 types of forwarding. Here is a summary of what you can read in `man ssh`:

1. Local (**L**) port forwarding `local_address:remote_address`:
   - Listens on `local_address` on local host
   - Forwards connections to `remote_address` on remote host
   - Use case: access a service running on remote server directly from your machine
1. Remote (**R**) port forwarding `remote_address:local_address`:
   - Listens on `remote_address` on remote host
   - Forwards connections to `local_address` on local host
   - Use case: deploy a service running on your machine to remote host
1. Dynamic (**D**) port forwarding `local_address`:
   - Listens on `local_address` on local host
   - Deploys a SOCKS proxy
   - Use case: use the remote server as a proxy for HTTP requests made on your machine

#### Use case

For example, imagine you have an HTTP server running on port 8080 on your remote server:

```bash
# on remote server:
cd /var/tmp
echo hello > hi
python3 -m http.server 8080
# keep it running
```

Then you could establish a local port forwarding to your local address `localhost:1234`, using SSH:

```bash
ssh -NT -L localhost:1234:localhost:8080 my-host
# keep it running
```

And, from another shell on your machine, access the running server:

```bash
curl http://localhost:1234/hi
# => hello
```

_Tip:_ You can also set up forwardings with UNIX sockets! The previous example becomes:

```bash
# StreamLocalBindUnlink=yes ensures the local socket is destroyed when SSH is killed
ssh -NT -L /var/tmp/server.sock:localhost:8080 -o StreamLocalBindUnlink=yes my-host
# keep it running
```

```bash
curl --unix-socket /var/tmp/server.sock http://server/hi
# => hello
```

### With SSHMon

SSHMon facilitates the setup of your port forwardings, and saves them for later use. To set up a local forwarding like on our previous example, click on your new host on the GUI, then add a new forwarding:

- Type: Local
- Bind: `localhost:1234` (or just `1234`, see below)
- Target: `localhost:8080` (or just `8080`, see below)

And you are all set!

_Tip:_ If you left the SSH config `GatewayPorts` option to its default value (`no`), SSH will use the loopback address as the bind address in your forwardings (see `man ssh_config` for more info). As a result, you may omit the host part in `localhost:1234`, and only set `1234`.

_Tip:_ For local and remote forwarding, the target address is required by SSH. However, if you leave it empty in SSHMon, it defaults to `localhost`.
