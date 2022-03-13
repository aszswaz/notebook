# SpringBoot mail模块

maven:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

properties:

各大邮箱的ssl配置都不一样，以下配置以网易企业邮箱为例

```properties
spring.mail.default-encoding=UTF-8
spring.mail.host=smtphm.qiye.163.com
spring.mail.port=465
spring.mail.protocol=smtp
spring.mail.username=example@example.com
spring.mail.password=example
spring.mail.test-connection=true
spring.mail.properties.mail.smtp.ssl.enable=true
spring.mail.properties.mail.imap.ssl.socketFactory.fallback=false
spring.mail.properties.mail.smtp.ssl.socketFactory.class=javax.net.ssl.SSLSocketFactory
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

