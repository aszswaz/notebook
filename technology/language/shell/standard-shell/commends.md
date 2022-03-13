# 常用的shell指令

## sed 

对字符串进行正则表达式操作，如下：

```bash
# 把多个空格替换为单个空格
$ echo "Hello  World" | sed 's/\s\s*/ /g'
Hello World
```

s/:正则表达式的替换操作

/g:对所有文本进行匹配，不仅仅是第一个

## echo

```bash
# 打印字符串并换行
$ echo "demo"
# 不换行打印字符串
$ echo -n "demo"
# 结合 read 使用
$ echo -n "please input: " && read demo
please input: demo
$ echo $demo
demo
```

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

## seq

`seq`用于生成指定范围内的所有数字，它通常应用于脚本当中：

```bash
for index in $(seq 0 10); do
	echo $index
done
```

seq默认从1开始，如果想要从0开始，则需要显式指定

## crontab

`crontab`用于执行定时任务，它的cron表达式格式为`分 时 天 月 周`

```bash
# 编辑当前用户的定时任务，一分钟执行一次echo "Hello World"
$ crontab -e
* * * * * echo "Hello World"
# 查看定时任务执行日志
$ sudo vim /var/log/cron
# 可以给别的用户创建定时任务
$ sudo crontab -u root -e
* * * * * echo "Hello World"
```

