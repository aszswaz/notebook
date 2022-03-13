# Linux 网络

## 配置网卡

以网卡enp7s0为例：

```bash
# 查看电脑安装的网卡
$ ip link
enp7s0 ......
enp9s0 ......
# 如果不存在`/etc/sysconfig/network-scripts/`目录就先创建该目录
$ cd /etc/sysconfig/network-scripts/
# 没有该文件就创建该文件
$ vim ifcfg-enp7s0
```

```txt
# 类型，以太网
TYPE="Ethernet"
# 网卡名称
DEVICE="enp7s0"
# 使用静态IP地址
BOOTPROTO="static"
# 系统启动时加载
ONBOOT="yes"
# 配置名称
NAME="enp7s0"
# IP地址
IPADDR="192.168.0.119"
# 子网掩码: 255.255.255.0
PREFIX="24"
# 默认网关
GATEWAY="192.168.1.1"
# 主DNS
DNS1="114.114.114.114"
# 备用DNS
DNS2="8.8.8.8"
```

## 网络共享

现有机器A、机器B，能够公司交换机的网线只有一根，机器A有两个网卡：enp7s0、enp9s0，机器B网卡：enp0s20，还有一根自己购买的网线。首先将机器A的enp7s0网卡接入交换机的网线，再将A的enp9s0与B的enp0s20用网线对接，最后是进行两台机器上的网络配置。

配置方案有两种：网络桥接、网络地址转换

### 网络桥接（network bridging）

