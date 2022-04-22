# libvirt

libvirt是一套用于管理硬件虚拟化的开源API、守护进程与管理工具。此套组可用于管理KVM、Xen、VMware ESXi、QEMU及其他虚拟化技术。libvirt内置的API广泛用于云解决方案开发中的虚拟机监视器编排层（Orchestration Layer）。

## 安装

```bash
$ sudo pacman libvirt libvirt-python libguestfs-tools virt-manager
$ virt-install
$ sudo systemctl enable libvirt && sudo systemctl start libvirt
```

## 虚拟网络

```bash
# 查看网络
$ sudo virsh net-list
# 导出网络配置
$ sudo vitsh net-dumpxml default
# 修改网络配置
$ sudo virsh net-edit default
# 或者创建一个 default.xml 文件，从 xml 文件创建网络，配置与下面等同
$ sudo virsh net-create default.xml
```

**网络 default 配置：**

```xml
<network>
  <name>default</name>
  <uuid>a5dcbc80-be3d-431c-a107-a947e6857d36</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='kvm-br' stp='on' delay='0'/>
  <mac address='52:54:00:f4:99:1d'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
    </dhcp>
  </ip>
</network>
```

**libvirt 启动时自动激活网络：**

```bash
# libvirt 启动时，自动激活网络
$ sudo virsh net-autostart default
# 激活网络
$ sudo virsh net-start default
```

## 启用远程链接

libvirt 的远程链接方式有两种：

* 直接通过 ssh 链接，url 是：qemu+ssh://root@example.com/system
* 通过 TCP 链接，需要额外配置，没有 ssh 加密，速度上应该会快些，url 是：qemu+tcp://www.example.com/system

**配置 TCP 链接：**

```bash
# 这些配置项，大部分都有注释，取消注释即可
$ sudo vi /etc/libvirt/libvirtd.conf
# 禁用 tls
listen_tls = 0
# 启用 tcp
listen_tcp = 1
tcp_port = "16509"
# 禁用认证
auth_tcp = "none"
# 在 libvirtd 的启动参数添加 listen，应用 tcp 配置
$ sudo vi /etc/sysconfig/libvirtd
LIBVIRTD_ARGS="--listen"
# 启用虚拟机图形界面远程链接
$ sudo vi /etc/libvirt/qemu.conf
spice_listen = "0.0.0.0"
vnc_listen = "0.0.0.0"
$ sudo systemctl restart libvirtd
# 防火墙开放端口
$ sudo firewall-cmd --zone=public --add-port='16509/tcp' --permanent && sudo firewall-cmd --reload
```

