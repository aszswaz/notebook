# [CURL](https://curl.se/libcurl/c/)

version: 7.79.1

## 配置 cmake

```cmake
find_package(CURL REQUIRED)
if (CURL_FOUND)
    message(STATUS "curl version: ${CURL_VERSION_STRING}")
    include_directories(${CURL_INCLUDE_DIRS})
    target_link_libraries(${PROJECT_NAME} PRIVATE ${CURL_LIBRARIES})
endif (CURL_FOUND)
```

## 请求 example.com 网站

```c++
#include <curl/curl.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

typedef struct ResponseBody {
    size_t length;
    char *content;
} ResponseBody;

ResponseBody *newResponseBody() {
    ResponseBody *r = malloc(sizeof(ResponseBody));
    memset(r, 0, sizeof(ResponseBody));
    r->content = malloc(1);
    r->content[0] = 0;
    return r;
}

void freeResponseBody(ResponseBody *s) {
    free(s->content);
    free(s);
}

void append(ResponseBody *r, char *buff, size_t size) {
    size_t newLen = r->length + size;
    r->content = realloc(r->content, newLen + 1);
    memccpy(r->content, buff, (int) r->length, size);
    r->length = newLen;
}

/**
 * libcurl DEBUG 信息输出
 *
 * @param type data 的类型
 * @param data DEBUG 的调试信息
 */
size_t debug_callback(CURL *handle, curl_infotype type, char *data, size_t size, void *userptr) {
    switch (type) {
        case CURLINFO_TEXT:
            // 调试信息，可能是连接代理的日志，也可能是 SSL 握手信息
            fwrite(data, 1, size, stdout);
            break;
        case CURLINFO_HEADER_IN :
            // 响应头
            fprintf(stdout, "=> ");
            fwrite(data, 1, size, stdout);
            break;
        case CURLINFO_HEADER_OUT:
            // 请求头
            fprintf(stdout, "<= Request Header \n");
            fwrite(data, 1, size, stdout);
            break;
        case CURLINFO_DATA_OUT:
            // 请求体
            fwrite(data, 1, size, stdout);
            break;
            // 未经解压的响应体
        case CURLINFO_DATA_IN:
        case CURLINFO_SSL_DATA_IN:
            // SSL 握手信息
        case CURLINFO_SSL_DATA_OUT:
        default:
            break;
    }
    return 0;
}

/**
 * curl收到响应头会回调该函数
 */
size_t write_header_callback(char *buffer, size_t size, size_t nitems, void *userdata) {
    fwrite(buffer, size, nitems, stdout);
    return size * nitems;
}

/**
 * curl接收服务器响应的数据的回调函数
 *
 * @param buffer 响应体字节数据
 * @param size 本次回调，buffer有多少字节
 * @param nitems 本地回调是第N次
 * @param userdata 通过 CURLcode curl_easy_setopt(CURL *handle, CURLOPT_WRITEFUNCTION, write_callback); 传入的句柄
 */
size_t write_callback(char *buffer, size_t size, size_t nitems, void *point) {
    ResponseBody *r = (ResponseBody *) point;
    size *= nitems;
    append(r, buffer, size);
    return size;
}

int main() {
    CURLcode curLcode;

    // 全局初始化curl，启用ssl和socket
    if ((curLcode = curl_global_init(CURL_GLOBAL_DEFAULT))) {
        fprintf(stderr, "curl global init failed: %s\n", curl_easy_strerror(curLcode));
        curl_global_cleanup();
        return EXIT_FAILURE;
    }

    const char *url = "https://www.example.com";

    // 初始化一个curl句柄
    CURL *curl = curl_easy_init();
    if (curl) {
        // 设置url
        curl_easy_setopt(curl, CURLOPT_URL, url);

        // 开启压缩
        curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "deflate, gzip, br, zstd");

        // DEBUG
        // 设置打印 DEBUG 信息的回调函数
        curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, debug_callback);
        // 开启 DEBUG
        curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

        // 设置响应头的读取函数
        // curl_easy_setopt(curl, CURLOPT_HEADERFUNCTION, write_header_callback);
        // curl_easy_setopt(curl, CURLOPT_HEADERDATA, NULL);

        // 设置请求体
        const char *content = "Hello World.\n";
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, content);
        // 设置请求体的大小，默认是 -1L（必须是 long 不能是 int），如果是 -1L，libcurl 会通过 strlen 获得请求体的大小。
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, -1L);

        // 设置服务器响应的读取函数
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
        // 把句柄传给 write_callback 函数
        ResponseBody *r = newResponseBody();
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *) r);
        // 执行请求
        curLcode = curl_easy_perform(curl);
        // 请求执行完毕，判断请求的执行状态
        if (!curLcode) {
            // 获取 HTTP 响应码
            long httpCode;
            curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpCode);
            if (httpCode == 200) {
                // 由于开启了压缩，example.com 会以 gzip 的方式发送网页，所以 Body Length 会比响应中的 Content-Length 大一些
                fprintf(stdout, "Http Code: %ld, Body length: %lu, Body Content: \n%s\n", httpCode, r->length, r->content);
            } else {
                // 由于开启了压缩，example.com 会以 gzip 的方式发送网页，所以 Body Length 会比响应中的 Content-Length 大一些
                fprintf(stderr, "Http Code: %ld, Body length: %lu, Body Content: \n%s\n", httpCode, r->length, r->content);
            };
        } else {
            // 打印错误信息
            fprintf(stderr, "%s\n", curl_easy_strerror(curLcode));
        }

        // 清理句柄
        freeResponseBody(r);
        curl_easy_cleanup(curl);
    } else {
        fprintf(stderr, "init curl failed\n");
        return EXIT_FAILURE;
    }
    curl_global_cleanup();
    return EXIT_SUCCESS;
}
```

