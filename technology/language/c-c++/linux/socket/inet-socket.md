# Linux 的socket编程

## TCP

### Server

```c++
#include <iostream>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <cerrno>
#include <unistd.h>
#include <arpa/inet.h>

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
    // 创建socket
    const int server_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server_socket == -1) {
        fprintf(stderr, "Socket create error: %s.", strerror(errno));
        return EXIT_FAILURE;
    }

    // unix domain socket 专用的地址结构体
    struct sockaddr_in server_addr{};
    // AF_LOCAL = AF_UNIX
    server_addr.sin_port = htons(8080);
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

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

    // 套接字请求队列大小
    int queueSize = 10;
    // 监听socket
    code = listen(server_socket, queueSize);
    if (code == -1) {
        fprintf(stderr, "listen error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    // 地址结构体的长度，会影响客户端地址结构的填充
    socklen_t socket_len = sizeof(struct sockaddr_in);
    struct sockaddr_in client_addr{};

    // 等待客户端连接
    int client_socket = accept(
            server_socket, reinterpret_cast<sockaddr *>(&client_addr),
            &socket_len
    );
    if (client_socket == -1) {
        fprintf(stderr, "accept error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    } else {
        fprintf(stdout, "client ip: %s\n", inet_ntoa(client_addr.sin_addr));
    }

    // 接收客户端传入的数据
    char buff[BUFSIZ]{};
    RECV_DATA(client_socket, buff, BUFSIZ)
    fprintf(stdout, "client message: %s\n", buff);

    // 发送数据
    SEND_DATA(client_socket, buff, BUFSIZ)

    close(server_socket);
    close(client_socket);
    return EXIT_SUCCESS;
}
```

### Client

```c++
#include "sys/socket.h"
#include "netinet/in.h"
#include "arpa/inet.h"
#include <unistd.h>
#include "netdb.h"
#include <cstdio>
#include "cstring"
#include <cerrno>
#include <cstdlib>

int main() {
    int server_socket;
    // 服务器网络地址结构体
    struct sockaddr_in remote_addr{};
    // 设置为 IPV4 通信
    remote_addr.sin_family = AF_INET;

    // 根据域名获得 IPV4 地址
    struct hostent *h;
    h = gethostbyname("localhost");
    // 把地址的字节转换为字符串
    const char *ip = inet_ntoa(*((struct in_addr *) h->h_addr));
    fprintf(stdout, "ip: %s\n", ip);
    // 也可以使用 memcpy(remote_addr.sin_addr.s_addr, h->h_addr, 4); 这两种方式的作用效果是等价的
    remote_addr.sin_addr.s_addr = inet_addr(ip);
    remote_addr.sin_port = htons(8080);

    /*
     * 创建客户端套接字--IPv4协议，面向连接通信，TCP协议
     * AF_INET = 地址格式，Internet = IP 地址
     * PF_INET = 数据包格式，Internet = IP、TCP/IP 或 UDP/IP
     * AF_UNIX = unix domain socket，UNIX 域套接字，通过unix的文件系统，进行套接字连接，支持TCP和UDP，但不支持原始数据包
     * 具体的区分暂且不清楚，可能是个互联网历史遗留的毛病，大多数情况下 AF_INET 等同 PF_INET
     *
     * 第二个参数指定的是socket类型
     * SOCK_STREAM：是一种基于连接的协议。连接建立并进行对话，直到连接被其中一方或网络错误终止。SOCK_STREAM 通过 TTL 控制指令来保证数据包的正确收发（不会出现数据包丢失，以及数据包顺序混乱等）
     * SOCK_DGRAM：是一种基于数据报的协议。发送端只管发送，接受端只管接受，相比SOCK_STREAM，具有消耗计算资源和网络资源少的特点，有有不提供数据报分组、组装和不能对数据包进行排序的缺点。
     * SOCK_RAW：原始模式基本上允许您绕过计算机处理 TCP/IP 的某些方式。您只需将数据包传递给需要它的应用程序，而不是通过内核上的 TCP/IP 堆栈执行的常规封装/解封装层。
     *           没有 TCP/IP 处理——所以它不是一个处理过的数据包，它是一个原始数据包。使用数据包的应用程序现在负责剥离报头，分析数据包，内核中的 TCP/IP 堆栈通常为您做的所有事情。
     * 更多请参见下面 socket_type 章节
     *
     * 第三个参数用于指定所要接收的协议包
     * IPPROTO_IP：TCP 的虚拟协议（Dummy protocol for TCP.），实际上是让内核根据socket类型和地址类型，自动选择协议，对于 SOCK_RAW 类型的 socket 无效
     * IPPROTO_TCP：传输控制协议（Transmission Control Protocol.）,告诉内核，这个socket只接受TCP数据包
     * IPPROTO_UDP：用户数据报协议（User Datagram Protocol.），告诉内核，这个socket只接受UDP数据包
     * IPPROTO_IPV6：对IPv6了解还不够，以后再补充
     */
    if ((server_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)) == -1) {
        fprintf(stderr, "socket error： %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    // 将套接字绑定到服务器的网络地址上
    if (connect(server_socket, (struct sockaddr *) &remote_addr, sizeof(struct sockaddr)) == -1) {
        fprintf(stderr, "connect error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    fprintf(stdout, "connected server\n");

    const char *sendStr = "Hello World";
    ssize_t len = send(server_socket, sendStr, strlen(sendStr) + 1, 0);
    if (len == -1) {
        fprintf(stderr, "send error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    char buff[BUFSIZ];
    len = recv(server_socket, buff, BUFSIZ, 0);
    if (len == -1) {
        fprintf(stderr, "recv error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    fprintf(stdout, "server message: %s\n", buff);

    close(server_socket);
    return 0;
}
```

