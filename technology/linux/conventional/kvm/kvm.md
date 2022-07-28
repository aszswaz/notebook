# 简介

KVM(Kernel-based Virtual Machine的缩写)，是内核内建的虚拟机，追求简便的运作。例如运行虚拟机仅需要加载相应的 kvm 模块，但是KVM需要芯片支持虚拟化技术（Intel的VT扩展，或是AMD的AMD-V 扩展）。

在KVM中，可以运行各种GNU/Linux，Windows 或其他系统镜像（例如FreeBSD，MacOS）。每个虚拟机都可以提供独享的虚拟硬件：网卡，硬盘，显卡等（虚拟机甚至可以直通主机设备，例如GPU PCI pass through）。

# 安装 KVM（以 ArchLinux 为例）

只要有输出就表示支持虚拟化，例如：

```bash
# 检查 CPU 是否开启虚拟化支持，KVM需要host的处理器支持虚拟化，通过以下命令查看host是否支持
$ LC_ALL=C lscpu | grep Virtualization
# 这是我本人的（Intel x86）
Virtualization:                  VT-x
# 这是一位博客作者的（AMD 的电脑）
Virtualization:                AMD-V
# kvm 负责CPU和内存的虚拟化
# qemu 向 guest OS 模拟硬件（例如，CPU，网卡，磁盘，等）
# ovmf 为虚拟机启用UEFI支持
# 实际上，这步只需要安装qemu就可以使用虚拟机，但是 qemu-kvm 接口有些复杂，libvirt 和 virt-manager 让配置和管理虚拟机更便捷。
# qemu-desktop 适用于有 GUI 的计算机上，启动虚拟机时，qemu 会给虚拟机创建一个 GUI 窗口
# qemu-base 则适用于没有 GUI 的计算机，qemu 会为虚拟机启动 VNC
$ sudo pacman -S qemu-desktop ovmf
$ sudo pacman -S libvirt virt-manager
```

# 创建并启动虚拟机

## 创建虚拟机

```bash
# 创建虚拟磁盘
$ qemu-img create -f qcow2 demo.qcow2 100G
# 使用 iso 镜像，安装虚拟机操作系统
$ qemu-system-x86_64 -m 2G -cpu host -smp "2,sockets=1,cores=1,threads=2,maxcpus=2" -enable-kvm ./demo.qcow2 -cdrom ./demo.iso
```

## 主机和虚拟机的网络互通

qemu 默认是通过软件模拟的方式，给虚拟机创建一个单独的内部网络，这种方式的好处是无需进行配置，虚拟机就可以进行网络连接，它的弊端是虚拟机主动连接主机，而主机无法连接虚拟机。如果想要主机可以连接虚拟机，并且不影响虚拟机连接互联网，则需要通过主机操作系统的虚拟往桥功能才能实现。

```bash
# 创建网桥
$ sudo brctl addbr kvm-br
# 使用 iproute2 配置网桥
$ sudo ip addr add '192.168.122.1/24' dev kvm-br
$ sudo ip link set kvm-br up
# 配置 firewall，开启 NAT 功能
...
# 在网桥上启用 DHCP，如果是希望给虚拟机配置静态 IP，则不需要这个
# $ sudo dnsmasq --interface=kvm-br --bind-interfaces --dhcp-range=127.0.0.2,127.0.0.254
# 启动虚拟机
$ sudo qemu-system-x86_64 \
    -m 4G \
    -smp "cpus=2,sockets=1,cores=1,threads=2,maxcpus=2" \
    -device virtio-net,netdev=kvm0 -netdev bridge,br=kvm-br,id=kvm0 \
    -enable-kvm \
    ./demo.qcow2
```

[配置 firewall 开启 NAT 转发](../conventional/network-card.md)

# 常用命令

```bash
# 创建硬盘
$ qemu-img create -f qcow2 demo.qcow2 100G
# 增加虚拟机硬盘容量上限
$ qemu-img resize win10-01.qcow2 +40G
# 创建快照
$ qemu-img snapshot -c v1.0.0 ./demo.qcow2
# 查看快照
$ qemu-img snapshot -l ./demo.qcow2
# 删除快照
$ qemu-img snapshot -d v1.0.0 ./demo.qcow2
# 恢复到快照
$ qemu-img snapshot -a v1.0.0 ./demo.qcow2
```

# 相关工具

**virt-manager**

通过可视化窗口管理 qemu 虚拟机

```bash
$ sudo pacman -S virt-manager
# 启动虚拟机服务
$ sudo systemctl start libvirtd
```

# 注意事项

1. linux 系统已经自带对 virtio 设备的支持，但是 windows 10 需要额外安装 [virtio-win](https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md) 驱动
1. 驱动 virtiofs 可以把主机的文件夹映射到虚拟机，virtio-win 中包含这个驱动。在 windows10 系统中，还需要安装 [winfsp](https://winfsp.dev/) ，然后，启动 VirtioFsSvc 服务

# 参数解释

## qemu-system-x86_64

qemu 虚拟机执行程序

### -m

指定虚拟机可用内存大小

### -smp

虚拟机的 CPU 配置

cpus：CPU 逻辑核心的初始数量，必须小于 maxcpus

sockets：虚拟 CPU 插槽，这个仅作用于虚拟机，与主机无关，通常设置为 1 个就行

cores：虚拟机可用的物理 CPU 核心，通常是物理 CPU 核心数的一半

threads：单个 CPU 核心的线程数，2 或者 1，2 表示开启 Intel 超线程技术

maxcpus：最多可用 N 个逻辑 CPU，值必须是 sockets \* cores \* threads

### -cdrom

使用 iso 镜像文件给虚拟机创建一个 CD 驱动器，通常用于虚拟机安装操作系统

### -device

创建虚拟设备，参数根据设备类型的不同而不同

第一个参数：设备驱动，比如：virtio-net

网络设置参数：

netdev：网络设备 ID

### -netdev

配置虚拟网络设备

第一个参数：网络类型，比如：bridge（网络桥接）

br：主机中已存在的桥接网卡

id：虚拟网络设备 ID，与 -device 的 netdev 参数一致

### -cpu

CPU 模式，该参数的可选值有很多，常用的只有两个

host：直接使用主机的 CPU 型号，启用主机 CPU 支持的全部功能

qemu64：qemu 模拟的 CPU 型号，默认值