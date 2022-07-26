# 系统时区设置

网上一大堆的教程，都在说只需要替换 `/etc/localtime ` 这个时区文件就可以了，linux的时区文件都在 `/usr/share/zoneinfo/` 目录下，但是经过我的实际测试，虽然这样操作过后，使用`date -R `指令显示的时区确实已经更改，但是 jvm 和一些其他的程序进程使用的时区并没有变动。

实际上大多数 linux 发行版自带了`timedatectl`工具可以用于修改时区设置（前提是需要root权限）

```bash
# 显示当前设置
$ timedatectl
# 列出可用时区
$ timedatectl list-timezone
# 设置时区（需要root权限）
$ sudo timedatectl set-timezone <timezone>
```

# 启用 NTP

[NTP](https://zh.wikipedia.org/zh-cn/%E7%B6%B2%E8%B7%AF%E6%99%82%E9%96%93%E5%8D%94%E5%AE%9A) 是通过网络，在计算机系统之间同步时钟的协议。

```bash
# 开启 NTP，默认的 NTP 服务在各大发行版中，有所不同，如 manjaro linux 默认是 0.manjaro.pool.ntp.org
$ sudo timedatectl set-ntp true
# 查看 NTP 配置信息
$ timedatectl show-timesync
FallbackNTPServers=0.manjaro.pool.ntp.org 1.manjaro.pool.ntp.org 2.manjaro.pool.ntp.org 3.manjaro.pool.ntp.org
ServerName=0.manjaro.pool.ntp.org
ServerAddress=94.130.49.186
RootDistanceMaxUSec=5s
PollIntervalMinUSec=32s
PollIntervalMaxUSec=34min 8s
PollIntervalUSec=34min 8s
NTPMessage={ Leap=0, Version=4, Mode=4, Stratum=3, Precision=-25, RootDelay=18.234ms, RootDispersion=1.327ms, Reference=C30D1705, OriginateTimestamp=Tue 2022-07-26 17:07:29 CST, ReceiveTimestamp=Tue 2022-07-26 17:07:29 CST, TransmitTimestamp=Tue 2022-07-26 17:07:29 CST, DestinationTimestamp=Tue 2022-07-26 17:07:29 CST, Ignored=no, PacketCount=8, Jitter=19.873ms }
Frequency=250560
# 查看 NTP 同步状态
$ timedatectl timesync-status
       Server: 94.130.49.186 (0.manjaro.pool.ntp.org)
Poll interval: 34min 8s (min: 32s; max 34min 8s)
         Leap: normal
      Version: 4
      Stratum: 3
    Reference: C30D1705
    Precision: 1us (-25)
Root distance: 10.444ms (max: 5s)
       Offset: -9.716ms
        Delay: 219.246ms
       Jitter: 19.873ms
 Packet count: 8
    Frequency: +3.823ppm
```

