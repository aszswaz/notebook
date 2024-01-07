# [Raspberry Pi OS](https://www.raspberrypi.com/software/)

Raspberry Pi 基金会为 [Raspberry Pi](https://www.raspberrypi.com/) 打造的操作系统

# 关闭 wifi

编辑 `/boot/config.txt`，添加下面的内核启动参数：

```txt
dtoverlay=disable-wifi
```

内核将不会加载 wifi 设备和驱动。==在这之前需要确保有另外可用的登录树莓派的方式，比如以太网或串口登录。==

# 通过串口登录 SHELL

```bash
# 启动一个 TUI 配置树莓派：Interfacing Options -> Serial -> Yes
$ sudo raspi-config
```

硬件方面需要准备一个 [CH340](https://detail.tmall.com/item.htm?_u=52pfas9b55ce&id=631915097812&spm=a1z09.2.0.0.1b692e8dEWFofC) 模块和三根杜邦线，用来进行 USB 数据表和 TTL 数据包的转换，将 GPIO14 接到该模块的 RXD，GPIO15 接到 TXD，GND 接到模块的 GND，GPIO 接口的位置可以通过 `pinout` 命令查找。

# 配置国内软件源

修改以下文件：

```bash
$ cd /etc/apt
$ sudo mv sources.list sources.list.old
$ sudo mv sources.list.d/raspi.list sources.list.d/raspi.list.old
```

sources.list：

```txt
deb http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware
deb-src http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware

deb http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware
deb-src http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware

deb http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware
deb-src http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware

deb https://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
deb-src https://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
```

sources.list.d/raspi.list：

```bash
deb https://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ bookworm main
```

更新软件源和软件包：

```bash
$ sudo apt update
```

更新软件源时可能会出现以下问题：

```txt
...
Get:5 https://mirrors.aliyun.com/debian bookworm-updates InRelease [44.1 kB]
Err:1 http://mirrors.aliyun.com/raspbian/raspbian bookworm InRelease
  The following signatures couldn't be verified because the public key is not available: NO_PUBKEY 9165938D90FDDD2E
Get:6 https://mirrors.aliyun.com/debian bullseye-backports InRelease [49.0 kB]
...
```

异常的原因是软件源仓库的公钥不被信任，解决方法是把公钥加入信任名单：

```bash
$ KEY='9165938D90FDDD2E'
$ sudo gpg --keyserver keyserver.ubuntu.com -recv-keys "$KEY"
$ sudo gpg --export --armor "$KEY" | sudo gpg --dearmour -o /etc/apt/trusted.gpg.d/aliyun.com.gpg
```

**注意事项**

Raspbian 是一个由树莓派社区开发和维护的操作系统，树莓派基金会官方维护的 Raspberry Pi OS 最初是来自于该系统，但是现在它们各自的发展已经分道扬镳，基于 Raspbian 开发的软件大多数是 ARM32 架构的，无法在 Raspberry Pi OS 64bit 中使用。

bookworm 是 debian 系统的版本，其代表 debian 12，bullseye 代表 debian 11，debian 的每一个版本底层变更都很大，如果搞错了会导致很多软件因为依赖关系无法被满足而无法安装，比如 ffmpeg 依赖 x11-common，而 debian bullseye 所携带的该软件包版本无法满足最新版的 ffmpeg。