# Unix domain socket

unix域套接字

## SOCK_STREAM

unix domain socket 的 TCP 实现。

### Server

```c++
#include <stdio.h>
#include <errno.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/un.h>

#define SOCKET_PATH "test.sock"

#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }

int main() {
    int socketfd = -1, clientfd = -1;
    struct sockaddr_un addr;
    int code = 0;
    socklen_t socketlen = sizeof(addr);
    char buff[BUFSIZ];

    socketfd = socket(AF_UNIX, SOCK_STREAM, IPPROTO_ICMP);
    SYSCALL_ERROR(socketfd == -1);
    addr.sun_family = AF_UNIX;
    strcpy(addr.sun_path, SOCKET_PATH);
    code = bind(socketfd, (struct sockaddr *)&addr, sizeof(addr));
    SYSCALL_ERROR(code == -1);
    // Sets the listening queue size of the socket.
    code = listen(socketfd, 50);
    SYSCALL_ERROR(code == -1);

    clientfd = accept(socketfd, (struct sockaddr *)&addr, &socketlen);
    SYSCALL_ERROR(clientfd == -1);
    printf("client socket file path: %s\n", addr.sun_path);

    code = recv(clientfd, buff, sizeof(buff), 0);
    SYSCALL_ERROR(code == -1);
    printf("client message: ");
    fwrite(buff, code, 1, stdout);
    printf("\n");
    code = send(clientfd, buff, code, 0);
    SYSCALL_ERROR(code == -1);

finally:
    if (socketfd != -1) close(socketfd);
    if (clientfd != -1) close(clientfd);
    unlink(SOCKET_PATH);
    return EXIT_SUCCESS;
}
```

### Client

```c++
#include <errno.h>
#include <stdlib.h>
#include <stdio.h>

#include <sys/socket.h>
#include <netinet/in.h>
#include <sys/un.h>
#include <unistd.h>

#define SOCKET_PATH "test.sock"

#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }

int main() {
    int sockfd;
    struct sockaddr_un addr;
    int code;
    const char *message = "Hello World";
    char buff[BUFSIZ];

    sockfd = socket(AF_UNIX, SOCK_STREAM, IPPROTO_ICMP);
    SYSCALL_ERROR(sockfd == -1);
    addr.sun_family = AF_UNIX;
    strcpy(addr.sun_path, SOCKET_PATH);
    code = connect(sockfd, (struct sockaddr *)&addr, sizeof(addr));
    SYSCALL_ERROR(code == -1);

    code = send(sockfd, message, strlen(message), 0);
    SYSCALL_ERROR(code == -1);
    code = recv(sockfd, buff, sizeof(buff), 0);
    SYSCALL_ERROR(code == -1);
    printf("server message: ");
    fwrite(buff, code, 1, stdout);
    printf("\n");
finally:
    if (sockfd != -1) close(sockfd);
    return EXIT_SUCCESS;
}
```

## SOCK_DGRAM

unix domain socket 的 UDP 实现。

### Server

```c++
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <stdio.h>

#include <sys/socket.h>
#include <sys/un.h>
#include <netinet/in.h>

#define SOCK_PATH "server.sock"
#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }

int main() {
    int sockfd = -1;
    int code;
    struct sockaddr_un addr;
    char buffer[BUFSIZ];
    socklen_t socklen;

    sockfd = socket(AF_UNIX, SOCK_DGRAM, 0);
    SYSCALL_ERROR(sockfd == -1);
    addr.sun_family = AF_UNIX;
    strcpy(addr.sun_path, SOCK_PATH);
    code = bind(sockfd, (struct sockaddr *)&addr, sizeof(addr));
    SYSCALL_ERROR(code == -1);

    // Receive data from the client and get the client's address and port.
    socklen = sizeof(addr);
    code = recvfrom(sockfd, buffer, sizeof(buffer), 0, (struct sockaddr *)&addr, &socklen);
    SYSCALL_ERROR(code == -1);
    printf("client address: %s\n", addr.sun_path);
    printf("client message: ");
    fwrite(buffer, code, 1, stdout);
    printf("\n");
    // response message.
    code = sendto(sockfd, buffer, code, 0, (struct sockaddr *)&addr, sizeof(addr));
    SYSCALL_ERROR(code == -1);

finally:
    if (sockfd != -1) close(sockfd);
    unlink(SOCK_PATH);
    return EXIT_SUCCESS;
}
```

### Client

```c++
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>

#include <sys/socket.h>
#include <sys/un.h>

#define SYSCALL_ERROR(expression) \
    if (expression) { \
        printf("%s %d: %s\n", __FILE_NAME__, __LINE__, strerror(errno)); \
        goto finally; \
    }


#define SERVER_SOCK "server.sock"
#define CLIENT_SOCK "client.sock"

int main() {
    int code;
    int sockfd = -1;
    struct sockaddr_un saddr, caddr;
    socklen_t socklen = sizeof(struct sockaddr_un);
    const char *message = "Hello World";
    char buffer[BUFSIZ];

    saddr.sun_family = AF_UNIX;
    strcpy(saddr.sun_path, SERVER_SOCK);
    caddr.sun_family = AF_UNIX;
    strcpy(caddr.sun_path, CLIENT_SOCK);

    // The client must also hold a unix domain socket for bidirectional communication with the service.
    sockfd = socket(AF_UNIX, SOCK_DGRAM, 0);
    SYSCALL_ERROR(sockfd == -1);
    code = bind(sockfd, (struct sockaddr *)&caddr, sizeof(caddr));
    SYSCALL_ERROR(code == -1);

    code = sendto(sockfd, message, strlen(message), 0, (struct sockaddr *)&saddr, socklen);
    SYSCALL_ERROR(code == -1);
    code = recvfrom(sockfd, buffer, sizeof(buffer), 0, (struct sockaddr *)&saddr, &socklen);
    SYSCALL_ERROR(code == -1);
    printf("server response: ");
    fwrite(buffer, code, 1, stdout);
    printf("\n");

finally:
    if (sockfd != -1) close(sockfd);
    unlink(CLIENT_SOCK);
    return EXIT_SUCCESS;
}
```
