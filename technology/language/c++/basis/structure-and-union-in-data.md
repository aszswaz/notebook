# 数据中的结构和联合

## 结构基础知识

### 聚合数据类型(aggregate data type)

聚合数据类型能够同时存储超过一个的单独数据。<span style="color: green">c提供了两种类型的聚合数据类型，<span style="background-color: greenyellow">数组和结构</span></span>

<span style="color: green">结构也是一些值的集合，这些值称为它的成员（member），<span style="background-color: greenyellow">但一个结构的各个成员可能具有不同的类型。</span></span>

数组元素的可以通过下标访问，这只是因为数组的元素长度相同。<span style="color:red">但是，在结构中情况并非如此。由于一个结构的成员可能长度不同，所以不能使用下标来访问它们。</span>

每个结构的成员都有自己的名字，它们是通过名字访问的。

结构变量属于标量类型。

#### 结构的声明

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    struct {
        int a;
        int c;
    } demo;
    demo.c = 100;
    demo.a = 110;
    printf("%d", demo.a);
    return 0;
}
```

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    struct {
        int a;
        char b;
        float c;
    } y[20], *z;// 声明一个结构数组，和一个该结构同类型的指针
    return 0;
}
```

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    // 给结构打个标签叫Demo
    struct Demo {
        int a;
        char b;
        float c;
    } demo01;
    struct Demo demo02;// 通过已经定义的结构标签，来定义一个结构
    demo01.a = 101;
    demo02.a = 102;
    printf("%d", demo01.a);
    printf("%d", demo02.a);
    return 0;
}
```

```c
#include <stdio.h>

int main(int argc, char *argv[]) {

    typedef struct {
        int a;
        float b;
        char c;
    } Demo;

    Demo demo;
    demo.a = 101;
    demo.b = 110;

    printf("a: %d\n", demo.a);
    printf("b: %f\n", demo.b);

    return 0;
}
```

**通过指针访问结构**

```c
#include <stdio.h>

int main(int argc, char *argv[]) {

    typedef struct {
        int a;
        float b;
        char c;
    } Demo;

    Demo demo, *p;
    p = &demo;
    p->a = 101;
    printf("a: %d\n", demo.a);
    (*p).b = 110;// 由于“.”的优先级高于“*”，需要“()”提升优先级
    printf("b: %f\n", demo.b);

    return 0;
}
```

**结构的不完整声明**

```c
#include <stdio.h>

int main(int argc, char *argv[]) {

    struct B;

    struct A {
        struct B *partner;
    };

    struct B {
        struct A *partner;
    };

    return 0;
}
```

在A的成员列表中需要标签B的不完整声明。一旦A被声明之后，B的成员列表也可以被声明。

#### 注意事项

<span style="color: red">声明一个结构A，A有一个成员p，p的类型就是结构A，那么P需要声明为指针，否则就会出现递归的结构声明。</span>如下所示

```c
#include <stdio.h>

int main(int argc, char *argv[]) {

    struct A {
        int a;
        struct A *p;
    };

    struct A demo;
    demo.a = 100;
    struct A demo01;
    demo.p = &demo01;
    (*demo.p).a = 110;

    printf("demo a: %d\n", demo.a);
    printf("demo01 a: %d\n", demo.p->a);

    return 0;
}
```

# 结构成员的内存对齐

例一：

```c
#include <stdio.h>

