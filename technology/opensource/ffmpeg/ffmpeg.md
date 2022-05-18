# ffmpeg项目源码解析笔记

ffmpeg 版本：

```txt
ffmpeg version n5.0 Copyright (c) 2000-2022 the FFmpeg developers
built with gcc 11.2.0 (GCC)
configuration: --prefix=/usr --disable-debug --disable-static --disable-stripping --enable-amf --enable-avisynth --enable-cuda-llvm --enable-lto --enable-fontconfig --enable-gmp --enable-gnutls --enable-gpl --enable-ladspa --enable-libaom --enable-libass --enable-libbluray --enable-libdav1d --enable-libdrm --enable-libfreetype --enable-libfribidi --enable-libgsm --enable-libiec61883 --enable-libjack --enable-libmfx --enable-libmodplug --enable-libmp3lame --enable-libopencore_amrnb --enable-libopencore_amrwb --enable-libopenjpeg --enable-libopus --enable-libpulse --enable-librav1e --enable-librsvg --enable-libsoxr --enable-libspeex --enable-libsrt --enable-libssh --enable-libsvtav1 --enable-libtheora --enable-libv4l2 --enable-libvidstab --enable-libvmaf --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxcb --enable-libxml2 --enable-libxvid --enable-libzimg --enable-nvdec --enable-nvenc --enable-shared --enable-version3
libavutil      57. 17.100 / 57. 17.100
libavcodec     59. 18.100 / 59. 18.100
libavformat    59. 16.100 / 59. 16.100
libavdevice    59.  4.100 / 59.  4.100
libavfilter     8. 24.100 /  8. 24.100
libswscale      6.  4.100 /  6.  4.100
libswresample   4.  3.100 /  4.  3.100
libpostproc    56.  3.100 / 56.  3.100
```



## 编译并启动程序

首先从 [ffmpeg官网](https://ffmpeg.org/download.html) 下载源码，然后开始编译

```bash
# 编译时启用mp3模块，启用debug模式（编译时加入调试需要的代码行号等信息），注意一定要加--disable-stripping， 如果不加此选项，ffmpeg在编译时，会使用strip去掉符号信息。
# --enable-debug=3`就是在执行gcc编译时，开启 -g3 -gdwarf-2 添加最多的调试信息（包括#define宏定义的值）
# --disable-optimizations 关闭编译时的代码优化，防止调试时，出现和源码对不上的情况
# --disable-asm 关闭汇编
$ configure --enable-libmp3lame --enable-debug=3 --disable-optimizations --disable-asm --disable-stripping
$ make
# 通过 gdb 启动程序
$ gdb ./ffmpeg_g
# 设置程序运行参数
set args -i ./demo.m4a -i ./demo.mp4 -codec copy -y /dev/shm/out.mp4
# 开始调试程序...
```

## main 函数中的主要调用

第 4875 行 `ffmpeg_parse_options` 函数：

解析传入参数、打开所有的输入文件、解析输入文件媒体信息、打开输出文件、初始化输出文件信息

第 4897 行 `transcode` 函数：

开始媒体流转换，这里是将音频文件和视频文件整合，并且由于制定了 `-codec copy` 所以不会对媒体流进行编解码，而是直接复制

