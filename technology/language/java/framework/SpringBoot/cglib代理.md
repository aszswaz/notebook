###### 在一个对象的父类当中，被修饰为final，并以及给定默认值的属性(类型为对象，而不是基本类型)，在获取时该属性的值的时候，出现获得的对象为null

导致该问题的原因有以下：

1. 对象是Spring自动注入的
2. 项目中使用的AOP编程，并且该对象的某一个函数符合AOP的扫描规则
3. 被SpringAOP的匹配规则命中的对象，都是通过CGLIB代理生成的对象，CGLIB只能代理当前对象自己有的方法，以及从父类继承的，并且可重写的非静态方法。
4. 调用方法是对象父类的方法，该方法被声明为final，不允许子类重写，并且该方法没有代码逻辑，作用只是返回属性的值
5. CGLIB代理生成的对象，不会走对象正常的初始化逻辑

首先来看一组代码

AOP类:

```java
package com.example.demo;

import lombok.extern.log4j.Log4j2;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

/**
 * @author aszswaz
 * @date 2021/3/9 16:31:38
 */
@Aspect
@Component
@Log4j2
public class BeanAopTest {
    /**
     * 扫描所有带指定注解的方法
     */
    @Before(value = "@annotation(org.springframework.scheduling.annotation.Scheduled)")
    public void before(JoinPoint joinPoint) {
        log.info(joinPoint.getTarget().getClass().getName());
    }

    @After(value = "@annotation(org.springframework.scheduling.annotation.Scheduled)")
    public void after(JoinPoint joinPoint) {
        log.info(joinPoint.getTarget().getClass().getName());
    }
}
```

父类：

```java
package com.example.demo;

/**
 * @author aszswaz
 * @date 2021/3/9 17:34:10
 */
public class BaseBean {
    private Integer integer = new Integer(100);

    public Integer integer() {
        return integer;
    }
}
```

子类:

```java
package com.example.demo;

import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * @author aszswaz
 * @date 2021/3/9 17:36:40
 */
@Component
@Log4j2
public class BeanTestOne extends BaseBean {

    @Scheduled(fixedRate = 1000, initialDelay = 1000)
    public void task() {
        log.info(super.toString());
    }
}
```

单元测试类：

```java
package com.example.demo;

import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * @author aszswaz
 * @date 2021/3/9 17:37:07
 */
@Log4j2
@SpringBootTest
class BeanTestOneTest {
    @Autowired
    private BeanTestOne testOne;

    @Test
    void testObject() {
        int i = testOne.integer();
        log.info(i);
    }
}
```

<span style="color: red">BeanAopTest 类的AOP扫描会命中 BeanTestOne 类的 task 方法，在单元测试中Spring的对象注入就不会走正常的类反射，而是注入cglib代理生成的对象，cglib代理生成的对象不会走正常的jvm构造对象以及属性初始化逻辑</span>

不过这时，调用父类的 integer() 并不会出现问题，可以正常获取到属性的值，这个并不矛盾，只是这个来自父类的 integer() 方法也被cglib代理了，里面不是简单的return，通过debug进入该方法可以看到如下内容（有注释是因为下载了cglib源代码）：

```java
private static class DynamicAdvisedInterceptor implements MethodInterceptor, Serializable {

		private final AdvisedSupport advised;

		public DynamicAdvisedInterceptor(AdvisedSupport advised) {
			this.advised = advised;
		}

		@Override
		@Nullable
		public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
			Object oldProxy = null;
			boolean setProxyContext = false;
			Object target = null;
			TargetSource targetSource = this.advised.getTargetSource();
			try {
				if (this.advised.exposeProxy) {
					// Make invocation available if necessary.
					oldProxy = AopContext.setCurrentProxy(proxy);
					setProxyContext = true;
				}
				// Get as late as possible to minimize the time we "own" the target, in case it comes from a pool...
				target = targetSource.getTarget();
				Class<?> targetClass = (target != null ? target.getClass() : null);
				List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
				Object retVal;
				// Check whether we only have one InvokerInterceptor: that is,
				// no real advice, but just reflective invocation of the target.
				if (chain.isEmpty() && Modifier.isPublic(method.getModifiers())) {
					// We can skip creating a MethodInvocation: just invoke the target directly.
					// Note that the final invoker must be an InvokerInterceptor, so we know
					// it does nothing but a reflective operation on the target, and no hot
					// swapping or fancy proxying.
					Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
					retVal = methodProxy.invoke(target, argsToUse);
				}
				else {
					// We need to create a method invocation...
					retVal = new CglibMethodInvocation(proxy, target, method, args, targetClass, chain, methodProxy).proceed();
				}
				retVal = processReturnType(proxy, target, method, retVal);
				return retVal;
			}
			finally {
				if (target != null && !targetSource.isStatic()) {
					targetSource.releaseTarget(target);
				}
				if (setProxyContext) {
					// Restore old proxy.
					AopContext.setCurrentProxy(oldProxy);
				}
			}
		}

		@Override
		public boolean equals(@Nullable Object other) {
			return (this == other ||
					(other instanceof DynamicAdvisedInterceptor &&
							this.advised.equals(((DynamicAdvisedInterceptor) other).advised)));
		}

		/**
		 * CGLIB uses this to drive proxy creation.
		 */
		@Override
		public int hashCode() {
			return this.advised.hashCode();
		}
	}
```

从以上的代码可以看出，调用 integer() 方法却并没有走入原来的代码，而是走入了cglib预先设定好的函数，该函数的主要逻辑逻辑，就是根据当前代理生成的对象，去获得容器中，原本的对象，最后通过反射的方式，调用原来的 integer() 获取属性值，所以正常的函数在cglib代理生成的对象上使用不会出现问题，但是 final 关键字会禁止 cglib 代理函数，示例如下：

```java
package com.example.demo;

/**
 * @author aszswaz
 * @date 2021/3/9 17:34:10
 */
public class BaseBean {
    private Integer integer = new Integer(100);

    /**
     * 在方法上添加final, 禁止cglib代理
     */
    public final Integer integer() {
        return integer;
    }
}
```

将父类的 integer() 函数加上 final 修饰，再次运行 单元测试：

```java
package com.example.demo;

/**
 * @author aszswaz
 * @date 2021/3/9 17:34:10
 */
public class BaseBean {
    private Integer integer = new Integer(100);  integer: null

    /**
     * 在方法上添加final, 禁止cglib代理
     */
    public final Integer integer() {
        return integer;  integer: null
    }
}
```

主：“;”后面的并非写错了，只是模拟idea的debug显示效果

可以看到没有再次走入 cglib 的代理函数，而是直接走入了原函数，同时 cglib 生成对象不会走 jvm 的对象初始化步骤的缘故，这个 integer 属性的值为null