## UDP

### Server

```c++
#include <cstring>
#include <netinet/in.h>
#include <sys/socket.h>
#include <cerrno>
#include <unistd.h>
#include <arpa/inet.h>
#include <cstdio>
#include <cstdlib>

int main() {
    struct sockaddr_in server_addr{};
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(8080);
    server_addr.sin_family = AF_INET;

    const int server_socket = socket(PF_INET, SOCK_DGRAM, IPPROTO_IP);
    if (server_socket == -1) {
        fprintf(stderr, "socket create error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    ssize_t code = bind(server_socket, reinterpret_cast<struct sockaddr *> (&server_addr), sizeof(server_addr));
    if (code == -1) {
        fprintf(stderr, "bind socket error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    struct sockaddr_in client_addr{};
    // IP地址结构的大小，绝对不能为0，否则recvfrom无法填充客户端的地址结构
    socklen_t socklen = sizeof(client_addr);
    char buff[BUFSIZ]{};

    // 读取数据，并且获得客户端的地址，数据报协议是无连接的，需要掌握双方的地址信息才可以双向通信
    code = recvfrom(
            server_socket, buff, BUFSIZ, 0, reinterpret_cast<struct sockaddr *>(&client_addr), &socklen
    );
    if (code == -1) {
        fprintf(stderr, "recvfrom error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    fprintf(stdout, "client %s message: %s\n", inet_ntoa(client_addr.sin_addr), buff);

    code = sendto(server_socket, buff, strlen(buff) + 1, 0, reinterpret_cast<struct sockaddr *>(&client_addr), socklen);
    if (code == -1) {
        fprintf(stderr, "sendto error :%s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    close(server_socket);
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
#include <arpa/inet.h>

int main() {
    struct sockaddr_in server_addr{};
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(8080);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    const int server_socket = socket(PF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (server_socket == -1) {
        fprintf(stderr, "socket create error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    ssize_t code;

    // 发送数据
    const char *sendData = "Hello World";
    code = sendto(
            server_socket, sendData, strlen(sendData) + 1, 0,
            reinterpret_cast<struct sockaddr *> (&server_addr),
            sizeof(server_addr)
    );
    if (code == -1) {
        fprintf(stderr, "sendto error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }

    // 注意，这里不可为0，否则会导致地址结构无法填充
    socklen_t socklen = sizeof(server_addr);

    // 接收数据
    char buff[BUFSIZ]{};
    code = recvfrom(
            server_socket, buff, BUFSIZ, 0, reinterpret_cast<struct sockaddr *> (&server_addr), &socklen
    );
    if (code == -1) {
        fprintf(stderr, "recvfrom error: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    fprintf(stdout, "sever message: %s\n", buff);

    close(server_socket);
    return EXIT_SUCCESS;
}
```

