# Jconsole

jconsole 是 java 的调试工具

## Jconsole远程连接

jconsole 本地连接非常简单，不做叙述，重点介绍jconsole远程连接。

在远程服务器上，需要给jvm设置以下参数：

```bash
$ java -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=6000 -Dcom.sun.management.jmxremote.rmi.port=6000 -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=192.168.0.119
```

