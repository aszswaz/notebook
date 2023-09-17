# Github 中间人攻击原理分析

## 序言

3 月 26 日，国内多个地区访问 Github 以及 Github pages 的时候，谷歌浏览器提示“**您的连接不是私密连接”**的错误信息，不少用户想知道为什么会这样。在这起事件中，**我得出的结论是由于 BGP 劫持，国内受影响的用户访问到的是错误的 Github 服务器。**为了了解整个事件的全貌，我们先从一些基础知识开始：

## 为什么会出现这样的提示

如果你使用的是谷歌浏览器，那么除了“**您的连接不是私密连接”** 之外，你可能还见过[其他提示](https://link.zhihu.com/?target=https%3A//support.google.com/chrome/answer/6098869%3Fhl%3Dzh-Hans)：

-   此网页包含重定向循环
-   此网站无法提供安全连接；网络连接错误发送的响应无效
-   您的时钟慢了，您的时钟快了
-   服务器的瞬时 Diffie-Hellman 公共密钥过弱
-   无法显示此网页
-   您计算机上的软件导致 Chrome 无法安全地连接到网络
-   删除过期的 DigiCert 证书

你可以猜测到，要正确地连接到服务器并不像看起来那么简单，而是需要经过一系列谨慎地校验，既要保证你访问的是正确的服务器，也要保障访问过程中数据不被监听或者篡改。我们需要知道：

1.  用户访问 [http://github.com](https://link.zhihu.com/?target=http%3A//github.com) 的时候， [http://github.com](https://link.zhihu.com/?target=http%3A//github.com) 只允许使用 HTTPS 进行加密连接（你可以使用浏览器的开发者工具，看到 [http://github.com](https://link.zhihu.com/?target=http%3A//github.com) 的请求带有 HTTP 头部 Strict-Transport-Security: max-age=31536000; includeSubdomains; preload ）
2.  当使用 HTTPS 建立加密连接的时候，浏览器会要求服务器提供 SSL/TLS 证书，然后浏览器使用自带的数字证书认证机构（简称 CA）的公钥，对服务器提供证书中的 CA 的数字签名进行验证。《图解 HTTP》中有一个非常形象的插图描述了整个流程。

![img](image/github被BGP劫持攻击/v2-3dfaa05379b8b9e3873b26226acc8675_720w.jpg)

\3. 之所以会出现“**您的连接不是私密连接”**的错误，是由于**服务器提供的证书没有通过验证**。以下几种原因会导致证书没有通过验证：

**证书过期或者不符合要求**

**如果** [github.com](https://link.zhihu.com/?target=http%3A//github.com/) **的证书过期或者没有使用合适的加密算法，证书**也无法通过浏览器的验证（会根据具体的原因显示上面提到的提示信息）。不过根据提示信息以及这次事件只发生在国内，而国外能够正常访问 [github.com](https://link.zhihu.com/?target=http%3A//github.com/)，所以排除这个原因。

**DNS 解析出错**

当我们访问 [http://github.com](https://link.zhihu.com/?target=http%3A//github.com) 的时候，需要首先将域名转变成 IP 地址，浏览器会优先查找本地的 hosts 文件，如果没有找到对应的记录，就会向 DNS 服务器请求解析（这里省略了一些与本文无关的细节，具体整个流程可以参考 [what-happens-when](https://link.zhihu.com/?target=https%3A//github.com/alex/what-happens-when)）。如果 **DNS 服务器解析出错或者受污染**，将 [github.com](https://link.zhihu.com/?target=http%3A//github.com/) 解析到错误的 IP 地址，就会导致用户访问错误的服务器。而错误的服务器无法提供正确的证书。不过根据网友提供的截图，DNS 解析到正确的 Github 的 IP 地址，同样排除此原因。

**正确的 IP 地址，错误的服务器**

即使知道了正确的 IP 地址，也不能代表你连接的就是该 IP 对应的服务器，什么意思呢？回忆下当你使用 SSH 协议以及 IP 地址连接一个从未访问过的远程服务器的时候，会出现这样的提示：

```text
The authenticity of host '138.197.19.xxx (138.197.19.xxx)' can't be established. 
ECDSA key fingerprint is SHA256:qwR9naUT7NA6RrLSnu9RQ/jR1fJ2K5eakv52ONEyuOE. 
Are you sure you want to continue connecting (yes/no)?
```

大多数人会直接选择 yes 并且忽略此信息，但是为什么 SSH 协议会有这个“多余的提示”呢？**简单来说，IP 协议并不可靠，恶意服务器可能通过 ARP 欺骗或其他手段来伪装自己是某个 IP 地址的服务器，不能因为服务器说它是某个 IP 地址就相信它。**为了防止这个问题，第三方 VPS 服务器商例如 DigitalOcean 会在网页提供对应服务器的 fingerprint，在你第一次连接的时候就可以对比提示中的 fingerprint 与网页的 fingerprint 是否一致来保证没有连接到错误的服务器。而第一次连接成功之后，客户端会把这些信息保存在本机的 known_hosts 中，代表以后会信任这个服务器。ARP 欺骗不在本文的讨论范围之外，因为 ARP 只能在子网中进行欺骗，我们主要讨论的是另外一种手段，称为 BGP 劫持。

**什么是 BGP**

BGP 是一种路由协议，我们知道连接服务器需要使用 IP 协议，而连接过程需要在不同的路由器中进行跳转（也称为 hop），每个路由器只负责自己网段的服务器，其他会根据路由表分发，BGP 协议就是一个路由寻址的最优路径算法，它使用了 Bellman-Ford 算法，**能够帮助我们高效地查找 A 服务器到 B 服务器的最佳路由路径。**国内的运营商使用它来进行路由路线规划，在终端中，我们可以使用`traceroute`指令来找到这个路由器路径。

**什么是 BGP 劫持**

BGP 劫持就是某些 AS 通过宣称自己拥有某个 IP 地址，而将对该 IP 地址的请求引向一些恶意服务器。下图中 AS 指的是一个区域中大量计算机组成的网络，中国各家运营商管理着相应的 AS。用户知道 [github.com](https://link.zhihu.com/?target=http%3A//github.com/) 的 IP 地址后，从 AS 1 出发，正常来说，应该访问在 AS 4 的 Github 服务器，但是 AS 5 与 AS 6 欺骗 BGP 它拥有 github.com 的 IP 地址并且误导 BGP 的路径经过它，于是用户变成访问 AS 6 服务器，但是用户还以为自己连接的是正确的服务器（根据 IP 地址）。万幸的是，由于 AS 6 的服务器无法提供正确的 Github 证书，所以 HTTPS 连接无法正确建立，而这也是整个事件的真正原因。Cloudflare 有一篇非常好的文章 [What Is BGP Hijacking?](https://link.zhihu.com/?target=https%3A//www.cloudflare.com/learning/security/glossary/bgp-hijacking/) 解释了什么是 BGP 以及 什么是 BGP 劫持。你也可以通过[这个网站](https://link.zhihu.com/?target=https%3A//isbgpsafeyet.com/)来检测自己运营商的 BGP 是否有被劫持的可能。

![img](image/github被BGP劫持攻击/v2-608927f1a4779174225d3f6a79668da4_720w.jpg)

## 总结

**整起事件中，有组织或者个人使用 BGP 劫持将 [github.com](https://link.zhihu.com/?target=http%3A//github.com/) 的 IP 地址指向了使用某 qq 邮箱自签名的证书的服务器，由于浏览器并没有信任该证书，所以出现了“您的连接不是私密连接”的错误信息。**这样的事情早就不是第一次发生，2008 年巴基斯坦的 ISP 运营商就使用 BGP 劫持屏蔽用户浏览 Youtube。2018 年，黑客通过 BGP 劫持将重定向了亚马逊 DNS 服务器的流量，然后盗取加密货币。