<font color="red">通过以上代码，可以看出UDP不能通过“连接”来交换数据，UDP的数据交换只能通过双方各自持有的对方的IP和端口进行数据交互。这点和TCP不同，TCP的三次握手建立一个连接后，数据的交换是由TTL控制包维护的，开发者不需要关心客户端的IP和端口</font>

## ipv4 字符串和int的相互转换

ipv4地址的长度是32个字节，正好是一个int的大小，在使用ip地址时通常需要对字符串和十制进行相互转换。

字符串转十进制：

```c
#include <arpa/inet.h>
#include <stdio.h>

int main() {
    // in_addr_t的类型是 unsigned int
    in_addr_t addr = inet_addr("192.168.0.119");
    fprintf(stdout, "0x%x\n", addr);
    return 0;
}
```

十进制转字符串

```c
#include <arpa/inet.h>
#include <stdio.h>

int main() {
    // addr.s_addr 的类型是 unsigned int
    struct in_addr addr;
    addr.s_addr = 0x7700a8c0;
    // 十进制IP地址，转换为字符串表示
    const char *ip = inet_ntoa(addr);
    fprintf(stdout, "%s\n", ip);
    return 0;
}
```

## socket_type

所在头文件：bits/socket_type.h

```c
enum __socket_type {
  // 有序的、可靠的、基于连接的字节流。
  SOCK_STREAM = 1,
#define SOCK_STREAM SOCK_STREAM
  // 固定最大长度的无连接、不可靠的数据报。
  SOCK_DGRAM = 2,
#define SOCK_DGRAM SOCK_DGRAM
  // 原始协议接口。
  SOCK_RAW = 3,
#define SOCK_RAW SOCK_RAW
  // 可靠传递的消息。
  SOCK_RDM = 4,
#define SOCK_RDM SOCK_RDM
  // 固定最大长度的有序、可靠、基于连接的数据报。
  SOCK_SEQPACKET = 5,
#define SOCK_SEQPACKET SOCK_SEQPACKET
  // 数据报拥塞控制协议。
  SOCK_DCCP = 6,
#define SOCK_DCCP SOCK_DCCP
  // 在开发级别获取数据包的 Linux 特定方式。用于在用户级别编写 rarp 和其他类似的东西。
  SOCK_PACKET = 10,
#define SOCK_PACKET SOCK_PACKET
  // 要与 socket 和 socketpair 的类型参数进行 OR 运算的标志，并用于 paccept 的标志参数。
  // 以原子方式为新描述符设置 close-on-exec 标志。
  SOCK_CLOEXEC = 02000000,
#define SOCK_CLOEXEC SOCK_CLOEXEC
  // 原子地将描述符标记为非阻塞。这是最底层的非阻塞NIO支持
  SOCK_NONBLOCK = 00004000
#define SOCK_NONBLOCK SOCK_NONBLOCK
};
```

## 还有其他的socket定义，挺多的，就不一一列举了

AF_INET、PF_INET、IPPROTO_TCP、IPPROTO_IP、IPPROTO_UDP 定义于 bits/socket.h。

