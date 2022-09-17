### 在SpringBoot中使用alibaba druid作为数据管理连接池

### 引入依赖

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.3</version>
    <exclusions>
        <!--排除slf4j依赖，解决slf4j绑定冲突-->
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 标准配置

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.druid.initial-size=6
spring.datasource.druid.max-active=15
spring.datasource.druid.min-idle=6
spring.datasource.druid.max-wait=60000
spring.datasource.druid.time-between-eviction-runs-millis=60000
spring.datasource.druid.min-evictable-idle-time-millis=300000
spring.datasource.druid.validation-query=select 'x' from dual
spring.datasource.druid.test-while-idle=true
spring.datasource.druid.test-on-borrow=false
spring.datasource.druid.test-on-return=false
spring.datasource.druid.pool-prepared-statements=true
spring.datasource.druid.max-pool-prepared-statement-per-connection-size=20
spring.datasource.druid.filters=stat,wall
spring.datasource.druid.url=jdbc:mysql://localhost:3306/data_manage_dev?allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&zeroDateTimeBehavior=CONVERT_TO_NULL&useSSL=false
spring.datasource.druid.username=data_manage_dev
spring.datasource.druid.password=z199809051593
```

# 使用过程中遇到的问题

#### org.mybatis.spring.MyBatisSystemException: nested exception is org.apache.ibatis.exceptions.PersistenceException

异常原因：

jvm的`Runtime.addShutDownHook`是多线程的并行操作，在强行结束项目的时候，连接池在SpringBean的任务执行完毕之前，jvm的关闭钩子先执行了druid的close方法，连接池已经关闭

详情请看log:

```bash
2021-01-13 10:55:59.195  INFO 15120 --- [bboShutdownHook] o.a.d.r.t.n.NettyChannel                 :  [DUBBO] Close netty channel [id: 0x323a7f05, L:/192.168.0.130:14920 - R:/192.168.0.24:20116], dubbo version: 2.7.4.1, current host: 192.168.0.130
2021-01-13 10:55:59.197  INFO 15120 --- [bboShutdownHook] o.a.d.r.p.d.DubboProtocol                :  [DUBBO] Destroy reference: dubbo://192.168.0.24:20116/com.zhiwei.channel.index.service.ChannelStatisticsService?anyhost=true&application=data-manage&bean.name=ServiceBean:com.zhiwei.channel.index.service.ChannelStatisticsService&check=false&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&group=channel-index-nb&interface=com.zhiwei.channel.index.service.ChannelStatisticsService&lazy=false&methods=mediaStatisticsCount,channelTodayPostNum,templateStatisticsInfo,mediaCurHourStatisticsCount,channelArticleDataTypes&payload=851658240&pid=15120&qos.enable=false&register.ip=192.168.0.130&release=2.7.4.1&remote.application=channel-index-provider&revision=1.0.0-RELEASE&serialization=hessian2&side=consumer&sticky=false&timeout=300000&timestamp=1610423521940, dubbo version: 2.7.4.1, current host: 192.168.0.130
2021-01-13 10:55:59.200  INFO 15120 --- [bboShutdownHook] o.a.d.q.s.Server                         :  [DUBBO] qos-server stopped., dubbo version: 2.7.4.1, current host: 192.168.0.130
# druid在Spring的定时任务执行完毕之前，就已经被关闭
2021-01-13 10:55:59.797  INFO 15120 --- [extShutdownHook] o.s.s.c.ThreadPoolTaskExecutor           : Shutting down ExecutorService 'applicationTaskExecutor'
2021-01-13 10:55:59.809  INFO 15120 --- [extShutdownHook] c.a.d.p.DruidDataSource                  : {dataSource-1} closing ...
2021-01-13 10:55:59.822  INFO 15120 --- [extShutdownHook] c.a.d.p.DruidDataSource                  : {dataSource-1} closed
# druid连接池已关闭但是定时任务还在继续执行
2021-01-13 10:55:59.882 ERROR 15120 --- [TaskScheduler-1] c.z.d.s.i.TemplateDataCountServiceImpl   : 模板小时采集量统计出错2021-01-13T10:00:00.452

