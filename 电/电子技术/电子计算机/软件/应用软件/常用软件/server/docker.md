# 简介

docker 的使用文档

# 安装

```bash
# archlinux
$ sudo pacman -S docker
```

# 常用指令

```bash
# 启动容器
$ docker container run --name="demo" -d -t demo
# 制作失败就会产生无效镜像，可以通过以下指令删除
$ docker rmi $(docker images | grep "none" | awk '{print $3}')
# 创建网桥网络，IP 的分配方式为静态分配
# --subnet：子网掩码
# -d：网络类型，bridge：桥接
# static：网络名称
$ docker network create -d bridge --subnet 192.168.98.0/24 static
# 容器使用主机的网络堆栈，不使用 docker 创建的虚拟网络，可以避免 NAT 的 IP 转换，不过端口的访问也不再受到 docker 的限制
$ docker container run -d -t --name="example" --net=host example
# 容器自动启动，或者容器退出自动重启
$ docker container run -d -t --name="example" --restart=always example
```

# 查看容器状态

```bash
$ docker stats --format='table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}'
```

参数说明：

| 占位符       | 描述                              |
| :----------- | :-------------------------------- |
| `.Container` | 容器名称或 ID（用户输入）         |
| `.Name`      | 容器名称                          |
| `.ID`        | 容器标识                          |
| `.CPUPerc`   | CPU 百分比                        |
| `.MemUsage`  | 内存使用情况                      |
| `.NetIO`     | 网络 IO                           |
| `.BlockIO`   | 块 IO                             |
| `.MemPerc`   | 内存百分比（不适用于 Windows）    |
| `.PIDs`      | PID 的数量（在 Windows 上不可用） |

# 制作镜像

在项目目录下创建文件 Dockerfile，输入以下内容

```dockerfile
FROM openjdk:8
WORKDIR /root/
COPY demo.jar demo.jar
ENV TZ="Asia/Shanghai"
ENTRYPOINT ["java", "-Xmx512M", "-Xms206M", "-jar", "demo.jar"]
```

构建镜像

```bash
$ docker image build -t "demo" .
```