int main() {

    struct Demo {
        char a;
        int b;
        char c;
    };

    printf("size: %lu", sizeof(struct Demo));// 输出内存大小

    return 0;
}
```

```bash
/home/aszswaz/project/CLionProjects/demo/cmake-build-debug/demo
size: 12
Process finished with exit code 0
```

例一的结构内存，如图所示：

<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="481px" height="91px" viewBox="-0.5 -0.5 481 91" content="&lt;mxfile host=&quot;Electron&quot; modified=&quot;2021-04-01T12:55:19.140Z&quot; agent=&quot;5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/14.5.1 Chrome/89.0.4389.82 Electron/12.0.1 Safari/537.36&quot; etag=&quot;toXhzR4_mYyGgaS71oov&quot; version=&quot;14.5.1&quot; type=&quot;device&quot;&gt;&lt;diagram id=&quot;toE1acUjxVjHVObhoOZr&quot; name=&quot;第 1 页&quot;&gt;7Zldb5swFIZ/DZerwJCvy5F+7GKTpuai26WDXfBqMDNOk+zXzwYbAk5VpqaLVSWRIvP62ODnPcE2eOEy391xWGbfGMLUAz7aeeG1B0AUBfJXCXst+H4jpJygRgo6YUX+YC2asA1BuOoFCsaoIGVfTFhR4ET0NMg52/bDHhntn7WEKbaEVQKprT4QJLJGnYNZp3/BJM3MmYPpoqnJoQnWI6kyiNj2QApvvHDJGRNNKd8tMVXsDJem3e0Lte2FcVyIMQ3ih99Zhe7S/f2MrOIf85+/noNPupdnSDd6wPpixd4Q4GxTIKw68b0w3mZE4FUJE1W7lZZLLRM5lUeBLOruMBd49+J1Bu3oZdZglmPB9zJENwinGtgwY7Yd/0hL2QF6o0HteNr23EGRBc3lHxgB9xi1TFxhFDrIKHKMUeQgo7ljjCavM5L30VIVkw2n+5jD5AmL12F1ZNURIlxOFoQVKhZXog4QUCsL/0R0wz7dcGbTBUfoBtP3wju18K4tvnK8os+uEpw94SWjjEulYIWMjB8JpQMJUpIqfonkg6UeK3pEzqWfdUVOEFKnOWpWP/dPgR8MkvsI/mPJDd6LvlnTuHQHAK7NJIE93cKPm6MW/ujcOTpzL0cnwz/y2XN0YUFKPm6OWvjPnaNgxErKIPsK15h+ZxXRc/uaCcHyI0wFGySuWWfku1TtbK/WsCLJVQmF9KS4la7d1/vN2sCVPjEiMK2NxrKz60lbq3w320f/CvR0Y74HQlR/2kwxLYJBmsjIua++J/LXuQ3XiFXgxd/R/k5dm+KBvQy9+PsGf13b6IIRa4iLv+PXiM75O7/4e0p/XXsIA+zl7cXfNzzQ/n/bF3nYvVCo6w7eyoQ3fwE=&lt;/diagram&gt;&lt;/mxfile&gt;"><defs/><g><rect x="160" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="200" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="240" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="280" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><path d="M 250 -30 L 245 -30 Q 240 -30 240 -20 L 240 40 Q 240 50 235 50 L 232.5 50 Q 230 50 235 50 L 237.5 50 Q 240 50 240 60 L 240 120 Q 240 130 245 130 L 250 130" fill="none" stroke="#000000" stroke-miterlimit="10" transform="rotate(270,240,50)" pointer-events="all"/><rect x="220" y="70" width="40" height="20" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 38px; height: 1px; padding-top: 80px; margin-left: 221px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">b</div></div></div></foreignObject><text x="240" y="84" fill="#000000" font-family="Helvetica" font-size="12px" text-anchor="middle">b</text></switch></g><rect x="0" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="0" y="40" width="40" height="20" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 38px; height: 1px; padding-top: 50px; margin-left: 1px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">a</div></div></div></foreignObject><text x="20" y="54" fill="#000000" font-family="Helvetica" font-size="12px" text-anchor="middle">a</text></switch></g><rect x="320" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="320" y="40" width="40" height="20" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 38px; height: 1px; padding-top: 50px; margin-left: 321px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">c</div></div></div></foreignObject><text x="340" y="54" fill="#000000" font-family="Helvetica" font-size="12px" text-anchor="middle">c</text></switch></g><rect x="360" y="0" width="40" height="40" fill="#808080" stroke="none" pointer-events="all"/><path d="M 360 0 L 360 0 M 360 7.05 L 367.05 0 M 360 14.1 L 374.1 0 M 360 21.15 L 381.15 0 M 360 28.2 L 388.2 0 M 360 35.25 L 395.25 0 M 362.3 40 L 400 2.3 M 369.35 40 L 400 9.35 M 376.4 40 L 400 16.4 M 383.45 40 L 400 23.45 M 390.5 40 L 400 30.5 M 397.55 40 L 400 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 360 0 L 400 0 L 400 40 L 360 40 L 360 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/><rect x="400" y="0" width="40" height="40" fill="#808080" stroke="none" pointer-events="all"/><path d="M 400 0 L 400 0 M 400 7.05 L 407.05 0 M 400 14.1 L 414.1 0 M 400 21.15 L 421.15 0 M 400 28.2 L 428.2 0 M 400 35.25 L 435.25 0 M 402.3 40 L 440 2.3 M 409.35 40 L 440 9.35 M 416.4 40 L 440 16.4 M 423.45 40 L 440 23.45 M 430.5 40 L 440 30.5 M 437.55 40 L 440 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 400 0 L 440 0 L 440 40 L 400 40 L 400 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/><rect x="440" y="0" width="40" height="40" fill="#808080" stroke="none" pointer-events="all"/><path d="M 440 0 L 440 0 M 440 7.05 L 447.05 0 M 440 14.1 L 454.1 0 M 440 21.15 L 461.15 0 M 440 28.2 L 468.2 0 M 440 35.25 L 475.25 0 M 442.3 40 L 480 2.3 M 449.35 40 L 480 9.35 M 456.4 40 L 480 16.4 M 463.45 40 L 480 23.45 M 470.5 40 L 480 30.5 M 477.55 40 L 480 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 440 0 L 480 0 L 480 40 L 440 40 L 440 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/><rect x="40" y="0" width="40" height="40" fill="#808080" stroke="none" pointer-events="all"/><path d="M 40 0 L 40 0 M 40 7.05 L 47.05 0 M 40 14.1 L 54.1 0 M 40 21.15 L 61.15 0 M 40 28.2 L 68.2 0 M 40 35.25 L 75.25 0 M 42.3 40 L 80 2.3 M 49.35 40 L 80 9.35 M 56.4 40 L 80 16.4 M 63.45 40 L 80 23.45 M 70.5 40 L 80 30.5 M 77.55 40 L 80 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 40 0 L 80 0 L 80 40 L 40 40 L 40 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/><rect x="80" y="0" width="40" height="40" fill="#808080" stroke="none" pointer-events="all"/><path d="M 80 0 L 80 0 M 80 7.05 L 87.05 0 M 80 14.1 L 94.1 0 M 80 21.15 L 101.15 0 M 80 28.2 L 108.2 0 M 80 35.25 L 115.25 0 M 82.3 40 L 120 2.3 M 89.35 40 L 120 9.35 M 96.4 40 L 120 16.4 M 103.45 40 L 120 23.45 M 110.5 40 L 120 30.5 M 117.55 40 L 120 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 80 0 L 120 0 L 120 40 L 80 40 L 80 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/><rect x="120" y="0" width="40" height="40" fill="#808080" stroke="none" pointer-events="all"/><path d="M 120 0 L 120 0 M 120 7.05 L 127.05 0 M 120 14.1 L 134.1 0 M 120 21.15 L 141.15 0 M 120 28.2 L 148.2 0 M 120 35.25 L 155.25 0 M 122.3 40 L 160 2.3 M 129.35 40 L 160 9.35 M 136.4 40 L 160 16.4 M 143.45 40 L 160 23.45 M 150.5 40 L 160 30.5 M 157.55 40 L 160 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 120 0 L 160 0 L 160 40 L 120 40 L 120 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/></g><switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><a transform="translate(0,-5)" xlink:href="https://www.diagrams.net/doc/faq/svg-export-text-problems" target="_blank"><text text-anchor="middle" font-size="10px" x="50%" y="100%">Viewer does not support full SVG 1.1</text></a></switch></svg>

<span style="color: red">系统禁止编译器在一个结构的起始位置，跳过几个字节来满足边界对齐要求，因此所有结构的起始位置必须是结构中边界要求最严格的数据类型所要求的位置。</span>因此成员a必须存储于一个能够被4整除的地址，结构的下一个成员变量是一个整型值，所以它必须跳过三个字节到达合适的边界才能存储。

例二：

```c
#include <stdio.h>

