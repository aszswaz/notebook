# log4j2

## 原生log4j2使用

```xml
<dependencys>
    <!-- 日志 -->
    <!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-slf4j-impl -->
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-slf4j-impl</artifactId>
        <version>2.17.0</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/com.lmax/disruptor -->
    <dependency>
        <groupId>com.lmax</groupId>
        <artifactId>disruptor</artifactId>
    </dependency>
</dependencys>
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration status="warn">
    <properties>
        <!-- 项目名称 -->
        <property name="PROJECT">data-manage-volume-warning</property>
        <property name="BASE_PATH">logs/${PROJECT}</property>
        <!--编码-->
        <property name="CHARSET">UTF-8</property>
        <property name="FILE_PATTERN">%date{yyyy-MM-dd HH:mm:ss.SSS} %p %-20t %-75logger %-30M %-5L - %m%n</property>
    </properties>

    <Appenders>
        <!-- 输出到控制台 -->
        <Console name="console" target="SYSTEM_OUT">
            <!--输出日志的格式，使用SpringBoot配色（仅能在SpringBoot项目中使用） -->
            <PatternLayout
                    pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} %highlight{%5p} --- [%15.15t] %-40.40c %-40M %-5L: %m%n"/>
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
        </Console>
        <!--滚动随机访问文件-->
        <!--
        append: 如果为 true-默认值，记录将附加到文件末尾。设置为 false 时，将在写入新记录之前清除文件。

        fileName: 文件名称（路径）

        filePattern: 归档日志文件的文件名的模式。模式的格式应取决于所使用的 RolloverStrategu。
        DefaultRolloverStrategy 将接受与SimpleDateFormat兼容的日期/时间模式和/或代表整数计数器的％i。
        整数计数器允许指定填充，例如％3i 用于将计数器空格填充到 3 位，或者(通常更有用)％03i 用于将计数器零填充到 3 位。该模式还支持在运行时进行插值，因此任何查询(例如DateLookup都可以包含在该模式中)。

        immediateFlush: 设置为 true-默认值时，每次写操作后都会进行刷新。这将确保将数据写入磁盘，但可能会影响性能。
        -->
        <RollingRandomAccessFile name="debug-file" append="true" fileName="${BASE_PATH}/debug/debug.log"
                                 filePattern="${BASE_PATH}/debug/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log"
                                 immediateFlush="true">
            <!--配置日志格式-->
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <!--在当前jvm启动时，直接新建文件，不在上一次启动生成的日志文件当中追加日志, minSize: 最小文件大小，超过该值执行翻转-->
                <OnStartupTriggeringPolicy minSize="1"/>
                <!--基于文件大小的翻转策略, 文件模式必须包含％i-->
                <SizeBasedTriggeringPolicy size="500MB"/>
                <!--基于时间的翻转策略
                interval: 基于日期模式中最具体的时间单位应进行翻转的频率。例如，对于一个日期模式，其中以小时为最具体的项目，并且每 4 个小时将发生 4 次翻转。预设值为 1.
                modulate: 指示是否应调整时间间隔以使下一次翻转发生在时间间隔边界上。例如，如果项目是小时，当前小时是 3 am，间隔是 4，则第一次滚动将在 4 am 发生，然后下一个滚动将在 8 am，中午，4pm 等发生。
                -->
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <!--过度策略，滚动文件过多时执行的策略
            fileIndex: 如果设置为“ max”(默认值)，则索引较高的文件将比索引较小的文件更新。如果设置为“ min”，则文件重命名和计数器将遵循上述“固定窗口”策略。
            min: 计数器的最小值。预设值为 1.
            max: 计数器的最大值。达到此值后，较旧的归档文件将在以后的转换中被删除。预设值为 7.
            -->
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <!--删除符合指定条件的归档文件-->
                <Delete basePath="${BASE_PATH}/debug/" maxDepth="10">
                    <IfFileName glob="*.log"/>
                    <!--只保留三个月内的log文件-->
                    <IfLastModified age="7d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <!--配置过滤器只输出debug级别日志-->
            <Filters>
                <!--按日志级别过滤-->
                <!--
                level: 指定过滤的等级
                onMatch: 匹配成功，执行指定的操作
                onMismatch: 匹配失败执行指定的操作
                onMatch, onMismatch指定的操作：
                ACCEPT: 直接放行
                DENY: 直接拒绝
                NEUTRAL: 如果有下一个过滤器，交给下一个过滤器判定。如果没有下一个过滤直接放行
                -->
                <ThresholdFilter level="debug" onMatch="NEUTRAL" onMismatch="DENY"/>
                <ThresholdFilter level="info" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--频率过滤器，每秒允许的平均事件数。-->
                <BurstFilter level="debug" rate="2" maxBurst="2" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingRandomAccessFile>
        <!--输出info日志-->
        <RollingRandomAccessFile name="info-file" append="true" fileName="${BASE_PATH}/info/info.log"
                                 filePattern="${BASE_PATH}/info/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log"
                                 immediateFlush="true">
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <OnStartupTriggeringPolicy minSize="1"/>
                <SizeBasedTriggeringPolicy size="500MB"/>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <Delete basePath="${BASE_PATH}/info/" maxDepth="10">
                    <IfFileName glob="*.log"/>
                    <IfLastModified age="180d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <Filters>
                <ThresholdFilter level="info" onMatch="NEUTRAL" onMismatch="DENY"/>
                <ThresholdFilter level="warn" onMatch="DENY" onMismatch="ACCEPT"/>
            </Filters>
        </RollingRandomAccessFile>
        <!--输出warn级别-->
        <RollingRandomAccessFile name="warn-file" append="true" fileName="${BASE_PATH}/warn/warn.log"
                                 filePattern="${BASE_PATH}/warn/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log"
                                 immediateFlush="true">
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <OnStartupTriggeringPolicy minSize="1"/>
                <SizeBasedTriggeringPolicy size="500MB"/>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <Delete basePath="${BASE_PATH}/warn/" maxDepth="10">
                    <IfFileName glob="*.log"/>
                    <IfLastModified age="180d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <Filters>
                <ThresholdFilter level="warn" onMatch="NEUTRAL" onMismatch="DENY"/>
                <ThresholdFilter level="error" onMatch="DENY" onMismatch="ACCEPT"/>
            </Filters>
        </RollingRandomAccessFile>
        <!--输出error以上级别日志-->
        <RollingRandomAccessFile name="error-file" append="true" fileName="${BASE_PATH}/error/error.log"
                                 filePattern="${BASE_PATH}/error/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log"
                                 immediateFlush="true">
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <OnStartupTriggeringPolicy minSize="1"/>
                <SizeBasedTriggeringPolicy size="500MB"/>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <Delete basePath="${BASE_PATH}/error/" maxDepth="10">
                    <IfFileName glob="*.log"/>
                    <IfLastModified age="180d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>
        </RollingRandomAccessFile>
        <!--将项目发生的重大错误信息，发送到邮件-->
        <SMTP name="Mail" subject="server：${PROJECT}"
              to="demo@example.com"
              from="demo@example.com"
              smtpProtocol="smtps" smtpHost="example.com" smtpPort="465" bufferSize="100" smtpDebug="false"
              smtpPassword="demo" smtpUsername="demo@example.com">
            <!--日志过滤-->
            <Filters>
                <ThresholdFilter level="ERROR" onMatch="NEUTRAL" onMismatch="DENY"/>
                <!--控制邮件的发送频率，为每小时5封，最大每小时10封-->
                <BurstFilter level="ERROR" rate="1" maxBurst="10" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </SMTP>
    </Appenders>

    <!-- sync/async -->
    <Loggers>
        <AsyncRoot level="info" includeLocation="true">
            <AppenderRef ref="console"/>
            <AppenderRef ref="debug-file"/>
            <AppenderRef ref="info-file"/>
            <AppenderRef ref="warn-file"/>
            <AppenderRef ref="error-file"/>
        </AsyncRoot>
    </Loggers>

</configuration>
```

