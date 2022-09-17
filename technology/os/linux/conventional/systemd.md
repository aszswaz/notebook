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