org.mybatis.spring.MyBatisSystemException: nested exception is org.apache.ibatis.exceptions.PersistenceException: 
### Error updating database.  Cause: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is com.alibaba.druid.pool.DataSourceClosedException: dataSource already closed at Wed Jan 13 10:55:59 CST 2021
### The error may exist in file [F:\programme\project\data-manage-father\data-manage\target\classes\mapper\master\TemplateCombinationStatisticsMapper.xml]
### The error may involve com.zhiwei.datamanage.mapper.TemplateCombinationStatisticsMapper.insertCombinationDayStatisticsData
### The error occurred while executing an update
### Cause: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is com.alibaba.druid.pool.DataSourceClosedException: dataSource already closed at Wed Jan 13 10:55:59 CST 2021
	at org.mybatis.spring.MyBatisExceptionTranslator.translateExceptionIfPossible(MyBatisExceptionTranslator.java:96) ~[mybatis-spring-2.0.6.jar:2.0.6]
	at org.mybatis.spring.SqlSessionTemplate$SqlSessionInterceptor.invoke(SqlSessionTemplate.java:441) ~[mybatis-spring-2.0.6.jar:2.0.6]
	at com.sun.proxy.$Proxy106.insert(Unknown Source) ~[?:?]
	at org.mybatis.spring.SqlSessionTemplate.insert(SqlSessionTemplate.java:272) ~[mybatis-spring-2.0.6.jar:2.0.6]
	at org.apache.ibatis.binding.MapperMethod.execute(MapperMethod.java:62) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.binding.MapperProxy$PlainMethodInvoker.invoke(MapperProxy.java:152) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.binding.MapperProxy.invoke(MapperProxy.java:85) ~[mybatis-3.5.6.jar:3.5.6]
	at com.sun.proxy.$Proxy113.insertCombinationDayStatisticsData(Unknown Source) ~[?:?]
	at com.zhiwei.datamanage.service.impl.CombinationDataCountServiceImpl.synCombinationDayStatisticsData(CombinationDataCountServiceImpl.java:50) ~[classes/:?]
	at com.zhiwei.datamanage.service.impl.TemplateDataCountServiceImpl.lambda$insertOrUpdateTemplateStatisticsData$0(TemplateDataCountServiceImpl.java:144) ~[classes/:?]
	at java.util.ArrayList.forEach(ArrayList.java:1259) ~[?:1.8.0_271]
	at com.zhiwei.datamanage.service.impl.TemplateDataCountServiceImpl.insertOrUpdateTemplateStatisticsData(TemplateDataCountServiceImpl.java:102) ~[classes/:?]
	at com.zhiwei.datamanage.listener.ScheduleDealExcel.updOrInsTemplateStatisticsData(ScheduleDealExcel.java:99) ~[classes/:?]
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[?:1.8.0_271]
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[?:1.8.0_271]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[?:1.8.0_271]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[?:1.8.0_271]
	at org.springframework.scheduling.support.ScheduledMethodRunnable.run(ScheduledMethodRunnable.java:84) ~[spring-context-5.3.2.jar:5.3.2]
	at org.springframework.scheduling.support.DelegatingErrorHandlingRunnable.run(DelegatingErrorHandlingRunnable.java:54) ~[spring-context-5.3.2.jar:5.3.2]
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511) ~[?:1.8.0_271]
	at java.util.concurrent.FutureTask.runAndReset$$$capture(FutureTask.java:308) ~[?:1.8.0_271]
	at java.util.concurrent.FutureTask.runAndReset(FutureTask.java) ~[?:1.8.0_271]
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$301(ScheduledThreadPoolExecutor.java:180) ~[?:1.8.0_271]
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:294) ~[?:1.8.0_271]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) ~[?:1.8.0_271]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) ~[?:1.8.0_271]
	at java.lang.Thread.run(Thread.java:748) [?:1.8.0_271]
