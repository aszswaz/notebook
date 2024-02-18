# [systemd](https://en.wikipedia.org/wiki/Systemd)

systemd is a system and service manager for Linux operating systems.

**manual**: `man systemd`,  `systemd.syntax`, `systemd.unit`, `systemd.service`, `systemd.special`

# service

The service file is the configuration file of the process used by systemd to manage the service, and they are stored in two directory: `/etc/systemd/system` and `/usr/lib/systemd/system`. Service files in `/etc/systemd/system` take precedence over `/usr/lib/systemd/system`. When building a software package, the author of the software usually chooses to place the service file in the `/usr/lib/systemd/system` directory. <font color="red">If you want to modify the software's service file, it is not recommended to modify the service file in the `/usr/lib/systemd/system` directory directly, as the package management system will overwrite it when you upgrade the package.</font>

We can use the following command to create a service file in `/etc/systemd/system` that overrides the package's service file.

```bash
# "--full" means that the original service file is copied exactly.
# "--force" means to create the v2ray.service file if it does not exist.
$ sudo systemctl edit --full v2ray
```

"systemctl" defaults to editing file with nano, the editor can be specified via the environment variable "EDITOR".

The following is a description of the common configuration of service files. For a detailed description of all configurations, please see the manual: `man systemd.service`.

```ini
[Unit]
Description=demo
# Start after network initialization.
After=network.target network-only.target
Wants=network-only.target

[Service]
User=nobody
Type=simple
WorkingDirectory=/etc/system
ExecStart=/usr/bin/zsh -c 'echo Hello World'
Restart=on-failure
RestartSec=30s

[Install]
# see man:systemd.special
WantedBy=default.target
```

# sysctl

sysctl  is  used  to  modify kernel parameters at runtime.  The parameters available are those listed under /proc/sys/.  Procfs is required for sysctl support in Linux. You can use sysctl to both read and write sysctl data.

For example, to modify the size of the UDP buffer:

```bash
$ sudo sysctl -w net.core.rmem_max=2500000
```

The parameters set by sysctl are not permanent, and the parameters need to be written into the configuration file to be permanent. From version 207 and 21x, systemd only applies settings from /etc/sysctl.d/\*.conf and /usr/lib/sysctl.d/\*.conf. If you had customized /etc/sysctl.conf, you need to rename it as /etc/sysctl.d/99-sysctl.conf. If you had e.g. /etc/sysctl.d/foo, you need to rename it to /etc/sysctl.d/foo.conf.
