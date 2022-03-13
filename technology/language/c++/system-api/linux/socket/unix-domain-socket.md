# Unix domain socket

unix域套接字

## SOCK_STREAM

面向连接的、可靠的unix域套接字

### Server

```c++
#include <iostream>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <cerrno>
#include <unistd.h>

#define SOCKET_PATH "/home/aszswaz/project/aszswaz/test/test.sock"

#define RECV_DATA(socket, buff, buffLen) \
    if (recv(socket, buff, buffLen, 0) == -1) { \
        fprintf(stderr, "recv error: %s\n", strerror(errno)); \
        return EXIT_FAILURE; \
    }

#define SEND_DATA(socket, buff, buffLen) \
    if (send(socket, buff, buffLen, 0) == -1) { \
        fprintf(stderr, "send data error: %s\n", strerror(errno)); \
        return EXIT_FAILURE; \
    }

int main() {
    // 创建本地socket
    const int server_socket = socket(AF_UNIX, SOCK_STREAM, IPPROTO_ICMP);
    if (server_socket == -1) {
        fprintf(stderr, "Socket create error: %s.", strerror(errno));
        return EXIT_FAILURE;
    }

    // unix domain socket 专用的地址结构体
    struct sockaddr_un server_socket_addr{};
    // AF_LOCAL = AF_UNIX
    server_socket_addr.sun_family = AF_UNIX;
    strcpy(server_socket_addr.sun_path, SOCKET_PATH);

    // 绑定套接字
    ssize_t code = bind(
            server_socket,
            reinterpret_cast<const sockaddr *>(&server_socket_addr),
            sizeof(server_socket_addr)
    );
    if (code == -1) {
        fprintf(stdout, "socket bind error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    socklen_t socket_len{};
    struct sockaddr_un client_addr{};

    // 等待客户端连接
    struct sockaddr_un client_sockaddr{};
    int client_sock = accept(server_socket, reinterpret_cast<sockaddr *>(&client_addr), &socket_len);
    if (client_sock == -1) {
        fprintf(stderr, "accept error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    } else {
        fprintf(stdout, "client socket file path: %s\n", client_sockaddr.sun_path);
    }

    // 接收客户端传入的数据
    char buff[BUFSIZ]{};
    RECV_DATA(client_sock, buff, BUFSIZ)
    fprintf(stdout, "client message: %s\n", buff);

    // 发送数据
    SEND_DATA(client_sock, buff, BUFSIZ)

    close(server_socket);
    close(client_sock);
    // 删除socket文件
    unlink(SOCKET_PATH);
    return EXIT_SUCCESS;
}
```

### Client

```c++
#include <sys/socket.h>
#include <netinet/in.h>
#include <cerrno>
#include <cstdio>
#include <cstdlib>
#include <sys/un.h>
#include <unistd.h>

#define SOCKET_PATH "/home/aszswaz/project/aszswaz/test/test.sock"

#define RECV_DATA(socket, buff, buffLen) \
    if (recv(socket, buff, buffLen, 0) == -1) { \
        fprintf(stderr, "recv error: %s\n", strerror(errno)); \
        return EXIT_FAILURE; \
    }

#define SEND_DATA(socket, buff, buffLen) \
    if (send(socket, buff, buffLen, 0) == -1) { \
        fprintf(stderr, "send data error: %s\n", strerror(errno)); \
        return EXIT_FAILURE; \
    }

int main() {
    // 创建本地socket
    int server_socket = socket(AF_UNIX, SOCK_STREAM, IPPROTO_ICMP);
    if (server_socket == -1) {
        fprintf(stderr, "socket create error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    struct sockaddr_un server_addr{};
    server_addr.sun_family = AF_UNIX;
    strcpy(server_addr.sun_path, SOCKET_PATH);
    // 连接socket
    int code = connect(server_socket, reinterpret_cast<const struct sockaddr *>(&server_addr), sizeof(server_addr));
    if (code == -1) {
        fprintf(stderr, "connect error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    // 发送数据包
    const char *sendStr = "Hello World";
    SEND_DATA(server_socket, sendStr, strlen(sendStr) + 1)

    // 接收数据包
    char buff[BUFSIZ]{};
    RECV_DATA(server_socket, buff, BUFSIZ)
    fprintf(stdout, "server message: %s\n", buff);

    close(server_socket);

    return EXIT_SUCCESS;
}
```

测试：

```bash
$ g++ server.cpp -o server && g++ client.cpp -o client
$ ./server
client socket file path: 
client message: Hello World
```

```bash
$ ./client
server message: Hello World
```

## SOCK_DGRAM

不可靠、无连接的unix域套接字

### Server

