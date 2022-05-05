# [ffmpeg](https://ffmpeg.org/doxygen/trunk/index.html)

音频、视频信息处理库

# cmake 导入库

```cmake
# ffmpeg
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBAV REQUIRED IMPORTED_TARGET
    libavcodec
    libavfilter
    libavformat
    libavdevice
    libavutil
    libswresample
    libpostproc
    libswscale
)
target_link_libraries(${PROJECT_NAME} PkgConfig::LIBAV)
```

# 读取媒体文件信息

```c++
extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavformat/avio.h>
#include <libavutil/file.h>
}

// 处理 ffmpeg 相关错误
#define av_err2str_cpp(errnum) \
    av_make_error_string((char *)((char[AV_ERROR_MAX_STRING_SIZE]) {0}), AV_ERROR_MAX_STRING_SIZE, errnum)

#define DEMO_FILE "./ignore/video02.mp4"

/**
 * 读取文件，将读取到字节传递给 libav
 */
int read_packet(void *file, uint8_t *buf, int buf_size) {
    if (feof((FILE *)file)) return AVERROR_EOF;
    return fread(buf, 1, buf_size, (FILE *)file);
}

int main(int argc, char *argv[]) {
    // 媒体流信息
    AVFormatContext *fmt_ctx = nullptr;
    AVIOContext *avio_ctx = nullptr;
    // 缓冲区
    uint8_t *avio_ctx_buffer = nullptr;
    int avio_ctx_buffer_size = 4096;
    FILE *demo_file = nullptr;
    // libav 函数返回码
    int ret = 0, exit_code = EXIT_SUCCESS;

    // 构建媒体信息结构体
    if (!(fmt_ctx = avformat_alloc_context())) {
        ret = AVERROR(ENOMEM);
        goto FINALLY;
    }
    // 构建媒体流缓冲区
    if (!(avio_ctx_buffer = (uint8_t *)av_malloc(avio_ctx_buffer_size))) {
        ret = AVERROR(ENOMEM);
        goto FINALLY;
    }
    // 打开文件
    demo_file = fopen(DEMO_FILE, "rb");
    if(!demo_file) {
        perror(DEMO_FILE);
        exit_code = EXIT_FAILURE;
        goto FINALLY;
    }
    // 设置媒体流的缓冲区和读取文件的回调函数
    avio_ctx = avio_alloc_context(avio_ctx_buffer, avio_ctx_buffer_size, 0, (void *)demo_file, &read_packet, nullptr, nullptr);
    if (!avio_ctx) {
        ret = AVERROR(ENOMEM);
        goto FINALLY;
    }
    fmt_ctx->pb = avio_ctx;

    // 开始读取媒体流
    ret = avformat_open_input(&fmt_ctx, nullptr, nullptr, nullptr);
    if (ret < 0) {
        fprintf(stderr, "Could not open input\n");
        goto FINALLY;
    }
    // 查找媒体流信息
    ret = avformat_find_stream_info(fmt_ctx, nullptr);
    if (ret < 0) {
        fprintf(stderr, "Could not find stream information.\n");
        goto FINALLY;
    }
    // 打印媒体流信息
    av_dump_format(fmt_ctx, 0, DEMO_FILE, 0);


FINALLY:
    // 回收内存和资源
    avformat_close_input(&fmt_ctx);
    if (avio_ctx) av_freep(&avio_ctx->buffer);
    avio_context_free(&avio_ctx);
    if(demo_file) fclose(demo_file);

    // 输出错误信息
    if (ret < 0) {
        fprintf(stderr, "Error occured: %s\n", av_err2str_cpp(ret));
        exit_code = EXIT_FAILURE;
    }

    return exit_code;
}

```

# 从 MP2 文件中提取 PCM 原始音频数据

