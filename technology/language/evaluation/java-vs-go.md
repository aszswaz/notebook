# Java 和 GO 的比较

## 作为 HTTP 服务器的性能

比较内容：接受客户端的请求，并返回 Hello World

**使用的框架/模块**

为避免程序员个人能力的因素影响，Java采用SprintBoot框架，GO采用net http模块测试

**测试服务器参数**

系统：centos7 + docker

CPU：intel E5 32核

内存：32G

**Java 部分：**

pom.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.5.4</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>demo</name>
	<description>Demo project for Spring Boot</description>
	<properties>
		<java.version>1.8</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

application.properties：

```properties
server.port=8080
server.tomcat.threads.max=10
server.tomcat.threads.min-spare=${server.tomcat.threads.max}
```

程序启动入口：DemoApplication.java

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
```

接口：DemoController.java

```java
package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author aszswaz
 * @createTime 2021-09-03 16:08:25
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
@RestController
public class DemoController {
    @GetMapping(value = "/")
    public String demo() {
        return "Hello World";
    }
}
```

Dockerfile：

```dockerfile
FROM openjdk:8

WORKDIR /root/
COPY target/demo-0.0.1-SNAPSHOT.jar demo-0.0.1-SNAPSHOT.jar
ENV TZ=Asia/Shanghai
ENTRYPOINT ["java", "-Xms512M", "-Xmx512M", "-jar", "demo-0.0.1-SNAPSHOT.jar"]
```

自动部署脚本 docker.sh：

```shell
#!/bin/zsh

name="demo-java-http-server"
host="192.168.0.119"
docker -H ${host} image build -t "${name}" .
docker -H ${host} container run -d -t --name="${name}" -m=512M --memory-swap=-1 -p 8082:8080 "${name}"
```

**GO部分：**

```go
package main

import (
	"fmt"
	"io"
	"net/http"
)

// GO 不支持 /** ... */（c、java、javascript，python的是 """ ... """） 这种的文档注释，只有 // 和 /* ... */ 这两种注释
// 响应客户端，给给客户端打个招呼
func hello(response http.ResponseWriter, request *http.Request) {
	userAgent := request.Header.Get("user-agent")
	fmt.Println(userAgent)
	// 响应客户端
	writeString, err := io.WriteString(response, "Hello World")
	// nil 是指针变量为零的指针，就是空指针，函数执行成功，err就是一个空指针，函数执行失败，err就不是空指针，这种异常处理方式，让我想起了 C
	if err != nil {
		fmt.Println(writeString)
		return
	}
}

// 处理图标请求
func favicon(response http.ResponseWriter, request *http.Request) {
	// 执行永久重定向，这个倒是很方便，例如 http.StatusMovedPermanently 301 这种的 HTTP 状态码不需要自己去进行繁琐的定义
	http.Redirect(response, request, "https://www.baidu.com/favicon.ico", http.StatusMovedPermanently)
}

func main() {
	// 注册 API 接口的处理函数
	http.HandleFunc("/", hello)
	// 即便没有任何网页源码，浏览器也会发送一条图标请求
	http.HandleFunc("/favicon.ico", favicon)

	// 打开端口号
	err := http.ListenAndServe("0.0.0.0:8080", nil)
	// 通过空指针判断是否发生异常
	if err != nil {
		fmt.Println("端口号打开失败")
		return
	}
}
```

Dockfile：

```docker
FROM golang
WORKDIR /root/
COPY demo.go /root/demo.go
RUN go build demo.go
RUN cp demo /usr/local/bin/demo
ENV TZ=Asia/Shanghai
ENTRYPOINT ["demo"]
```

自动部署脚本 docker.sh：

```shell
#!/bin/zsh

