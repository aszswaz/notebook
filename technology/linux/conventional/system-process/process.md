# linux service

## systemd

systemd 是目前主流的 linux 服务管理工具，它负责整个系统所有服务的启动、停止、重启、开机自启动、状态等管理。

### 常用命令

```bash
# 开机启动
$ systemctl enable mysqld

# 关闭开机启动
$ systemctl disable mysqld

# 启动服务
$ systemctl start mysqld

# 停止服务
$ systemctl stop mysqld

# 重启服务
$ systemctl restart mysqld

# 查看服务状态
$ systemctl status mysqld
$ systemctl is-active sshd.service

# 结束服务进程(服务无法停止时)
$ systemctl kill mysqld
```

### systemd 的 service 文件

service 配置文件主要放在 /usr/lib/systemd/system 目录，也可能在 /etc/systemd/system 目录

示例01：

```txt
# 查看 sshd 服务启动文件
systemctl cat sshd.service

# /usr/lib/systemd/system/sshd.service
[Unit]
Description=OpenSSH server daemon
Documentation=man:sshd(8) man:sshd_config(5)
After=network.target sshd-keygen.service
Wants=sshd-keygen.service

[Service]
Type=notify
EnvironmentFile=/etc/sysconfig/sshd
ExecStart=/usr/sbin/sshd -D $OPTIONS
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
```

<font color="green">每个服务文件以 .service 结尾，一般会分为 3 部分，必须包含 [Service] 部分</font>

**[Unit] 启动顺序与依赖关系**

```txt
Description：当前服务的简单描述
Documentation：指定 man 文档位置

After：如果 network.target 或 sshd-keygen.service 需要启动，那么 sshd.service 应该在它们之后启动
Before：定义 sshd 应该在哪些服务之前启动
注意：After 和 Before 字段只涉及启动顺序，不涉及依赖关系。

Wants：表示 sshd.service 与 sshd-keygen.service 之间存在"弱依赖"关系，即如果"sshd-keygen.service"启动失败或停止运行，不影响 sshd.service 继续执行
Requires：表示"强依赖"关系，即如果该服务启动失败或异常退出，那么sshd.service 也必须退出
注意：Wants 字段与 Requires 字段只涉及依赖关系，与启动顺序无关，默认情况下是同时启动。
```

**[Service] 启动行为**

```txt
EnvironmentFile：许多软件都有自己的环境参数文件，该字段指定文件路径
注意：/etc/profile 或者 /etc/profile.d/ 这些文件中配置的环境变量仅对通过 pam 登录的用户生效，而 systemd 是不读这些配置的。
systemd 是所有进程的父进程或祖先进程，它的环境变量会被所有的子进程所继承，如果需要给 systemd 配置默认参数可以在 /etc/systemd/system.conf  和 /etc/systemd/user.conf 中设置。加载优先级 system.conf 最低，可能会被其他的覆盖。


Type：定义启动类型。可设置：simple，exec，forking，oneshot，dbus，notify，idle，详情请参见下表
simple(设置了 ExecStart= 但未设置 BusName= 时的默认值)：ExecStart 字段启动的进程为该服务的主进程
forking：ExecStart 字段的命令将以 fork() 方式启动，此时父进程将会退出，子进程将成为主进程


ExecStart：定义启动进程时执行的命令
上面的例子中，启动 sshd 执行的命令是 /usr/sbin/sshd -D $OPTIONS，其中的变量 $OPTIONS 就来自 EnvironmentFile 字段指定的环境参数文件。类似的，还有如下字段：
ExecReload：重启服务时执行的命令
ExecStop：停止服务时执行的命令
ExecStartPre：启动服务之前执行的命令
ExecStartPost：启动服务之后执行的命令
ExecStopPost：停止服务之后执行的命令


RemainAfterExit：设为yes，表示进程退出以后，服务仍然保持执行


KillMode：定义 Systemd 如何停止服务，可以设置的值如下：
control-group（默认值）：当前控制组里面的所有子进程，都会被杀掉
process：只杀主进程
mixed：主进程将收到 SIGTERM 信号，子进程收到 SIGKILL 信号
none：没有进程会被杀掉，只是执行服务的 stop 命令


Restart：定义了退出后，Systemd 的重启方式。可以设置的值如下：
no（默认值）：退出后不会重启
on-success：只有正常退出时（退出状态码为0），才会重启
on-failure：非正常退出时（退出状态码非0），包括被信号终止和超时，才会重启
on-abnormal：只有被信号终止和超时，才会重启
on-abort：只有在收到没有捕捉到的信号终止时，才会重启
on-watchdog：超时退出，才会重启
always：不管是什么退出原因，总是重启


RestartSec：表示 Systemd 重启服务之前，需要等待的秒数
```

**Type**

