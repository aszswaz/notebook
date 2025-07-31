# curl

## 配置文件

curl 默认会读取用户的home目录下的.curlrc文件，本仓库有已经配置好的[curlrc](../../scripts/config/curlrc)，通过ln链接到`${HOME}/.curlrc`即可使用。

也可以手动读取配置文件:

```bash
$ curl -K demo.conf
```

配置文件的内容就是curl的那些参数。

## 使用代理访问网站

**指令格式：**

```bash
$ curl -x [protocol]://[host]:[port] [url]
```

支持的代理协议：

| 协议    | 说明                                                         |
| ------- | ------------------------------------------------------------ |
| http    | 基于http的代理                                               |
| https   | 基于https的代理                                              |
| SOCKS4  | 只支持TCP应用；                                              |
| SOCKS4A | 支持TCP应用；支持服务器端域名解析；                          |
| SOCKS5  | 支持TCP和UDP应用；支持服务器端域名解析（curl需要使用socks5h）；支持多种身份验证；支持IPV6； |
| SOCKS5h | 支持socks5全部功能，支持服务端域名解析，仅curl支持           |

**例：**

以百度为例，使用socks5代理访问百度，指令如下：

```bash
$ curl -x socks5://example.com:80 https://www.baidu.com
```

<font color="red">注意，使用socks5链接时，域名的解析仍然是由本机来完成的</font>

修改hosts文件，加入如下内容

```bash
127.0.0.1  www.baidu.com
```

再次请求

```bash
$ curl -x socks5://example.com:80 https://www.baidu.com
```

```txt
curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to www.baidu.com:443 
```

这个问题在多数时候不会造成什么后果，但是有一种情况是例外的，那就是域名被污染了，比如访问`www.google.com`

```bash
$ curl -x socks5://example.com:80 https://www.google.com
```

```txt
curl: (60) SSL: no alternative certificate subject name matches target host name 'www.google.com'
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```

<font color="green">将协议从socks5改为socks5h即可</font>

## 常用参数/指令

--compressed 对gzip 之类经过压缩的响应流进行解压缩

-s                      开启curl的静音模式，curl在输出流不是终端的输出流的时候，会打印数据的传输信息，开启静音模式可以取消数据传输进度的打印

