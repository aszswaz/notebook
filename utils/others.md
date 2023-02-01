# 简介

CLI 的常用工具文档，都是可执行或脚本，不是某个 shell 的内置函数

# sed

对字符串进行正则表达式操作，如下：

```bash
# 把多个空格替换为单个空格
$ echo "Hello  World" | sed 's/\s\s*/ /g'
Hello World
# 将文件中第一个匹配的字符串替换为指定的字符串
$ sed -e 's/demo/hello world/g' demo.txt
# 将文件所有匹配的字符串替换为指定的内容
$ sed -i 's/demo/hello world/g' demo.txt
# 和 find、xargs 结合使用
$ find src/ -type f | xargs sed -i 's/demo/hello world/g'
```

s/:正则表达式的替换操作

/g:对所有文本进行匹配，不仅仅是第一个

# echo

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

# seq

seq 用于生成指定范围内的所有数字，它通常应用于脚本当中：

```bash
for index in $(seq 0 10); do
	echo $index
done
```

seq 默认从1开始，如果想要从 0 开始，则需要显式指定

# crontab

crontab 用于执行定时任务，它的cron表达式格式为：分、时、天、月、周

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

# tidy

html 格式化工具

安装：

```bash
$ sudo pacman -S tidy
```

# zip

把文件压缩成zip

```bash
$ sudo pacman -S zip
$ zip -r html.zip /home/html
```

# unzip

```bash
$ sudo pacman -S unzip
# 如果压缩包当中存在中文，在解压的时候需要使用“-O”指定文件名称的编码
$ unzip -O UTF-8 html.zip
```

解压zip文件

# qalc

```bash
$ sudo pacman -S qalc
```

科学计算工具

```bash
$ qalc 1 + 1
1 + 1 = 2
$ qalc
> 1 + 1
1 + 1 = 2
```

使用数学函数，比如 ans （上一个计算的结果）

```bash
$ qalc
> 1 + 1
1 + 1 = 2
> ans + 1
ans + 1 = 3
```

# jq

json格式化工具

```bash
$ sudo pacman -S jq
```

```bash
# 读取文件
$ jq . demo.json
# 格式化输入流
$ cat demo.json | jq
# 遍历数组
$ jq '.demo[]' demo.json
# 获取数组的某个元素
$ jq '.demo[2]' demo.json
# 获取子元素（依次递归）
$ jq '.demo.sub' demo.json
# 获得所有key，注意： keys 和 keys[] 区别，keys 是输出的开始和结束，带有数组的符号 “[” 和 “]”，而 keys[] 没有数组的符号
$ jq 'keys' demo.json
# 以普通文本的形式输出 key （不带 “[]”、”""“）
$ jq -r 'keys[]' demo.json
# 获取数组的长度
$ echo "[\"Hello World\"]" | jq "length"
$ echo "{\"data\": [\"Hello World\"]}" | jq ".data|length"
```

# perl-xml-xpath

xml 的 xpath 解析工具

```bash
$ sudo pacman -S perl-xml-xpath
```

```bash
$ xpath -q -e '/element' demo.xml
```

# xmllint

XML 的格式化工具

```bash
# archlinux 安装
$ sudo pacman -S libxml2
# 从 xml 文件读取，并输出格式化结果到stdout
$ xmllint --format demo.xml
# 从 stdin 读取，并输出格式结果到stdout
$ xmllint --format -
# 如果xml文本中没有指定编码，则需要告诉 xmllint 编码，否则所有的中文字符都会被编码为 unicode
$ xmllint --format --encode UTF-8 -
```

# hexdump

二进制文件查看工具，linux 系统自带，不需要安装

```bash
# -C 表示输出 ASCII 字符 -n 表示读取多少个字节
$ hexdump -C -n 512 example.bin
```

# cmus

一款命令行的音乐播放器，常用指令如下：

