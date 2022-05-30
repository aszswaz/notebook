# openssl

## 使用 openssl 进行 https 同行

首先配置cmake

```cmake
cmake_minimum_required(VERSION 3.20)
project(demo02 C)

set(CMAKE_C_STANDARD 99)

add_executable(${PROJECT_NAME} main.c)

find_package(OpenSSL REQUIRED)
target_link_libraries(${PROJECT_NAME} OpenSSL::SSL)
```

创建main.c文件

```c
#include <stdio.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <netdb.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

#define HOST "www.example.com"
#define PORT 443

typedef struct hostent hostent;
typedef struct in_addr in_addr;
typedef struct sockaddr_in sockaddr_in;
typedef struct sockaddr sockaddr;
/**
 * 日志输出流
 */
FILE *log_out;
FILE *log_err;

int main() {
    log_out = stdout;
    log_err = stderr;

    // 注册可用的 SSL/TLS 密码和摘要。
    SSL_library_init();
    // 为所有libcrypto函数注册错误字符串。SSL_load_error_strings() 执行相同的操作，但还会注册libssl错误字符串。
    ERR_load_crypto_strings();
    SSL_load_error_strings();
    // 将所有算法添加到表中（摘要和密码）。
    OpenSSL_add_all_algorithms();

    /*
     * SSLv23_method(), SSLv23_server_method(), SSLv23_client_method()
     * 这些是通用版本灵活的SSL/TLS 方法。实际使用的协议版本将协商为客户端和服务器相互支持的最高版本。支持的协议有 SSLv2、SSLv3、TLSv1、TLSv1.1 和 TLSv1.2。大多数应用程序应该使用这些方法.
     */
    // 构建ssl客户端
    const SSL_METHOD *sslMethod = SSLv23_client_method();
    // 创建一个新的SSL_CTX对象作为框架来建立支持 TLS/SSL 的连接。
    SSL_CTX *sslCtx = SSL_CTX_new(sslMethod);
    if (!sslCtx) {
        fprintf(log_err, "SSL_CTX_new failed\n");
        ERR_print_errors_fp(log_err);
        return 1;
    }
    // 查询域名的IP地址
    hostent *hostent = gethostbyname(HOST);
    in_addr ip;
    memcpy(&(ip.s_addr), hostent->h_addr_list[0], hostent->h_length);
    // 输出域名和对应的IP地址
    fprintf(log_out, "host: %s, ipv4: %s\n", HOST, inet_ntoa(ip));

    // 建立TCP的socket
    const int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        fprintf(log_err, "Socket creation failed.\n");
        return 1;
    }
    sockaddr_in sock_address;
    sock_address.sin_family = AF_INET;
    sock_address.sin_port = htons(PORT);
    sock_address.sin_addr = ip;
    // 连接socket
    int error = connect(sock, (sockaddr *) &sock_address, sizeof(sockaddr));
    if (error) {
        fprintf(log_err, "The socket connection failed.\n");
        return 1;
    }

    // 开始ssl握手
    SSL *ssl = SSL_new(sslCtx);
    if (!ssl) {
        fprintf(log_err, "ssl handle creation failed.\n");
        ERR_print_errors_fp(log_err);
        return 1;
    }
    // 设置 TSL 的 SNI 字段，这个字段用于握手的时候进行服务器域名验证，并且是不加密的，目前被政府用于拦截没有备案的网站的访问
    SSL_set_tlsext_host_name(ssl, HOST);
    // ssl句柄和socket进行绑定
    SSL_set_fd(ssl, sock);
    // ssl握手开始
    SSL_connect(ssl);
    /* (5) 打印出协商的好的加密密文 */
    fprintf(log_out, "(5) SSL connected with cipher: %s\n", SSL_get_cipher(ssl));

    // 打印服务器的证书
    X509 *server_cert = SSL_get_peer_certificate(ssl);
    const char *string = X509_NAME_oneline(X509_get_subject_name(server_cert), 0, 0);
    fprintf(log_out, "subject: %s\n", string);
    string = X509_NAME_oneline(X509_get_issuer_name(server_cert), 0, 0);
    fprintf(log_out, "issuer: %s\n\n", string);
    // 回收内存
    X509_free(server_cert);

    char *head_line = "GET / HTTP/1.1\r\n";
    SSL_write(ssl, head_line, (int) strlen(head_line));
    head_line = "Host: www.example.com\r\n";
    SSL_write(ssl, head_line, (int) strlen(head_line));
    head_line = "Connection: keep-alive\r\n";
    SSL_write(ssl, head_line, (int) strlen(head_line));
    head_line = "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\n";
    SSL_write(ssl, head_line, (int) strlen(head_line));
    head_line = "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36\r\n";
    SSL_write(ssl, head_line, (int) strlen(head_line));
    head_line = "\r\n";
    SSL_write(ssl, head_line, (int) strlen(head_line));

    char buff[BUFSIZ];
    while ((error = SSL_read(ssl, buff, BUFSIZ)) > 0) {
        fprintf(log_out, "%s", buff);
    }

    // 释放连接
    SSL_shutdown(ssl);
    close(sock);
    SSL_free(ssl);
    SSL_CTX_free(sslCtx);
    return 0;
}
```

