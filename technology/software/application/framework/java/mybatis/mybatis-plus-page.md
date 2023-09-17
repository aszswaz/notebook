# mybatis插件

## 引入maven

```xml
<!-- https://mvnrepository.com/artifact/com.baomidou/mybatis-plus-boot-starter -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.2</version>
</dependency>
```

## 搭配SpringBoot使用

引入maven

```xml
<!-- https://mvnrepository.com/artifact/com.baomidou/mybatis-plus-boot-starter -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.2</version>
</dependency>
```

表结构：

```mysql
CREATE TABLE demo
(
    `id`   BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    `demo` VARCHAR(255)
) CHAR SET utf8mb4;
```

实体类

```java
package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * @author aszswaz
 * @date 2021/4/30 16:42:40
 */
@SuppressWarnings("JavaDoc")
@Data
@TableName(value = "demo")
public class DemoEntity {
    /**
     * 设置数据库的主键自增
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    /**
     * 文本
     */
    @TableField(value = "demo")
    private String demo;
}
```

mapper

```java
package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.DemoEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author aszswaz
 * @date 2021/4/30 16:42:17
 */
@SuppressWarnings("JavaDoc")
@Mapper
public interface DemoMapper extends BaseMapper<DemoEntity> {
    Integer inserts(
            @Param(value = "list") List<DemoEntity> demoEntities
    );
}
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.mapper.DemoMapper">
    <insert id="inserts">
        INSERT INTO demo (demo)
        VALUES
        <foreach collection="list" item="item" separator=",">
            (#{demo})
        </foreach>
    </insert>
</mapper>
```

注入插件的bean

```java
package com.example.demo.util;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

/**
 * @author aszswaz
 * @date 2021/4/30 17:16:21
 */
@Component
@SuppressWarnings("JavaDoc")
public class BeanUtil {
    @Bean
    public MybatisPlusInterceptor paginationInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 设置SQL类型
        PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        // 设置最大分页数量
        paginationInnerInterceptor.setMaxLimit((long) ServerConfig.MAX_LIMIT);
        interceptor.addInnerInterceptor(paginationInnerInterceptor);
        return interceptor;
    }
}
```

<span style="color: orange">其实如果只是增删改查，是不需要创建`MybatisPlusInterceptor`bean的，但是插件的分页查询功能就无法使用（也不会出现异常，就是分页无效，会返回所有数据罢了）。</span>

单元测试：

```java
package com.example.demo.mybatis;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.entity.DemoEntity;
import com.example.demo.mapper.DemoMapper;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * @author aszswaz
 * @date 2021/4/30 16:41:39
 */
@SuppressWarnings("JavaDoc")
@Log4j2
@SpringBootTest
public class MybatisPlusTest {
    @Autowired
    private DemoMapper demoMapper;

    /**
     * 先向数据库存储一百条数据
     */
    @Test
    void inserts() {
        List<DemoEntity> demoEntities = new ArrayList<>(100);
        for (int i = 0; i < 100; i++) {
            DemoEntity demoEntity = new DemoEntity();
            demoEntity.setDemo("demo-" + i);
            demoEntities.add(demoEntity);
        }
        log.info("成功插入：" + this.demoMapper.inserts(demoEntities));
    }

    /**
     * 分页查询
     */
    @Test
    void selectPage() {
        Page<DemoEntity> page = new Page<>();
        // 设置每一页的大小
        page.setSize(20);
        // 设置每页最大的大小，如果size < MaxLimit，查询使用的size，如果size > MaxLimit 查询使用的MaxLimit
        page.setMaxLimit(50L);
        // 注意：0也是第一页
        page.setCurrent(1);
        // 指定查询条件，也可以直接是null（查询所有）
        QueryWrapper<DemoEntity> queryWrapper = new QueryWrapper<>();
        // 设置返回对象
        queryWrapper.setEntityClass(DemoEntity.class);

        while (true) {
            // 发起查询
            page = this.demoMapper.selectPage(page, queryWrapper);
            if (Objects.isNull(page.getRecords()) || page.getRecords().isEmpty()) {
                break;
            }
            log.info("当前页：" + page.getCurrent());
            log.info("总页数：" + page.getPages());
            log.info("总数：" + page.getTotal());
            log.info("当前分页大小：" + page.getSize());
            log.info("最大分页上限：" + page.getMaxLimit());
            log.info("当前查询得到的数量：" + page.getRecords().size());
            page.getRecords().forEach(System.out::println);
            // 下一页
            page.setCurrent(page.getCurrent() + 1);
        }
    }
}
```