| 指令                | 作用                                                         |
| ------------------- | ------------------------------------------------------------ |
| :cd \<filepath\>    | 进入文件夹                                                   |
| :add \<filepath\>   | 把文件夹下所有音频文件加入播放列表，支持mp3、aac等           |
| 1，2，3，4，5，6，7 | 这个是快捷键，对应7种界面视图，个人感觉1 和 5最用，其他界面不清楚作用 |
| :c                  | 暂停、持续播放                                               |
| :x                  | 播放选中的文件                                               |
| :update-cache       | 刷新歌曲信息的缓存，曾经碰到过修改了mp3的IDV3 tags 信息，但是 cmus 不会同步显示 |
| shift + c，r        | shift + c 是启用“继续播放”，r 是循环播放                     |
| ctrl + r            | 切换“列表循环”或“单曲循环                                    |

# typora

安装 typora

```bash
$ sudo pacman -S typora
```

# gawk，awk

awk是一个模式扫描及处理语言。

gawk 是awk的linux实现，在命令行也可以使用awk，awk和gawk是同一个可执行程序。缺省情况下它从标准输入读入并写至标准输出。：

示例01：按空格拆分列，打印指定的列

```bash
$ echo "row01-column01 row-01column02\nrow02-column01 row-02-column02" | gawk '{ print $2 }'
```

执行结果：

```txt
row-01column02
row-02-column02
```

示例02：对指定列的数字进行累加：

```bash
$ echo "1\n1" | gawk '{ sum += $1 }; END { print sum }'
```

执行结果：

```txt
2
```

示例03：读取文件，并打印指定的列。

```bash
$ gawk '{ print $1 }' /etc/passwd
```

示例04：指定列的分隔符，并打印指定的列，这里分隔符以“:”为例：

```bash
$ gawk -F':'' '{ print $1 }' /etc/passwd
```

示例05：统计行数：

```bash
# END 表示所有的文本读取完毕，再执行指令，这里是读取完毕再打印 FNR，FNR是一个内置变量，它的变量值是已读取的行数
$ echo "1\n1" | gawk 'END { print FNR }'
```

示例06：分组聚合

```bash
# 准备演示的文件
$ vim demo.txt
a|ab
b|ab
a|ab
c|ab
$ awk -F '|' '{count[$1]++;} END {for(i in count) {print i ": " count[i]}}' demo.txt
a: 2
b: 1
c: 1
```

下面是awk常用内置变量：

| 变量名称 | 变量说明                                                     |
| -------- | ------------------------------------------------------------ |
| ENVIRON  | 读取当前shell的变量或系统环境变量，例如：echo "" \| gawk '{ print ENVIRON["PATH"] }' |
| FNR      | 浏览文件的记录数                                             |
| NF       | 列数                                                         |
| NR       | 当前行的行号                                                 |
| FNR      | 已读的行数                                                   |

# netcat（nc）

这是一款 TCP、UDP 代理工具，主要功能是把 stdin 流发送到目标服务器。

```bash
$ sudo pacman -S openbsd-netcat
```

通常用于搭配ssh访问github.com

```bash
$ vim ~/.ssh/config
```

```txt
Host github.com
  ProxyCommand=nc -X 5 -x eample:10808 %h %p
```

-X: 表示使用socks5协议，-X connect 是https代理

-x: 是代理服务器地址

%h: 是目标服务器地址

%p: 是目标服务器端口号

# shfmt

shell的格式化工具

安装：

```bash
$ sudo pacman -S shfmt
```

使用：

```bash
$ shfmt -i 4 demo.sh
```

-i：N>0表示使用N个空格缩进，N=0表示使用制表符缩进

-w：将结果写入文件而不是标准输出

# valgrind

可用于 C 和 C++ 程序的内存泄漏检测工具

安装：

```bash
$ sudo pacman -S valgrind
```

示例代码（C++，c方面只需要把 new 改为 malloc 即可）：

```c++
#include <iostream>

int main() {
    auto *demo = new std::string("demo");
    std::cout << demo->c_str() << std::endl;
    return 0;
}
```

