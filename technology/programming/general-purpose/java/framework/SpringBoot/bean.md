# SpringBoot Bean的生命周期

Spring的Bean的生命周期（作用域）有两种，分别是`singleton`和`prototype`。

**singleton**是全局单例，从JVM开始运行，它就一直存在，直到JVM退出。这种单例的好处是不用每次使用一个方法，就去创建一个对象。它的坏处也很明显，对象的属性在多线程的情况下，容易出现并发问题。

**prototype**是非全局单例，需要使用这个对象的时候再创建，不需要时丢弃给GC。

singleton是属于SpringBoot的最基础的应用，所有被SpringBoot管理的对象，默认是这个模式的，这里就并不多做说明，这里主要讲解prototype的用法和需要注意的点。

prototype的用法如下：

```java
package com.example.demo.vo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * @author aszswaz
 * @createTime 2021-12-13 22:34:09
 * @ide IntelliJ IDEA
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@SuppressWarnings("JavaDoc")
public class DemoEntity {
    private static final Logger log = LoggerFactory.getLogger(DemoEntity.class);

    public DemoEntity() {
        log.info("I was created.");
    }
}

```

注解`org.springframework.context.annotation.Scope`就是声明对象的作用域（全局单例，或非全局单例）。

**prototype**应用非常简单，但是对我来说，它有一个应用上的误区：

```java
package com.example.demo.controller;

import com.example.demo.vo.DemoEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author aszswaz
 * @createTime 2021-12-08 12:18:48
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
@RestController
public class HelloController {
    private static final Logger log = LoggerFactory.getLogger(HelloController.class);

    private final DemoEntity demoEntity;

    @Autowired
    public HelloController(
            DemoEntity demoEntity
    ) {
        this.demoEntity = demoEntity;
    }

    @GetMapping(value = "hello")
    public void hello() {
        log.info("{}", this.demoEntity.hashCode());
    }
}
```

<font color="red">我先前一直认为，只需要这样使用DemoEntity，就会在每次执行`/hello`请求的时候，创建一个DemoEntity对象，通过反射方式给`demoEntity`变量注入对象。</font>这是错误的想法，DemoEntity对象会在创建`HelloController`的对象的时候被创建一次，但是由于后者是全局单例对象，不会被销毁，作为后者属性的`demoEntity`自然也会一直存在于内存当中，不会有任何变化。下方的log就表示了这一点，`/hello`请求执行了三次，但是`DemoEntity`构造函数中的语句，只执行了一次而已。

```log
...
2021-12-13 23:11:15.785  INFO 159264 --- [           main] com.example.demo.vo.DemoEntity           : I was created.
...
2021-12-13 23:11:22.513  INFO 159264 --- [nio-8080-exec-1] c.e.demo.controller.HelloController      : 1274957397
2021-12-13 23:11:24.370  INFO 159264 --- [nio-8080-exec-2] c.e.demo.controller.HelloController      : 1274957397
2021-12-13 23:11:25.015  INFO 159264 --- [nio-8080-exec-3] c.e.demo.controller.HelloController      : 1274957397
```

如果想要达到假设中的效果，则必须在`HelloController`也添加一个`@Scope`：

```java
...
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class HelloController {
    ...
}
```

```log
2021-12-13 23:17:22.503  INFO 160082 --- [nio-8080-exec-1] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:17:22.510  INFO 160082 --- [nio-8080-exec-1] c.e.demo.controller.HelloController      : 1774042155
2021-12-13 23:17:23.237  INFO 160082 --- [nio-8080-exec-2] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:17:23.239  INFO 160082 --- [nio-8080-exec-2] c.e.demo.controller.HelloController      : 1109919351
2021-12-13 23:17:23.856  INFO 160082 --- [nio-8080-exec-3] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:17:23.859  INFO 160082 --- [nio-8080-exec-3] c.e.demo.controller.HelloController      : 1771464867
```

看上去满足了执行一次`/hello`请求创建一次`DemoEntity`的目的，`HelloController`却与单例对象的真谛背道而驰。

<font color="red">我的结论是`prototype`对象与`Autowired`的组合比较鸡肋，我使用`prototype`的主要目的在于让对象的属性，在高并发场景下也是可用的，这需要对象在每次使用的时候被重新创建，它俩的组合无法达到我的预期。</font>

