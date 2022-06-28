# CoreDns

## 简介

官方网站：[https://coredns.io/](https://coredns.io/)

这是一个开源的DNS服务器，它是使用GO语言编写。并且支持对DNS查询进行TLS加密。

## 防DNS污染的基础配置

### 服务端

服务端开启1443端口，监听经过TLS加密的DNS查询请求：

```txt
# 开启加密的DNS
tls://.:1443 {
	# 这是TLS证书的公钥和私钥，如果不指定 /etc/coredns/tls/ca.pem，那么会时候系统中的 CA 证书校验服务器证书
    tls /etc/coredns/tls/public.pem /etc/coredns/tls/private.pem /etc/coredns/tls/ca.pem

	# 这里可以做IP和域名映射
    hosts {
        fallthrough
    }

    # tls加密的google dns
    forward . tls://8.8.8.8 tls://8.8.4.4 {
    	# tls证书的所属域名
        tls_servername  dns.google
    }

    # TTL缓存，单位：秒
    cache {
        # 查询成功的缓存
        success  9984  3600
        # 查询失败的缓存
        denial   9984  3600
    }
	# 每隔一定的时间，加载一次配置文件
    reload 5s
    # 查询日志输出到stdout
    log
    errors
}
```

### 客户端

支持TLS加密查询DNS的软件仅仅是少数，需要在本地假设一个CoreDNS，用于明文的DNS查询

```txt
# 普通的DNS查询
.:53 {
    # 添加几个IP和域名的应声
    hosts {
     	fallthrough
    }

	# 把所有的DNS查询请求通过TLS加密，转发到上游服务器
    forward . tls://127.0.0.1:1443 {
    	# 这是服务器的域名，主要是校验TLS公钥的正确性
        tls_servername www.example.com
    }

    cache {
        # 查询成功缓存，86400 是最大TTL，3600是最小TTL，单位都是秒
        success 86400 3600
        # 查询失败缓存，86400 是最大TTL，5是最小TTL，单位都是秒
        denial  86400 5
    }

    reload 5s
    log
    errors
}
```