int main() {

    struct Demo {
        int b;
        char a;
        char c;
    };

    printf("size: %lu", sizeof(struct Demo));// 输出内存大小

    return 0;
}
```

```bash
/home/aszswaz/project/CLionProjects/demo/cmake-build-debug/demo
size: 8
Process finished with exit code 0
```

例二的结构内存，如图：

<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="321px" height="81px" viewBox="-0.5 -0.5 321 81" content="&lt;mxfile host=&quot;Electron&quot; modified=&quot;2021-04-01T13:02:02.301Z&quot; agent=&quot;5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/14.5.1 Chrome/89.0.4389.82 Electron/12.0.1 Safari/537.36&quot; etag=&quot;LBiBlNsMmD4AbI7nrd0o&quot; version=&quot;14.5.1&quot; type=&quot;device&quot;&gt;&lt;diagram id=&quot;FkN0yWMnZ3GWn7j7DnY_&quot; name=&quot;第 1 页&quot;&gt;7Zhbb9owFMc/TR6HghNujwu03SQmVaPStr6Z2CRWnThyTIF++h0nNiEEVCaVzqpKJGT/j6+/40tOvGCabe8kLtIfglDuIZ9svWDmITRAA/jXwq4WwtGwFhLJSC31G2HBXqgRfaOuGaFlq6ASgitWtMVY5DmNVUvDUopNu9hK8HavBU5oR1jEmHfVX4yotFbHaNTo3yhLUttzfzipLRm2hc1MyhQTsTmQghsvmEohVJ3KtlPKNTvLpa53e8a6H5ikubqkgpys7tM5mr38+f34/eF5PnxYp19MK8+Yr82EzWDVzhKQYp0TqhvxvSDapEzRRYFjbd2Ay0FLVcYh14ekaY5KRbdnx9nfzx5WDRUZVXIHRWwFC8ysGBSa/Kbhb6X0AL3VsPF4sm+5gQIJw+UfGCEHGQ0dYxS4xwj5jjEKHWQUOsZo8DojOEcLnYzXku8iieMnql6H1ZDVOcIkXBZM5JDPhdRTjcr67vF7gyudY+Mu2/0+PoSLrgV32IG77NCF+ao2uVJJ8USnggtZ0cqhZLRinB9JmLNE84yBDwU90vQY3KRfjSFjhOhuTrqqvfLfAv+4jT/wL1vaV6M/cm/7B65dtWP3GKGxY4wmHUb44+7iDv0Th+i77mIblxzgjz8u/s4B8d/xX/AybpHN8ZLye1Eyc9EvhVIiO8FUiaNjw75iZNtEB7W9JS5Z3CuwAp/kt+C1n1WoWTlwYTomDCeVoyk0NhvsrdrvNnL0e6ilW+d7KCDV72hRgB5Vzxt507WooX9B2PDpzTPeDN8vvoFs852ish187Alu/gI=&lt;/diagram&gt;&lt;/mxfile&gt;"><defs/><g><rect x="0" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="40" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="80" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="120" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><path d="M 90 -30 L 85 -30 Q 80 -30 80 -20 L 80 40 Q 80 50 75 50 L 72.5 50 Q 70 50 75 50 L 77.5 50 Q 80 50 80 60 L 80 120 Q 80 130 85 130 L 90 130" fill="none" stroke="#000000" stroke-miterlimit="10" transform="rotate(270,80,50)" pointer-events="all"/><rect x="60" y="60" width="40" height="20" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 38px; height: 1px; padding-top: 70px; margin-left: 61px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">b</div></div></div></foreignObject><text x="80" y="74" fill="#000000" font-family="Helvetica" font-size="12px" text-anchor="middle">b</text></switch></g><rect x="200" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="160" y="0" width="40" height="40" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="160" y="40" width="40" height="20" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 38px; height: 1px; padding-top: 50px; margin-left: 161px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">a</div></div></div></foreignObject><text x="180" y="54" fill="#000000" font-family="Helvetica" font-size="12px" text-anchor="middle">a</text></switch></g><rect x="200" y="40" width="40" height="20" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 38px; height: 1px; padding-top: 50px; margin-left: 201px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">c</div></div></div></foreignObject><text x="220" y="54" fill="#000000" font-family="Helvetica" font-size="12px" text-anchor="middle">c</text></switch></g><rect x="240" y="0" width="40" height="40" fill="#b3b3b3" stroke="none" pointer-events="all"/><path d="M 240 0 L 240 0 M 240 7.05 L 247.05 0 M 240 14.1 L 254.1 0 M 240 21.15 L 261.15 0 M 240 28.2 L 268.2 0 M 240 35.25 L 275.25 0 M 242.3 40 L 280 2.3 M 249.35 40 L 280 9.35 M 256.4 40 L 280 16.4 M 263.45 40 L 280 23.45 M 270.5 40 L 280 30.5 M 277.55 40 L 280 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 240 0 L 280 0 L 280 40 L 240 40 L 240 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/><rect x="280" y="0" width="40" height="40" fill="#b3b3b3" stroke="none" pointer-events="all"/><path d="M 280 0 L 280 0 M 280 7.05 L 287.05 0 M 280 14.1 L 294.1 0 M 280 21.15 L 301.15 0 M 280 28.2 L 308.2 0 M 280 35.25 L 315.25 0 M 282.3 40 L 320 2.3 M 289.35 40 L 320 9.35 M 296.4 40 L 320 16.4 M 303.45 40 L 320 23.45 M 310.5 40 L 320 30.5 M 317.55 40 L 320 37.55" fill="none" stroke="#dddddd" stroke-miterlimit="10" pointer-events="all"/><path d="M 280 0 L 320 0 L 320 40 L 280 40 L 280 0" fill="none" stroke="#000000" stroke-miterlimit="10" pointer-events="all"/></g><switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><a transform="translate(0,-5)" xlink:href="https://www.diagrams.net/doc/faq/svg-export-text-problems" target="_blank"><text text-anchor="middle" font-size="10px" x="50%" y="100%">Viewer does not support full SVG 1.1</text></a></switch></svg>

所包含的成员和前面那个结构一样，但它只占用8个字节的空间，节省了33%。两个字符可以紧挨着存储，所以只有结构最后面需要跳过的两个字节才被浪费。

### sizeof

```c
#include <stdio.h>

