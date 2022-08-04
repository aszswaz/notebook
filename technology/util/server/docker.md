# Docker

## [创建静态内部网络](https://docs.docker.com/network/)

### 创建一个通过桥接的网络

```bash
$ docker network create -d bridge --subnet 192.168.98.0/24 static
```

--subnet：子网掩码

-d：网络类型，bridge：桥接

static：网络名称

## 直接使用主机的网络堆栈

容器使用主机的网络资源，不使用docker创建的虚拟网络，可以避免NAT的IP转换

```bash
$ docker container run -d -t --name="example" --net=host example
```

<font color="red">注意：使用主机网络，容器开启的端口就不再受到docker控制，而是由主机上的防火墙控制</font>

## 删除 none 镜像

制作失败就会产生坏镜像，可以通过以下指令删除

```bash
$ docker rmi $(docker images | grep "none" | awk '{print $3}')
```

## 容器自动启动，或者容器退出自动重启

```bash
$ docker container run -d -t --name="example" --restart=always example
```

## 开启远程访问

docker 本身就有远程访问配置，我之前也折腾过这个配置，但是随着 docker 的版本升级，它的配置方式总是会出现变化，因此，我不再通过直接配置 docker 来开启远程访问，而是直接通过 ssh 的隧道访问 docker。

