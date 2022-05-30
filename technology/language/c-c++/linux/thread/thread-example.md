# pthread 示例

## cmake

```cmake
cmake_minimum_required(VERSION 3.20)

set(MODULE_NAME pthreads_demo)
add_executable(${MODULE_NAME} main.cpp)

# 连接线程库：linux的pthreads、windows的win32、hp threads
find_package(Threads REQUIRED)
if (Threads_FOUND)
    message(STATUS "Thread library: ${CMAKE_THREAD_LIBS_INIT}")
    target_link_libraries(${MODULE_NAME} Threads::Threads)
endif (Threads_FOUND)
```

## 示例01

```c++
//
// Created by aszswaz on 2021/10/23.
//
#include <pthread.h>
#include <iostream>
#include <cstring>
#include <unistd.h>

#define HANDLER_ERROR(resultCode, message) \
    if (resultCode) { \
        errno = resultCode; \
        perror(message); \
        exit(EXIT_FAILURE); \
    }

/**
 * 打印线程属性
 */
int print_attr(pthread_attr_t *attr) {
    int resultCode;

    int value;
    const char *typeStr;

    // 分离状态
    resultCode = pthread_attr_getdetachstate(attr, &value);
    HANDLER_ERROR(resultCode, "pthread_attr_getdetachstate error.")
    switch (value) {
        case PTHREAD_CREATE_DETACHED:
            typeStr = "PTHREAD_CREATE_DETACHED";
            break;
        case PTHREAD_CREATE_JOINABLE:
            typeStr = "PTHREAD_CREATE_JOINABLE";
            break;
        default:
            typeStr = "???";
            break;
    }
    printf("detach state: %s\n", typeStr);

    // 线程的CPU资源争抢范围
    resultCode = pthread_attr_getscope(attr, &value);
    HANDLER_ERROR(resultCode, "pthread_attr_getscope error.")
    switch (value) {
        case PTHREAD_SCOPE_SYSTEM:
            typeStr = "PTHREAD_SCOPE_SYSTEM";
            break;
        case PTHREAD_SCOPE_PROCESS:
            typeStr = "PTHREAD_SCOPE_PROCESS";
            break;
        default:
            typeStr = "???";
            break;
    }
    printf("scope: %s\n", typeStr);

    // 继承调度器
    resultCode = pthread_attr_getinheritsched(attr, &value);
    HANDLER_ERROR(resultCode, "pthread_attr_getinheritsched error.")
    switch (value) {
        case PTHREAD_INHERIT_SCHED:
            typeStr = "PTHREAD_INHERIT_SCHED";
            break;
        case PTHREAD_EXPLICIT_SCHED:
            typeStr = "PTHREAD_EXPLICIT_SCHED";
            break;
        default:
            typeStr = "???";
            break;
    }
    printf("Inherit scheduler: %s\n", typeStr);

    // 调度策略
    resultCode = pthread_attr_getschedpolicy(attr, &value);
    HANDLER_ERROR(resultCode, "pthread_attr_getschedpolicy error.")
    switch (value) {
        case SCHED_OTHER:
            typeStr = "SCHED_OTHER";
            break;
        case SCHED_FIFO:
            typeStr = "SCHED_FIFO";
            break;
        case SCHED_RR:
            typeStr = "SCHED_RR";
            break;
        default:
            typeStr = "???";
            break;
    }
    printf("Scheduling policy: %s\n", typeStr);

    struct sched_param sp{};

    // 调度优先级
    resultCode = pthread_attr_getschedparam(attr, &sp);
    HANDLER_ERROR(resultCode, "pthread_attr_getschedparam error.")
    printf("Scheduling priority: %d\n", sp.sched_priority);

    size_t v;

    // 防护尺寸
    resultCode = pthread_attr_getguardsize(attr, &v);
    HANDLER_ERROR(resultCode, "pthread_attr_getguardsize error.")
    printf("Guard size: %zu bytes\n", v);

    void *stkaddr;

    // 线程堆栈地址和堆栈大小
    resultCode = pthread_attr_getstack(attr, &stkaddr, &v);
    HANDLER_ERROR(resultCode, "pthread_attr_getstack error.")
    printf("Stack address: %p\n", stkaddr);
    printf("Stack size: %zu\n", v);

    return EXIT_SUCCESS;
}

/**
 * 线程的入口函数
 */
void *run(void *message) {
    printf("%s\n", (char *) message);

    pthread_t threadId;
    pthread_attr_t attr;
    int resultCode;

    // 获得当前线程ID
    threadId = pthread_self();
    printf("current thread id: %zu\n", threadId);
    resultCode = pthread_getattr_np(threadId, &attr);
    HANDLER_ERROR(resultCode, "pthread_getattr_np error.\n")

    print_attr(&attr);

    for (int i = 0; i < 100; ++i) {
        std::cout << i << std::endl;
        sleep(1);
    }

    char *resultStatus = (char *) malloc(BUFSIZ);
    memset(resultStatus, 0, BUFSIZ);
    strcpy(resultStatus, "Success.");
    return resultStatus;
}

int main() {
    int resultCode;

    printf("pid %d\n", getpid());

    pthread_t threadId;
    pthread_attr_t *attr;

    attr = (pthread_attr_t *) malloc(sizeof(pthread_attr_t));
    memset(attr, 0, sizeof(pthread_attr_t));

    // 初始化线程属性
    resultCode = pthread_attr_init(attr);
    HANDLER_ERROR(resultCode, "pthread_attr_init error")

    /*
     * 设置线程的状态：
     * PTHREAD_CREATE_DETACHED: 分离状态，此状态下，pthread_join 函数无效，该线程一退出，便可重用其线程 ID 和其他资源。
     * PTHREAD_CREATE_JOINABLE：非分离状态，默认值，此状态下，pthread_join 可用
     * 无论是创建分离线程还是非分离线程，在所有线程都退出之前，进程不会退出。但是 main() 的 return 会导致进程提前退出，可以使用 pthread_exit 退出 main 线程。
     */
    resultCode = pthread_attr_setdetachstate(attr, PTHREAD_CREATE_JOINABLE);
    HANDLER_ERROR(resultCode, "pthread_attr_setdetachstate error")

    /*
     * 设置是否使用继承的调度策略：
     * PTHREAD_INHERIT_SCHED: 表示新建的线程将继承创建者线程中定义的调度策略。将忽略在 pthread_create() 调用中定义的所有调度属性。
     * PTHREAD_EXPLICIT_SCHED：默认值，使用 pthread_create() 调用中的属性。
     */
    resultCode = pthread_attr_setinheritsched(attr, PTHREAD_EXPLICIT_SCHED);
    HANDLER_ERROR(resultCode, "pthread_attr_setinheritsched error")

    /*
     * 设置线程的CPU资源竞争范围，POSIX定义两个值：
     * PTHREAD_SCOPE_SYSTEM: 系统范围内争抢
     * PTHREAD_SCOPE_PROCESS: 进程范围内争抢，linux未实现，一旦使用就会程序崩溃
     */
    resultCode = pthread_attr_setscope(attr, PTHREAD_SCOPE_SYSTEM);
    HANDLER_ERROR(resultCode, "pthread_attr_setscope error")

    /*
     * 设置线程的调度策略：
     * SCHED_OTHER：默认值，由操作系统选择调度策略
     * SCHED_FIFO：先入先出策略
     * SCHED_RR：循环策略
     * SCHED_OTHER是不支持优先级使用的，而SCHED_FIFO和SCHED_RR支持优先级的使用，他们分别为1和99，数值越大优先级越高。
     * 三种策略下的极值如下：
     * SCHED_OTHER: (0-0)
     * SCHED_FIFO: (1-99)
     * SCHED_RR: (1-99)
     * SCHED_FIFO 和 SCHED_RR 只有以 root 用户运行才能使用，普通用户运行会导致程序崩溃
     */
    resultCode = pthread_attr_setschedpolicy(attr, SCHED_OTHER);
    HANDLER_ERROR(resultCode, "pthread_attr_setschedpolicy error")

    // 设置线程优先级，
    struct sched_param param{};
    // 调度策略为 SCHED_FIFO 和 SCHED_RR 才可以设置，值为 1 ~ 99，如果是 SCHED_OTHER，设置非 0 值将会导致程序崩溃
    param.sched_priority = 0;
    resultCode = pthread_attr_setschedparam(attr, &param);
    HANDLER_ERROR(resultCode, "pthread_setschedparam error")

    // 创建线程，并给线程的入口函数传入返回值
    resultCode = pthread_create(&threadId, attr, (void *(*)(void *)) &run, (char *) "Hello Thread.");
    HANDLER_ERROR(resultCode, "pthread_create")

    // 等待线程执行结束，并且接收线程入口函数的返回值
    char *response = nullptr;
    pthread_join(threadId, reinterpret_cast<void **>(&response));
    printf("%s\n", response);

    // 回收线程属性指针
    resultCode = pthread_attr_destroy(attr);
    HANDLER_ERROR(resultCode, "pthread_attr_destroy error")

    /*
     * 主线程如果是通过 return 退出的，操作系统会认为程序结束，从而强制终止程序，
     * 如果是通过 pthread_exit 退出主线程，那么不会对还在执行的线程造成影响，进程将会继续运行，直到所有线程全部退出
     */
    // pthread_exit(nullptr);
    return EXIT_SUCCESS;
}
```

