# 欧几里得算法

## 简介

在《计算机程序设计艺术》第一卷第1章第1.1节第E0小节提到：保证 m >= n 可以有效提升该算法的速度，针对这一点进行测试。

## 问题内容

假定 m = 119 和 n = 544，n 除 m，商为0，余数是119，于是，r = 119，然后 m = n，n = r，第一次的运算的结果只是 m 和 n 交换变量，多了一步无用的取模操作。在执行欧几里得算法之前，为了避免这一步取模操作，《计算机程序设计艺术》建议保证 m >= n 以提高效率，具体到代码，就是通过 if 判断，如果 m < n，先交换 m 和 n的值。

从代码的角度考虑，少了1次取模运算，多了 1次 if。本文探究的问题是：1次 if 的运算时间是否小于一次取模运算？

## 测试详情

首先准备代码 demo01.c 和 demo02.c：

demo01.c：

```c
#include <stdio.h>
#include <sys/time.h>
#include <unistd.h>
#include <limits.h>

/**
 * 求最大公因数
 */
void demo(int m, int n) {
    // 交换变量，确保 m >= n
    if (m < n) {
        int num = n;
        n = m;
        m = num;
    }

    int r;
    while ((r = m % n)) {
        m = n;
        n = r;
    }
}

/**
 * 检验《计算机程序设计艺术》第一卷第1章第1.1节第E0小节的正确性。
 */
void main() {
    int m, n;
    m = 1000000;
    n = 2000000;

    struct timeval start_time;
    struct timeval end_time;
    printf("UINT MAX: %u\n", UINT_MAX);
    gettimeofday(&start_time, NULL);

    for (unsigned int i = 0; i < UINT_MAX; i++) {
        demo(m, n);
    }

    gettimeofday(&end_time, NULL);
    long consume_time = (end_time.tv_sec * 1000000 + end_time.tv_usec) - (start_time.tv_sec * 1000000 + start_time.tv_usec);
    printf("Consume time: %ld\n", consume_time);
}
```

复制文件 demo01.c 为 demo02.c，然后把 demo02.c 的以下这段代码删除：

```c
// 交换变量，确保 m >= n
if (m < n) {
    int num = n;
    n = m;
    m = num;
}
```

在目标机器上使用 gcc 编译：

```bash
$ gcc demo01.c -o demo01 && gcc demo02.c -o demo02
```

测试的两台机器CA、CB的参数：

CA：

```txt
操作系统：centos7
CPU型号：Intel(R) Xeon(R) CPU E5-2689 0 @ 2.60GHz
CPU逻辑核心数：32
内存总大小：27GB

内存0x0036：
大小：16384MB
类型：DDR3
速度：1333 MT/s
制造商：三星
配置内存速度：1333 MT/s

```

CB：

```txt
操作系统：MANJARO
CPU型号：Intel(R) Core(TM) i5-7200U CPU @ 2.50GHz
CPU逻辑核心数：4
内存总大小：12GB

内存0x0009：
大小：4GB
类型：DDR4
速度：2400 MT/s
制造商：Micron
配置内存速度：2133 MT/s

内存0x000B：
大小：8GB
速度：2667 MT/s
制造商：金士顿
配置内存速度：2133 MT/s
```

机器 CA 的MDI内存表坏了，无法读取完全的内存信息，不过这台机器的两根内存条都是同种型号。

首先来看机器 CA 上的测试结果：

```bash
$ ./demo01
UINT MAX: 4294967295
Consume time: 25065902
$ ./demo02
UINT MAX: 4294967295
Consume time: 36064038 微妙
```

机器 CB：

```bash
$ ./demo01
UINT MAX: 4294967295
Consume time: 21440942
$ ./demo02
UINT MAX: 4294967295
Consume time: 35669359 微妙
```

在两台机器上的测试结果都是 demo01 所消耗的时间少于 demo02，由此得出结论：1次 if 加 1次赋值的运算时间少于 1次取模的运算时间。

另外，机器CB的两个测试结果都优于机器CA许多，机器CA的CPU比机器CB的好一点，但是内存条比机器CB相差一代DRR，内存的读写速度相差将近 1000 MT/s，本次测试对于 CPU 的要求不高，应该是内存的读写速度导致了这样的差异。

### 后续的测试

在 demo01 的基础上，去除函数调用，测试函数的调用所消耗的时间：

```c
#include <stdio.h>
#include <sys/time.h>
#include <unistd.h>
#include <limits.h>

/**
 * 检验《计算机程序设计艺术》第一卷第3页 E0 的正确性。
 */
void main() {
    int m, n;
    m = 1000000;
    n = 2000000;

    struct timeval start_time;
    struct timeval end_time;
    gettimeofday(&start_time, NULL);    

    for (unsigned int i = 0; i < UINT_MAX; i++) {
        // 交换变量，确保 m >= n
        if (m < n) {
            int num = n;
            n = m;
            m = num;
        }

        int r;
        while ((r = m % n)) {
            m = n;
            n = r;
        }
    }

    gettimeofday(&end_time, NULL);
    long consume_time = (end_time.tv_sec * 1000000 + end_time.tv_usec) - (start_time.tv_sec * 1000000 + start_time.tv_usec);
    printf("Consume time: %ld\n", consume_time);
}
```

在上述示例的机器CB当中测试：

```txt
Consume time: 12724395
```

结论：函数去除函数调用后，运算时间少了 8.716547 秒，平均每次函数调用耗时 0.002029479249 微妙