Caused by: org.apache.ibatis.exceptions.PersistenceException: 
### Error updating database.  Cause: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is com.alibaba.druid.pool.DataSourceClosedException: dataSource already closed at Wed Jan 13 10:55:59 CST 2021
### The error may exist in file [F:\programme\project\data-manage-father\data-manage\target\classes\mapper\master\TemplateCombinationStatisticsMapper.xml]
### The error may involve com.zhiwei.datamanage.mapper.TemplateCombinationStatisticsMapper.insertCombinationDayStatisticsData
### The error occurred while executing an update
### Cause: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is com.alibaba.druid.pool.DataSourceClosedException: dataSource already closed at Wed Jan 13 10:55:59 CST 2021
	at org.apache.ibatis.exceptions.ExceptionFactory.wrapException(ExceptionFactory.java:30) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.update(DefaultSqlSession.java:199) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.insert(DefaultSqlSession.java:184) ~[mybatis-3.5.6.jar:3.5.6]
	at sun.reflect.GeneratedMethodAccessor115.invoke(Unknown Source) ~[?:?]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[?:1.8.0_271]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[?:1.8.0_271]
	at org.mybatis.spring.SqlSessionTemplate$SqlSessionInterceptor.invoke(SqlSessionTemplate.java:427) ~[mybatis-spring-2.0.6.jar:2.0.6]
	... 25 more
Caused by: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is com.alibaba.druid.pool.DataSourceClosedException: dataSource already closed at Wed Jan 13 10:55:59 CST 2021
	at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:82) ~[spring-jdbc-5.3.2.jar:5.3.2]
	at org.mybatis.spring.transaction.SpringManagedTransaction.openConnection(SpringManagedTransaction.java:80) ~[mybatis-spring-2.0.6.jar:2.0.6]
	at org.mybatis.spring.transaction.SpringManagedTransaction.getConnection(SpringManagedTransaction.java:67) ~[mybatis-spring-2.0.6.jar:2.0.6]
	at org.apache.ibatis.executor.BaseExecutor.getConnection(BaseExecutor.java:337) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.SimpleExecutor.prepareStatement(SimpleExecutor.java:86) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.SimpleExecutor.doUpdate(SimpleExecutor.java:49) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.BaseExecutor.update(BaseExecutor.java:117) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.CachingExecutor.update(CachingExecutor.java:76) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.update(DefaultSqlSession.java:197) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.insert(DefaultSqlSession.java:184) ~[mybatis-3.5.6.jar:3.5.6]
	at sun.reflect.GeneratedMethodAccessor115.invoke(Unknown Source) ~[?:?]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[?:1.8.0_271]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[?:1.8.0_271]
	at org.mybatis.spring.SqlSessionTemplate$SqlSessionInterceptor.invoke(SqlSessionTemplate.java:427) ~[mybatis-spring-2.0.6.jar:2.0.6]
	... 25 more
Caused by: com.alibaba.druid.pool.DataSourceClosedException: dataSource already closed at Wed Jan 13 10:55:59 CST 2021
	at com.alibaba.druid.pool.DruidDataSource.getConnectionInternal(DruidDataSource.java:1555) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.pool.DruidDataSource.getConnectionDirect(DruidDataSource.java:1408) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.filter.FilterChainImpl.dataSource_connect(FilterChainImpl.java:5059) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.filter.FilterAdapter.dataSource_getConnection(FilterAdapter.java:2756) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.filter.FilterChainImpl.dataSource_connect(FilterChainImpl.java:5055) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.filter.stat.StatFilter.dataSource_getConnection(StatFilter.java:689) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.filter.FilterChainImpl.dataSource_connect(FilterChainImpl.java:5055) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.pool.DruidDataSource.getConnection(DruidDataSource.java:1386) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.pool.DruidDataSource.getConnection(DruidDataSource.java:1378) ~[druid-1.2.3.jar:1.2.3]
	at com.alibaba.druid.pool.DruidDataSource.getConnection(DruidDataSource.java:99) ~[druid-1.2.3.jar:1.2.3]
	at org.springframework.jdbc.datasource.DataSourceUtils.fetchConnection(DataSourceUtils.java:158) ~[spring-jdbc-5.3.2.jar:5.3.2]
	at org.springframework.jdbc.datasource.DataSourceUtils.doGetConnection(DataSourceUtils.java:116) ~[spring-jdbc-5.3.2.jar:5.3.2]
	at org.springframework.jdbc.datasource.DataSourceUtils.getConnection(DataSourceUtils.java:79) ~[spring-jdbc-5.3.2.jar:5.3.2]
	at org.mybatis.spring.transaction.SpringManagedTransaction.openConnection(SpringManagedTransaction.java:80) ~[mybatis-spring-2.0.6.jar:2.0.6]
	at org.mybatis.spring.transaction.SpringManagedTransaction.getConnection(SpringManagedTransaction.java:67) ~[mybatis-spring-2.0.6.jar:2.0.6]
	at org.apache.ibatis.executor.BaseExecutor.getConnection(BaseExecutor.java:337) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.SimpleExecutor.prepareStatement(SimpleExecutor.java:86) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.SimpleExecutor.doUpdate(SimpleExecutor.java:49) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.BaseExecutor.update(BaseExecutor.java:117) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.executor.CachingExecutor.update(CachingExecutor.java:76) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.update(DefaultSqlSession.java:197) ~[mybatis-3.5.6.jar:3.5.6]
	at org.apache.ibatis.session.defaults.DefaultSqlSession.insert(DefaultSqlSession.java:184) ~[mybatis-3.5.6.jar:3.5.6]
	at sun.reflect.GeneratedMethodAccessor115.invoke(Unknown Source) ~[?:?]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[?:1.8.0_271]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[?:1.8.0_271]
	at org.mybatis.spring.SqlSessionTemplate$SqlSessionInterceptor.invoke(SqlSessionTemplate.java:427) ~[mybatis-spring-2.0.6.jar:2.0.6]
	... 25 more

