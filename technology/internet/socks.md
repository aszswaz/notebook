# SOCKS

**SOCKS**是一种[网络传输协议](https://zh.wikipedia.org/wiki/网络传输协议)，主要用于客户端与外网服务器之间通讯的中间传递。SOCKS是"SOCKet Secure"的[缩写](https://zh.wikipedia.org/wiki/缩写)[[注 1\]](https://zh.wikipedia.org/zh-cn/SOCKS#cite_note-1)。

当[防火墙](https://zh.wikipedia.org/wiki/防火墙_(网络))后的客户端要访问外部的服务器时，就跟SOCKS[代理服务器](https://zh.wikipedia.org/wiki/代理服务器)连接。这个代理服务器控制客户端访问外网的资格，允许的话，就将客户端的请求发往外部的服务器。

这个协议最初由David Koblas开发，而后由NEC的Ying-Da Lee将其扩展到SOCKS4。最新协议是SOCKS5，与前一版本相比，增加支持[UDP](https://zh.wikipedia.org/wiki/用户数据报协议)、验证，以及[IPv6](https://zh.wikipedia.org/wiki/IPv6)。

根据[OSI模型](https://zh.wikipedia.org/wiki/OSI模型)，SOCKS是[会话层](https://zh.wikipedia.org/wiki/会话层)的协议，位于[表示层](https://zh.wikipedia.org/wiki/表示层)与[传输层](https://zh.wikipedia.org/wiki/传输层)之间。

## 版本分支

下面是客户端向SOCKS 4代理[服务器](https://zh.wikipedia.org/wiki/服务器)，发送的连接请求包的格式（以[字节](https://zh.wikipedia.org/wiki/字节)为单位）：

| VN   | CD   | DSTPORT | DSTIP | USERID   | NULL |
| ---- | ---- | ------- | ----- | -------- | ---- |
| 1    | 1    | 2       | 4     | variable | 1    |

-   VN是SOCK版本，应该是4；
-   CD是SOCK的命令码，1表示CONNECT请求，2表示BIND请求；
-   DSTPORT表示目的主机的端口；
-   DSTIP指目的主机的[IP地址](https://zh.wikipedia.org/wiki/IP地址)；
-   NULL是0；

代理服务器而后发送回应包（以字节为单位）：

| VN   | CD   | DSTPORT | DSTIP |
| ---- | ---- | ------- | ----- |
| 1    | 1    | 2       | 4     |

CD是代理服务器答复，有几种可能：

*   请求得到允许；

*   请求被拒绝或失败；

*   由于SOCKS服务器无法连接到客户端的identd（一个验证身份的进程），请求被拒绝；

*   由于客户端程序与identd报告的用户身份不同，连接被拒绝。

DSTPORT与DSTIP与请求包中的内容相同，但被忽略。

如果请求被拒绝，SOCKS服务器马上与客户端断开连接；如果请求被允许，代理服务器就充当客户端与目的主机之间进行双向传递，对客户端而言，就如同直接在与目的主机相连。

## SOCKS4a

**SOCKS 4A**是SOCKS 4协议的简单扩展，允许[客户端](https://zh.wikipedia.org/wiki/客户端)对无法解析[域名](https://zh.wikipedia.org/wiki/域名)的目的主机进行访问。

客户端对DSTIP的头三个字节设定为NULL，最后一个字节为非零；对应的IP地址就是0.0.0.x，其中x是非零，这当然不可能是目的主机的地址，这样即使客户端可以解析域名，对此也不会发生冲突。USERID以紧跟的NULL字节作结尾，客户端必须发送目的主机的域名，并以另一个NULL字节作结尾。CONNECT和[BIND](https://zh.wikipedia.org/wiki/BIND)请求的时候，都要按照这种格式（以字节为单位）：

| VN   | CD   | DSTPORT | DSTIP 0.0.0.x | USERID   | NULL | HOSTNAME | NULL |
| ---- | ---- | ------- | ------------- | -------- | ---- | -------- | ---- |
| 1    | 1    | 2       | 4             | variable | 1    | variable | 1    |

使用4a协议的服务器必须检查请求包里的DSTIP字段，如果表示地址0.0.0.x，x是非零结尾，那么服务器就得读取客户端所发包中的域名字段，然后服务器就得解析这个[域名](https://zh.wikipedia.org/wiki/域名)，可以的话，对目的主机进行连接。

## SOCKS5

SOCKS5比SOCKS4a多了验证、IPv6、UDP支持。创建与SOCKS5服务器的TCP连接后客户端需要先发送请求来确认协议版本及认证方式，格式为（以字节为单位）：

| VER  | NMETHODS | METHODS |
| ---- | -------- | ------- |
| 1    | 1        | 1-255   |

*   VER是SOCKS版本，这里应该是0x05；
*   NMETHODS是METHODS部分的长度；
*   METHODS是客户端支持的认证方式列表，每个方法占1字节。当前的定义是：
    *   0x00 不需要认证
    *   0x01 GSSAPI
    *   0x02 用户名、密码认证
    *   0x03 - 0x7F由[IANA](https://zh.wikipedia.org/wiki/IANA)分配（保留）
        *   0x03: 握手挑战认证协议
        *   0x04: 未分派
        *   0x05: 响应挑战认证方法
        *   0x06: [传输层安全](https://zh.wikipedia.org/wiki/传输层安全)
        *   0x07: NDS认证
        *   0x08: 多认证框架
        *   0x09: JSON参数块
        *   0x0A–0x7F: 未分派
    *   0x80 - 0xFE为私人方法保留
    *   0xFF 无可接受的方法

**以 curl 为例**

```bash
$ curl -x socks5://localhost:8080 https://example.com
```

服务端收到字节

```txt
0x05 0x02 0x00 0x01 
```

有用户名和密码

```bash
$ curl -x socks5://localhost:8080 https://example.com --proxy-user username:password
```

```txt
0x05 0x03 0x00 0x01 0x02 
```

服务器从客户端提供的方法中选择一个并通过以下消息通知客户端（以字节为单位）：

| VER  | METHOD |
| ---- | ------ |
| 1    | 1      |

*   VER是SOCKS版本，这里应该是0x05；
*   METHOD是服务端选中的方法。如果返回0xFF表示没有一个认证方法被选中，客户端需要关闭连接。

之后客户端和服务端根据选定的认证方式执行对应的认证。

认证结束后客户端就可以发送请求信息。如果认证方法有特殊封装要求，请求必须按照方法所定义的方式进行封装。

SOCKS5请求格式（以字节为单位）：

| VER  | CMD  | RSV  | ATYP | DST.ADDR | DST.PORT |
| ---- | ---- | ---- | ---- | -------- | -------- |
| 1    | 1    | 0x00 | 1    | 动态     | 2        |

-   VER是SOCKS版本，这里应该是0x05；
-   CMD是SOCK的命令码
    *   0x01表示CONNECT请求
    *   0x02表示BIND请求
    *   0x03表示UDP转发
-   RSV 0x00，保留
-   ATYP DST.ADDR类型
    *   0x01 IPv4地址，DST.ADDR部分，固定4字节长度
    *   0x03 域名，DST.ADDR部分第一个字节为域名长度，DST.ADDR剩余的内容为域名，没有\0结尾。
    *   0x04 IPv6地址，16个字节长度。
-   DST.ADDR 目的地址
-   DST.PORT 网络字节序表示的目的端口，字节顺序为小端序

以curl的请求为例

```bash
$ curl -x socks5://localhost:8080 https://example.com
```

```txt
0x05 0x01 0x00 0x01 0x5d 0xb8 0xd8 0x22 0x01 0xbb 
```

0x05 协议版本，0x01 表示connect，0x00 保留字段，0x01 表示IP类型为IPv4，0x5d 0xb8 0xd8 0x22 表示IPv4地址（需要进行编码转换），0x01 0xbb 是端口号（这里是443端口）

**服务器按以下格式回应客户端的请求（以字节为单位）**：

-   VER是SOCKS版本，这里应该是0x05；
-   REP应答字段
    *   0x00表示成功
    *   0x01普通SOCKS服务器连接失败
    *   0x02现有规则不允许连接
    *   0x03网络不可达
    *   0x04主机不可达
    *   0x05连接被拒
    *   0x06 TTL超时
    *   0x07不支持的命令
    *   0x08不支持的地址类型
    *   0x09 - 0xFF未定义
-   RSV 0x00，保留
-   ATYP BND.ADDR类型
    *   0x01 IPv4地址，DST.ADDR部分4字节长度
    *   0x03域名，DST.ADDR部分第一个字节为域名长度，DST.ADDR剩余的内容为域名，没有\0结尾。
    *   0x04 IPv6地址，16个字节长度。
-   BND.ADDR 服务器绑定的地址
-   BND.PORT 网络字节序表示的服务器绑定的端口

**SOCKS5 用户名密码认证方式**

在客户端、服务端协商使用用户名密码认证后，客户端发出用户名密码，格式为（以字节为单位）：

| 鉴定协议版本 | 用户名长度 | 用户名 | 密码长度 | 密码 |
| ------------ | ---------- | ------ | -------- | ---- |
| 1            | 1          | 动态   | 1        | 动态 |

鉴定协议版本目前为 0x01 。

服务器鉴定后发出如下回应：

| 鉴定协议版本 | 鉴定状态 |
| ------------ | -------- |
| 1            | 1        |

其中鉴定状态 0x00 表示成功，0x01 表示失败。