编译：

```bash
$ g++ main.cpp -g3 -o main
```

运行：

```bash
$ valgrind --tool=memcheck --leak-check=full --show-leak-kinds=all ./main
==24126== Memcheck, a memory error detector
==24126== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==24126== Using Valgrind-3.17.0 and LibVEX; rerun with -h for copyright info
==24126== Command: ./main
==24126== 
demo
==24126== 
==24126== HEAP SUMMARY:
==24126==     in use at exit: 32 bytes in 1 blocks
==24126==   total heap usage: 3 allocs, 2 frees, 76,832 bytes allocated
==24126== 
==24126== 32 bytes in 1 blocks are definitely lost in loss record 1 of 1
==24126==    at 0x483EF3F: operator new(unsigned long) (vg_replace_malloc.c:417)
==24126==    by 0x10A2FC: main (main.cpp:4)
==24126== 
==24126== LEAK SUMMARY:
==24126==    definitely lost: 32 bytes in 1 blocks
==24126==    indirectly lost: 0 bytes in 0 blocks
==24126==      possibly lost: 0 bytes in 0 blocks
==24126==    still reachable: 0 bytes in 0 blocks
==24126==         suppressed: 0 bytes in 0 blocks
==24126== 
==24126== For lists of detected and suppressed errors, rerun with: -s
==24126== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
```

HEAP SUMMARY：整个程序的内存使用情况，以及内存泄漏发生的位置

LEAK SUMMARY：内存泄漏情况

# translate-shell

语言翻译插件

```bash
# 安装
$ sudo pacman -S translate-shell
# 翻译中文
$ trans zh-CN:en 演示
# 查看可用的翻译引擎，默认是 google
$ trans -S
# 指定翻译引擎
$ trans -e google zh-CN:en 演示
# 播放语音
$ trans -p zh-CN:en 演示
```

# npm

```bash
# 在当前项目安装开发依赖
$ npm install -D demo
# 查看软件包的版本
$ npm ls demo
```

# iftop

监控主机的网络占用

```bash
# 安装
$ sudo pacman -S iftop
$ sudo iftop
```

# peek

将屏幕的指定区域录制为 GIF 图像：

```bash
$ sudo pacman -S peek
$ peek
```

# adb

通过 ADB 安装 XAPK 和 APK，Google Play 上的应用 APK 可在 [apkure](https://apkpure.com/) 上面找到

```bash
# 首先解压 XAPK 文件
$ unzip example.xapk
# 通过 adb 将解压得到的 APK 文件安装到手机
$ adb install-multiple *.apk
# 如果同时链接多个设备，先查看设备信息
$ adb devices -l
List of devices attached
XXXXXXXXXXXXXXXX       device usb:1-1.1 product:DEVICE02 model:DEVICE02 device:DEVICE transport_id:2
XXXXXXXXXXXXXXXX       device usb:1-1.2 product:DEVICE01 model:DEVICE01 device:DEVICE transport_id:1
# 假设将软件安装到 DEVICE02，需要指定设备的 transport_id
$ adb -t 2 install-multiple *.apk
```

# zenity

一个使用 GTK 编写的对话框程序，使用方式如下：

```bash
$ zenity --error --title="Hello World" --text="Hello Wrold" --no-wrap
```

# notify-send

notify-send 也是对话框程序，它和 [zenity](zenity) 的不同之处是，zenity 的对话框出现位置是屏幕中央，notify-send 的出现位置是在屏幕的角落，具体的位置是随着 GUI 环境的不同而不同，比如在 xface 环境下，对话框默认是出现在右上角，在 kde 环境下，对话框出现在右下角。使用方式为：

```bash
$ notify-send "Hello World" "Hello World"
```

# scrcpy

scrcpy 可以通过 adb 协议将手机的屏幕映射到电脑。

```bash
$ sudo pacman -S scrcpy
$ scrcpy
```