```bash
#include <iostream>
#include <cstdlib>
#include <cstring>

extern "C" {
#include <libavutil/frame.h>
#include <libavutil/mem.h>
#include <libavcodec/avcodec.h>
#include <libavutil/error.h>
}

#define SOURCE_FILE "source-demo.mp2"
#define TARGET_FILE "target-audio01.pcm"
#define AUDIO_INBUF_SIZE 20480
#define AUDIO_REFILL_THRESH 4096

#define IS_NULL_PTR(ptr, message) \
    if (!ptr) { \
        fprintf(stderr, "\033[91m%s\033[0m\n", message); \
        goto FINALLY; \
    }
#define av_perr(errnum) \
    char av_err_buff[AV_ERROR_MAX_STRING_SIZE]; \
    av_strerror(errnum, (char *) &av_err_buff, AV_ERROR_MAX_STRING_SIZE); \
    fprintf(stderr, "\033[91m%s\033[0m\n", av_err_buff);

/**
 * 从片段中读取帧，并输出到文件
 *
 * @author aszswaz
 * @date 2022-04-28
 * @return 0 表示成功，非 0 表示失败
 */
static int decode(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame, FILE *outfile);

/**
 * 输出采样信息
 *
 * @author aszswaz
 * @date 2022-04-28
 */
static int get_format_from_sample_fmt(const char **fmt, enum AVSampleFormat sample_fmt);

int main(int argc, char **argv) {
    const AVCodec *codec;
    AVCodecContext *c = nullptr;
    AVCodecParserContext *parser = nullptr;
    enum AVSampleFormat sfmt;

    int ret = 0, len = 0, n_channels = 0;
    FILE *source_file = nullptr, *target_file = nullptr;
    const char *fmt = nullptr;

    /*
     * AV_INPUT_BUFFER_PADDING_SIZE 值为 64，因为解码器一次读取 32 或 64 字节，所以需要预留 64 个字节
     * 如果附加字节的前 23 位不是 0，则损坏的 MPEG 比特流可能会导致过度读取和段错误。
     */
    uint8_t inbuf[AUDIO_INBUF_SIZE + AV_INPUT_BUFFER_PADDING_SIZE];
    uint8_t *data = nullptr;
    size_t data_size = 0;
    AVPacket *pkt = nullptr;
    AVFrame *decode_frame = nullptr;

    // 初始化数据包
    pkt = av_packet_alloc();
    IS_NULL_PTR(pkt, "Not enough storage");
    // 获取解码器
    codec = avcodec_find_decoder(AV_CODEC_ID_MP2);
    IS_NULL_PTR(codec, "Codec not found");
    // 初始化解析器
    parser = av_parser_init(codec->id);
    IS_NULL_PTR(parser, "Parser not found");
    // 媒体流编码上下文
    c = avcodec_alloc_context3(codec);
    IS_NULL_PTR(c, "Could not allocate audio codec context");
    // 打开解码器和文件流
    if (avcodec_open2(c, codec, nullptr) < 0) {
        fprintf(stderr, "\033[91m%s\033[0m\n", "Could not open codec");
        goto FINALLY;
    }
    // 媒体流的帧
    decode_frame = av_frame_alloc();
    IS_NULL_PTR(decode_frame, "Insufficient memory stick");

    source_file = fopen(SOURCE_FILE, "rb");
    IS_NULL_PTR(source_file, strerror(errno));
    target_file = fopen(TARGET_FILE, "wb");
    IS_NULL_PTR(target_file, strerror(errno));

    data = inbuf;
    // 解析媒体流编码
    data_size = fread(inbuf, 1, AUDIO_INBUF_SIZE, source_file);
    while (data_size > 0) {
        // 获得一个压缩数据的包
        ret = av_parser_parse2(parser, c, &pkt->data, &pkt->size, data, data_size, AV_NOPTS_VALUE, AV_NOPTS_VALUE, 0);
        if (ret < 0) {
            fprintf(stderr, "\033[91mError while parsing\033[0m\n");
            goto FINALLY;
        }
        data += ret;
        data_size -= ret;
        // 读取片段中的帧，并输出到文件
        if (pkt->size && decode(c, pkt, decode_frame, target_file)) goto FINALLY;
        // 从文件补充数据，时刻保证缓存中，等待解码的数据不是特别多（指针越界），也不是特别少（出现残缺的帧）
        if (data_size < AUDIO_REFILL_THRESH) {
            // 未读字节前移，删除已读字节
            memmove(inbuf, data, data_size);
            data = inbuf;
            // 补充字节
            len = fread(data + data_size, 1, AUDIO_INBUF_SIZE - data_size, source_file);
            if (len > 0) data_size += len;
        }
    }

    // 刷新解码器
    pkt->data = nullptr;
    pkt->size = 0;
    decode(c, pkt, decode_frame, target_file);

    // 打印 pcm 信息
    sfmt = c->sample_fmt;
    // 检查样本格式是否是平面的
    if (av_sample_fmt_is_planar(sfmt)) {
        const char *packed = av_get_sample_fmt_name(sfmt);
        printf("Warning: the sample format the decoder produced is planar (%s). This example will output the first channel only.\n", packed ? packed : "?");
        sfmt = av_get_packed_sample_fmt(sfmt);
    }

    n_channels = c->channels;
    ret = get_format_from_sample_fmt(&fmt, sfmt);
    if (ret < 0) goto FINALLY;

    printf("Play the output audio file with the command:\n"
           "ffplay -f %s -ac %d -ar %d %s\n",
           fmt, n_channels, c->sample_rate,
           TARGET_FILE);

FINALLY:
    if (source_file) fclose(source_file);
    if (target_file) fclose(target_file);

    if (c) avcodec_free_context(&c);
    if (parser) av_parser_close(parser);
    if (decode_frame) av_frame_free(&decode_frame);
    if (pkt) av_packet_free(&pkt);

    return EXIT_SUCCESS;
}

static int decode(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame, FILE *outfile) {
    int ret, i, j;
    int data_size;

    // 带有压缩数据的包发送到解码器
    ret = avcodec_send_packet(dec_ctx, pkt);
    if (ret < 0) {
        av_perr(ret);
        return EXIT_FAILURE;
    }

    // 读取所有输出的帧
    while (ret >= 0) {
        ret = avcodec_receive_frame(dec_ctx, frame);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF) {
            break;
        } else if (ret < 0) {
            av_perr(ret);
            return EXIT_FAILURE;
        }
        // 获取每个样本的字节数
        data_size = av_get_bytes_per_sample(dec_ctx->sample_fmt);
        if (data_size < 0) {
            av_perr(data_size);
            return EXIT_FAILURE;
        }
        // 写出每个音频通道中，每个样本的数据，音频通道通常是两个，分别为左声道和右声道，也可能是一个单声道
        for (i = 0; i < frame->nb_samples; i++) {
            for (j = 0; j < dec_ctx->channels; j++) {
                fwrite(frame->data[j] + data_size * i, 1, data_size, outfile);
            }
        }
    }

    return EXIT_SUCCESS;
}

static int get_format_from_sample_fmt(const char **fmt, enum AVSampleFormat sample_fmt) {
    size_t i;
    struct sample_fmt_entry {
        enum AVSampleFormat sample_fmt;
        const char *fmt_be, *fmt_le;
    } sample_fmt_entries[] = {
        { AV_SAMPLE_FMT_U8,  "u8",    "u8"    },
        { AV_SAMPLE_FMT_S16, "s16be", "s16le" },
        { AV_SAMPLE_FMT_S32, "s32be", "s32le" },
        { AV_SAMPLE_FMT_FLT, "f32be", "f32le" },
        { AV_SAMPLE_FMT_DBL, "f64be", "f64le" },
    };

    for (i = 0; i < FF_ARRAY_ELEMS(sample_fmt_entries); i++) {
        struct sample_fmt_entry *entry = &sample_fmt_entries[i];
        if (sample_fmt == entry->sample_fmt) {
            *fmt = AV_NE(entry->fmt_be, entry->fmt_le);
            return 0;
        }
    }

    fprintf(stderr, "sample format %s is not supported as output format\n", av_get_sample_fmt_name(sample_fmt));
    return -1;
}
```

