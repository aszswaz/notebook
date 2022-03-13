# SpringBoot

## 配置自动注入

SpringBoot 的配置自动注入，除了使用 `@Value`以外，还可以通过对象注入的方式，获取配置文件中的配置。操作步骤如下：

首先是启动类：DemoApplication.java

```java
package demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan(value = "demo.config")
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(RssArticleSimilarityApplication.class, args);
    }
}

```

`@ConfigurationPropertiesScan`为配置对应的对象所在的包。

配置类：DemoConfig.java

```java
package demo.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(value = "demo.config")
@Data
public class DemoConfig {
    /**
     * mongodb 连接地址
     */
    private final String address;
}
```

`@ConfigurationProperties`表明这是一个配置类，值为配置的名字的前缀。配置的映射方式是前缀 + 属性名称

配置文件：application.properties

```properties
demo.config.address=exmaple.com
```

另外还需要`additional-spring-configuration-metadata.json`和`spring-configuration-metadata.json`两份文件，它们的内容相同。如下

```json
{
  "properties": [
    {
      "name": "demo.config.address",
      "type": "java.lang.String",
      "defaultValue": null,
      "description": "连接地址."
    }
  ]
}
```

`additional-spring-configuration-metadata.json`文件主要用于开发工具对于这个配置的提示，比如 IDEA 就会使用这个文件的中的属性配置提示，在 application.properties 文件中写配置的时候，就会出想对应的配置候选输入框。

`spring-configuration-metadata.json`文件主要是SpringBoot框架内部使用，比如`defaultValue`，如果用户没有进行显示配置，就会使用它。

## 拦截器

在SpringBoot当中可以通过拦截器对用户的请求进行校验。

接口HandlerInterceptor的定义：

```java
package org.springframework.web.servlet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.lang.Nullable;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

public interface HandlerInterceptor {

    /**
     * 在请求执行前调用该函数
     *
     * @param request  用户的请求操作对象，可以通过它获取用户删除的参数、请求体等
     * @param response 用户的请求响应操作对象，比如拦截器验证不通过，可通过它输出对应的响应
     * @param handler  请求处理程序，一般是{@link HandlerMethod}或者{@link ResourceHttpRequestHandler}
     */
    default boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        return true;
    }

    /**
     * 在请求处理程序执行后，渲染视图前，调用该函数
     *
     * @param request      用户的请求操作对象，可以通过它获取用户删除的参数、请求体等
     * @param response     用户的请求响应操作对象，比如拦截器验证不通过，可通过它输出对应的响应
     * @param handler      请求处理程序，一般是{@link HandlerMethod}或者{@link ResourceHttpRequestHandler}
     * @param modelAndView 用于渲染视图的所有所需数据，比如HTTP状态码，响应体等
     */
    default void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
                            @Nullable ModelAndView modelAndView) throws Exception {
    }

    /**
     * 请求处理完成、视图渲染完毕后，的回调函数，可用于清理资源
     *
     * @param request  用户的请求操作对象，可以通过它获取用户删除的参数、请求体等
     * @param response 用户的请求响应操作对象，比如拦截器验证不通过，可通过它输出对应的响应
     * @param handler  请求处理程序，一般是{@link HandlerMethod}或者{@link ResourceHttpRequestHandler}
     * @param ex       处理请求时发生的异常
     */
    default void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                 @Nullable Exception ex) throws Exception {
    }
}
```

拦截器使用示例：

```java
package com.example.demo.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

@SuppressWarnings("JavaDoc")
@Component
public class DemoInterceptor implements HandlerInterceptor, WebMvcConfigurer {
    private static final Logger log = LoggerFactory.getLogger(DemoInterceptor.class);

    @Override
    public boolean preHandle(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull Object handler) {
        log.info("Handler type {}", handler.getClass().getName());
        log.info("Request url {}", request.getServletPath());
        log.info("Request method {}", request.getMethod());
        if (handler instanceof HandlerMethod) {
            HandlerMethod method = (HandlerMethod) handler;
            // 输出请求处理程序，也就是 Controller 类的信息
            log.info("Controller name {}", method.getBeanType().getName());
            log.info("Controller method {}", method.getMethod().getName());
            log.info("Controller bean {}", method.getBean());
        } else if (handler instanceof ResourceHttpRequestHandler) {
            ResourceHttpRequestHandler requestHandler = (ResourceHttpRequestHandler) handler;
            log.info(requestHandler.toString());
        }
        return true;
    }

    /**
     * 注册拦截器
     */
    @Override
    public void addInterceptors(@NotNull InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/**");
    }
}
```

