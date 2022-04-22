# 其他网络相关工具

# [rinetd](https://github.com/samhocevar/rinetd)

rinetd 可以把指定端口的 tcp 和 udp 数据包，转发的目标地址，用法如下：

```bash
$ yay -S rinetd
```

/etc/rinetd.conf：

```txt
# [bind ip] [bind port] [target ip] [taget port]
0.0.0.0 8080 www.example.com 80
```

更多帮助信息请查看 `man rinetd`