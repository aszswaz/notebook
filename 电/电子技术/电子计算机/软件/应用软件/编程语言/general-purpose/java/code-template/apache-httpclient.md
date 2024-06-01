# Apache Http Client

## Maven

```xml
<!-- https://mvnrepository.com/artifact/org.apache.httpcomponents/httpclient -->
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.5.13</version>
</dependency>
```

## 使用比较全面的配置，构造一个 HttpClient

```java
import org.apache.http.client.HttpClient;
import java.nio.charset.StandardCharsets;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.config.ConnectionConfig;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.config.SocketConfig;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.DefaultHttpRequestRetryHandler;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;

public class HttpClientDemo {
    public static void main(String[] args) {
        HttpClientBuilder clientBuilder = HttpClients.custom();

        // HTTP 请求配置
        RequestConfig.Builder requestConfig = RequestConfig.custom();
        requestConfig.setConnectionRequestTimeout(60 * 1000);
        requestConfig.setSocketTimeout(60 * 1000);
        requestConfig.setConnectTimeout(60 * 1000);
        // 启用重定向
        requestConfig.setRedirectsEnabled(true);
        requestConfig.setMaxRedirects(10);
        requestConfig.setRelativeRedirectsAllowed(true);
        clientBuilder.setDefaultRequestConfig(requestConfig.build());

        // 启用 HTTP 和 HTTPS
        RegistryBuilder<ConnectionSocketFactory> registryBuilder = RegistryBuilder.create();
        registryBuilder.register("http", PlainConnectionSocketFactory.getSocketFactory());
        registryBuilder.register("https", SSLConnectionSocketFactory.getSystemSocketFactory());

        // 连接池配置
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager(registryBuilder.build());
        connectionManager.setMaxTotal(200);
        connectionManager.setDefaultMaxPerRoute(100);
        connectionManager.setValidateAfterInactivity(2 * 60 * 1000);

        // socket 配置
        SocketConfig.Builder socketConfig = SocketConfig.custom();
        socketConfig.setRcvBufSize(8192);
        socketConfig.setSndBufSize(8192);
        socketConfig.setSoKeepAlive(true);
        socketConfig.setSoTimeout(60 * 1000);
        connectionManager.setDefaultSocketConfig(socketConfig.build());

        // HTTP 连接配置
        ConnectionConfig.Builder connectionConfig = ConnectionConfig.custom();
        connectionConfig.setBufferSize(8192);
        connectionConfig.setCharset(StandardCharsets.UTF_8);
        connectionManager.setDefaultConnectionConfig(connectionConfig.build());
        clientBuilder.setConnectionManager(connectionManager);

        /*
        设置重试次数，也就是对IO超时做出重试
        第二个参数是表示是否重试非幂等的HTTP请求，在HTTP的定义中，GET、HEAD、PUT、DELETE方法是幂等的，而POST是非幂等的，
        因为相同的请求下，除非数据是动态数据，否则GET方法无论请求多少次，客户端收到的数据都是一样的
        PUT方法请求服务器修改数据，只要参数不变，修改结果也是一致的
        DELETE方法请求服务器删除数据，虽然多次请求，可能第一次返回状态码200，第二次请求返回状态码404，但是数据被删除这一结果没有改变，所以它也是幂等的
        POST方法请求服务器添加数据，多次请求可能会出现添加多条数据的情况，具体的主要看服务器对于资源唯一性的实现，所以它不是冥等的
        建议根据项目的实际需求，决定是否开启非幂等请求的重试，对于需要保证数据或者任务添加成功的情况，并且目标服务器能够保证资源的唯一性，建议开启非幂等请求重试
        */
        clientBuilder.setRetryHandler(new DefaultHttpRequestRetryHandler(3, false));

        // 构建 HTTP Client
        HttpClient httpClient = clientBuilder.build();
    }
}
```