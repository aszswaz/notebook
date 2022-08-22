# 使用 Netty 编写一个Socket客户端

```java
package demos;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * netty 演示
 *
 * @author aszswaz
 * @date 2021/7/10 21:21:51
 * @IDE IntelliJ IDEA
 */
@Slf4j
@SuppressWarnings("JavaDoc")
public class NettyClientDemo extends ChannelHandlerAdapter {
    public static void main(String[] args) throws InterruptedException {
        final String host = "example.net";
        final int port = 80;

        // 事件组
        final EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(workerGroup);
            // 指定通道类型
            bootstrap.channel(NioSocketChannel.class);
            // 指定处理的事件类型
            bootstrap.option(ChannelOption.SO_KEEPALIVE, true);
            // 添加事件处理器
            bootstrap.handler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel ch) {
                    ch.pipeline().addLast(new NettyClientDemo());
                }
            });
            ChannelFuture channelFuture = bootstrap.connect(host, port).sync();
            channelFuture.channel().closeFuture().sync();
        } finally {
            workerGroup.shutdownGracefully();
        }
    }

    /**
     * 二进制缓存 MAP
     */
    private final Map<String, ByteArrayOutputStream> buffMap = new HashMap<>();

    /**
     * 处理连接成功建立事件
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        log.info("连接建立");
        // 写出http请求报文
        final String message = "GET / HTTP/1.1\r\n" +
                "Host: example.com\r\n" +
                "User-Agent: curl/7.77.0\r\n" +
                "Accept: */*\r\n" +
                "Connection: keep-alive\r\n\r\n";
        // 建立缓冲区
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        ByteBuf outBuf = ctx.alloc().buffer(bytes.length);
        outBuf.writeBytes(bytes);
        ctx.writeAndFlush(outBuf);
    }

    /**
     * 服务器的响应到达
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        log.info("服务器响应到达");
        ByteBuf inBuf = (ByteBuf) msg;
        /*
        异步IO如果以这种方式读取数据，会导致数据接收不完全，发生网页只是读取了一部分的问题
        if (inBuf.isReadable()) {
            System.out.println(inBuf.toString(StandardCharsets.UTF_8));
        }
         */

        /*
         还是得根据 http、ftp 这类的报文协议来判断数据是否接收成功
         本例以 gitea 服务器为例，采用 http 通信协议
         */
        String socketId = ctx.channel().read().id().asLongText();
        // 使用 byteOutStream 缓存字节
        ByteArrayOutputStream byteArrayOutputStream = this.buffMap.get(socketId);
        if (byteArrayOutputStream == null) {
            byteArrayOutputStream = new ByteArrayOutputStream();
            this.buffMap.put(socketId, byteArrayOutputStream);
        }
        if (inBuf.isReadable()) {
            int len = inBuf.readableBytes();
            byte[] bytes = new byte[len];
            inBuf.readBytes(bytes);
            byteArrayOutputStream.write(bytes, 0, len);
            // 这个1024只是默认的缓冲区大小，这里就只是假设如果缓冲区没有被填满，那就当作这个流的全部数据已经接收完毕
            // 但是对方操作 I\O 的 flush 方法强制的发送缓冲区，在全部数据没有接收完毕的情况下，这个缓冲区的可读字节数就不一定是1024了
            // 实际需要的什么时候才能停止读取流，开始处理业务，需要根据具体的通信协议去判断，
            // 比如 http 协议规定，请求报文的结尾需要连续的 “ \r\n\r\n ”表示报文结束，那么就需要完整的读取到 “ \r\n\r\n ”后才可以真正开始分析客户端的请求，然后开始业务处理
            if (len != 1024) {
                System.out.println(byteArrayOutputStream);
                ctx.close();
            }
        }
    }
}
```