int main() {

    struct Demo {
        char a;
        char b;
        char c;
    };

    // sizeof输出结构的长度，包括因边界对齐而跳过的那些字节
    printf("size: %lu", sizeof(struct Demo));

    return 0;
}
```

### offsetof

```c
#include <stdio.h>
#include <stddef.h>

int main() {

    struct Demo {
        int a;
        char b;
        char c;
    };

    /*
     * offsetof(定义于stddef.h)可以确定某个成员相对于结构位置的实际位置
     * offsetof( type, member ) "type"就是结构的类型，member就是成员,表达式的结果是一个size_t的值，表示这个成员开始存储的位置，距离结构开始存储的位置，偏移几个字节。
     */
    printf("address: %lu", offsetof(struct Demo, b));

    return 0;
}
```

```bash
/home/aszswaz/project/CLionProjects/demo/cmake-build-debug/demo
address: 4
Process finished with exit code 0
```

# 作为函数参数的结构

结构是一个`标量`，因此结构可以作为参数传递给一个函数。<span style="color: red">但它的效率很低，因为C语言的参传值调用方式要求把参数的一份拷贝传递给参数。</span>

```c
#include <stdio.h>

typedef struct {
    int a;
    char b;
    char c;
} Demo;

void demoMethod(Demo demo);

