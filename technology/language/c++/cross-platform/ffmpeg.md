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
        // 写出每个音频样本数据中，每个通道的数据
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

