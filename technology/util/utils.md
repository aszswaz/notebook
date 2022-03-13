# 命令行工具

## tidy

html 格式化工具

安装：

```bash
$ sudo pacman -S tidy
```

## zip

把文件压缩成zip

```bash
$ sudo pacman -S zip
$ zip -r html.zip /home/html
```

## unzip

```bash
$ sudo pacman -S unzip
# 如果压缩包当中存在中文，在解压的时候需要使用“-O”指定文件名称的编码
$ unzip -O UTF-8 html.zip
```

解压zip文件

## qalc

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

## jq

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

## perl-xml-xpath

xml 的 xpath 解析工具

```bash
$ sudo pacman -S perl-xml-xpath
```

```bash
$ xpath -q -e '/element' demo.xml
```

## xmllint

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

## hexdump

二进制文件查看工具，linux 系统自带，不需要安装

```bash
# -C 表示输出 ASCII 字符 -n 表示读取多少个字节
$ hexdump -C -n 512 example.bin
```

## ffmpeg

## 把pcm转换为mp3文件

```bash
$ ffmpeg -y -f s16be -ac 2 -ar 41000 -acodec pcm_s16le -i demo.pcm demo.mp3
```

<span style="color: green">41000是音频的码率， pcm_s16le是pcm解码器</span>

### 把wav文件转换为mp3文件

```bash
ffmpeg -i input.wav -f mp3 -acodec libmp3lame -y output.mp3
```

### m4a音频文件转换为AAC音频文件

```bash
$ ffmpeg -i example.m4a -acodec copy example.aac
```

### 针对mp3的歌曲信息（IDV3 tag）进行修复

针对网上下载的《兄弟抱一下》歌曲为例：

查看歌曲的IDV3 信息

```bash
$ ffprobe 兄弟抱一下.mp3
...
Input #0, mp3, from '兄弟抱一下.mp3':
  Metadata:
    track           : 1
    title           : ÅÓÁú ÐÖµÜ±§Ò»ÏÂ
    album           : ÐÖµÜ±§Ò»ÏÂ
    TYER            : 2012.3.16
    genre           : Í¨Ë×
    artist          : ÅÓÁú
    encoder         : Lavf52.54.0
  Duration: 00:04:26.03, start: 0.000000, bitrate: 128 kb/s
  Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 128 kb/s
```

| IDV3 TAG | 说明        |
| -------- | ----------- |
| title    | 歌曲名称    |
| album    | 专辑        |
| genre    | 流派        |
| artist   | 艺术家/作者 |

修复IDV3：

```bash
$ ffmpeg -i 兄弟抱一下.mp3 -metadata title="兄弟抱一下" -metadata album="兄弟抱一下" -metadata genre="怀旧" -metadata artist="庞龙" 兄弟抱一下-backup.mp3
...
# 查看修改后的文件
$ ffprobe 兄弟抱一下-backup.mp3
...
Input #0, mp3, from '兄弟抱一下-backup.mp3':
  Metadata:
    track           : 1
    artist          : 庞龙
    title           : 兄弟抱一下
    TYER            : 2012.3.16
    album           : 兄弟抱一下
    genre           : 怀旧
    encoder         : Lavf58.76.100
  Duration: 00:04:26.06, start: 0.025057, bitrate: 128 kb/s
  Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 128 kb/s
    Metadata:
      encoder         : Lavc58.13
# 删除原文件
$ rm 兄弟抱一下.mp3 && mv 兄弟抱一下-backup.mp3 兄弟抱一下.mp3
```

<font color="red">我在使用 cmus 播放器的时候，标题还是会出现乱码，似乎是受到 TYER 这个标签的影响，使用以下指令删除 TYER 可以恢复正常</font>

```bash
$ ffmpeg -i 兄弟抱一下.mp3 -metadata TYER="" backup.mp3 -metadata track="" && rm 兄弟抱一下.mp3 && mv backup.mp3 兄弟抱一下.mp3
```

### 使用ffmpeg录音

```bash
$ ffmpeg -y -f alsa -ar 41000 -ac 2 -i hw:0,0 out.wav -loglevel info
# 录音5秒
$ ffmpeg -y -f alsa -t 00:00:05 -ar 41000 -ac 2 -i hw:0,0 out.wav -loglevel info
```

-f 是指定数据源，-t 是录音时长，-i 是指定设备来源，-ar是采样率，-ac是音频通道，-y是文件已存在进行覆盖

<font color="red">注意：不建议直接存储为mp3格式，mp3是有损压缩，会丢失一些音频数据，ffmpeg会直接在控制台显示数据丢失警告。</font>

### 播放音频

```bash
$ ffplay -nodisp -autoexit -i demo.mp3
```

-nodisp：不显示窗口，-autoexit：播放完毕自动退出

### 把m4s的音频和图像整合为单个mp4文件

```bash
$ ffmpeg -i audio.m4s -i video.m4s -codec copy demo.mp4
```

### 从视频中抽取图片

```bash
$ ffmpeg -i video.mp4 -r 30 -ss 00:03:22 -vframes 24 demo-%3d.png
```

-ss 是开始采集时间，-r 是每秒采集速率，一般是24，-vframes是采集次数

## cmus

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

## typora

安装 typora

```bash
$ sudo pacman -S typora
```

原本的编辑器宽度太小，需要增加编辑器宽度。解压 files文件夹下的 [typora.tar.gz](../../files/typora.tar.gz)，把 themes 覆盖到 $HOME/.config/Typora/themes/，把 base-control.css 复制到 /usr/share/typora/resources/style。

## gawk，awk

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

## netcat（nc）

这是一款TCP、UDP代理工具，主要功能是把stdin流发送到目标服务器，archlinux官方仓库没有这个软件包，需要通过yay安装。

```bash
$ yay -S libressl-netcat
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

## shfmt

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

## valgrind

可用于C和C++程序的内存泄漏检测工具

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

## translate-shell

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

## npm

```bash
# 在当前项目安装开发依赖
$ npm install -D demo
# 查看软件包的版本
$ npm ls demo
```

## iftop

监控主机的网络占用

```bash
# 安装
$ sudo pacman -S iftop
$ sudo iftop
```