int main() {

    Demo demo;
    demo.a = 110;
    demoMethod(demo);
    printf("main value: %d\n", demo.a);

    return 0;
}

void demoMethod(Demo demo) {
    demo.a = 100;
    printf("demo value: %d\n", demo.a);
}
```

如上所示 demoMethod 方法中的赋值操作，并没有影响main函数中的结构。

```bash
/home/aszswaz/project/CLionProjects/demo/cmake-build-debug/demo
demo value: 100
main value: 110

Process finished with exit code 0
```

<span style="color: green">建议通过指针进行传参，操作如下</span>

```c
#include <stdio.h>

typedef struct {
    int a;
    char b;
    char c;
} Demo;

void demoMethod(Demo *demo);

int main() {

    Demo demo;
    demo.a = 110;
    demoMethod(&demo);
    printf("main value: %d\n", demo.a);

    return 0;
}

void demoMethod(Demo *demo) {
    demo->a = 100;
    printf("demo value: %d\n", demo->a);
}
```

```bash
/home/aszswaz/project/CLionProjects/demo/cmake-build-debug/demo
demo value: 100
main value: 100

Process finished with exit code 0
```

# 位段（位域）

有些数据在存储时并不需要占用一个完整的字节，只需要占用一个或几个二进制位即可。例如开关只有通电和断电两种状态，用 0 和 1 表示足以，也就是用一个二进位。正是基于这种考虑，C语言又提供了一种叫做`位域`的数据结构。

```c
#include <stdio.h>