```c++
#include <iostream>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <cerrno>
#include <unistd.h>

#define SERVER_SOCKET_PATH "/home/aszswaz/project/aszswaz/test/server.sock"

int main() {
    unlink(SERVER_SOCKET_PATH);
    // 创建本地socket
    const int server_socket = socket(AF_UNIX, SOCK_DGRAM, IPPROTO_IP);
    if (server_socket == -1) {
        fprintf(stderr, "Socket create error: %s.", strerror(errno));
        return EXIT_FAILURE;
    }

    // unix domain socket 专用的地址结构体
    struct sockaddr_un server_addr{};
    // AF_LOCAL = AF_UNIX
    server_addr.sun_family = AF_UNIX;
    strcpy(server_addr.sun_path, SERVER_SOCKET_PATH);

    // 绑定套接字
    ssize_t code = bind(
            server_socket,
            reinterpret_cast<const sockaddr *>(&server_addr),
            sizeof(server_addr)
    );
    if (code == -1) {
        fprintf(stdout, "socket bind error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    // 接收客户端传入的数据
    char buff[BUFSIZ]{};
    struct sockaddr_un client_addr{};
    // 地址结构长度，不可为0，否则无法填充地址结构体
    socklen_t socklen = sizeof(client_addr);

    code = recvfrom(server_socket, buff, BUFSIZ, 0, reinterpret_cast<struct sockaddr *> (&client_addr), &socklen);
    if (code == -1) {
        fprintf(stderr, "recvfrom error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    } else {
        fprintf(stdout, "client file: %s\n", client_addr.sun_path);
    }
    fprintf(stdout, "client message: %s\n", buff);

    // 返回数据
    code = sendto(
            server_socket, buff, strlen(buff) + 1, 0, reinterpret_cast<struct sockaddr *>(&client_addr), socklen
    );
    if (code == -1) {
        fprintf(stderr, "sendto error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    close(server_socket);
    // 删除socket文件
    unlink(SERVER_SOCKET_PATH);
    return EXIT_SUCCESS;
}
```

## Client

```c++
#include <sys/socket.h>
#include <netinet/in.h>
#include <cerrno>
#include <cstdio>
#include <cstdlib>
#include <sys/un.h>
#include <unistd.h>

#define SERVER_SOCKET_PATH "/home/aszswaz/project/aszswaz/test/server.sock"
#define CLIENT_SOCKET_PATH "/home/aszswaz/project/aszswaz/test/client.sock"

int main() {
    unlink(CLIENT_SOCKET_PATH);
    ssize_t code;

    // 创建客户端的socket
    int client_socket = socket(AF_UNIX, SOCK_DGRAM, IPPROTO_IP);
    if (client_socket == -1) {
        fprintf(stderr, "socket create error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    struct sockaddr_un client_addr{};
    client_addr.sun_family = AF_UNIX;
    strcpy(client_addr.sun_path, CLIENT_SOCKET_PATH);
    code = bind(client_socket, reinterpret_cast<struct sockaddr *>(&client_addr), sizeof(client_addr));
    if (code == -1) {
        fprintf(stderr, "client bind error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    struct sockaddr_un server_addr{};
    server_addr.sun_family = AF_UNIX;
    strcpy(server_addr.sun_path, SERVER_SOCKET_PATH);
    socklen_t socklen = sizeof(server_addr);

    // 发送数据包
    const char *sendStr = "Hello World";
    // 千万要注意，这里有个大坑，这里是通过客户端建立的socket文件，向服务端的socket文件发送数据。而服务端也需要反过来吧数据发送到客户端的socket文件
    // 如果客户端直接向服务端的socket发送数据，那么服务端就只能单方面接受，而不能给予客户端响应
    code = sendto(
            client_socket, sendStr, strlen(sendStr) + 1, 0, reinterpret_cast<struct sockaddr *>(&server_addr), socklen
    );
    if (code == -1) {
        fprintf(stderr, "sendto error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    // 接收数据包
    char buff[BUFSIZ]{};
    code = recvfrom(client_socket, buff, BUFSIZ, 0, reinterpret_cast<struct sockaddr *>(&server_addr), &socklen);
    if (code == -1) {
        fprintf(stdout, "recvfrom: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    fprintf(stdout, "server message: %s\n", buff);

    close(client_socket);
    unlink(CLIENT_SOCKET_PATH);
    return EXIT_SUCCESS;
}
```

<font color="red">注意！这里客户端和服务端的通信存在一个大坑，Unix domain socket UDP的数据传输流程如下：</font>

客户端发送数据：

客户端 -> client.sock -> server.sock -> 服务端

服务端响应数据：

服务端 -> server.sock -> client.sock -> 客户端

<font color="red">这样才可以双向通信</font>

我一直以为它是，传统的通信模型：

客户端 -> server.sock -> 服务端

服务端 -> server.sock -> 客户端      --     （程序错误）

<font color="red">在这种模式下，只能是客户端发送数据给服务端，但是服务端得不到客户端的地址，无法响应数据给客户端</font>