## 上传文件

创建demo.json文件

```json
{
  "message": "Hello World"
}
```

请求代码如下：

```c++
#include <curl/curl.h>
#include <cstdlib>
#include <cstdio>

/**
 * 发送请求体
 *
 * @param ptr curl 给出的缓冲区，把要发送的字节，填充到这里
 * @param size 分N次读取，系统底层的IO会自动操作，一般无需关心
 * @param nmemb 缓冲区的大小，需要用这个防止缓冲区溢出
 * @param userdata curl_easy_setopt(curl, CURLOPT_READDATA, pointer) 传入的句柄，本示例中是个文件的句柄
 * @return 本次函数回调有多少字节需要发送
 */
size_t read_callback(char *ptr, size_t size, size_t nmemb, void *userdata) {
    FILE *file = (FILE *) userdata;
    size_t len = fread(ptr, size, nmemb, file);
    fprintf(stdout, "send %lu bytes fo file\n", len);
    return len;
}

int main() {
    // 全局初始化curl，启用ssl和socket
    if (curl_global_init(CURL_GLOBAL_DEFAULT)) {
        fprintf(stderr, "全局初始化curl失败\n");
        curl_global_cleanup();
        return EXIT_FAILURE;
    }
    // 初始化一个curl句柄
    CURL *curl = curl_easy_init();
    if (curl) {
        // 设置url
        curl_easy_setopt(curl, CURLOPT_URL, "https://www.example.com");

        // 设置为POST请求
        curl_easy_setopt(curl, CURLOPT_POST, 1L);

        // 设置请求头
        curl_slist *headers = curl_slist_append(nullptr, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        // 设置用于发送请求体的回调函数
        FILE *file = fopen("demo.json", "rb");
        curl_easy_setopt(curl, CURLOPT_READFUNCTION, read_callback);
        curl_easy_setopt(curl, CURLOPT_READDATA, file);

        // 执行请求
        curl_easy_perform(curl);

        // 清理句柄
        curl_easy_cleanup(curl);
        fclose(file);
    } else {
        fprintf(stderr, "初始化curl句柄失败\n");
        return EXIT_FAILURE;
    }
    curl_global_cleanup();
    return EXIT_SUCCESS;
}
```

