# ffmpeg项目源码解析笔记

## 准备

```bash
# 编译时启用mp3模块，启用debug模式（编译时加入调试需要的代码行号等信息），注意一定要加--disable-stripping， 如果不加此选项，ffmpeg在编译时，会使用strip去掉符号信息。
$ configure --enable-libmp3lame --enable-debug=3 --disable-optimizations --disable-asm --disable-stripping
$ make
```

<span style="color: red">`--enable-debug=3`就是在执行gcc编译时，开启`-g3 -gdwarf-2`添加最多的调试信息（包括#define宏定义的值）</span>

<span style="color: red">`--disable-optimizations` 关闭编译时的代码优化，防止调试时，出现和源码对不上的情况</span>

<span style="color: red">`--disable-asm`关闭汇编</span>

## 1. ffmpeg_parse_options

解析所有选项并打开输入/输出文件

### 1. open_input_file

打开数据源文件

```c
const AVInputFormat *file_iformat = av_find_input_format("s16be");
```