2021-01-13 10:55:59.882  INFO 15120 --- [TaskScheduler-1] c.z.d.l.ScheduleDealExcel                : 本次2021-01-13T10:00:00.452从接口统计模板采集数据结束 ,用时27430
```

druid的jvm退出挂钩注册在`apache dubbo当中`

```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.dubbo.config;

import org.apache.dubbo.common.extension.ExtensionLoader;
import org.apache.dubbo.common.logger.Logger;
import org.apache.dubbo.common.logger.LoggerFactory;
import org.apache.dubbo.registry.support.AbstractRegistryFactory;
import org.apache.dubbo.rpc.Protocol;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 * The shutdown hook thread to do the clean up stuff.
 * This is a singleton in order to ensure there is only one shutdown hook registered.
 * Because {@link ApplicationShutdownHooks} use {@link java.util.IdentityHashMap}
 * to store the shutdown hooks.
 */
public class DubboShutdownHook extends Thread {

    private static final Logger logger = LoggerFactory.getLogger(DubboShutdownHook.class);

    private static final DubboShutdownHook DUBBO_SHUTDOWN_HOOK = new DubboShutdownHook("DubboShutdownHook");
    /**
     * Has it already been registered or not?
     */
    private final AtomicBoolean registered = new AtomicBoolean(false);
    /**
     * Has it already been destroyed or not?
     */
    private final AtomicBoolean destroyed= new AtomicBoolean(false);

    private DubboShutdownHook(String name) {
        super(name);
    }

    public static DubboShutdownHook getDubboShutdownHook() {
        return DUBBO_SHUTDOWN_HOOK;
    }

    @Override
    public void run() {
        if (logger.isInfoEnabled()) {
            logger.info("Run shutdown hook now.");
        }
        doDestroy();
    }

    /**
     * Register the ShutdownHook
     */
    public void register() {
        if (!registered.get() && registered.compareAndSet(false, true)) {
            Runtime.getRuntime().addShutdownHook(getDubboShutdownHook());
        }
    }

    /**
     * Unregister the ShutdownHook
     */
    public void unregister() {
        if (registered.get() && registered.compareAndSet(true, false)) {
            Runtime.getRuntime().removeShutdownHook(getDubboShutdownHook());
        }
    }

    /**
     * Destroy all the resources, including registries and protocols.
     */
    public void doDestroy() {
        if (!destroyed.compareAndSet(false, true)) {
            return;
        }
        // destroy all the registries
        AbstractRegistryFactory.destroyAll();
        // destroy all the protocols
        destroyProtocols();
    }

    /**
     * Destroy all the protocols.
     */
    private void destroyProtocols() {
        ExtensionLoader<Protocol> loader = ExtensionLoader.getExtensionLoader(Protocol.class);
        for (String protocolName : loader.getLoadedExtensions()) {
            try {
                Protocol protocol = loader.getLoadedExtension(protocolName);
                if (protocol != null) {
                    protocol.destroy();
                }
            } catch (Throwable t) {
                logger.warn(t.getMessage(), t);
            }
        }
    }
}
```

**暂无解决办法**