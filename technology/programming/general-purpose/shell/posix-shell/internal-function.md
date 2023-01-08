# 内部函数

## trap

处理退出信号

```bash
# 捕获 SIGINT 信号，退出时删除文件夹
$ trap "rm -rf demo; exit 1" SIGINT
```

<font color="red">注意：被trap捕获的信号，所有的shell终端都不会再执行默认的退出操作，所以，一定要显式调用 exit</font>

可捕获的信号如下：

```
SIGHUP  1      控制终端发现被挂起或控制进程死亡
SIGINT  2      键盘终端，在终端按下快捷键 ctrl + c 就是发送这个信息
SIGQUIT 3      来自键盘的退出信号
SIGKILL 9      杀死进程的信号
SIGALRM 14     定时时钟中断
SIGTERM 15     终止信号
```

<font color="red">不建议捕获 SIGKILL 信号，这个信号是程序变成僵尸，用来强制杀死程序的</font>