## 音频重采样

```c++
#include <iostream>

extern "C" {
#include <libavutil/opt.h>
#include <libavutil/channel_layout.h>
#include <libavutil/samplefmt.h>
#include <libswresample/swresample.h>
}

// 设置音频音效为立体音效（双声道）
#define SRC_CH_LAYOUT AV_CH_LAYOUT_STEREO
#define DST_CH_LAYOUT AV_CH_LAYOUT_STEREO
// 采样率，每秒采样 N 次
#define SRC_RATE 48000
#define DST_RATE 44100
// 单次采样（生成）的样本总数
#define SRC_NB_SAMPLES 1024
// 采样格式
#define SRC_SAMPLE_FMT AV_SAMPLE_FMT_DBL
#define DST_SAMPLE_FMT AV_SAMPLE_FMT_S16

// 文件
#define DST_FILE "/dev/shm/demo.pcm"

/**
 * 从 t 开始填充 dst 缓冲区
 */
static void fill_samples(double *dst, int nb_samples, int nb_channels, int sample_rate, double *t);

/**
 * 检查采样格式是否支持打印
 */
static int get_format_from_sample_fmt(const char **fmt, enum AVSampleFormat sample_fmt);

int main(int argc, char **argv) {
    // 数据缓存
    uint8_t **src_data = nullptr, **dst_data = nullptr;
    // 根据音效，获取音频声道数
    int src_nb_channels = av_get_channel_layout_nb_channels(SRC_CH_LAYOUT);
    int dst_nb_channels = av_get_channel_layout_nb_channels(DST_CH_LAYOUT);
    // 数据缓存长度
    int src_linesize = 0, dst_linesize = 0;
    // 目标音频采样率
    int dst_nb_samples = 0, max_dst_nb_samples = 0;
    // 输出文件
    FILE *dst_file = nullptr;
    int dst_bufsize = 0;
    // 重采样器
    SwrContext *swr_ctx = nullptr;

    char buf[64];
    double t;
    int ret = 0;
    // 目标采样格式信息
    const char *fmt;

    dst_file = fopen(DST_FILE, "wb");
    if (!dst_file) {
        perror(DST_FILE);
        goto FINALLY;
    }
    // 创建俺重采样器
    swr_ctx = swr_alloc();
    if (!swr_ctx) {
        ret = AVERROR(ENOMEM);
        goto FINALLY;
    }
    // 设置输入流选项
    ret = av_opt_set_channel_layout((void *)swr_ctx, "in_channel_layout", SRC_CH_LAYOUT, 0);
    if (ret < 0) goto FINALLY;
    ret = av_opt_set_int((void *)swr_ctx, "in_sample_rate", SRC_RATE, 0);
    if (ret < 0) goto FINALLY;
    ret = av_opt_set_sample_fmt((void *)swr_ctx, "in_sample_fmt", SRC_SAMPLE_FMT, 0);
    if (ret < 0) goto FINALLY;

    // 设置输出流选项
    ret = av_opt_set_channel_layout((void *)swr_ctx, "out_channel_layout", DST_CH_LAYOUT, 0);
    if (ret < 0) goto FINALLY;
    ret = av_opt_set_int((void *) swr_ctx, "out_sample_rate", DST_RATE, 0);
    if (ret < 0) goto FINALLY;
    ret = av_opt_set_sample_fmt((void *) swr_ctx, "out_sample_fmt", DST_SAMPLE_FMT, 0);
    if (ret < 0) goto FINALLY;

    ret = swr_init(swr_ctx);
    if (ret < 0) goto FINALLY;

    // 分配输入源的样本缓冲区
    ret = av_samples_alloc_array_and_samples(&src_data, &src_linesize, src_nb_channels, SRC_NB_SAMPLES, SRC_SAMPLE_FMT, 0);
    if (ret < 0) goto FINALLY;

    // 计算目标采样数
    max_dst_nb_samples = dst_nb_samples = av_rescale_rnd(SRC_NB_SAMPLES, DST_RATE, SRC_RATE, AV_ROUND_UP);
    // 分配目标样本缓冲区
    ret = av_samples_alloc_array_and_samples(&dst_data, &dst_linesize, dst_nb_channels, dst_nb_samples, DST_SAMPLE_FMT, 0);
    if (ret < 0) goto FINALLY;

    t = 0;
    do {
        // 合成音频
        fill_samples((double *) src_data[0], SRC_NB_SAMPLES, src_nb_channels, SRC_RATE, &t);
        // 计算目标样本数量
        dst_nb_samples = av_rescale_rnd(swr_get_delay(swr_ctx, SRC_RATE) + src_nb_channels, DST_RATE, SRC_RATE, AV_ROUND_UP);
        // 重新获取目标采样缓冲区，避免内存溢出
        if (dst_nb_samples > max_dst_nb_samples) {
            av_freep(&dst_data[0]);
            ret = av_samples_alloc(dst_data, &dst_linesize, dst_nb_channels, dst_nb_samples, DST_SAMPLE_FMT, 1);
            if (ret < 0) break;
            max_dst_nb_samples = dst_nb_samples;
        }
        // 转换为目标格式
        ret = swr_convert(swr_ctx, dst_data, dst_nb_samples, (const uint8_t **) src_data, SRC_NB_SAMPLES);
        if (ret < 0) goto FINALLY;
        dst_bufsize = av_samples_get_buffer_size(&dst_linesize, dst_nb_channels, ret, DST_SAMPLE_FMT, 1);
        if (dst_bufsize < 0) {
            ret = dst_bufsize;
            goto FINALLY;
        }
        printf("t:%f in:%d out:%d\n", t, SRC_NB_SAMPLES, ret);
        fwrite((const void *)dst_data[0], 1, dst_bufsize, dst_file);
    } while (t < 10);

    ret = get_format_from_sample_fmt(&fmt, DST_SAMPLE_FMT);
    if (ret < 0) goto FINALLY;
    // 打印采样信息
    av_get_channel_layout_string(buf, sizeof(buf), dst_nb_channels, DST_CH_LAYOUT);
    fprintf(stderr, "Resampling succeeded. Play the output file with the command:\n"
            "ffplay -f %s -channel_layout %s -channels %d -ar %d %s\n",
            fmt, buf, dst_nb_channels, DST_RATE, DST_FILE);

FINALLY:
    if (dst_file) fclose(dst_file);
    if (src_data) {
        av_freep(&src_data[0]);
        av_freep(&src_data);
    }
    if (dst_data) {
        av_freep(&dst_data[0]);
        av_freep(&dst_data);
    }
    if (swr_ctx) swr_free(&swr_ctx);

    if (ret < 0) {
        char av_err_buf[AV_ERROR_MAX_STRING_SIZE];
        av_strerror(ret, (char *)&av_err_buf, AV_ERROR_MAX_STRING_SIZE);
        fprintf(stderr, "\033[91m%s\033[0m\n", av_err_buf);
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

static void fill_samples(double *dst, int nb_samples, int nb_channels, int sample_rate, double *t) {
    int i, j;
    double tincr = 1.0 / sample_rate, *dstp = dst;
    const double c = 2 * M_PI * 440.0;

    // 生成频率为 440 Hz 的正弦音
    for (i = 0; i < nb_samples; i++) {
        // 声音数据设置为正弦音
        dstp[0] = sin(c * *t);
        // 将所有声道都设置为一个音
        for (j = 1; j < nb_channels; j++) dstp[j] = dstp[0];
        dstp += nb_channels;
        *t += tincr;
    }
}

static int get_format_from_sample_fmt(const char **fmt, enum AVSampleFormat sample_fmt) {
    uint64_t i;
    struct sample_fmt_entry {
        enum AVSampleFormat sample_fmt;
        const char *fmt_be, *fmt_le;
    } sample_fmt_entries[] = {
        { AV_SAMPLE_FMT_U8,  "u8",    "u8"    },
        { AV_SAMPLE_FMT_S16, "s16be", "s16le" },
        { AV_SAMPLE_FMT_S32, "s32be", "s32le" },
        { AV_SAMPLE_FMT_FLT, "f32be", "f32le" },
        { AV_SAMPLE_FMT_DBL, "f64be", "f64le" },
    };
    *fmt = nullptr;

    for (i = 0; i < FF_ARRAY_ELEMS(sample_fmt_entries); i++) {
        struct sample_fmt_entry *entry = &sample_fmt_entries[i];
        if (sample_fmt == entry->sample_fmt) {
            *fmt = AV_NE(entry->fmt_be, entry->fmt_le);
            return 0;
        }
    }

    fprintf(stderr,
            "Sample format %s not supported as output format\n",
            av_get_sample_fmt_name(sample_fmt));
    return AVERROR(EINVAL);
}
```