以下内容摘抄自[维基百科：桥接器](https://zh.wikipedia.org/wiki/%E6%A9%8B%E6%8E%A5%E5%99%A8)

桥接器在功能上与[集线器](https://zh.wikipedia.org/wiki/集线器)等其他用于连接网段的设备类似，不过后者工作在[物理层](https://zh.wikipedia.org/wiki/物理层)（OSI模型第1层）。

网桥能够识别数据链路层中的数据帧，并将这些数据帧临时存储于内存，再重新生成信号作为一个全新的数据帧转发给相连的另一个网段（network segment）。由于能够对数据帧拆包、暂存、重新打包（称为存储转发机制 store-and-forward），网桥能够连接不同技术参数传输速率的数据链路，如连接10BASE-T与100BASE-TX。

linux具备网络桥接的功能，可以实现将 enp7s0 接受到的数据帧转发到 enp9s0、enp0s20 组成的网络，达到交换机 $\rightleftharpoons$ enp7s0 $\rightleftharpoons$ enp9s0 $\rightleftharpoons$ enp0s20 的目的。配置方式如下：

```bash
# 进入网卡配置脚本目录
$ cd /etc/sysconfig/network-scripts/
# 首先配置 enp7s0
$ vim ifcfg-enp7s0
```

```txt
TYPE=Ethernet
BOOTPROTO=none
NAME=enp7s0
DEVICE=enp7s0
ONBOOT=yes
BRIDGE=bridge0
```

<font color="green">`BRIDGE`是网桥网卡的名称</font>

```bash
# 配置enp9s0
$ vim ifcfg-enp9s0
```

```txt
TYPE=Ethernet
BOOTPROTO=none
NAME=enp9s0
DEVICE=enp9s0
ONBOOT=yes
BRIDGE=bridge0
```

创建网桥网卡

```bash
$ vim ifcfg-bridge0
```

```txt
TYPE=Bridge
BOOTPROTO=static
IPADDR=192.168.0.119
GATEWAY=192.168.0.1
DNS1=114.114.114.114
DNS2=8.8.8.8
ONBOOT=yes
PREFIX=24
DEFROUTE=yes
NAME=bridge0
DEVICE=bridge0
```

重启NetworkManager

```bash
$ sudo systemctl restart NetworkManager
```

### 网络地址转换（**N**etwork **A**ddress **T**ranslation）

缩写：NAT，又称网络掩蔽、IP掩蔽。在[计算机网络](https://zh.wikipedia.org/wiki/計算機網絡)中是一种在IP[数据包](https://zh.wikipedia.org/wiki/封包)通过[路由器](https://zh.wikipedia.org/wiki/路由器)或[防火墙](https://zh.wikipedia.org/wiki/防火墙)时重写来源[IP地址](https://zh.wikipedia.org/wiki/IP地址)或目的IP地址的技术。这种技术被普遍使用在有多台主机但只通过一个公有IP地址访问[互联网](https://zh.wikipedia.org/wiki/網際網路)的[私有网络](https://zh.wikipedia.org/wiki/私有网络)中。它是一个方便且得到了广泛应用的技术。当然，NAT也让主机之间的通信变得复杂，导致了通信效率的降低。

摘自[维基百科：网络地址转换](https://zh.wikipedia.org/wiki/%E7%BD%91%E7%BB%9C%E5%9C%B0%E5%9D%80%E8%BD%AC%E6%8D%A2)

实际使用起来，与网桥的区别在于只能是机器B主动向网络中其他的主机发起连接，而其他主机无法感知到机器B的存在。举个例子，假设机器A enp7s0网卡的IP为192.168.0.119，而机器B的IP是192.168.24.2，机器B向192.168.0.121的主机C发起连接，C看到的来源IP就是192.168.0.119，而不是192.168.24.2。如果机器B并不用作服务器，那么这种方案也是可行的。配置方式如下：

首先主机A：

en7s0 网卡

```bash
$ vim ifcfg-enp7s0
```

```txt
TYPE=Ethernet
BOOTPROTO=static
NAME=enp7s0
DEVICE=enp7s0
ONBOOT=yes
IPADDR=192.168.0.119
GATEWAY=192.168.0.1
PREFIX=24
DEFROUTE=yes
DNS1=114.114.114.114
DNS2=8.8.8.8
```

enp9s0 网卡

```bash
$ vim ifcfg-enp9s0
```

```txt
TYPE=Ethernet
BOOTPROTO=static
NAME=enp9s0
DEVICE=enp9s0
ONBOOT=yes
IPADDR=192.168.24.1
PREFIX=24
DEFROUTE=yes
```

<font color="red">enp9s0 不需要网关配置（GATEWAY）、DNS配置</font>

机器B:

enp0s20 网卡

```bash
$ vim ifcfg-enp0s20
```

```txt
TYPE=Ethernet
BOOTPROTO=static
NAME=enp0s20
DEVICE=enp0s20
ONBOOT=yes
IPADDR=192.168.24.2
GATEWAY=192.168.24.1
PREFIX=24
DEFROUTE=yes
DNS1=114.114.114.114
DNS2=8.8.8.8
```

<font color="red">enp0s20 需要与 enp9s20 子网掩码（PREFIX）相同，所处网段也要相同。这里子网掩码是 24，网段是 192.168.24.0</font>

NAT的配置主要是通过防火墙来完成，目前主流的防火墙是iptables和firewalld，先讲解iptables的NAT配置方法：

```bash
# 进入超级用户模式
$ sudo -i
# 开启IP转换
$ echo 1 > /proc/sys/net/ipv4/ip_forward
$ iptables -F
$ iptables -P INPUT ACCEPT
$ iptables -P FORWARD ACCEPT
# enp7s0 为A主机接入交换器的网卡
$ iptables -t nat -A POSTROUTING -o enp7s0 -j MASQUERADE
# 保存规则
$ service iptables save
```

firewalld的NAT配置方法：

```bash
# 操作过程中，firewalld需要编辑网卡文件，这个动作会被SELinux阻拦，需要临时关闭SELinux
$ setenforce 0
# 启用IP转发
$ echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf.d/ipv4_forward.conf
# 使配置生效
$ sysctl -p /etc/sysctl.conf.d/ipv4_forward.conf
# 修改网卡的规则区域
# 外部区域，表示从这个网卡过来的连接，不受信任，enp7s0接入了互联网，从互联网过来的连接都不可信任
$ sudo firewall-cmd --permanent --zone=public --change-interface=enp7s0
# 信任区域，enp9s0 是内部网卡，所有连接都信任
$ sudo firewall-cmd --permanent --zone=trusted --change-interface=enp9s0
# 打开NAT的IP伪装
$ sudo firewall-cmd --zone=public --add-masquerade --permanent
# 设置NAT规则，将来自指定网段的数据包，伪装成enp7s0的IP地址
$ sudo firewall-cmd --zone=public --permanent --add-rich-rule='rule family=ipv4 source address=192.168.24.0/24 masquerade'
# 生效配置
$ sudo firewall-cmd --reload
```

<font color="red">注意事项：</font>

1. firewalld 和  iptables之间会出现冲突，使用firewalld就不能使用iptables。
2. 操作firewalld进行NAT转发，需要关闭SELinux的时候，建议临时关闭就行，因为Docker运行容器需要用到SELinux，如果永久关闭SELinux，会直接导致docker无法启动容器
2. 本示例中 enp7s0 是网络出口网卡，它的规则区域需要慎重选择，这直接影响到外来流量是否可以访问本机的特定端口，我一般把端口的开放规则配置在 public 区域，所以我把 enp7s0 网卡添加到 public 。

## firewalld 防火墙

### 开放一个TCP端口

准备工作：

```bash
# 查看防火墙规则
$ firewall-cmd --get-zones
block dmz drop external home internal public trusted work
# 查看当前防火墙启用的规则
$ firewall-cmd --get-default-zone
public
```

配置规则，开放端口，主要有两种方式，第一种：

```bash
# 在public规则中添加开放的端口
$ sudo firewall-cmd --zone=public --add-port=10808/tcp
# 目前的配置属于运行时配置，防火墙重启就会无效，需要进行持久化
$ sudo firewall-cmd --runtime-to-permanent
```

第二种：

```bash
# 不同于第一种，这是创建一个永久配置，但是还没有被防火墙应用
$ sudo firewall-cmd --permanent --zone=public --add-port=10809/tcp
# 应用配置
$ sudo firewall-cmd --reload
```

### 打印规则中的端口

```bash
$ sudo firewall-cmd --zone=public --list-port
```

### IP封禁

指定IP，指定端口的规则：

```bash
# 客户端IP允许访问某个端口
$ sudo firewall-cmd --permanent --add-rich-rule="rule family=ipv4 source address=127.0.0.1 port port=80 protocol=tcp accept" && sudo firewall-cmd --reload
# 客户端IP禁止访问某个端口
$ sudo firewall-cmd --permanent --add-rich-rule="rule family=ipv4 source address=127.0.0.1 port port=80 protocol=tcp reject" && sudo firewall-cmd --reload
# 删除指定的访问规则
$ sudo firewall-cmd --permanent --remove-rich-rule="rule family=ipv4 source address=127.0.0.1 port port=80 protocol=tcp accept" && sudo firewall-cmd --reload
# 删除指定的封禁规则
$ sudo firewall-cmd --permanent --remove-rich-rule="rule family=ipv4 source address=127.0.0.1 port port=80 protocol=tcp reject" && sudo firewall-cmd --reload
```

上述操作中 address 为IP，protocol 是协议：tcp、udp，accept 接受访问，reject 是拒绝访问。

## 打开1024以下的端口

1024以下的端口，在linux系统中，普通用户运行的程序是不能使用的，解决办法如下：

1. 程序以root用户运行

2. 给程序打开端口的权限

    ```bash
    # 给指定程序设置 CAP_NET_BIND_SERVICE 能力
    $ sudo setcap cap_net_bind_service=+eip /path/to/application
    # 不再需要使用这个能力，可以使用以下命令来清除。
    $ sudo setcap -r /path/to/application
    ```
