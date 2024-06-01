### elasticsearch的java客户端的使用(RestHighLevelClient)

## 创建elasticsearch的连接

```java
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;

import java.io.IOException;
import java.util.List;

/**
 * es工具
 *
 * @author aszswaz
 * @date 2021/4/7 13:42:17
 */
@SuppressWarnings("JavaDoc")
public abstract class ElasticsearchUtil {
    public static final String ELASTICSEARCH_IP = "lcaohost";
    public static final int ELASTICSEARCH_PORT = 9090;
    public static final RestHighLevelClient REST_HIGH_LEVEL_CLIENT;

    static {
        HttpHost httpHost = new HttpHost(ELASTICSEARCH_IP, ELASTICSEARCH_PORT, "http");
        RestClientBuilder restClientBuilder = RestClient.builder(httpHost);
        //设置身份验证
        RestClientBuilder.HttpClientConfigCallback clientConfigCallback = httpClientBuilder -> {
            CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(
                    "username", "password"
            ));
            httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
            return httpClientBuilder;
        };
        restClientBuilder.setHttpClientConfigCallback(clientConfigCallback);
        REST_HIGH_LEVEL_CLIENT = new RestHighLevelClient(restClientBuilder);
        // 验证连接有效性
        try {
            REST_HIGH_LEVEL_CLIENT.ping(RequestOptions.DEFAULT);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

```

pom

```xml
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
    <version>7.9.2</version>
</dependency>
```

