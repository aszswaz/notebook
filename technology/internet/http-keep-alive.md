## HTTP 的长连接数据传输模式

使用 http 的长连接，进行传输数据的时候，有两种传输模式。

### 一、普通传输形式

服务器在响应首部添加 Content-Length 表示这次响应体的长度，超过这个长度的响应体会被截断，SpringBoot默认的长连接传输模式就是这个

以 SpringBoot 作为服务器，使用 java 的 Socket 去请求服务器：

首先从 [SpringBoot 官网](https://start.spring.io/) 建立 SpringBoot 项目（Dependencies需要添加 Spring Web），下载一个zip压缩包，解压后，在 src/main/resources/static 文件夹下，新建一个 index.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>connect test</title>
</head>
<body>
  <h1 style="text-align: center">connect test</h1>
</body>
</html>
```

编译并且启动服务器

```bash
$ mvn package -Dmaven.test.skip=true
$ java -jar target/demo-0.0.1-SNAPSHOT.jar
```

```txt
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v2.5.2)

2021-07-10 21:20:19.941  INFO 24396 --- [           main] com.example.demo.DemoApplication         : Starting DemoApplication v0.0.1-SNAPSHOT using Java 1.8.0_291 on aszswaz with PID 24396 (/home/aszswaz/Public/demo/target/demo-0.0.1-SNAPSHOT.jar started by aszswaz in /home/aszswaz/Documents)
2021-07-10 21:20:19.955  INFO 24396 --- [           main] com.example.demo.DemoApplication         : No active profile set, falling back to default profiles: default
2021-07-10 21:20:21.365  INFO 24396 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2021-07-10 21:20:21.386  INFO 24396 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-07-10 21:20:21.387  INFO 24396 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.48]
2021-07-10 21:20:21.480  INFO 24396 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2021-07-10 21:20:21.481  INFO 24396 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 1399 ms
2021-07-10 21:20:21.887  INFO 24396 --- [           main] o.s.b.a.w.s.WelcomePageHandlerMapping    : Adding welcome page: class path resource [static/index.html]
2021-07-10 21:20:22.003  INFO 24396 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2021-07-10 21:20:22.014  INFO 24396 --- [           main] com.example.demo.DemoApplication         : Started DemoApplication in 2.626 seconds (JVM running for 3.152)
```

编写java代码：

```java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

