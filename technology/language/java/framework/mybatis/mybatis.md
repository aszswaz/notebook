# [mybatis](https://mybatis.org/mybatis-3/zh/index.html)

MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。

## mybatis + Hikari 数据库连接池 + 自动扫描 mapper

mybatis.xml:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="com.zhiweidata.automatictest.publics.HikariDataSourceFactory">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://example.com:3306/mysql?useSSL=FALSE&amp;serverTimezone=Asia/Shanghai"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${passowrd}"/>
            </dataSource>
        </environment>
    </environments>
</configuration>
```

demo/MybatisDemo.java:

```java
package demo;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.builder.xml.XMLConfigBuilder;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.jetbrains.annotations.NotNull;

import static java.util.Objects.requireNonNull;

/**
 * @author aszswaz
 * @createTime 2021-09-09 15:11:59
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class MybatisDemo {
    private static final SqlSessionFactory SQL_SESSION_FACTORY;

    static {
        SqlSessionFactory sqlSessionFactory = null;
        try (InputStream inputStream = Resources.getResourceAsStream("mybatis.xml")) {
            SqlSessionFactoryBuilder builder = new SqlSessionFactoryBuilder();

            // 先读取xml中的配置
            XMLConfigBuilder configBuilder = new XMLConfigBuilder(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            configBuilder.parse();
            Configuration configuration = configBuilder.getConfiguration();
            // mybatis不支持在文件下扫描mapper.xml，需要自己实现
            File mappersDir = Resources.getResourceAsFile("mappers");
            scanMapper(mappersDir, configuration);

            sqlSessionFactory = builder.build(configuration);
        } catch (Exception e) {
            e.printStackTrace();
        }
        SQL_SESSION_FACTORY = sqlSessionFactory;
    }

    /**
     * 扫描mapper
     */
    private static void scanMapper(@NotNull File file, @NotNull Configuration configuration) throws IOException {
        if (file.isDirectory()) {
            File[] mappers = requireNonNull(file.listFiles());
            for (File mapper : mappers) {
                scanMapper(mapper, configuration);
            }
        } else {
            String fileName = file.getName();
            if (".xml".equals(fileName.substring(fileName.lastIndexOf(".")))) {
                String resource = file.toPath().toUri().toString();
                try (InputStream inputStream = Resources.getUrlAsStream(resource)) {
                    XMLMapperBuilder mapperBuilder = new XMLMapperBuilder(inputStream, configuration, resource, configuration.getSqlFragments());
                    mapperBuilder.parse();
                }
            }
        }
    }

    public static void main(String[] args) {
        try (SqlSession session = SQL_SESSION_FACTORY.openSession(true)) {
            List<String> databases = session.getMapper(DemoMapper.class).showDatabases();
            databases.forEach(System.out::println);
        }
    }
}
```

demo/DemoMapper.java:

```java
package demo;

import java.util.List;

/**
 * @author aszswaz
 * @createTime 2021-09-09 15:14:37
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public interface DemoMapper {
    List<String> showDatabases();
}
```

mappers/DemoMapper.xml:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="demo.DemoMapper">
    <select id="showDatabases" resultType="string">
        SHOW DATABASES
    </select>
</mapper>
```

com/zhiweidata/automatictest/publics/HikariDataSourceFactory.java:

```java
package com.zhiweidata.automatictest.publics;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.util.Properties;
import javax.sql.DataSource;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.datasource.DataSourceFactory;
import org.jetbrains.annotations.NotNull;

/**
 * mysql的数据库连接池Hikari工厂
 *
 * @author aszswaz
 * @createTime 2021-09-09 10:41:07
 * @ide IntelliJ IDEA
 */
@Slf4j
@SuppressWarnings("JavaDoc")
public class HikariDataSourceFactory implements DataSourceFactory {
    private HikariConfig config;

    @Override
    public void setProperties(@NotNull Properties properties) {
        final String initSql = "SHOW DATABASES";
        final long timeout = 60000;

        this.config = new HikariConfig();
        this.config.setDriverClassName(properties.getProperty("driver"));
        this.config.setJdbcUrl(properties.getProperty("url"));
        this.config.setUsername(properties.getProperty("username"));
        this.config.setPassword(properties.getProperty("password"));
        this.config.setAutoCommit(true);
        this.config.setConnectionTestQuery(initSql);
        this.config.setConnectionInitSql(initSql);
        this.config.setConnectionTimeout(timeout);
        this.config.setIdleTimeout(timeout << 1);
        this.config.setInitializationFailTimeout(timeout);
        this.config.setMaximumPoolSize(10);
        this.config.setMinimumIdle(5);
        this.config.setMaxLifetime(timeout << 2);
    }

    @Override
    public DataSource getDataSource() {
        return new HikariDataSource(this.config);
    }
}
```

<font color="red">注意：这种扫描方式只适用于非jar包运行</font>

