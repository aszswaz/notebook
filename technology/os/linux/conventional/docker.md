# docker操作

## 安装

```bash
$ sudo pacman -S docker
```

## 查看容器状态

```bash
$ docker stats --format='table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}'
```

参数说明：

| 占位符       | 描述                              |
| :----------- | :-------------------------------- |
| `.Container` | 容器名称或 ID（用户输入）         |
| `.Name`      | 容器名称                          |
| `.ID`        | 容器标识                          |
| `.CPUPerc`   | CPU百分比                         |
| `.MemUsage`  | 内存使用情况                      |
| `.NetIO`     | 网络IO                            |
| `.BlockIO`   | 块 IO                             |
| `.MemPerc`   | 内存百分比（不适用于 Windows）    |
| `.PIDs`      | PID 的数量（在 Windows 上不可用） |

## 制作镜像

在项目目录下创建文件 Dockerfile，输入以下内容

```dockerfile
FROM openjdk:8
WORKDIR /root/
COPY demo.jar demo.jar
ENV TZ="Asia/Shanghai"
ENTRYPOINT ["java", "-Xmx512M", "-Xms206M", "-jar", "demo.jar"]
```

build镜像

```bash
$ docker image build -t "demo" .
```

## 启动容器

```bash
$ docker container run --name="demo" -d -t demo
```

