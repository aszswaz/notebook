# [systemd](https://en.wikipedia.org/wiki/Systemd)

systemd is a system and service manager for Linux operating systems.

**manual**: `man systemd`,  `systemd.syntax`, `man systemd.unit`, `man systemd.service`

# service

There are many systemd configuration items, so only the commonly used service configuration templates are recorded here.

```ini
[Unit]
Description=demo
# Start after network initialization.
After=network.target network-only.target
Wants=network-only.target

[Service]
Type=simple
ExecStart=/usr/bin/zsh -c 'echo Hello World'
Restart=always
RestartSec=30s

[Install]
WantedBy=multe-user.target
```

# sysctl

sysctl  is  used  to  modify kernel parameters at runtime.  The parameters available are those listed under /proc/sys/.  Procfs is required for sysctl support in Linux. You can use sysctl to both read and write sysctl data.

For example, to modify the size of the UDP buffer:

```bash
$ sudo sysctl -w net.core.rmem_max=2500000
```

The parameters set by sysctl are not permanent, and the parameters need to be written into the configuration file to be permanent. From version 207 and 21x, systemd only applies settings from /etc/sysctl.d/\*.conf and /usr/lib/sysctl.d/\*.conf. If you had customized /etc/sysctl.conf, you need to rename it as /etc/sysctl.d/99-sysctl.conf. If you had e.g. /etc/sysctl.d/foo, you need to rename it to /etc/sysctl.d/foo.conf.