## 在SpringBoot 项目中适用log4j2

### 在SpringBoot项目中，配置log4j2使用SpringBoot的配色方案

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
<!-- 异步框架 log4j2 异步日志需要 -->
<!-- https://mvnrepository.com/artifact/com.lmax/disruptor -->
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.4</version>
</dependency>
```

log4j2.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration status="warn">
    <properties>
        <!-- 项目名称 -->
        <property name="PROJECT">project-name</property>
        <property name="BASE_PATH">logs/${PROJECT}</property>
        <!--编码-->
        <property name="CHARSET">UTF-8</property>
        <property name="FILE_PATTERN">%date{yyyy-MM-dd HH:mm:ss.SSS} %pid %p %t %logger %M %L - %m%n</property>
    </properties>

    <Appenders>
        <!-- 输出到控制台 -->
        <Console name="console" target="SYSTEM_OUT">
            <!--输出日志的格式，使用SpringBoot配色（仅能在SpringBoot项目中使用） -->
            <PatternLayout
                    pattern="%clr{%d{yyyy-MM-dd HH:mm:ss.SSS}}{faint} %clr{%5p} %clr{${sys:PID}}{magenta} %clr{---}{faint} %clr{[%15.15t]}{faint} %clr{%-40.40c{1.}}{cyan} %clr{:}{faint} %m%n%xwEx"/>
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
        </Console>
        <!--滚动随机访问文件-->
        <!--
        append: 如果为 true-默认值，记录将附加到文件末尾。设置为 false 时，将在写入新记录之前清除文件。

        fileName: 文件名称（路径）

        filePattern: 归档日志文件的文件名的模式。模式的格式应取决于所使用的 RolloverStrategu。
        DefaultRolloverStrategy 将接受与SimpleDateFormat兼容的日期/时间模式和/或代表整数计数器的％i。
        整数计数器允许指定填充，例如％3i 用于将计数器空格填充到 3 位，或者(通常更有用)％03i 用于将计数器零填充到 3 位。该模式还支持在运行时进行插值，因此任何查询(例如DateLookup都可以包含在该模式中)。

        immediateFlush: 设置为 true-默认值时，每次写操作后都会进行刷新。这将确保将数据写入磁盘，但可能会影响性能。
        -->
        <RollingRandomAccessFile name="debug-file" append="true" fileName="${BASE_PATH}/debug/debug.log"
                                 filePattern="${BASE_PATH}/debug/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log.gz"
                                 immediateFlush="true">
            <!--配置日志格式-->
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <!--在当前jvm启动时，直接新建文件，不在上一次启动生成的日志文件当中追加日志, minSize: 最小文件大小，超过该值执行翻转-->
                <OnStartupTriggeringPolicy minSize="1"/>
                <!--基于文件大小的翻转策略, 文件模式必须包含％i-->
                <SizeBasedTriggeringPolicy size="500MB"/>
                <!--基于时间的翻转策略
                interval: 基于日期模式中最具体的时间单位应进行翻转的频率。例如，对于一个日期模式，其中以小时为最具体的项目，并且每 4 个小时将发生 4 次翻转。预设值为 1.
                modulate: 指示是否应调整时间间隔以使下一次翻转发生在时间间隔边界上。例如，如果项目是小时，当前小时是 3 am，间隔是 4，则第一次滚动将在 4 am 发生，然后下一个滚动将在 8 am，中午，4pm 等发生。
                -->
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <!--过度策略，滚动文件过多时执行的策略
            fileIndex: 如果设置为“ max”(默认值)，则索引较高的文件将比索引较小的文件更新。如果设置为“ min”，则文件重命名和计数器将遵循上述“固定窗口”策略。
            min: 计数器的最小值。预设值为 1.
            max: 计数器的最大值。达到此值后，较旧的归档文件将在以后的转换中被删除。预设值为 7.
            -->
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <!--删除符合指定条件的归档文件-->
                <Delete basePath="${BASE_PATH}/debug/" maxDepth="10">
                    <IfFileName glob="*.log.gz"/>
                    <!--只保留三个月内的log文件-->
                    <IfLastModified age="180d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <!--配置过滤器只输出debug级别日志-->
            <Filters>
                <!--按日志级别过滤-->
                <!--
                level: 指定过滤的等级
                onMatch: 匹配成功，执行指定的操作
                onMismatch: 匹配失败执行指定的操作
                onMatch, onMismatch指定的操作：
                ACCEPT: 直接放行
                DENY: 直接拒绝
                NEUTRAL: 如果有下一个过滤器，交给下一个过滤器判定。如果没有下一个过滤直接放行
                -->
                <ThresholdFilter level="debug" onMatch="NEUTRAL" onMismatch="DENY"/>
                <ThresholdFilter level="info" onMatch="DENY" onMismatch="ACCEPT"/>
            </Filters>
        </RollingRandomAccessFile>
        <!--输出info日志-->
        <RollingRandomAccessFile name="info-file" append="true" fileName="${BASE_PATH}/info/info.log"
                                 filePattern="${BASE_PATH}/info/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log"
                                 immediateFlush="true">
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <OnStartupTriggeringPolicy minSize="1"/>
                <SizeBasedTriggeringPolicy size="500MB"/>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <Delete basePath="${BASE_PATH}/info/" maxDepth="10">
                    <IfFileName glob="*.log"/>
                    <IfLastModified age="180d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <Filters>
                <ThresholdFilter level="info" onMatch="NEUTRAL" onMismatch="DENY"/>
                <ThresholdFilter level="warn" onMatch="DENY" onMismatch="ACCEPT"/>
            </Filters>
        </RollingRandomAccessFile>
        <!--输出warn级别-->
        <RollingRandomAccessFile name="warn-file" append="true" fileName="${BASE_PATH}/warn/warn.log"
                                 filePattern="${BASE_PATH}/warn/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log"
                                 immediateFlush="true">
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <OnStartupTriggeringPolicy minSize="1"/>
                <SizeBasedTriggeringPolicy size="500MB"/>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <Delete basePath="${BASE_PATH}/warn/" maxDepth="10">
                    <IfFileName glob="*.log"/>
                    <IfLastModified age="180d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <Filters>
                <ThresholdFilter level="warn" onMatch="NEUTRAL" onMismatch="DENY"/>
                <ThresholdFilter level="error" onMatch="DENY" onMismatch="ACCEPT"/>
            </Filters>
        </RollingRandomAccessFile>
        <!--输出error以上级别日志-->
        <RollingRandomAccessFile name="error-file" append="true" fileName="${BASE_PATH}/error/error.log"
                                 filePattern="${BASE_PATH}/error/$${date:yyyy-MM}/$${date:yyyy-MM-dd}/${PROJECT}-(%d{yyyy-MM-dd HH})~%i.log"
                                 immediateFlush="true">
            <PatternLayout charset="${CHARSET}" pattern="${FILE_PATTERN}"/>
            <Policies>
                <OnStartupTriggeringPolicy minSize="1"/>
                <SizeBasedTriggeringPolicy size="500MB"/>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy fileIndex="max" min="1" max="100">
                <Delete basePath="${BASE_PATH}/error/" maxDepth="10">
                    <IfFileName glob="*.log"/>
                    <IfLastModified age="180d"/>
                </Delete>
            </DefaultRolloverStrategy>
            <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>
        </RollingRandomAccessFile>
    </Appenders>

    <!-- sync/async -->
    <Loggers>
        <AsyncRoot level="debug" includeLocation="true">
            <AppenderRef ref="console"/>
            <AppenderRef ref="info-file"/>
            <AppenderRef ref="warn-file"/>
            <AppenderRef ref="error-file"/>
        </AsyncRoot>
    </Loggers>

</configuration>
```

