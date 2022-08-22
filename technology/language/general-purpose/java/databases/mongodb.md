# Mongodb Java 驱动

## 连接 Mongodb 数据库

maven 配置

```xml
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongodb-driver-sync</artifactId>
    <version>4.4.0</version>
</dependency>
```

连接数据库

```Java
import static com.mongodb.client.model.Filters.eq;

import org.bson.Document;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public static void main( String[] args ) {

    // Replace the uri string with your MongoDB deployment's connection string
    String uri = "mongodb://username:password@exmaple.com:27017/demo?authSource=admin&Mechanism=SCRAM-SHA-1";

    try (MongoClient mongoClient = MongoClients.create(uri)) {
        MongoDatabase database = mongoClient.getDatabase("sample_mflix");
        MongoCollection<Document> collection = database.getCollection("movies");

        Document doc = collection.find(eq("title", "Back to the Future")).first();
        System.out.println(doc.toJson());
    }
}
```

