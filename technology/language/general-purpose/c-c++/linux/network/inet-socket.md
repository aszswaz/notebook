# Linux 的socket编程

## TCP

### Server

```c
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>

#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>
#include <arpa/inet.h>

#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }

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
    int sockfd = -1, clientfd = -1;
    struct sockaddr_in saddr;
    int code;
    int queueSize = 10;
    struct sockaddr_in caddr;
    socklen_t caddr_len = sizeof(caddr);
    char buff[BUFSIZ];

    // Create a socket using TCP.
    sockfd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    SYSCALL_ERROR(sockfd == -1);

    saddr.sin_port = htons(8080);
    saddr.sin_family = AF_INET;
    saddr.sin_addr.s_addr = inet_addr("127.0.0.1");

    // bind address.
    code = bind(sockfd, (struct sockaddr *)(&saddr), sizeof(saddr));
    SYSCALL_ERROR(code == -1);
    // Listen on the port and set the size of the connection establishment request queue.
    code = listen(sockfd, 10);
    SYSCALL_ERROR(code == -1);


    // Waiting for client to connect.
    clientfd = accept(sockfd, (struct sockaddr *)(&caddr), &caddr_len);
    printf("Connection established successfully! client ip: %s\n", inet_ntoa(caddr.sin_addr));

    memset(buff, 0, sizeof(buff));
    code = recv(clientfd, buff, sizeof(buff), 0);
    SYSCALL_ERROR(code < 0);
    printf("client message: ");
    fwrite(buff, code, 1, stdout);
    printf("\n");
    code = send(clientfd, buff, code, 0);
    SYSCALL_ERROR(code < 0);

finally:
    if (sockfd != -1) close(sockfd);
    if (clientfd != -1) close(clientfd);
    return EXIT_SUCCESS;
}
```

### Client

```c
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>

#include "sys/socket.h"
#include "netinet/in.h"
#include "arpa/inet.h"
#include "netdb.h"

#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }

int main() {
    int ssocketfd = -1;
    struct sockaddr_in saddr;
    struct hostent *host;
    int code;
    socklen_t saddr_len = sizeof(saddr);
    const char *message = "Hello World";
    char buff[BUFSIZ];

    // Quey DNS.
    host = gethostbyname("localhost");
    if (!host) {
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, hstrerror(h_errno));
        goto finally;
    }
    printf("ip: %s\n", inet_ntoa(*((struct in_addr *) host->h_addr)));
    // Set the IP address and address type.
    saddr.sin_family = host->h_addrtype;
    memcpy(&saddr.sin_addr.s_addr, host->h_addr, host->h_length);
    saddr.sin_port = htons(8080);

    // Create a socket using the TCP protocol.
    ssocketfd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    SYSCALL_ERROR(ssocketfd == -1);
    code = connect(ssocketfd, (struct sockaddr *)&saddr, saddr_len);
    SYSCALL_ERROR(code == -1);
    printf("connected server\n");

    code = send(ssocketfd, message, strlen(message), 0);
    SYSCALL_ERROR(code == -1);
    memset(buff, 0, sizeof(message));
    code = recv(ssocketfd, buff, BUFSIZ, 0);
    SYSCALL_ERROR(code == -1);
    printf("server message: ");
    fwrite(buff, code, 1, stdout);
    printf("\n");

finally:
    if (ssocketfd != -1) close(ssocketfd);
    return 0;
}
```

## UDP

### Server

```c++
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>

#include <netinet/in.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }

int main() {
    struct sockaddr_in addr;
    int socketfd = -1, clientfd = -1;
    socklen_t socklen = sizeof(addr);
    char buff[BUFSIZ];

    int code;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(8080);
    addr.sin_family = AF_INET;

    socketfd = socket(PF_INET, SOCK_DGRAM, IPPROTO_IP);
    SYSCALL_ERROR(socketfd == -1);

    code = bind(socketfd, (struct sockaddr *)&addr, socklen);
    SYSCALL_ERROR(code == -1);


    // Read the data and obtain the address of the client.
    // The datagram protocol is connectionless, and it is necessary to master the address information of both parties to enable two-way communication.
    memset(buff, 0, sizeof(buff));
    code = recvfrom(socketfd, buff, sizeof(buff), 0, (struct sockaddr *)&addr, &socklen);
    SYSCALL_ERROR(code == -1);
    printf("client %s message: %s\n", inet_ntoa(addr.sin_addr), buff);

    code = sendto(socketfd, buff, strlen(buff), 0, (struct sockaddr *)&addr, socklen);
    SYSCALL_ERROR(code == -1);

finally:
    if (socketfd) close(socketfd);
    if (clientfd) close(clientfd);
    return EXIT_SUCCESS;
}
```

### Client

```c++
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <unistd.h>

#include <sys/socket.h>
#include <netinet/in.h>
#include <sys/un.h>
#include <arpa/inet.h>

#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }

int main() {
    struct sockaddr_in saddr;
    int socketfd = -1;
    int code;
    const char *message = "Hello World";
    socklen_t socklen = sizeof(saddr);
    char buff[BUFSIZ];

    saddr.sin_family = AF_INET;
    saddr.sin_port = htons(8080);
    saddr.sin_addr.s_addr = INADDR_ANY;

    socketfd = socket(PF_INET, SOCK_DGRAM, IPPROTO_UDP);
    SYSCALL_ERROR(socketfd == -1);

    code = sendto(socketfd, message, strlen(message), 0, (struct sockaddr *)&saddr, socklen);
    SYSCALL_ERROR(code == -1);

    memset(buff, 0, sizeof(buff));
    code = recvfrom(socketfd, buff, sizeof(buff), 0, (struct sockaddr *)&saddr, &socklen);
    SYSCALL_ERROR(code == -1);
    fprintf(stdout, "sever message: %s\n", buff);

finally:
    if (socketfd != -1) close(socketfd);
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

