# ffmpeg

一款开源的图像处理工具

## 常用命令

```bash
# 播放 pcm 文件
# -ar 音频（视频）帧率
# -f 音频（视频）格式
$ ffplay -ar 48000 -channels 2 -f s16le -i demo.pcm
# 从 mp4 中抽取音频
# -vn 是丢弃视频内容
# -acodec copy 是复制音频流
$ ffmpeg -i demo.mp4 -vn -y -acodec copy demo.m4a
# 把pcm转换为mp3文件
# -acodec 编解码器
$ ffmpeg -y -f s16be -ac 2 -ar 41000 -acodec pcm_s16le -i demo.pcm demo.mp3
# 把wav文件转换为mp3文件
$ ffmpeg -i input.wav -f mp3 -acodec libmp3lame -y output.mp3
# m4a音频文件转换为AAC音频文件
$ ffmpeg -i example.m4a -acodec copy example.aac
# 添加自定义标签
$ ffmpeg -i demo.m4a -movflags use_metadata_tags -metdata tag="Hello World" output.m4a
```

# 针对mp3的歌曲信息（IDV3 tag）进行修复

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
# 由于输入文件是 MP3，输出文件也是 MP3，设置 -acodec copy 可以跳过编码和解码步骤
$ ffmpeg -i 兄弟抱一下.mp3 -metadata title="兄弟抱一下" -metadata album="兄弟抱一下" -metadata genre="怀旧" -metadata artist="庞龙" -acodec copy 兄弟抱一下-backup.mp3
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

# 使用 ffmpeg 录音

```bash
$ ffmpeg -y -f alsa -ar 41000 -ac 2 -i hw:0,0 out.wav -loglevel info
# 录音5秒
$ ffmpeg -y -f alsa -t 00:00:05 -ar 41000 -ac 2 -i hw:0,0 out.wav -loglevel info
```

-f 是指定数据源，-t 是录音时长，-i 是指定设备来源，-ar是采样率，-ac是音频通道，-y是文件已存在进行覆盖

<font color="red">注意：不建议直接存储为mp3格式，mp3是有损压缩，会丢失一些音频数据，ffmpeg会直接在控制台显示数据丢失警告。</font>

# 播放音频

```bash
$ ffplay -nodisp -autoexit -i demo.mp3
```

-nodisp：不显示窗口，-autoexit：播放完毕自动退出

# 把 m4s 的音频和图像整合为单个 mp4 文件

```bash
$ ffmpeg -i audio.m4s -i video.m4s -codec copy demo.mp4
```

# 从视频中抽取图片

```bash
$ ffmpeg -ss '00:03:22' -i video.mp4 -r 30 -vframes 24 demo-%3d.png
```

-ss：开始采集的视频时间，格式为 hh:mm:ss。

-r：每秒采集 N 帧。

-vframes：最多采集 N 帧。

-t：最多采集 N 秒。

<font color="green">-ss 参数尽量放在 -i 之前，这样可以直接跳过指定时间之前的内容，而不是先解码再丢弃。</font>

<font color="red">-r、-vframes 等参数必须要在 -i 后面。</font>

# 截取视频

```bash
$ ffmpeg -ss '00:03:00' -i demo.mp4 -t 30 -c:v copy -c:a copy demo-out.mp4
```

-c:v copy：不解码，直接复制图像

-c:a copy：不解码，直接复制音频

# 修改视频大小

```bash
$ ffmpeg -i demo.mp4 -vf 'scale=320:240' demo-out.mp4
```

