# [z shell](https://zh.wikipedia.org/wiki/Z_shell) 当中常用的脚本

## 简介

**Z shell**（**Zsh**）是一款可用作[交互式](https://zh.wikipedia.org/w/index.php?title=交互式&action=edit&redlink=1)登录的[shell](https://zh.wikipedia.org/wiki/殼層)及[脚本编写](https://zh.wikipedia.org/wiki/Shell脚本)的[命令解释器](https://zh.wikipedia.org/wiki/命令行界面)。Zsh对[Bourne shell](https://zh.wikipedia.org/wiki/Bourne_shell)做出了大量改进，同时加入了[Bash](https://zh.wikipedia.org/wiki/Bash)、[ksh](https://zh.wikipedia.org/wiki/Korn_shell)及[tcsh](https://zh.wikipedia.org/wiki/Tcsh)的某些功能。

自2019年起，[macOS](https://zh.wikipedia.org/wiki/MacOS)的默认Shell已从[Bash](https://zh.wikipedia.org/wiki/Bash)改为Zsh。

### 特性

特性包括：

-   可帮助用户键入常用命令选项及参数的可编程[命令行补全功能](https://zh.wikipedia.org/w/index.php?title=命令行补全&action=edit&redlink=1)，自带对数百条命令的支持
-   可与任意Shell共享[命令历史](https://zh.wikipedia.org/w/index.php?title=命令历史&action=edit&redlink=1)
-   可在无需运行外部程序（如[find](https://zh.wikipedia.org/wiki/Find)）的情况下通过 [文件扩展](https://zh.wikipedia.org/w/index.php?title=Glob&action=edit&redlink=1)匹配文件
-   改进[变量](https://zh.wikipedia.org/wiki/变量_(程序设计))/[数组](https://zh.wikipedia.org/wiki/数组)处理方式
-   在单缓冲区内编辑多行命令
-   [拼写检查](https://zh.wikipedia.org/wiki/拼寫檢查)
-   多种兼容模式（例如，Zsh可在运行为`/bin/sh`的情况下伪装成[Bourne shell](https://zh.wikipedia.org/wiki/Bourne_shell)）
-   可编程的[命令行界面](https://zh.wikipedia.org/wiki/命令行界面)，包括将提示行信息显示在屏幕右侧并在输入过长指令时自动隐藏的功能
-   可加载模块可提供额外支持：完整[传输控制协议](https://zh.wikipedia.org/wiki/传输控制协议)、[Unix域套接字](https://zh.wikipedia.org/wiki/Unix域套接字)控制、[FTP](https://zh.wikipedia.org/wiki/文件传输协议)客户端及扩展数学函数。
-   自带`where`命令，其与`which`命令类似，但是显示指定于`$PATH`中所指定指令的全部位置，而不是仅显示所使用指令的位置。
-   目录名称。此功能可让用户设置快捷方式，（如`~mydir`，与`~`及`~user`的工作方式相似）。

### [Oh My Zsh](https://ohmyz.sh/)

用户社区网站"Oh My Zsh"收集Z shell的第三方插件及主题。[[8\]](https://zh.wikipedia.org/wiki/Z_shell#cite_note-8)截止于2018年，其[GitHub](https://zh.wikipedia.org/wiki/GitHub)源共有超过1000位贡献者、200多款插件和超过140款主题。同时也带有更新已安装插件及主题的自动更新工具。[[9\]](https://zh.wikipedia.org/wiki/Z_shell#cite_note-9)

## 字符串处理

### 拆分字符串变量

按照空格打断字符串：

```shell
#!/bin/zsh

demo="demo01 demo02 demo03"
# 除了“ ”之外，也可以是其他任何字符串
demo_array=(${(s/ /)demo})

for element in ${demo_array}; do
    echo $element
done
```

执行结果：

```txt
demo01
demo02
demo03
```

### 预拆分字符串，并根据下标获取对应位置的字符串

```shell
#!/bin/zsh

demo="demo01 demo02 demo03"
# 设置分割符为空格
IFS=" "
# 这种方式需要IFS
echo ${demo[(w)2]}
```

输出结果：

```txt
demo02
```

第二种：

```shell
#!/bin/zsh

demo="demo01--demo02--demo03"
# 指定“--”作为断点，如果分隔符是 : 就用别的字符作为左右界，比如 ws.:.
echo ${demo[(ws:--:)2]}
```

```txt
demo02
```

<font color="red">注意：以上两种预拆分字符串，返回的仅仅是指定的索引位置的子字符串，而不是整个打断后的字符串数组</font>

### 按照换行符打断字符串

```bash
# zsh 并不直接转义 \n，需要通过 echo 转换
demo=$(echo "demo\ndemo\ndemo")
demo=(${(f)demo})
echo ${#demo}
```

```text
3
```

**执行指令，并且把指令打印到 stdout 的文字，按照换行符进行拆分成数组：**

```shell
#!/bin/zsh

# 设置字符串的断点符，注意不能缺少“$”
IFS=$'\n'
# 使用 echo 模拟指令的执行结果
demo=($(echo "demo01\ndemo02\ndemo03"))
# 输出字符串的打断结果
for element in ${demo}; do
    echo $element
done
```

运行结果：

```txt
demo01
demo02
demo03
```

## 给函数设置一个快捷键

```shell
function demo() {
	echo "Hello World"
}
```

```bash
# 绑定快捷键：Ctrl + i
$ bindkey "^i" demo
```

运行结果：

```bash
# 注意这里没有写错，Hello World 会在光标所在位置打印
$ Hello World
```

## vared

读取控制台输入，并写入变量，与read不同的是，vared删除多字节的字符（比如简体中文），不会存在只删除半个字符的问题。

```bash
$ vared -c -p "please input: " demo
please input: 你好！世界！
$ echo "${demo}"
```

<font color="red">需要注意的是，vared不会重置变量的值，并且会打印变量已有的值，如下所示</font>

```bash
$ demo="你好！世界！"
$ vared -c -p "Please input: " demo
Please input: 你好！世界！
```

## TCP 操作

zsh也可以像bash一样操作TCP，示例脚本如下：

编写一个回声服务器。服务端：

```shell
#!/bin/zsh

if [[ "$1" != "" ]]; then
    port=$1
else
    port=8080
fi

# 加载TCP模块
zmodload zsh/net/tcp
# 监听端口
ztcp -l $port
echo "listen: $port"
# 通过REPLY变量获得socket的文件描述符
server_socket=$REPLY
echo "server socket: $server_socket"

if [[ "$server_socket" == "" ]]; then
    exit 1
fi

# 注册退出信号，在脚本退出的时候关闭端口和连接
trap "ztcp -c $server_socket; ztcp -c $client_socket; exit 0" SIGINT
trap "ztcp -c $server_socket; ztcp -c $client_socket; exit 0" SIGQUIT
trap "ztcp -c $server_socket; ztcp -c $client_socket; exit 0" SIGKILL
trap "ztcp -c $server_socket; ztcp -c $client_socket; exit 0" SIGTERM

while true; do
    echo "Wait for the client to connect..."
    # 等待客户端连接
    ztcp -a $server_socket
    # 获得客户端的socket的文件的描述符
    client_socket=$REPLY
    echo "client socket: $client_socket"
    # 回声
    while read -r line; do
        echo "client: ${line}"
        echo $line >&$client_socket
    done <&$client_socket
    echo "client socket ${client_socket} closed."
done

```

客户端：

```shell
#!/bin/zsh

if [[ "$1" == "" ]]; then
    host="localhost"
else
    host="$1"
fi

if [[ "$2" == "" ]]; then
    port=8080
else
    port=$2
fi
# 加载TCP模块
zmodload zsh/net/tcp
# 与目标服务器建立连接
ztcp $host $port
# 获得socket的文件描述符
socket=$REPLY
while true; do
    unset input
    vared -c -p "Please input: " input
    echo $input >&$socket

    read -r response <&$socket
    echo "server: ${response}"
    unset response
done

# 程序退出的时候关闭连接
trap "ztcp -c $socket;exit 0" SIGINT
trap "ztcp -c $socket;exit 0" SIGQUIT
trap "ztcp -c $socket;exit 0" SIGKILL
trap "ztcp -c $socket;exit 0" SIGTERM
```

<font color="red">注意：SOCKET 的流操作符只有“<”和“>”，没有“<<”和“>>”</font>
