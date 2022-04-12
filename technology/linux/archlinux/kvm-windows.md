# Arachlinux/Manjaro 在KVM安装windows10虚拟机

## 什么是KVM

KVM(Kernel-based Virtual Machine的缩写)，是内核内建的虚拟机，追求简便的运作。例如运行虚拟机仅需要加载相应的 kvm 模块，但是KVM需要芯片支持虚拟化技术（Intel的VT扩展，或是AMD的AMD-V 扩展）。

在KVM中，可以运行各种GNU/Linux，Windows 或其他系统镜像（例如FreeBSD，MacOS）。每个虚拟机都可以提供独享的虚拟硬件：网卡，硬盘，显卡等（虚拟机甚至可以直通主机设备，例如GPU PCI pass through）。

## 处理器准备

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

## 安装KVM

```bash
$ sudo pacman -S qemu libvirt ovmf virt-manager
```

kvm 负责CPU和内存的虚拟化

qemu 向Guest OS模拟硬件（例如，CPU，网卡，磁盘，等）

ovmf 为虚拟机启用UEFI支持

libvirt 提供管理虚拟机和其它虚拟化功能的工具和API

virt-manager 是管理虚拟机的GUI

注： 实际上，这步只需要安装qemu就可以使用虚拟机，但是qemu-kvm接口有些复杂，libvirt和virt-manager让配置和管理虚拟机更便捷。

## 开启libvirt服务

```bash
$ sudo systemctl start libvirtd
```

## 将用户加入kvm用户组

```bash
$ sudo usermod -a -G kvm ${USER}
```

## 获得windows10系统镜像

[官网下载](https://www.microsoft.com/zh-cn/software-download/windows10ISO)

## 安装win10专用的虚拟驱动

```bash
$ sudo pacman -S virtio-win
```

## 配置 NAT default 网络

编辑`/etc/libvirt/qemu/networks/default.xml`文件，直接把文件的原本内容替换为以下内容

```bash
$ sudo vim /etc/libvirt/qemu/networks/default.xml
```

```xml
<network>
    <name>default</name>
    <bridge name="virbr0"/>
    <forward/>
    <ip address="192.168.122.1" netmask="255.255.255.0">
        <dhcp>
            <range start="192.168.122.2" end="192.168.122.254"/>
        </dhcp>
    </ip>
</network>
```

重启服务，并启动default网络

```bash
$ sudo systemctl restart libvirtd && sudo virsh net-autostart default && sudo virsh net-start default
```

## 使用 virt-manager 创建虚拟机

通过下载的iso文件创建虚拟机实例，傻瓜式的GUI操作，这里不做叙述

## 给虚拟机绑定IP地址

```bash
# 首先找到虚拟机的MAC地址，$VM_NAME 可以通过 virt-manager GUI看到，以我的mac地址为例
$ sudo virsh dumpxml $VM_NAME | grep 'mac address'
      <mac address='52:54:00:a8:b1:4a'/>
# 查看虚拟网络列表
$ virsh net-list
 名称      状态   自动开始   持久
-----------------------------------
 default   活动   是         是
# default 就是网络名称
$ sudo virsh net-edit $NETWORK_NAME
```

```xml
<network>
  <name>default</name>
  <uuid>7eb1048b-af91-48c5-b0d2-721b152a789b</uuid>
  <forward mode='nat'/>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:69:20:17'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
      <host mac='52:54:00:a8:b1:4a' name='win10' ip='192.168.122.3'/>
    </dhcp>
  </ip>
</network>
```

如上所示，通过配置`<dhcp>`的`<host>`绑定网卡的IP，重启网络

```bash
# 删除网络
$ sudo virsh net-destroy default
# 添加并运行网络
$ sudo virsh net-start default
```

## 开启windows10虚拟机和宿主机的文件夹共享（通过smb协议）

配置windows防火墙，启用`文件和打印机共享（SMB-Ln）`入站规则

windows虚拟机开启网络共享，设置网络共享文件夹

回到宿主机这边，查看文件共享是否打开成功

```bash
# 注意这里要求输入密码
$ smbclient -L 192.168.122.3
smbclient: Can't load /etc/samba/smb.conf - run testparm to debug it
Enter WORKGROUP\username's password:
```

```txt

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      远程管理
        C$              Disk      默认共享
        IPC$            IPC       远程 IPC
        Users           Disk      
SMB1 disabled -- no workgroup available
```

挂载SMB

```bash
$ sudo mount -t cifs //192.168.122.3/Users/username public -o user=username,password=passowrd,uid=username,iocharset=utf8
```

public代表的是作为挂载点的宿主机文件夹

## 主机对虚拟机开启所有端口的访问权限

由于不存在网络安全问题，主机可以对虚拟机开放所有端口的访问权限：

```bash
# libvirt 就是 qemu/kvm 给虚拟机创建的防火墙区域，virbr0 就是虚拟机的网卡，注意 protocols 字段没有 tcp 和 udp
$ sudo firewall-cmd --zone=libvirt --list-all
libvirt (active)
  target: ACCEPT
  icmp-block-inversion: no
  interfaces: virbr0
  sources: 
  services: dhcp dhcpv6 dns ssh tftp
  ports: 
  protocols: icmp ipv6-icmp
  forward: no
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules: 
        rule priority="32767" reject
# 开放 tcp 和 udp
$ sudo firewall-cmd --zone=libvirt --permanent --add-protocols tcp
$ sudo firewall-cmd --zone=libvirt --permanent --add-protocols udp
$ sudo firewall-cmd --reload
# 查看操作结果
$ sudo firewall-cmd --zone=libvirt --list-all
libvirt (active)
  target: ACCEPT
  icmp-block-inversion: no
  interfaces: virbr0
  sources: 
  services: dhcp dhcpv6 dns ssh tftp
  ports: 
  protocols: icmp ipv6-icmp tcp udp
  forward: no
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules: 
	rule priority="32767" reject
```



<font color="red">注意</font>

1. 如果没有uid参数，挂载后，没有写权限
2. 需要在关闭虚拟机之前，卸载目录，否则会影响挂载文件夹所在路径的其他文件读写（包括 ls 展开文件）