int main() {
    struct bs {
        unsigned m;
        unsigned n: 4;
        unsigned char ch: 6;
    } a = {0xad, 0xE, '$'};
    //第一次输出
    printf("%#x, %#x, %c\n", a.m, a.n, a.ch);
    //更改值后再次输出
    a.m = 0xb8901c;
    a.n = 0x2d;
    a.ch = 'z';
    printf("%#x, %#x, %c\n", a.m, a.n, a.ch);
    return 0;
}
```

```bash
/home/aszswaz/project/CLionProjects/demo/cmake-build-debug/demo
0xad, 0xe, $
0xb8901c, 0xd, :

Process finished with exit code 0
```

# 联合

<span style="color: green">联合的所有成员引用的是内存中的相同的位置。</span>当你向在不同的时刻把不同的东西存储于同一位置时，就可以使用联合.

```c
#include "stdio.h"

// 声明一个“联合”
typedef union {
    float f;
    int a;
} Demo;

int main() {
    Demo test;

    // 对成员f进行赋值，观察成员a的变化
    test.f = 1.000f;
    printf("f: %f; a: %d\n", test.f, test.a);

    // 保留当前成员a的值
    const int copy = test.a;

    // 对成员a进行赋值，观察成员f的变化
    test.a = 2;
    printf("a: %d; f: %f\n", test.a, test.f);

    // 将成员a的值，改回原值，观察成员f的变化
    test.a = copy;
    printf("a: %d; f: %f\n", test.a, test.f);
    return 0;
}
```

```bash
/home/aszswaz/project/CLionProjects/demo/cmake-build-debug/demo
f: 1.000000; a: 1065353216
a: 2; f: 0.000000
a: 1065353216; f: 1.000000

Process finished with exit code 0
```

<span style="background-color: greenyellow">提示：由于int，没有浮点数的小数点位，所以成员a和f在看上去“不那么正常”</span>。如果你想看看浮点数是如何存储在一种特定的机器中但又对其他东西不感兴趣，联合就可能有所帮助。

# 变体记录(variant record)

从概念上说，类似于`联合`——内存中某个特定的区域在不同的时刻存储不同类型的值。但是，在现在这个情况下，这些值比简单的整型或浮点型更为复杂。它们的每一个都是一个完整的结构。

在一个成员长度不同的联合里，分配给联合的内存数量取决于它的最长成员的长度。这样，联合的长度总是足以容纳它最大的成员。如果这些成员的长度相差悬殊，当存储长度较短的成员时，浪费的空间是相当可观的。在这种情况下，更好的方法是在联合中存储指向不同成员的指针而不是直接存储成员本身。所有的指针长度都是相同的，这样就解决了内存浪费的问题。

# 在结构中，声明一个函数

```c
#include "stdio.h"

struct DEMO {
    int a;

    void (*testHello)(char *name);
};

void testHello(const char *name) {
    printf("%s", name);
}

int main() {
    struct DEMO demo, *p;
    p = &demo;
    p->testHello = (void (*)(char *)) testHello;
    p->testHello("Hello World");
}
```

