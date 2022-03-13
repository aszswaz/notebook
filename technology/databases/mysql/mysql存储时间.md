## mysql中timestamp与datetime的区别

1. 占用空间

   | **类型**  | **占据字节** | **表示形式**        |
   | --------- | ------------ | ------------------- |
   | datetime  | 8 字节       | yyyy-mm-dd hh:mm:ss |
   | timestamp | 4 字节       | yyyy-mm-dd hh:mm:ss |

2. 表示范围
   | 类型      | 表示范围                                                     |
   | --------- | ------------------------------------------------------------ |
   | datetime  | '1000-01-01 00:00:00.000000' to '9999-12-31 23:59:59.999999' |
   | timestamp | '1970-01-01 00:00:01.000000' to '2038-01-19 03:14:07.999999' |
   
3. 时区
   `timestamp` 只占 4 个字节，而且是以`utc`的格式储存， 它会自动检索当前时区并进行转换。

   `datetime`以 8 个字节储存，不会进行时区的检索.

   也就是说，对于`timestamp`来说，如果储存时的时区和检索时的时区不一样，那么拿出来的数据也不一样。对于`datetime`来说，存什么拿到的就是什么。

   还有一个区别就是如果存进去的是`NULL`，`timestamp`会自动储存当前时间，而 `datetime`会储存 `NULL`。

### 测试

创建一个表

```mysql
create table time_demo
(
    id               bigint unsigned auto_increment primary key,
    `timestamp_demo` timestamp default current_timestamp,
    `datetime_demo`  datetime  default now(),
    `message`        varchar(255)
);
```

插入数据

```mysql
INSERT INTO time_demo (message) value ('测试');

INSERT INTO time_demo
    (timestamp_demo, datetime_demo, message)
    value
    ('2021-04-22 11:00:00', '2021-04-22 11:00:00', '测试01');
```

编写jdbc: 

```java
package zhong.jdbc.demo;

import java.sql.*;

/**
 * @author aszswaz
 * @date 2021/4/22 11:47:10
 */
public class JdbcDemo {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        String url = "jdbc:mysql://desktop.localhost:3306/demo?serverTimezone=Asia/Shanghai";
        String user = "root";
        String password = "z199809051593";
        Connection connection = DriverManager.getConnection(url, user, password);
        Statement statement = connection.createStatement();

        String query = "select * from time_demo";
        ResultSet resultSet = statement.executeQuery(query);

        ResultSetMetaData metaData = resultSet.getMetaData();
        int cellCount = metaData.getColumnCount();

        StringBuilder builder = new StringBuilder();

        Object[] columns = new Object[cellCount];
        for (int i = 0; i < cellCount; i++) {
            columns[i] = metaData.getColumnLabel(i + 1);
            builder.append("|%-30s");
            if (i == cellCount - 1) {
                builder.append("|");
            }
        }
        System.out.printf(builder + System.lineSeparator(), columns);

        int num = cellCount * 30 + cellCount + 1;
        char[] chars = new char[num];
        for (int i = 0; i < num; i++) {
            if (i % 31 == 0) {
                chars[i] = '|';
            } else {
                chars[i] = '-';
            }
        }
        System.out.println(new String(chars));

        while (resultSet.next()) {
            Object[] data = new Object[cellCount];
            for (int i = 0; i < cellCount; i++) {
                data[i] = resultSet.getObject(i + 1);
            }
            System.out.printf(builder + System.lineSeparator(), data);
        }
    }
}
```

执行结果

```bash
|id                            |timestamp_demo                |datetime_demo                 |message                       |
|------------------------------|------------------------------|------------------------------|------------------------------|
|1                             |2021-04-22 10:59:13.0         |2021-04-22T10:59:13           |测试                            |
|2                             |2021-04-22 11:00:00.0         |2021-04-22T11:00              |测试01                          |
```

修改jdbc的时区参数

```java
String url = "jdbc:mysql://desktop.localhost:3306/demo?serverTimezone=UTC";
```

结果：

```bash
|id                            |timestamp_demo                |datetime_demo                 |message                       |
|------------------------------|------------------------------|------------------------------|------------------------------|
|1                             |2021-04-22 18:59:13.0         |2021-04-22T10:59:13           |测试                            |
|2                             |2021-04-22 19:00:00.0         |2021-04-22T11:00              |测试01                          |
```

<span style="color: red">可以看到，timestamp的字段，会随着时区的变化而变化，datetime不会有任何变化</span>