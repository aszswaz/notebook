# Java quartz框架 - 基于内存的调度器

```java
package com.zhongzhang;

import org.quartz.JobBuilder;
import org.quartz.JobDetail;
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
@SuppressWarnings("JavaDoc")
public class QuartzDemo {
    public static void main(String[] args) throws SchedulerException {
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
        JobBuilder jobBuilder = JobBuilder.newJob(QuartzJob.class);
        jobBuilder.withIdentity("demo", "demo");
        jobBuilder.usingJobData("demo", "Hello World");
        JobDetail jobDetail = jobBuilder.build();
        TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger();
        triggerBuilder.withIdentity("demo", "demo");
        triggerBuilder.withSchedule(SimpleScheduleBuilder.repeatSecondlyForever(5));
        Trigger trigger = triggerBuilder.build();
        scheduler.scheduleJob(jobDetail, trigger);
        scheduler.start();
    }
}
```

```java
package com.zhongzhang;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author aszswaz
 * @date 2021/6/4 13:36:04
 * @IDE IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class QuartzJob implements Job {
    private static final Logger log = LoggerFactory.getLogger(QuartzJob.class);

    @Override
    public void execute(JobExecutionContext context) {
        log.info(context.getMergedJobDataMap().getString("demo"));
    }
}
```

quartz.properties配置


```properties
# suppress inspection "UnusedProperty" for whole file
# quartz作业框架配置
org.quartz.scheduler.instanceName=datapush
org.quartz.scheduler.threadName=datapush
# 调度程序是否为守护线程
org.quartz.scheduler.makeSchedulerThreadDaemon=false
# 线程数量
org.quartz.threadPool.threadCount=10
# 线程池实现类
org.quartz.threadPool.class=org.quartz.simpl.SimpleThreadPool
# 配置任务执行信息存储
# 内存存储
org.quartz.jobStore.class=org.quartz.simpl.RAMJobStore
# 捕获jvm推出事件，关闭调度器
org.quartz.plugin.shutdownhook.class=org.quartz.plugins.management.ShutdownHookPlugin
org.quartz.plugin.shutdownhook.cleanShutdown=true
### 配置日志
# 配置触发器的运行、移除日志
org.quartz.plugin.triggHistory.class=org.quartz.plugins.history.LoggingTriggerHistoryPlugin
org.quartz.plugin.triggHistory.triggerFiredMessage=Trigger \{1\}.\{0\} fired job \{6\}.\{5\} at: \{4, date, yyyy-MM-dd HH:mm:ss.SSS\}.
org.quartz.plugin.triggHistory.triggerCompleteMessage=Trigger \{1\}.\{0\} completed firing job \{6\}.\{5\} at \{4, date, yyyy-MM-dd HH:mm:ss.SSS\}.

```