/**
 * @author aszswaz
 * @date 2021/7/10 21:21:51
 * @IDE IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class Demo {
    public static void main(String[] args) {
        Socket socket = null;
        try {
            socket = new Socket("localhost", 8080);
            final OutputStream outputStream = socket.getOutputStream();
            final InputStream inputStream = socket.getInputStream();
            String[] headers = {
                    "GET / HTTP/1.1",
                    "Host: localhost",
                    "User-Agent: curl/7.77.0",
                    "Accept: */*",
                    "Connection: keep-alive"
            };
            for (String header : headers) {
                outputStream.write(header.getBytes(StandardCharsets.UTF_8));
                outputStream.write('\r');
                outputStream.write('\n');
            }
            // 表示报文发送完毕
            outputStream.write('\r');
            outputStream.write('\n');

            int bit;
            /* 注意千万不能把 != -1 写成 >= 0 或 > 0，因为有些时候看起来是个负数，但它是一串连续的数据中的4个字节，
               所以只有 -1 才能表示输入流已经关闭（网络流就是TCP连接已经关闭，read返回值为 -1）*/
            while ((bit = inputStream.read()) != -1) {
                System.out.print((char) bit);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (Objects.nonNull(socket)) socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

运行代码，从SpringBoot中获得的响应如下：

```txt
HTTP/1.1 200 
Vary: Origin
Vary: Access-Control-Request-Method
Vary: Access-Control-Request-Headers
Last-Modified: Sat, 10 Jul 2021 11:56:53 GMT
Accept-Ranges: bytes
Content-Type: text/html
Content-Language: zh-CN
Content-Length: 181
Date: Sat, 10 Jul 2021 13:32:24 GMT
Keep-Alive: timeout=60
Connection: keep-alive

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>connect test</title>
</head>
<body>
  <h1 style="text-align: center">connect test</h1>
</body>
</html>
```

可以看到响应首部带有 `Content-Length: 181`

### 二、数据块传输模式

数据块传输模式的特点是服务器在响应首部带有`Transfer-Encoding: chunked`，

关于`Transfer-Encoding`，[MDN官网](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Transfer-Encoding)介绍如下：

**语法**

```txt
Transfer-Encoding: chunked
Transfer-Encoding: compress
Transfer-Encoding: deflate
Transfer-Encoding: gzip
Transfer-Encoding: identity

// 可以列出多个值，用逗号分隔
Transfer-Encoding: gzip, chunked
```

**指令**

>   chunked
>
>   >   数据以一系列分块的形式进行发送。 Content-Length 首部在这种情况下不被发送。。在每一个分块的开头需要添加当前分块的长度，以十六进制的形式表示，后面紧跟着 '\r\n' ，之后是分块本身，后面也是'\r\n' 。终止块是一个常规的分块，不同之处在于其长度为0。终止块后面是一个挂载（trailer），由一系列（或者为空）的实体消息首部构成。

>   compress
>
>   >   采用 Lempel-Ziv-Welch (LZW) 压缩算法。这个名称来自UNIX系统的 compress 程序，该程序实现了前述算法。
>   >   与其同名程序已经在大部分UNIX发行版中消失一样，这种内容编码方式已经被大部分浏览器弃用，部分因为专利问题（这项专利在2003年到期）。

>   deflate
>
>   >   采用 zlib 结构 (在 RFC 1950 中规定)，和 deflate 压缩算法(在 RFC 1951 中规定)。

>   gzip
>
>   >   表示采用  Lempel-Ziv coding (LZ77) 压缩算法，以及32位CRC校验的编码方式。这个编码方式最初由 UNIX 平台上的 gzip 程序采用。处于兼容性的考虑， HTTP/1.1 标准提议支持这种编码方式的服务器应该识别作为别名的 x-gzip 指令。

>   identity
>
>   >   用于指代自身（例如：未经过压缩和修改）。除非特别指明，这个标记始终可以被接受。

**示例**

分块编码

分块编码主要应用于如下场景，即要传输大量的数据，但是在请求在没有被处理完之前响应的长度是无法获得的。例如，当需要用从数据库中查询获得的数据生成一个大的HTML表格的时候，或者需要传输大量的图片的时候。一个分块响应形式如下：

```txt
HTTP/1.1 200 OK
Content-Type: text/plain
Transfer-Encoding: chunked

7\r\n
Mozilla\r\n
9\r\n
Developer\r\n
7\r\n
Network\r\n
0\r\n
\r\n
```

以上是MDN官网的讲解，百度的搜索引擎首页，大部分的资源连接是通过这种方式进行的传输（个人觉得第二种方式相对第一种方式要麻烦些，毕竟需要把数据切割成块，在数据量大的情况下这个可以理解，但是用数据块去传输html、js、css这类的网页静态资源，不知道百度是图什么。google的搜索引擎首页使用的主要还是`Content-Length`方式）

有一个开源项目叫 gitea，这是个 git 仓库服务器，它页面也是通过数据分块的方式传输，这个项目怎么部署运行，请看[gitea官网的帮助](https://docs.gitea.io/zh-cn/)，这里不做叙述。

以 gitea 作为目标服务，使用上一个例子的 java 代码发起请求，响应如下：

```txt
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Set-Cookie: i_like_gitea=421e74b88b10db89; Path=/; HttpOnly
Set-Cookie: _csrf=GguXgQim2zMqeMxhFqcucTvksDg6MTYyNTkyNDkwMjk1Mjg0NjY4MA; Path=/; Expires=Sun, 11 Jul 2021 13:48:22 GMT; HttpOnly; SameSite=Lax
Set-Cookie: macaron_flash=; Path=/; Max-Age=0; HttpOnly
X-Frame-Options: SAMEORIGIN
Date: Sat, 10 Jul 2021 13:48:22 GMT
Transfer-Encoding: chunked

31ea
<!DOCTYPE html>
<html lang="en-US" class="theme-">
// 此处省略网页代码
</html>


0

```

可以看到，响应首部有`Transfer-Encoding: chunked`，响应体的第一行`31ea`正是数据块的长度（十六进制），gitea 只是使用了两个数据块，一个是包含数据的块，一个是长度为0，表示响应结束的数据块。根据这一套分块编码，我简单写了个对应的读取方式：

```java
package test;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

/**
 * @author aszswaz
 * @date 2021/7/9 01:05:51
 * @IDE IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class RequestTest {
    public static void main(String[] args) throws IOException {
        Socket socket = new Socket("localhost", 3000);
        OutputStream outputStream = socket.getOutputStream();
        InputStream inputStream = socket.getInputStream();
        String[] headers = {
                "GET / HTTP/1.1",
                "Host: localhost:3000",
                "User-Agent: curl/7.77.0",
                "Accept: */*",
                "Connection: keep-alive"
        };
        for (String header : headers) {
            outputStream.write(header.getBytes(StandardCharsets.UTF_8));
            outputStream.write('\r');
            outputStream.write('\n');
        }
        outputStream.write('\r');
        outputStream.write('\n');

        // 读取请求头的部分
        int[] buff = new int[4];
        int i = 0;
        int len;
        while ((len = inputStream.read()) != -1) {
            System.out.print((char) len);
            if (len == '\r' || len == '\n') {
                buff[i++] = len;
                boolean b = buff[0] == '\r' && buff[1] == '\n' &&
                        buff[2] == '\r' && buff[3] == '\n';
                if (b) break;
            } else {
                i = 0;
            }
        }

        // 读取数据块
        label01:
        while (true) {
            // 读取数据块的长度，这个长度以16进制表示
            StringBuilder stringBuilder = new StringBuilder();
            int lastChar = 0;
            while (true) {
                len = inputStream.read();
                if (len == -1) {
                    socket.close();
                    return;
                }
                if (lastChar == '\r' && len == '\n') {
                    break;
                }
                if (len != '\r' && len != '\n') {
                    if (len == 0) {
                        break label01;
                    }
                    stringBuilder.append((char) len);
                }
                lastChar = len;
            }
            long blockLength = Long.parseLong(stringBuilder.toString(), 16);
            System.out.println("数据块的长度：" + blockLength);
            // 如果数据块的长度为0，表示文件传输完成
            if (blockLength == 0) break;
            // 读取数据块
            // 已经读取的数据块的长度
            int currentBlockLength = 0;
            do {
                len = inputStream.read();
                if (len == -1) {
                    socket.close();
                    return;
                }
                System.out.print((char) len);
                currentBlockLength++;
            } while (currentBlockLength != blockLength);
            // 分块的后面也是'\r\n'
            System.out.print((char) inputStream.read());
            System.out.print((char) inputStream.read());
        }

        socket.close();
    }
}
```

效果如下：

```txt
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Set-Cookie: i_like_gitea=9ccc99e84d87e312; Path=/; HttpOnly
Set-Cookie: _csrf=srM1EOR3Yd0F8YWXPnx6hMMAxx06MTYyNTkyNjI0MjQxNDQ4Mzg5Ng; Path=/; Expires=Sun, 11 Jul 2021 14:10:42 GMT; HttpOnly; SameSite=Lax
Set-Cookie: macaron_flash=; Path=/; Max-Age=0; HttpOnly
X-Frame-Options: SAMEORIGIN
Date: Sat, 10 Jul 2021 14:10:42 GMT
Transfer-Encoding: chunked

数据块的长度：12778
<!DOCTYPE html>
<html lang="en-US" class="theme-">
<head data-suburl="">
// 省略html代码
</html>


数据块的长度：0
```

可以看到十六进制`31ea`表示的数据块长度为`12778`（这个长度不包括分块末尾的`\r\n`），读取了正常的数据块，还有一个长度为0的数据块表述本次响应结束。