| 值      | 说明                                                         |
| ------- | ------------------------------------------------------------ |
| neshot  | 这一选项适用于只执行一项任务、随后立即退出的服务。可能需要同时设置 RemainAfterExit=yes 使得 systemd 在服务进程退出之后仍然认为服务处于激活状态。 |
| notify  | 与 Type=simple 相同，但约定服务会在就绪后向 systemd 发送一个信号。这一通知的实现由 libsystemd-daemon.so 提供。 |
| dbus    | 若以此方式启动，当指定的 BusName 出现在DBus系统总线上时，systemd认为服务就绪。 |
| idle    | systemd会等待所有任务处理完成后，才开始执行 idle 类型的单元。其他行为与 Type=simple 类似。 |
| forking | systemd认为当该服务进程fork，且父进程退出后服务启动成功。对于常规的守护进程（daemon），除非你确定此启动方式无法满足需求，使用此类型启动即可。使用此启动类型应同时指定 PIDFile=，以便 systemd 能够跟踪服务的主进程 |
| simple  | （默认值） systemd认为该服务将立即启动。服务进程不会 fork 。如果该服务要启动其他服务，不要使用此类型启动，除非该服务是socket 激活型。 |

<font color="red">在如果Type配置不正确，会造成`systemctl start`指令不能正常退出，Type配置正确，使用`systemctl status`会显示`Active: active (running)`</font>

**配置中多个相同配置会选择最后一个，下面结果是 execstart2**

```txt
[Service]
ExecStart=/bin/echo execstart1
ExecStart=/bin/echo execstart2
```

**所有的启动设置之前，都可以加上一个连词号（-），表示"抑制错误"，即发生错误的时候，不影响其他命令的执行**

EnvironmentFile=-/etc/sysconfig/sshd，表示即使 /etc/sysconfig/sshd 文件不存在，也不会抛出错误

**[Install]**

```txt
WantedBy：表示该服务所在的 Target(服务组)
```

**关于 Target，运行级别**

```bash
# 查看默认 Target
$ systemctl get-default
# 结果为 multi-user.target，表示默认的启动 Target 是multi-user.target。在这个组里的所有服务，都将开机启动。这就是为什么 systemctl enable 命令能设置开机启动的原因

# 查看 multi-user.target 包含的所有服务
$ systemctl list-dependencies multi-user.target

# 切换到另一个 target
# shutdown.target 就是关机状态
# 常用的 Target 有两个：一个是 multi-user.target，表示多用户命令行状态；另一个是 graphical.target，表示图形用户状态，它依赖于 multi-user.target
$ systemctl isolate shutdown.target
```

### 自定义服务

```txt
vim /usr/lib/systemd/system/zdy.service

[Unit]
Description=描述
Environment=环境变量或参数(系统环境变量此时无法使用)
After=network.target

[Service]
Type=forking
EnvironmentFile=所需环境变量文件或参数文件
ExecStart=启动命令(需指定全路径)
ExecStop=停止命令(需指定全路径)
User=以什么用户执行命令

[Install]
WantedBy=multi-user.target
```

新建完成后设置自启动

```bash
# 添加或修改配置文件后，需要重新加载
$ systemctl daemon-reload

# 设置自启动，实质就是在 /etc/systemd/system/multi-user.target.wants/ 添加服务文件的链接
$ systemctl enable zdy
```

## 搜索正在后台运行的程序

以java程序为例

```shell
ps -ef|grep java
```

搜索结果如下

```shell
aszswaz    865   542  0 21:14 pts/0    00:00:00 grep --color=auto java
aszswaz  24451     1  2 08:13 ?        00:19:17 java -jar target/data-manage-0.0.1-SNAPSHOT.jar
aszswaz  25032     1  1 08:29 ?        00:08:57 java -jar target/data-manage-volume-warning-0.0.1-SNAPSHOT.jar
```

第一条信息为指令的执行程序，忽略即可

## 使用kill杀死指定pid的进程

```shell
kill 24451
```

## 使用 systemd 自启动一个依赖于 X11 图形系统的程序

这个场景是需要一个程序挂载在系统的托盘区，并且需要开机自启动。为这种程序配置 systemd，一定要注意，要在图形界面完全的启动之后才能启动该程序，service 文件的 Unit.After 和 Install.WantedBy 项配置就要慎重。

在 `${HOME}/.config/system` 目录下新建一个 demo.service 文件，内容如下：

```txt
[Unit]
Description=demo
After=plasma-kglobalaccel.service

[Service]
ExecStart=/home/user/demo
Restart=always

[Install]
WantedBy=plasma-kglobalaccel.service
```

plasma 是 KDE 的用户会话管理程序，通俗点讲，要求用户输入登陆密码的，就是它。它是整个图形系统中最后启动的，所以我这里通过 After 和 WantedBy 执行该程序要在 plasma 启动后才能运行。

有些网友说可以把 After 和 WantedBy 设置为 `graphical-session.target` 或 `default.target`，我尝试了一下，`graphical-session.target` 在我的机器上是无效的，`default.target` 倒是可以运行程序，不过会有 Qt 的警告出现，可能是程序启动的时候，Plasma 等其他软件没有启动的缘故。