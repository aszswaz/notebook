# iprouter2

Linux 管理网卡、端口等网络资源的工具主要有 net-tools 和 iproute2，net-tools 已停止维护。

# 网络接口管理

```bash
$ sudo ip link
$ sudo ip link show
# 查看特定接口信息：
$ sudo ip link show wlan1
# 查看接口详细信息：
$ sudo ip -s link show wlan1
# 只看已经激活的接口：
$ sudo ip link show up
# 启动/停止网络接口
$ sudo ip link set wlan1 up
$ sudo ip link set wlan1 down
# 修改接口MTU
$ sudo ip link set wlan1 mtu 1500
# 修改接口MAC地址（需要先关闭接口）
$ sudo ip link set wlan1 down
$ sudo ip link set wlan1 address 00:01:02:03:04:05
$ sudo ip link set wlan1 up
```

# 网卡（接口） IP 管理

```bash
# 查看所有接口：
$ sudo ip addr
$ sudo ip addr show
# 查看特定接口：
$ sudo ip addr show dev wlan1
# 为接口添加一个IP地址，不再使用子网掩码，而是使用CIDR：
$ sudo ip addr add 192.168.1.100/24 brd + dev wlan1
# 使用brd +是默认广播地址，即和下面的语句等价
$ sudo ip addr add 192.168.1.100/24 brd 192.168.1.255 dev wlan1
# 删除接口的指定IP地址
$ sudo ip addr del 192.168.1.100/24 dev wlan1
# 删除接口的全部IP地址
# 同时清除IPv4和IPv6地址
$ sudo ip addr flush dev wlan1
# 仅清除IPv4地址
$ sudo ip addr -4 flush dev wlan1
# 仅清除IPv6地址
$ sudo ip addr -6 flush dev wlan1
```

# 网络状态管理

```bash
# 查看系统中活动的连接
$ ss
# 查看系统中的端口占用情况
$ ss -nlp
# 查看占用端口的进程
$ sudo lsof -i:8080
```

# 路由管理

```bash
# 查看系统路由表
$ sudo ip route
$ sudo ip route show
# 新增路由条目
$ sudo ip route add 192.168.1.0/24 via 192.168.1.100
# 删除路由条目
$ sudo ip route del 192.168.1.0/24 via 192.168.1.100
```

# ARP 管理

```bash
# 查看ARP表
$ sudo ip neigh
$ sudo ip neigh show
# 新增ARP条目
$ sudo ip neigh add 192.168.1.1 lladdr 00:01:02:03:04:05 dev wlan1
# 删除ARP条目
$ sudo ip neigh del 192.168.1.1 lladdr 00:01:02:03:04:05 dev wlan1
```