name="demo-go-http-server"
host="192.168.0.119"
docker -H ${host} image build -t "${name}" .
docker -H ${host} container run -d -t --name="${name}" -m=512M --memory-swap=-1 -p 8083:8080 "${name}"
```

**客户端测试程序**

这里为了保证公平性，测试程序采用 C 语言编写。

单线程 10万次（1万次建立socket，每条socker复用10次） 请求测试

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

/**
 * 演示函数
 */
void demo(int sock);

int main(int argc, char **argv) {
    // argc为参数数量，程序自身所在位置是第一个参数
    if (argc != 3) {
        fprintf(stderr, "请输入参数：ip port\n");
        return 1;
    }

    int sock;
    struct sockaddr_in remote_addr;
    // IPv4通信
    remote_addr.sin_family = AF_INET;

    remote_addr.sin_addr.s_addr = inet_addr(argv[1]);
    // strtol 把字符串转换为整数
    remote_addr.sin_port = htons(strtol(argv[2], NULL, 0));

    time_t start_time;  //这是一个适合存储日历时间类型。
    start_time = time(NULL);
    // 秒的时间戳
    fprintf(stdout, "程序开始时间：%d\n", (int) start_time);

    for (int i = 0; i < 10000; ++i) {
        // 创建socket
        sock = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (sock < 0) {
            fprintf(stderr, "socket 创建失败！\n");
            return 1;
        }
        // 绑定连接socket
        int err = connect(sock, (struct sockaddr *) &remote_addr, sizeof(struct sockaddr));
        if (err < 0) {
            fprintf(stderr, "socket 连接失败！\n");
            return 1;
        }

        for (int j = 0; j < 10; j++) {
            demo(sock);
        }
        fprintf(stdout, "已完成：%d\n", i * 10);

        close(sock);
    }
    // 再次获取时间
    time_t end_time = time(NULL);
    fprintf(stdout, "程序结束时间: %d，耗时：%d\n", (int) end_time, (int) (end_time - start_time));
    return 0;
}

void demo(int sock) {
    char *header = "GET / HTTP/1.1\r\n";
    send(sock, header, strlen(header), 0);

    header = "Host: 192.168.0.119:8082\r\n";
    send(sock, header, strlen(header), 0);

    header = "User-Agent: curl/7.77.0\r\n";
    send(sock, header, strlen(header), 0);

    header = "Accept: */*\r\n";
    send(sock, header, strlen(header), 0);

    // 请求保持长连接
    header = "Connection: keep-alive\r\n";
    send(sock, header, strlen(header), 0);

    header = "\r\n";
    send(sock, header, strlen(header), 0);

    // 开始读取响应
    char buff[BUFSIZ];
    memset(&buff, 0, BUFSIZ);
    ssize_t len;
    len = read(sock, buff, BUFSIZ);

    // 这里懒得解析 HTTP 协议，按照读取长度转换为字符串指针， + 1 是因为字符串末尾有个 \0 字节
    size_t size = len + 1;
    char *response = malloc(size);
    // 初始化内存，往内存中填充0
    memset(response, 0, size);
    // 复制内存
    memcpy(response, buff, len);

    // 判断响应中是否包含 Hello World
    if (!strstr(response, "Hello World")) {
        fprintf(stderr, "响应中不包含 Hello World\n");
    }

    // 释放内存
    free(response);
}
```

**单线程测试结果**

java 用时：3706秒，折算61.7分钟

GO 用时：3681秒，折算61.35分钟

**客户端多线程请求测试**

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>
#include <pthread.h>

/**
 * 演示函数
 */
void demo(int sock);

/**
 * 多线程函数入口
 */
void *run();

char *host;
int port;

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wincompatible-function-pointer-types"

