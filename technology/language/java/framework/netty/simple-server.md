# 使用Netty编写的一个简单的回声服务器

请求处理部分

```java
package com.zhong.crawler.proxy.proxyrequesthandler;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;
import io.netty.util.ReferenceCountUtil;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * 客户端代理请求处理
 *
 * @author aszswaz
 * @date 2021/7/9 09:18:33
 * @IDE IntelliJ IDEA
 */
@Slf4j
@SuppressWarnings({"JavaDoc", "FieldCanBeLocal", "unused"})
public class ProxyRequestHandler extends ChannelHandlerAdapter {
    /**
     * 连接建立
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        InetAddress inetSocketAddress = ((InetSocketAddress) ctx.channel().remoteAddress()).getAddress();
        log.info("与客户端：{} - {}建立连接", inetSocketAddress.getHostName(), inetSocketAddress.getHostAddress());

        // 创建缓冲区
        ByteBuf outBuf = ctx.alloc().buffer(1024);
        // 在缓冲区中写入问候
        outBuf.writeBytes(("Hello " + inetSocketAddress.getHostAddress() + System.lineSeparator()).getBytes(StandardCharsets.UTF_8));
        // 发送缓冲区中的数据，并刷新缓冲区
        final ChannelFuture channelFuture = ctx.writeAndFlush(outBuf);
        // 注册缓冲区写出完成之后的操作
        channelFuture.addListener((ChannelFutureListener) future -> {
            if (!channelFuture.equals(future)) return;
            log.info("客户端问候写出成功");
            /*
            关闭通道
            ctx.close();
             */
        });
        /*
        或者可以使用 netty 预定义的代码关闭连接
        channelFuture.addListener(ChannelFutureListener.CLOSE);
         */
    }

    /**
     * 通道中有数据到达
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        ByteBuf in = (ByteBuf) msg;
        String clientMessage = "";
        // ByteBuf.readableBytes 当前缓冲区可读字节
        byte[] buff = new byte[in.readableBytes()];
        if (in.isReadable()) {
            // 读取缓冲区中的所有字节
            in.readBytes(buff);
            clientMessage = new String(buff, StandardCharsets.UTF_8);
            System.out.println(clientMessage);
        }
        // 销毁缓冲区
        ReferenceCountUtil.release(msg);

        // 判断客户端
        if (clientMessage.toLowerCase(Locale.ROOT).contains("hello")) {
            ByteBuf messageBuf = ctx.alloc().buffer(1024);
            messageBuf.writeBytes("server: Hello client!\n".getBytes(StandardCharsets.UTF_8));
            ctx.write(messageBuf);
            ctx.flush();
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        // 引发异常，关闭连接
        log.error(cause.getMessage(), cause);
        ctx.close();
    }
}
```

服务器启动部分

```java
package com.zhong.crawler.proxy.server;

import com.zhong.crawler.proxy.proxyrequesthandler.ProxyRequestHandler;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import lombok.extern.slf4j.Slf4j;

/**
 * 代理服务器
 *
 * @author aszswaz
 * @date 2021/7/8 23:15:18
 * @IDE IntelliJ IDEA
 */
@Slf4j
@SuppressWarnings("JavaDoc")
public class CrawlerProxyServer {
    public static void start() throws Exception {
        /*
        EventLoopGroup 是用于处理I/O操作的多线程事件循环，
        第一个 EventLoopGroup 接受连接，并将接受的连接注册给第二个 EventLoopGroup
        使用多少线程以及它们如何映射到创建的通道取决于 EventLoopGroup 实现，甚至可以通过构造函数进行配置。
         */
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            // ServerBootstrap 是一个设置服务器的辅助类。 您可以直接使用 Channel 设置服务器。 但是，请注意，这是一个乏味的过程，在大多数情况下您不需要这样做。
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(bossGroup, workerGroup);
            // 在这里，我们指定使用 NioServerSocketChannel 类，该类用于实例化一个新的 Channel 以接受传入的连接。
            serverBootstrap.channel(NioServerSocketChannel.class);
            /*
            此处指定的处理程序将始终由新接受的 Channel 评估。
            ChannelInitializer 是一个特殊的处理程序，旨在帮助用户配置新的 Channel。
            很可能您希望通过添加一些处理程序（例如 ProxyRequestHandler）来配置新 Channel 的 ChannelPipeline 来实现您的网络应用程序。 随着应用程序变得复杂，您可能会向管道添加更多处理程序，并最终将此匿名类提取到顶级类中。
             */
            serverBootstrap.childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel ch) {
                    ch.pipeline().addLast(new ProxyRequestHandler());
                }
            });
            /*
            您还可以设置特定于 Channel 实现的参数。 我们正在编写一个 TCP/IP 服务器，因此我们可以设置套接字选项，例如 tcpNoDelay 和 keepAlive。 请参阅 ChannelOption 的 apidocs 和特定的 ChannelConfig 实现以获取有关支持的 ChannelOptions 的概述。
             */
            serverBootstrap.option(ChannelOption.SO_BACKLOG, 128);
            // 你注意到 option() 和 childOption() 了吗？ option() 用于接受传入连接的 NioServerSocketChannel.childOption() 用于父 ServerChannel 接受的 Channels，在本例中为 NioSocketChannel。
            serverBootstrap.childOption(ChannelOption.SO_KEEPALIVE, true);
            // 绑定端口
            ChannelFuture channelFuture = serverBootstrap.bind(8080).sync();
            /*
            等到服务器套接字关闭。
            在这个例子中，这不会发生，但你可以优雅地这样做
            关闭你的服务器。
            */
            channelFuture.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```

## 使用工具测试服务器的应答

```shell
$ telnet localhost 8080
```

<font color="red">本例代码摘抄自 [netty官网](https://netty.io/wiki/user-guide-for-5.x.html)，为了保持文档的详细，没有对代码做删改操作。这个例子的代码实际上存在一个异步IO的 bug，在总数据的字节数量超过默认的缓冲区大小（1024）的情况下，获取的字节不完全，会导致 html 文件只下载了一部分。具体的解决方法已经在[simple-client.md](simple-client.md)给出</font>

[netty中文文档](http://ifeve.com/netty5-user-guide/)