另外在补充一点，DemoEntity只被创建一次，是因为使用它的只有一个HelloController，加入还有一个Hello2Controller，它的单例对象在创建时，也会创建一个DemoEntity对象，相当于HelloController和Hello2Controller分别拥有一个专属的DemoEntity对象，这是在自动注入的情况下，prototype与singleton唯一不同的地方。但还是非常的鸡肋。

## BeanFactory

<font color="green">除了通过Autowired和Resource这种自动注入之外，还可以通过`org.springframework.beans.factory.BeanFactory#getBean(java.lang.Class<T>)`获得bean，prototype的对象不适合自动注入，但是很适合手动获取。</font>

```java
package com.example.demo.controller;

import com.example.demo.vo.DemoEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author aszswaz
 * @createTime 2021-12-08 12:18:48
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
@RestController
public class HelloController {
    private static final Logger log = LoggerFactory.getLogger(HelloController.class);

    private final BeanFactory beanFactory;

    @Autowired
    public HelloController(
            BeanFactory beanFactory
    ) {
        this.beanFactory = beanFactory;
    }

    @GetMapping(value = "hello")
    public void hello() {
        DemoEntity entity = this.beanFactory.getBean(DemoEntity.class);
        log.info("{}", entity);
    }
}

```

```log
2021-12-13 23:34:04.744  INFO 162265 --- [nio-8080-exec-1] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:34:04.744  INFO 162265 --- [nio-8080-exec-1] c.e.demo.controller.HelloController      : com.example.demo.vo.DemoEntity@2661aab4
2021-12-13 23:34:05.277  INFO 162265 --- [nio-8080-exec-2] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:34:05.278  INFO 162265 --- [nio-8080-exec-2] c.e.demo.controller.HelloController      : com.example.demo.vo.DemoEntity@3054a038
2021-12-13 23:34:06.295  INFO 162265 --- [nio-8080-exec-3] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:34:06.295  INFO 162265 --- [nio-8080-exec-3] c.e.demo.controller.HelloController      : com.example.demo.vo.DemoEntity@3cb62acd
2021-12-13 23:34:07.278  INFO 162265 --- [nio-8080-exec-4] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:34:07.278  INFO 162265 --- [nio-8080-exec-4] c.e.demo.controller.HelloController      : com.example.demo.vo.DemoEntity@e29aaea
```

另外值得一提的是，`org.springframework.boot.SpringApplication#run(java.lang.Class<?>, java.lang.String...)`的返回值是`org.springframework.context.ConfigurableApplicationContext`，这个类是接口`org.springframework.beans.factory.BeanFactory`的实现类，一样可以通过getBean方法获取容器中的Bean：

```Java
package com.example.demo;

import com.example.demo.vo.DemoEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    private static final Logger log = LoggerFactory.getLogger(DemoApplication.class);

    public static void main(String[] args) {
        BeanFactory beanFactory = SpringApplication.run(DemoApplication.class, args);
        log.info("{}", beanFactory.getBean(DemoEntity.class));
    }
}

```

```log
...
2021-12-13 23:45:07.981  INFO 163850 --- [           main] com.example.demo.DemoApplication         : Started DemoApplication in 1.724 seconds (JVM running for 2.316)
2021-12-13 23:45:07.984  INFO 163850 --- [           main] com.example.demo.vo.DemoEntity           : I was created.
2021-12-13 23:45:07.984  INFO 163850 --- [           main] com.example.demo.DemoApplication         : com.example.demo.vo.DemoEntity@5d05ef57
```

从上面日志可以看出，SpringBoot在初始化完毕后，并不会占用man线程。所以可以把它保存为静态变量，以供非SpringBoot管理的对象使用：

```java
@SpringBootApplication
public class DemoApplication {
    private static BeanFactory beanFactory;

    public static void main(String[] args) {
        beanFactory = SpringApplication.run(DemoApplication.class, args);
    }

    public static BeanFactory getBeanFactory() {
        return beanFactory;
    }
}
```

```java
@RestController
public class HelloController {
    private static final Logger log = LoggerFactory.getLogger(HelloController.class);

    @GetMapping(value = "hello")
    public void hello() {
        DemoEntity entity = DemoApplication.getBeanFactory().getBean(DemoEntity.class);
        log.info("{}", entity);
    }
}
```

我总结是，`prototype`与自动注入的结合虽然比较鸡肋，但是与手动获取bean结合的很好，能够满足在高并发场景下，对象的属性也能安全读写的要求。