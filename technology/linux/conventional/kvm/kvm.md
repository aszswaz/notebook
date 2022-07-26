# 简介

KVM(Kernel-based Virtual Machine的缩写)，是内核内建的虚拟机，追求简便的运作。例如运行虚拟机仅需要加载相应的 kvm 模块，但是KVM需要芯片支持虚拟化技术（Intel的VT扩展，或是AMD的AMD-V 扩展）。

在KVM中，可以运行各种GNU/Linux，Windows 或其他系统镜像（例如FreeBSD，MacOS）。每个虚拟机都可以提供独享的虚拟硬件：网卡，硬盘，显卡等（虚拟机甚至可以直通主机设备，例如GPU PCI pass through）。

# 安装 KVM（以 ArchLinux 为例）

**检查处理器是否支持虚拟化：**

KVM需要host的处理器支持虚拟化，通过以下命令查看host是否支持

```bash
$ LC_ALL=C lscpu | grep Virtualization
```

只要有输出就表示支持虚拟化，例如：

```txt
# 这是我本人的（Intel x86）
Virtualization:                  VT-x
# 这是一位博客作者的（AMD的电脑）
Virtualization:                AMD-V
```

**通过软件包管理器安装：**

```bash
# kvm 负责CPU和内存的虚拟化
# qemu 向Guest OS模拟硬件（例如，CPU，网卡，磁盘，等）
# ovmf 为虚拟机启用UEFI支持
# 实际上，这步只需要安装qemu就可以使用虚拟机，但是 qemu-kvm 接口有些复杂，libvirt和virt-manager让配置和管理虚拟机更便捷。
$ sudo pacman -S qemu ovmf
$ sudo 
```

**创建虚拟网络**

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
```

[配置 firewall 开启 NAT 转发](../conventional/internet.md)

**启动虚拟机**

```bash
# 启动虚拟机
# -device virtio-net,netdev=tap0 使用 virtio-net 驱动创建一个名称为 kvm0 的网卡，virtio 是半虚拟化设备，它的效率更高
# -netdev bridge,br=kvm-br,id=kvm0 虚拟机使用 kvm0 网卡，网络模式为 bridge，并且将 kvm0 网卡桥接到 kvm-br0 网卡
$ sudo qemu-system-x86_64 \
    -m "1G,slots=3,maxmem=4G" \
    -smp 2 \
    -device virtio-net,netdev=kvm0 -netdev bridge,br=kvm-br,id=kvm0 \
    -enable-kvm \
    ./demo.qcow2
```

# 常用命令

```bash
# 创建硬盘
$ qemu-img create -f qcow2 demo.qcow2 100G
# 增加虚拟机硬盘容量上限
$ qemu-img resize win10-01.qcow2 +40G

# 启动虚拟机
# -m 设置虚拟机内存大小，单位是 MB
# -cdrom 指定操作系统的安装包，如果虚拟机已经安装操作系统可以不需要它
# -smp 设置虚拟机可用 CPU 数量
$ qemu-system-x86_64 -m 4G -smp 2 -enable-kvm ./demo.qcow2 -cdrom ./demo.iso

# 快照
# 创建快照
$ qemu-img snapshot -c v1.0.0 ./demo.qcow2
# 查看快照
$ qemu-img snapshot -l ./demo.qcow2
# 删除快照
$ qemu-img snapshot -d v1.0.0 ./demo.qcow2
# 回复到快照
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

1. linux 系统已经自带对 virtio 设备的支持，但是 windows10 需要额外安装 [virtio-win](https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md) 驱动
1. 驱动 virtiofs 可以把主机的文件夹映射到虚拟机，virtio-win 中包含这个驱动。在 windows10 系统中，还需要安装 [winfsp](https://winfsp.dev/) ，然后，启动 VirtioFsSvc 服务