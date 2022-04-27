# [ffmpeg](https://ffmpeg.org/doxygen/trunk/index.html)

## cmake 导入库

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

## 读取媒体文件信息

```c++
extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavformat/avio.h>
#include <libavutil/file.h>
}

// 处理 ffmpeg 相关错误
#define av_err2str_cpp(errnum) \
    av_make_error_string((char *)((char[AV_ERROR_MAX_STRING_SIZE]) {0}), AV_ERROR_MAX_STRING_SIZE, ret)

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
    demo_file = fopen(DEMO_FILE, "r+");
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

