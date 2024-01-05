# 常用的工具简单记录

## iostat

磁盘io查看工具

```bash
# 安装软件包，以archlinux系列为例
$ sudo pacman -S sysstat
# 查看各个分区的io（以MB为单位）
$ iostat -m
# 结合watch使用，5秒刷新一次io信息
$ watch -n 5 iostat -m
```

## xxd

以十六进制形式查看文件

```bash
# 查看文件十六进制
$ xxd demo.mp3
# 以每组一个字节，字母大写的形式输出
$ xxd -g 1 -u demo.mp3
# 查看帮助信息
$ xxd --help
```

## xsel

把程序输出的内容放到gui桌面的剪切板

```bash
# 安装
$ sudo pacman -S xsel
# 使用
$ echo 'Hello World' | xsel --clipboard
```

## expr

算数运算工具

```bash
$ expr 1 + 1
```

## realpath

获得文件的绝对路径（在控制台，一般结合 xsel 使用）

```bash
$ realpath demo.txt
```

## ffmpeg

音频、视频和图像处理工具集

```bash
$ sudo pacman -S ffmpeg
```

**ffprobe**

```bash
# 读取音频的ID3标签信息
$ ffprobe 金南玲-逆流成河.mp3
ffprobe version n4.4 Copyright (c) 2007-2021 the FFmpeg developers
  built with gcc 10.2.0 (GCC)
  configuration: --prefix=/usr --disable-debug --disable-static --disable-stripping --enable-amf --enable-avisynth --enable-cuda-llvm --enable-lto --enable-fontconfig --enable-gmp --enable-gnutls --enable-gpl --enable-ladspa --enable-libaom --enable-libass --enable-libbluray --enable-libdav1d --enable-libdrm --enable-libfreetype --enable-libfribidi --enable-libgsm --enable-libiec61883 --enable-libjack --enable-libmfx --enable-libmodplug --enable-libmp3lame --enable-libopencore_amrnb --enable-libopencore_amrwb --enable-libopenjpeg --enable-libopus --enable-libpulse --enable-librav1e --enable-librsvg --enable-libsoxr --enable-libspeex --enable-libsrt --enable-libssh --enable-libsvtav1 --enable-libtheora --enable-libv4l2 --enable-libvidstab --enable-libvmaf --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxcb --enable-libxml2 --enable-libxvid --enable-libzimg --enable-nvdec --enable-nvenc --enable-shared --enable-version3
  libavutil      56. 70.100 / 56. 70.100
  libavcodec     58.134.100 / 58.134.100
  libavformat    58. 76.100 / 58. 76.100
  libavdevice    58. 13.100 / 58. 13.100
  libavfilter     7.110.100 /  7.110.100
  libswscale      5.  9.100 /  5.  9.100
  libswresample   3.  9.100 /  3.  9.100
  libpostproc    55.  9.100 / 55.  9.100
Input #0, mp3, from '金南玲-逆流成河.mp3':
  Metadata:
    title           : 逆流成河（完整版）-金南玲
    album           : 逆流成河（完整版）
    artist          : 金南玲
    encoder         : Lavf57.56.100
  Duration: 00:03:43.48, start: 0.025057, bitrate: 128 kb/s
  Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 128 kb/s
    Metadata:
      encoder         : Lavc57.64
```

