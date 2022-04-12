# 在 kvm 中创建 windows 虚拟机

## 获得windows10系统镜像

[官网下载](https://www.microsoft.com/zh-cn/software-download/windows10ISO)

## 安装win10专用的虚拟驱动

```bash
$ sudo pacman -S virtio-win
```

## 使用 virt-manager 创建虚拟机

通过下载的iso文件创建虚拟机实例，傻瓜式的GUI操作，这里不做叙述

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

<font color="red">注意</font>

1. 如果没有uid参数，挂载后，没有写权限
2. 需要在关闭虚拟机之前，卸载目录，否则会影响挂载文件夹所在路径的其他文件读写（包括 ls 展开文件）

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