int main(int argc, char **argv) {
    // argc为参数数量，程序自身所在位置是第一个参数
    if (argc != 4) {
        fprintf(stderr, "请输入参数：ip port thread_size\n");
        return 1;
    }

    host = argv[1];
    port = (int) strtol(argv[2], NULL, 0);

    time_t start_time;  //这是一个适合存储日历时间类型。
    start_time = time(NULL);
    // 秒的时间戳
    fprintf(stdout, "程序开始时间：%d\n", (int) start_time);

    // 线程符号数组
    size_t thread_size = strtol(argv[3], NULL, 0);
    size_t memory_size = thread_size * sizeof(pthread_t);
    pthread_t *threads = malloc(memory_size);
    memset(threads, 0, memory_size);

    int i;
    for (i = 0; i < thread_size; ++i) {
        pthread_t thread;
        // 创建内核级线程，在 /proc/${pic}/task 文件夹下可以看到对应的线程编号
        if (pthread_create(&thread, NULL, run, NULL)) {
            fprintf(stderr, "线程%d创建失败\n", i);
            continue;
        }
        threads[i] = thread;
    }

    // 等待执行完毕
    for (i = 0; i < thread_size; i++) {
        if (threads[i] == 0) continue;
        pthread_join(threads[i], NULL);
    }

    // 再次获取时间
    time_t end_time = time(NULL);
    fprintf(stdout, "程序结束时间: %d，耗时：%d\n", (int) end_time, (int) (end_time - start_time));

    free(threads);
    return 0;
}

#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma ide diagnostic ignored "ConstantFunctionResult"

void *run() {
    struct sockaddr_in remote_addr;
    // IPv4通信
    remote_addr.sin_family = AF_INET;
    remote_addr.sin_addr.s_addr = inet_addr(host);
    // strtol 把字符串转换为整数
    remote_addr.sin_port = htons(port);

    int sock;
    for (int i = 0; i < 10000; ++i) {
        // 创建socket
        sock = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (sock < 0) {
            fprintf(stderr, "socket 创建失败！\n");
            return NULL;
        }
        // 绑定连接socket
        int err = connect(sock, (struct sockaddr *) &remote_addr, sizeof(struct sockaddr));
        if (err < 0) {
            fprintf(stderr, "socket 连接失败！\n");
            return NULL;
        }

        for (int j = 0; j < 10; j++) {
            demo(sock);
        }
        close(sock);
    }
    return NULL;
}

#pragma clang diagnostic pop

void demo(int sock) {
    char *header = "GET / HTTP/1.1\r\n";
    send(sock, header, strlen(header), 0);

    header = "Host: 192.168.0.119:8082\r\n";
    send(sock, header, strlen(header), 0);

    header = "User-Agent: curl/7.77.0\r\n";
    send(sock, header, strlen(header), 0);

    header = "Accept: */*\r\n";
    send(sock, header, strlen(header), 0);

    // 请求保持长连接
    header = "Connection: keep-alive\r\n";
    send(sock, header, strlen(header), 0);

    header = "\r\n";
    send(sock, header, strlen(header), 0);

    // 开始读取响应
    char buff[BUFSIZ];
    memset(&buff, 0, BUFSIZ);
    ssize_t len;
    len = read(sock, buff, BUFSIZ);

    // 这里懒得解析 HTTP 协议，按照读取长度转换为字符串指针， + 1 是因为字符串末尾有个 \0 字节
    size_t size = len + 1;
    char *response = malloc(size);
    // 初始化内存，网内存中填充0
    memset(response, 0, size);
    // 复制内存
    memcpy(response, buff, len);

    // 判断响应中是否包含 Hello World
    if (!strstr(response, "Hello World")) {
        fprintf(stderr, "响应中不包含 Hello World\n");
    }

    // 释放内存
    free(response);
}
```

编译：

```bash
$ gcc main.c -o http-client -lpthread
```

**10线程测试**

```bash
# 测试java服务器
$ ./http-client 127.0.0.1 8082 10
# 测试go服务器
$ ./http-client 127.0.0.1 8083 10
```

Java：3611秒，折算60.1分钟

GO：3610秒，折算60.1分钟

**100线程测试**

```bash
# 测试java服务器
$ ./http-client 127.0.0.1 8082 100
# 测试go服务器
$ ./http-client 127.0.0.1 8083 100
```

Java：3604秒，折算60分钟

GO：3602秒，折算60分钟

因为Java是动态语言，GO是静态语言，动态语言特性是注重强拓展性，静态语言注重执行效率，所以综合来说Java和GO的这点执行效率的差距是可以接受的。

