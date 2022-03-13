# quartz基于mysql数据库的调度器（自定义数据库连接池）

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>quartz</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencies>
        <!--quartz-->
        <!-- https://mvnrepository.com/artifact/org.quartz-scheduler/quartz -->
        <dependency>
            <groupId>org.quartz-scheduler</groupId>
            <artifactId>quartz</artifactId>
            <version>2.3.2</version>
            <exclusions>
                <exclusion>
                    <groupId>com.zaxxer</groupId>
                    <artifactId>HikariCP-java7</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.25</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/com.zaxxer/HikariCP -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>4.0.3</version>
        </dependency>
        <!-- 日志 -->
        <!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-core -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.14.1</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-api -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>2.14.1</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-1.2-api -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-1.2-api</artifactId>
            <version>2.14.1</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.slf4j/slf4j-api -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.0-alpha1</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.slf4j/slf4j-simple -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>2.0.0-alpha1</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.20</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

</project>
```



首先创建数据库

```sql
CREATE DATABASE quartz CHARSET utf8mb4;
```

建表

```sql
DROP DATABASE quartz;
CREATE DATABASE quartz CHARSET utf8mb4;
USE quartz;

CREATE TABLE QRTZ_JOB_DETAILS
(
    SCHED_NAME        VARCHAR(120) NOT NULL,
    JOB_NAME          VARCHAR(200) NOT NULL,
    JOB_GROUP         VARCHAR(200) NOT NULL,
    DESCRIPTION       VARCHAR(250) NULL,
    JOB_CLASS_NAME    VARCHAR(250) NOT NULL,
    IS_DURABLE        VARCHAR(1)   NOT NULL,
    IS_NONCONCURRENT  VARCHAR(1)   NOT NULL,
    IS_UPDATE_DATA    VARCHAR(1)   NOT NULL,
    REQUESTS_RECOVERY VARCHAR(1)   NOT NULL,
    JOB_DATA          BLOB         NULL,
    PRIMARY KEY (SCHED_NAME, JOB_NAME, JOB_GROUP)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储每一个已配置的 Job 的详细信息';


CREATE TABLE QRTZ_TRIGGERS
(
    SCHED_NAME     VARCHAR(120) NOT NULL,
    TRIGGER_NAME   VARCHAR(200) NOT NULL,
    TRIGGER_GROUP  VARCHAR(200) NOT NULL,
    JOB_NAME       VARCHAR(200) NOT NULL,
    JOB_GROUP      VARCHAR(200) NOT NULL,
    DESCRIPTION    VARCHAR(250) NULL,
    NEXT_FIRE_TIME BIGINT(13)   NULL,
    PREV_FIRE_TIME BIGINT(13)   NULL,
    PRIORITY       INTEGER      NULL,
    TRIGGER_STATE  VARCHAR(16)  NOT NULL,
    TRIGGER_TYPE   VARCHAR(8)   NOT NULL,
    START_TIME     BIGINT(13)   NOT NULL,
    END_TIME       BIGINT(13)   NULL,
    CALENDAR_NAME  VARCHAR(200) NULL,
    MISFIRE_INSTR  SMALLINT(2)  NULL,
    JOB_DATA       BLOB         NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, JOB_NAME, JOB_GROUP)
        REFERENCES QRTZ_JOB_DETAILS (SCHED_NAME, JOB_NAME, JOB_GROUP)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储已配置的 Trigger 的信息';


CREATE TABLE QRTZ_SIMPLE_TRIGGERS
(
    SCHED_NAME      VARCHAR(120) NOT NULL,
    TRIGGER_NAME    VARCHAR(200) NOT NULL,
    TRIGGER_GROUP   VARCHAR(200) NOT NULL,
    REPEAT_COUNT    BIGINT(7)    NOT NULL,
    REPEAT_INTERVAL BIGINT(12)   NOT NULL,
    TIMES_TRIGGERED BIGINT(10)   NOT NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储简单的 Trigger，包括重复次数，间隔，以及已触的次数';


CREATE TABLE QRTZ_CRON_TRIGGERS
(
    SCHED_NAME      VARCHAR(120) NOT NULL,
    TRIGGER_NAME    VARCHAR(200) NOT NULL,
    TRIGGER_GROUP   VARCHAR(200) NOT NULL,
    CRON_EXPRESSION VARCHAR(120) NOT NULL,
    TIME_ZONE_ID    VARCHAR(80),
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储 Cron Trigger，包括 Cron 表达式和时区信息';


CREATE TABLE QRTZ_SIMPROP_TRIGGERS
(
    SCHED_NAME    VARCHAR(120)   NOT NULL,
    TRIGGER_NAME  VARCHAR(200)   NOT NULL,
    TRIGGER_GROUP VARCHAR(200)   NOT NULL,
    STR_PROP_1    VARCHAR(512)   NULL,
    STR_PROP_2    VARCHAR(512)   NULL,
    STR_PROP_3    VARCHAR(512)   NULL,
    INT_PROP_1    INT            NULL,
    INT_PROP_2    INT            NULL,
    LONG_PROP_1   BIGINT         NULL,
    LONG_PROP_2   BIGINT         NULL,
    DEC_PROP_1    NUMERIC(13, 4) NULL,
    DEC_PROP_2    NUMERIC(13, 4) NULL,
    BOOL_PROP_1   VARCHAR(1)     NULL,
    BOOL_PROP_2   VARCHAR(1)     NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储简单的 Trigger，包括重复次数，间隔，以及已触的次数';

CREATE TABLE QRTZ_BLOB_TRIGGERS
(
    SCHED_NAME    VARCHAR(120) NOT NULL,
    TRIGGER_NAME  VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    BLOB_DATA     BLOB         NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
        REFERENCES QRTZ_TRIGGERS (SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT 'Trigger 作为 Blob 类型存储, (用于 Quartz 用户用 JDBC 创建他们自己定制的 Trigger 类型，JobStore并不知道如何存储实例的时候)';


CREATE TABLE QRTZ_CALENDARS
(
    SCHED_NAME    VARCHAR(120) NOT NULL,
    CALENDAR_NAME VARCHAR(200) NOT NULL,
    CALENDAR      BLOB         NOT NULL,
    PRIMARY KEY (SCHED_NAME, CALENDAR_NAME)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '以 Blob 类型存储 Quartz 的 Calendar 信息';

CREATE TABLE QRTZ_PAUSED_TRIGGER_GRPS
(
    SCHED_NAME    VARCHAR(120) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    PRIMARY KEY (SCHED_NAME, TRIGGER_GROUP)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储已暂停的 Trigger 组的信息';


CREATE TABLE QRTZ_FIRED_TRIGGERS
(
    SCHED_NAME        VARCHAR(120) NOT NULL,
    ENTRY_ID          VARCHAR(95)  NOT NULL,
    TRIGGER_NAME      VARCHAR(200) NOT NULL,
    TRIGGER_GROUP     VARCHAR(200) NOT NULL,
    INSTANCE_NAME     VARCHAR(200) NOT NULL,
    FIRED_TIME        BIGINT(13)   NOT NULL,
    SCHED_TIME        BIGINT(13)   NOT NULL,
    PRIORITY          INTEGER      NOT NULL,
    STATE             VARCHAR(16)  NOT NULL,
    JOB_NAME          VARCHAR(200) NULL,
    JOB_GROUP         VARCHAR(200) NULL,
    IS_NONCONCURRENT  VARCHAR(1)   NULL,
    REQUESTS_RECOVERY VARCHAR(1)   NULL,
    PRIMARY KEY (SCHED_NAME, ENTRY_ID)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储与已触发的 Trigger 相关的状态信息，以及相联 Job 的执行信息';


CREATE TABLE QRTZ_SCHEDULER_STATE
(
    SCHED_NAME        VARCHAR(120) NOT NULL,
    INSTANCE_NAME     VARCHAR(200) NOT NULL,
    LAST_CHECKIN_TIME BIGINT(13)   NOT NULL,
    CHECKIN_INTERVAL  BIGINT(13)   NOT NULL,
    PRIMARY KEY (SCHED_NAME, INSTANCE_NAME)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储少量的有关 Scheduler 的状态信息，和别的 Scheduler 实例(假如是用于一个集群中)';


CREATE TABLE QRTZ_LOCKS
(
    SCHED_NAME VARCHAR(120) NOT NULL,
    LOCK_NAME  VARCHAR(40)  NOT NULL,
    PRIMARY KEY (SCHED_NAME, LOCK_NAME)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '存储程序的悲观锁的信息(假如使用了悲观锁)';
```

```java
package com.zhongzhang;

import lombok.extern.log4j.Log4j2;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

/**
 * @author aszswaz
 * @date 2021/6/4 13:33:55
 * @IDE IntelliJ IDEA
 */
@Log4j2
@SuppressWarnings("JavaDoc")
public class QuartzDemo {
    public static void main(String[] args) throws SchedulerException {
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
        if (!scheduler.checkExists(new JobKey("demo", "demo"))) {
            JobBuilder jobBuilder = JobBuilder.newJob(QuartzJob.class);
            jobBuilder.withIdentity("demo", "demo");
            jobBuilder.usingJobData("demo", "Hello World");
            JobDetail jobDetail = jobBuilder.build();
            TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger();
            triggerBuilder.withIdentity("demo", "demo");
            triggerBuilder.withSchedule(SimpleScheduleBuilder.repeatSecondlyForever(5));
            Trigger trigger = triggerBuilder.build();
            scheduler.scheduleJob(jobDetail, trigger);
        }
        scheduler.start();
    }
}
```

```java
package com.zhongzhang;

import lombok.extern.log4j.Log4j2;
import org.quartz.Job;
import org.quartz.JobExecutionContext;

/**
 * @author aszswaz
 * @date 2021/6/4 13:36:04
 * @IDE IntelliJ IDEA
 */
@Log4j2
@SuppressWarnings("JavaDoc")
public class QuartzJob implements Job {
    @Override
    public void execute(JobExecutionContext context) {
        log.info(context.getMergedJobDataMap().getString("demo"));
    }
}
```

自定义数据库连接池

```java
package com.zhongzhang;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.log4j.Log4j2;
import org.quartz.utils.ConnectionProvider;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * @author aszswaz
 * @date 2021/6/4 19:44:48
 * @IDE IntelliJ IDEA
 */
@Log4j2
@SuppressWarnings({"JavaDoc", "unused"})
public class HikariDataSourceProvider implements ConnectionProvider {
    private final HikariDataSource hikariDataSource;

    public HikariDataSourceProvider() {
        this.hikariDataSource = new HikariDataSource();
    }

    @Override
    public Connection getConnection() throws SQLException {
        return hikariDataSource.getConnection();
    }

    @Override
    public void shutdown() {
        this.hikariDataSource.close();
    }

    @Override
    public void initialize() throws SQLException {
        this.hikariDataSource.setLoginTimeout(10);
        // 设置测试连接的sql
        this.hikariDataSource.setConnectionTestQuery("SHOW TABLES");
        this.hikariDataSource.setConnectionInitSql("SHOW TABLES");
        // 连接超市
        this.hikariDataSource.setConnectionTimeout(60 * 1000);
        // 最大连接数
        this.hikariDataSource.setMaximumPoolSize(10);
        // 最小连接数
        this.hikariDataSource.setMinimumIdle(1);
        // 测试sql超时时间
        this.hikariDataSource.setValidationTimeout(60 * 1000);
        // 连接空闲时间
        this.hikariDataSource.setIdleTimeout(60 * 1000);
        // 连接初始化sql执行超时时间
        this.hikariDataSource.setInitializationFailTimeout(60 * 1000);
        // 正常的连接保持时间
        this.hikariDataSource.setKeepaliveTime(10 * 60 * 1000);
        // 连接最大保持时间
        this.hikariDataSource.setMaxLifetime(30 * 60 * 1000);
    }

    public void setUsername(String username) {
        log.info("set username: {}", username);
        this.hikariDataSource.setUsername(username);
    }

    public void setPassword(String password) {
        log.info("set password: {}", password);
        this.hikariDataSource.setPassword(password);
    }

    public void setJdbcUrl(String jdbcUrl) {
        this.hikariDataSource.setJdbcUrl(jdbcUrl);
    }

    public void setComment(String comment) {
        log.info(comment);
    }
}
```

quartz.properties配置

```properties
# suppress inspection "UnusedProperty" for whole file
# quartz作业框架配置
org.quartz.scheduler.instanceName=demo
### 配置线线程池
org.quartz.scheduler.threadName=demo
# 调度程序是否为守护线程
org.quartz.scheduler.makeSchedulerThreadDaemon=false
# 线程数量
org.quartz.threadPool.threadCount=10
# 线程池实现类
org.quartz.threadPool.class=org.quartz.simpl.SimpleThreadPool
### 配置日志
# 配置触发器的运行、移除日志
org.quartz.plugin.triggHistory.class=org.quartz.plugins.history.LoggingTriggerHistoryPlugin
org.quartz.plugin.triggHistory.triggerFiredMessage=Trigger \{1\}.\{0\} fired job \{6\}.\{5\} at: \{4, date, yyyy-MM-dd HH:mm:ss.SSS\}.
org.quartz.plugin.triggHistory.triggerCompleteMessage=Trigger \{1\}.\{0\} completed firing job \{6\}.\{5\} at \{4, date, yyyy-MM-dd HH:mm:ss.SSS\}.
### 配置作业调度信息存储
## 使用内存存储
#org.quartz.jobStore.class=org.quartz.simpl.RAMJobStore
## 使用数据库存储
org.quartz.jobStore.class=org.quartz.impl.jdbcjobstore.JobStoreTX
# 设置数据库方言（jdbc标准方言）
org.quartz.jobStore.driverDelegateClass=org.quartz.impl.jdbcjobstore.StdJDBCDelegate
# 设置JobDataMap中的值必须是字符串，否则就需要通过序列化存储到数据库，因为版本不同可能会序列化失败
org.quartz.jobStore.useProperties=true
# 在被视为“误触发”之前，调度程序将“容忍”触发器通过其下一次触发时间的毫秒数。默认值（如果您未在配置中输入此属性）为 60000（60 秒）。
org.quartz.jobStore.misfireThreshold=60000
# 数据库连接池名称
org.quartz.jobStore.dataSource=myDataSource
org.quartz.dataSource.myDataSource.connectionProvider.class=com.zhongzhang.HikariDataSourceProvider
org.quartz.dataSource.myDataSource.jdbcUrl=jdbc:mysql://mysqld:3306/quartz?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false
org.quartz.dataSource.myDataSource.username=root
org.quartz.dataSource.myDataSource.password=z199809051593
org.quartz.dataSource.myDataSource.comment=This is a comment.
```

