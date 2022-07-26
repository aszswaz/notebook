# 防火墙

Linux 的防火墙主要有 firewall 和 iptables，firewall 更加现代化

# firewall

## 开放一个TCP端口

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

## 打印规则中的端口

```bash
$ sudo firewall-cmd --zone=public --list-port
```

## IP封禁

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

