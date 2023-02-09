# 简介

Linux 电源管理设置的笔记

# 笔记本合盖

设置笔记本合盖要执行的动作，有两种方式，第一种是编辑 /etc/systemd/logind.conf 文件：

```bash
$ sudo -e /etc/systemd/logind.conf
HandleLidSwitch=ignore
```

可选的动作如下：

| 动作         | 说明         |
| ------------ | ------------ |
| ignore       | 忽略，无动作 |
| poweroff     | 关机         |
| reboot       | 重启         |
| halt         | 停止系统     |
| suspend      | 挂起         |
| hibernate    | 休眠         |
| hybrid-sleep | 混合休眠     |
| lock         | 锁定         |
| kexec        | 锁定         |

如果桌面环境是 xfce，管理电源的软件是 upower，需要编辑 /etc/UPower/UPower.conf 文件：

```bash
$ sudo -e /etc/UPower/UPower.conf
# 忽略合盖
IgnoreLid=true
$ sudo systemctl restart upower
```

