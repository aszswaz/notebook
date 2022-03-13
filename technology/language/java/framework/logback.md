# logback配置

## 原生logback配置

```xml
<!-- https://mvnrepository.com/artifact/ch.qos.logback/logback-classic -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.3.0-alpha12</version>
</dependency>

<!-- https://mvnrepository.com/artifact/com.sun.mail/jakarta.mail -->
<dependency>
    <groupId>com.sun.mail</groupId>
    <artifactId>jakarta.mail</artifactId>
    <version>2.0.1</version>
</dependency>
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="true">
    <!-- Console 输出设置 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %highlight(%5p) [%15.15t] %-40.40logger %3L : %m%n</pattern>
            <charset>utf8</charset>
        </encoder>
    </appender>

    <!--日志输出到文件-->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>article-similarity.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %5p [%15.15t] %-40.40logger %3L : %m%n</pattern>
            <charset>utf8</charset>
        </encoder>
    </appender>

    <!--发送邮件，默认只发送ERROR级别的日志-->
    <appender name="EMAIL" class="ch.qos.logback.classic.net.SMTPAppender">
        <smtpHost>example.com</smtpHost>
        <smtpPort>465</smtpPort>
        <to>example@example.com</to>
        <from>example@example.com</from>
        <username>example@example.com</username>
        <password>password</password>
        <!-- 开启SSL连接 -->
        <SSL>true</SSL>
        <STARTTLS>false</STARTTLS>
        <charsetEncoding>UTF-8</charsetEncoding>
        <!--异步发送-->
        <asynchronousSending>true</asynchronousSending>

        <subject>article-similarity: %m</subject>
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %5p [%15.15t] %-40.40logger %3L : %m%n</pattern>
        </layout>
    </appender>

    <!-- 日志输出级别 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
        <appender-ref ref="EMAIL"/>
    </root>
</configuration>
```

## 在SpringBoot项目中适用logback

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="true">
    <!--启用SpringBoot的日志渲染器-->
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter"/>
    <conversionRule conversionWord="wex"
                    converterClass="org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter"/>
    <conversionRule conversionWord="wEx"
                    converterClass="org.springframework.boot.logging.logback.ExtendedWhitespaceThrowableProxyConverter"/>

    <!-- SpringBoot项目专用的日志格式 -->
    <property name="CONSOLE_LOG_PATTERN"
              value="${CONSOLE_LOG_PATTERN:-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %3L %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>

    <!-- Console 输出设置 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
            <charset>utf8</charset>
        </encoder>
    </appender>

    <!--日志输出到文件-->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>article-similarity.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %5p [%15.15t] %-40.40logger %3L : %m%n</pattern>
            <charset>utf8</charset>
        </encoder>
    </appender>

    <!--发送邮件，默认只发送ERROR级别的日志-->
    <appender name="EMAIL" class="ch.qos.logback.classic.net.SMTPAppender">
        <smtpHost>example.com</smtpHost>
        <smtpPort>465</smtpPort>
        <to>example@example.com</to>
        <from>example@example.com</from>
        <username>example@example.com</username>
        <password>password</password>
        <!-- 开启SSL连接 -->
        <SSL>true</SSL>
        <STARTTLS>false</STARTTLS>
        <charsetEncoding>UTF-8</charsetEncoding>
        <!--异步发送-->
        <asynchronousSending>true</asynchronousSending>

        <subject>article-similarity: %m</subject>
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %5p [%15.15t] %-40.40logger %3L : %m%n</pattern>
        </layout>
    </appender>

    <!-- 日志输出级别 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
        <appender-ref ref="EMAIL"/>
    </root>
</configuration>
```

<font color="green">SpringBoot默认的log框架就是logback所以不需要额外的maven导入</font>

