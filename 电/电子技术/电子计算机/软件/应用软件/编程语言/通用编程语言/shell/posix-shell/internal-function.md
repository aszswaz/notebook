# 简介

SHELL 的内部函数

# trap

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

# shift

shift 每次执行 shift 都会删除 \$* 中的第一个参数（不包括 \$0），它可以用来解析指令参数，示例如下：

```bash
#!/bin/bash

set -o errexit
set -o nounset

function help() {
    echo "Usage: $(basename $0) [options...]" 1>&2
    local spaces=20
    printf "    %-${spaces}s %s\n" '-h,--help' '打印帮助信息' 2>&1
    printf "    %-${spaces}s %s\n" '--hello' '打印 hello world' 2>&1
}

if [ $# -eq 0 ]; then
    help
    exit 1
fi
while [ $# -gt 0 ]; do
    case "$1" in
    -h | --help)
        help
        exit 1
        ;;
    --hello)
        echo "Hello World"
        ;;
    *)
        echo "Unknown option: $1"
        help
        exit 1
        ;;
    esac
    shift
done
```

# getopts

getopts 是 shell 一个用来解析选项参数的内部函数，示例如下：

```bash
#!/bin/bash

set -o errexit
set -o nounset

function help() {
    echo "Usage: $(basename $0) [options...]" 1>&2
    local spaces=20
    printf "    %-${spaces}s %s\n" '-h' '打印帮助信息' 1>&2
    printf "    %-${spaces}s %s\n" '-a [num]' '设置变量 a' 1>&2
    printf "    %-${spaces}s %s\n" '-b [num]' '设置变量 b' 1>&2
}

a=0
b=0

if [ $# -eq 0 ]; then
    help
    exit 1
fi
# 第一个字符为“:”表示不报告错误
# “x:”表示一个带参数的选项，“x”则表示一个不带参数的选项
# 如果遇到未知选项，getopts 会将“?”放到 opt 变量中，并且将该指令放到 OPTARG 变量中
while getopts ':a:b:h' opt; do
    case "$opt" in
    h)
        help
        exit 1
        ;;
    a)
        a=${OPTARG}
        ;;
    b)
        b=${OPTARG}
        ;;
    ?)
        echo "Unknown option: -${OPTARG}"
        help
        exit 1
        ;;
    esac
done
# 清除参数
shift $((OPTIND - 1))

echo "a + b = $a + $b = $((a + b))"
```

```bash
$ bash demo.sh -a 10 -b 10
a + b = 10 + 10 = 20
$ bash demo.sh -h
Usage: demo.sh [options...]
    -h                   打印帮助信息
    -a [num]             设置变量 a
    -b [num]             设置变量 b
```

# declare

declare 的用途有很多，我最常用的是它的两个功能：获取函数源代码和声明数据结构。示例如下：

```bash
# 通过 declare 获取函数的源代码，并且以 root 用户运行该函数
function demo() {
    if [ $USER == "root" ]; then
        echo "success"
    else
        # sudo 的 -E 选项可以继承除了 HOME、USER 之外的环境变量
        sudo -E bash -o errexit -o nounset -c "$(declare -f demo);demo"
    fi
}
demo

# 创建一个字典
declare -A demo_dict
demo_dict["key"]="value"
```

