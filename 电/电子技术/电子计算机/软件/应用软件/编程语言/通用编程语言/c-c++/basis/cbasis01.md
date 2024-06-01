# C 和 C++ 基础 - 01

## 数组

### 数组的声明和遍历

```c++
#include "iostream"

int main() {
    int ints[4] = {0, 1, 2, 3};
    for (int i = 0; i < 4; ++i) {
        std::cout << "index: " << i << ", value: " << ints[i] << std::endl;
    }
    return EXIT_SUCCESS;
}
```

输出：

```c++
/home/aszswaz/CLionProjects/untitled/cmake-build-debug/untitled
index: 0, value: 0
index: 1, value: 1
index: 2, value: 2
index: 3, value: 3

Process finished with exit code 0
```

### 数组下标越界

数组的下标越界，指针就会指向不属于数组的内存区域，主要会导致的后果有2个：

#### 下标越界，但是指向的内存仍在当前进程所属的内存范围之内：

```c++
#include "iostream"

int main() {
    int ints[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    for (int i = 0; i < 11; ++i) {
        std::cout << "index: " << i << ", value: " << ints[i] << std::endl;
    }
    return EXIT_SUCCESS;
}
```

输出：

```c++
/home/aszswaz/CLionProjects/untitled/cmake-build-debug/untitled
index: 0, value: 0
index: 1, value: 1
index: 2, value: 2
index: 3, value: 3
index: 4, value: 4
index: 5, value: 5
index: 6, value: 6
index: 7, value: 7
index: 8, value: 8
index: 9, value: 9
index: 10, value: 330756352

Process finished with exit code 0
```

如上所示，指针会访问与数组相邻的内存，得到了一个很奇怪的值。这块内存可能是存储了当前进程的某一块指令，或者是存储某一个变量。

可以通过指针对不属于数组的内存进行修改，但是会破坏程序的其他部分

```c++
#include "iostream"

int main() {
    int ints[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    ints[10] = 101;
    for (int i = 0; i < 11; ++i) {
        std::cout << "index: " << i << ", value: " << ints[i] << std::endl;
    }
    return EXIT_SUCCESS;
}
```

```bash
/home/aszswaz/CLionProjects/untitled/cmake-build-debug/untitled
*** stack smashing detected ***: terminated # 翻译： 检测到堆栈粉碎：已终止
index: 0, value: 0
index: 1, value: 1
index: 2, value: 2
index: 3, value: 3
index: 4, value: 4
index: 5, value: 5
index: 6, value: 6
index: 7, value: 7
index: 8, value: 8
index: 9, value: 9
index: 10, value: 101

Process finished with exit code 134 (interrupted by signal 6: SIGABRT) # 返回非0状态码
```

可以看到虽然遍历正常运行，但是程序并没有正常退出

#### 下标越界，指针指向的内存超过程序所属内存

指针指向的内存不属于进程所属的内存，操作系统内核的内存保护机制，会强制杀死进程

```c++
#include "iostream"

int main() {
    int ints[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    for (int i = 0; i < 11; ++i) {
        std::cout << "index: " << i << ", value: " << ints[i] << std::endl;
    }
    std::cout << ints[1000000] << std::endl;
    std::cout << "我没被杀死" << std::endl;
    return EXIT_SUCCESS;
}
```

```c++
/home/aszswaz/CLionProjects/untitled/cmake-build-debug/untitled
index: 0, value: 0
index: 1, value: 1
index: 2, value: 2
index: 3, value: 3
index: 4, value: 4
index: 5, value: 5
index: 6, value: 6
index: 7, value: 7
index: 8, value: 8
index: 9, value: 9
index: 10, value: -747008512

Process finished with exit code 139 (interrupted by signal 11: SIGSEGV)
```

很显然，“我没被杀死”这句话还没输出就被杀死了

### 当数组作为函数的参数时，有两种声明形式：

第一种，在变量名前，添加"*"表示数组

```c++
#include "iostream"

void demo(char *array);

int main() {
    char array[10] = "abcdefg";
    demo(array);
    return EXIT_SUCCESS;
}

void demo(char *array) {
    for (int i = 0; i < 10; ++i) {
        std::cout << array[i] << std::endl;
    }
}
```

注意“*”虽然在c++的其他地方，表示获取内存地址所对应的值，但是在函数的参数当中，似乎只能用于表示数组指针，给函数传入非数组的值会出现编译错误

```c++
#include "iostream"

void demo(char *array);

int main() {
    char c = 'a';
    demo(c);
    return EXIT_SUCCESS;
}

void demo(char *array) {
    for (int i = 0; i < 10; ++i) {
        std::cout << array[i] << std::endl;
    }
}
```

错误信息：

```bash
====================[ 构建 | untitled | Debug ]===================================
/opt/clion/bin/cmake/linux/bin/cmake --build /home/aszswaz/CLionProjects/untitled/cmake-build-debug --target untitled -- -j 3
Scanning dependencies of target untitled
[ 50%] Building CXX object CMakeFiles/untitled.dir/main.cpp.o
/home/aszswaz/CLionProjects/untitled/main.cpp: 在函数‘int main()’中:
/home/aszswaz/CLionProjects/untitled/main.cpp:7:10: 错误：invalid conversion from ‘char’ to ‘char*’ [-fpermissive]
    7 |     demo(c);
      |          ^
      |          |
      |          char
/home/aszswaz/CLionProjects/untitled/main.cpp:3:17: 附注：  初始化‘void demo(char*)’的实参 1
    3 | void demo(char *array);
      |           ~~~~~~^~~~~
make[3]: *** [CMakeFiles/untitled.dir/build.make:83：CMakeFiles/untitled.dir/main.cpp.o] 错误 1
make[2]: *** [CMakeFiles/Makefile2:96：CMakeFiles/untitled.dir/all] 错误 2
make[1]: *** [CMakeFiles/Makefile2:103：CMakeFiles/untitled.dir/rule] 错误 2
make: *** [Makefile:138：untitled] 错误 2
```

第二种方式，和正常的数组声明一样

```c++
#include "iostream"

#define MAX_SIZE 10

void demo(char array[]);

int main() {
    char array[MAX_SIZE] = "abcdefg";
    demo(array);
    return EXIT_SUCCESS;
}

void demo(char array[]) {
    for (int i = 0; i < MAX_SIZE; ++i) {
        std::cout << array[i] << std::endl;
    }
}
```

第三种方式，定义函数中数组参数的大小

```c++
#include "iostream"

#define MAX_SIZE 10

void demo(char array[MAX_SIZE]);

int main() {
    char array[MAX_SIZE] = "abcdefg";
    demo(array);
    return EXIT_SUCCESS;
}

void demo(char array[MAX_SIZE]) {
    for (int i = 0; i < MAX_SIZE; ++i) {
        std::cout << array[i] << std::endl;
    }
}
```

<span style='background-color: yellow'>在上诉的三种函数的参数，声明为数组的方式，实际上第二种方式和第三种方式，与第一种方式，最终都是一致的，编译器会将其转换为指针类型的参数，传入函数。不过这点不适用于结构。</span>

## 预处理指令（prerocessor directives）

```c
#include <stdic.h>
#define MAX_COLS 20
```

这两行称为预处理指令，也叫宏，他们是由**预处理器**解释的。预处理器读入源代码，根据源代码指令对其进行修改，然后把修改过的源代码交给编译器。

### define

define作用主要是进行替换。可替换的内容有两种：变量和代码块。

宏替换的过程叫做宏展开，gcc和gdb输出宏展开的指令如下：

gcc:

```bash
$ gcc -E demo.c -o demo.h
```

gdb:

```bash
(gdb) macro expan DEMO
```

替换变量到指定位置：

```c
#include "stdio.h"
#define DEMO_INT 110
#define DEMO_STRING "Hello World"

int main(void) {
    fprint(stdout, "DEMO_INT: %d\n", DEMO_INT);
    fprint(stdout, "DEMO_STRING: %s\n", DEMO_STRING);
    return 0;
}
```

宏展开之后是这样的：

```c
#include "stdio.h"

int main(void) {
    fprint(stdout, "DEMO_INT: %d\n", 110);
    fprint(stdout, "DEMO_STRING: %s\n", "Hello World");
    return 0;
}
```

替换代码块，以ffmpeg中的一段代码为例子：

```c
#define MATCH_PER_TYPE_OPT(name, type, outvar, fmtctx, mediatype)\
{\
    int i;\
    for (i = 0; i < o->nb_ ## name; i++) {\
        char *spec = o->name[i].specifier;\
        if (!strcmp(spec, mediatype))\
            outvar = o->name[i].u.type;\
    }\
}
```

宏调用处：

```c
MATCH_PER_TYPE_OPT(codec_names, str, audio_codec_name, ic, "a");
```

展开后：

```c
{
    int i;
    for (i = 0; i < o->nb_codec_names; i++) {
        char *spec = o->codec_names[i].specifier;
        if (!strcmp(spec, "a")) audio_codec_name = o->codec_names[i].u.str;
    }
}
```

### 宏的不固定参数

宏的不固定参数主要配合参数不固定的函数使用，示例如下：

```c
#include <stdio.h>

#define demo(...) fprintf(stdout, __VA_ARGS__)

int main(void) {
    demo("value01: %s\n", "demo");
    return 0;
}
```

...表示参数列表不固定，\_\_VA\_ARGS\_\_表示使用不固定参数列表的位置，宏展开后，如下所示：

```c
fprintf(stdout, "value01: %s\n", "demo");
```

<font color="red">宏的不固定参数列表和函数的不固定参数列表不一样，宏的不固定参数列表不能一个参数都没有，以下面的代码为例，这是不允许的，编译不会通过。</font>

```c
#include <stdio.h>

#define demo(format, ...) fprintf(stdout, format, __VA_ARGS__)

int main(void) {
    demo("value01: \n");
    return 0;
}
```

## 函数原型(function prototype)

```c
int demo(int arrays[], int max);
```

函数原型告诉编译器这些以后将在源文件中定义的函数的特征。这样，当这些函数被调用时，编译器就能对他们进行准确性检查。

## 指针(pointer)

指针指定一个存储于计算机内存中的值的地址。

<span style="color: red">指针变量的占用内存大小，取决于硬件（或者操作系统）的寻址能力，16位的操作系统中指针是2个字节，32位是4个字节，64位是8个字节</span>

## 过程（procedure）

无返回值的函数被称为过程

## 使用多个文件编写代码

多文件写代码主要使用两种形式:

使用头文件声明函数原型, 再以另外的文件编写函数真正的实现

```c
#include <stdio.h>
#include "demo.h"
#include "config.c"

static int b;

int main() {
    demo();
    printf("main: %d\n", b);
    printf("main: %d\n", config);
    return 0;
}
```

头文件

```c
#ifndef DEMO_DEMO_H
#define DEMO_DEMO_H

#endif //DEMO_DEMO_H

static const int demo = 100;// 头文件中也可以声明变量

void demo();
```

函数实现文件

```c
#include "stdio.h"

static int b = 10;

void demo() {
    printf("demo: %d\n", b);
}
```

直接使用 source 文件,但是不能编写函数, 只能声明一些变量, 可以用作程序常量配置

```c
static const int config = 100;
```

## 连接属性

连接属性一共有三种: `external`(外部), `internal`(内部) 和 `none`(无)

没有连接属性的标识符(none)总是被当作单独的个体, 也就是说该标识符的多个声明被当作独立不同的实体.

属于internal连接的属性的标识符在同一个源文件内的所有声明中都指同一个实体, 但位于不同文件中的多个声明则分属不同的实体.

属于external连接属性的标识符, 不论被声明多少次, 位于几个源文件都表示同一个实体.

<span style="background-color: yellow">关键字: extern, static用于在声明中修改标识符的连接属性, 如果某个声明在正常情况下具有`external`属性, 在前面加上`static`关键字可以使它的连接属性变为'internal'.</span>

例: 创建三个文件: main.c,, demo.h, demo.c

```c
#include <stdio.h>
#include "demo.h"

int b;

int main() {
    demo();
    printf("main: %d\n", b);
    return 0;
}
```

```c
#ifndef DEMO_DEMO_H
#define DEMO_DEMO_H

#endif //DEMO_DEMO_H

void demo();
```

```c
#include "stdio.h"

int b = 10;

void demo() {
    printf("demo: %d\n", b);
}
```

这时, 代码中的两处`int b`的连接属性都是外部连接(external), 在编译会出现冲突:

```bash
$ gcc main.c demo.c demo.h -o demo
/usr/bin/ld: /tmp/ccPzT7B5.o:(.data+0x0): multiple definition of `b'; /tmp/ccCo2dRZ.o:(.bss+0x0): first defined here
collect2: 错误：ld 返回 1
```

须得使用`static`关键字将两个变量改为各自的文件私有

```c
static int b = 0;
```

修改后, 如下:

main.c

```c
#include <stdio.h>
#include "demo.h"

static int b;

int main() {
    demo();
    printf("main: %d\n", b);
    return 0;
}
```

dmoe.c

```c
#include "stdio.h"

static int b = 100;

void demo() {
    printf("demo: %d\n", b);
}
```

```bash
$ gcc main.c demo.c demo.h -o demo

$ demo
demo: 100
main: 0
```

<span style="background-color: yellow">函数`demo()`在本题中也具有'external'属性, 同样也可以使用`static`修改为'intenal'</span>

<span style="color: red">对于在代码块内部声明的变量，如果给它加上关键字static，可以使它的存储类型从自动变为静态。具有静态存储类型的变量在整个程序的执行过程中一直存在，而不仅仅在声明它的代码块的执行时存在。<span style="background-color: yellow">注意：修改变量的存储类型并不表示修改该变量的作用域，它仍然只能在该代码块内部按名字访问</span></span>

<span style="color: green">最后：关键字`register`可以用于自动变量的声明，提示它们该存储于机器的硬件寄存器，而不是内存中，这类变量称为寄存器变量，如果一个编译器自己具有一套寄存器优化方法，它也可能忽略`register`</span>

## 初始化

除非对自动变量进行显式的初始化，否则当自动变量创建时，它们的值总是垃圾（对于 C 是这样的，C++ 则是会根据变量的类型进行初始化）

```c
#include <stdio.h>

void demo();

int main() {
    int i;
    printf("main: %d\n", i);
    demo();
    return 0;
}

void demo() {
    int demo;
    printf("demo: %d\n", demo);
}
```

```bash
main: 0
demo: 32550 # demo每次运行的值都不一样
```

## static关键字

当用于不同上下文环境时，static关键字具有不同的意思

<span style="background-color: greenyellow">当它用于函数定义时，或用于代码块之外的变量声明时，static关键字用于修改表标识符的连接属性，从`external`改为`internal`，但标识符的存储类型和作用于不受影响。用这种方式声明的函数或变量只能在声明它们的源文件中访问。</span>

<span style="background-color: greenyellow">当它用于代码块内部的变量声明时，static关键字用于修改变量的存储类型，从自动变量修改为静态变量，但变量的连接属性和作用域不受影响。用这种方式声明的变量在程序执行之前创建，并在程序的整个执行期间一直存在，而不是每次在代码块开始执行时创建，在代码块执行完毕之后销毁。</span>

## 间接访问操作符

通过一个指针访问它所指向的地址的工程称为间接访问或解引用指针。操作符是单目操作符“*”

## 对特定的内存地址进行访问

假设变量a的内存地址是100，通过内存地址对a进行赋值，表达式如下：

```c
*(int *)100 = 25;
```

<span style="color: green">强制类型转换把100从“整型”转换为“指向整型的指针”，这样对它进行间接访问就是合法的。<span style="color: red">但是，需要使用这种技巧的机会绝无仅有的</span>，通常无法预测编译器会把某个特定的变量放在内存中的什么位置，所以无法预先知道它的地址。这个技巧的唯一有用之处是你偶尔需要通过地址访问内存中的某个特定位置，它并不是用于访问某个变量，而是访问硬件本身。例如，操作系统需要与输入输出设备控制器通信，启动I/O操作并从前面的操作中获得结果。这些位置必须通过它们的地址来访问，此时这些地址是预先已知的。</span>

## 存储类型

变量的存储类型(storage class)是指存储变量值的内存类型.

有三个地方可以用于存储变量: 普通内存, 运行时堆栈, 硬件寄存器

## 基本数据类型

在C语言中，仅有4中基本数据类型——**整型、浮点型、指针和聚合类型**（如数组和结构等）。所有其他的类型都是从这4种数据类型的某种组合派生而来。

## 整型

整型包括：字符、短整型、整型和长整型，它们都分为**有符号（singed）**和**无符号（unsigned）**两种

<span style="background-color: yellow">长整型至少应该和整型一样长，而整型至少和短整型一样长</span>

<span style="color: red">标准并没有规定长整型必须比短整型长，只是规定它不得比短整型短。ANSI标准加入了一个范围，说明了各种整型值的最小允许范围。 </span>

<span style="color: red">`short int`至少16位，`long int`至少32位。至于缺省的int究竟是16位还是32位，或者是其他值，则由编译器的设计者决定。通常这个选择是这种机器最为自然（高效）的位数</span>

## 字符串字面常量

当一个字符串常量出现于一个表达式中时，表达式所使用的值就是这些字符所存储的地址，而不是这些字符本身。因此，你可以把字符串常量赋值给一个“指向字符的指针”，后者指向这些字符所存储的地址。但是，你不能把字符串常量赋值给一个字符数组，因为字符串常量的直接是一个指针，而不是这些字符本身。

## 函数的不定长参数

```c
#include <stdio.h>
#include <stdarg.h>

void demo(int n, const char *message, ...) {
    // 参数列表
    va_list args;

    // 初始化参数列表，以message（也就是固定参数的最后一个参数）的内存地址为准，获取栈内存中的参数列表
    va_start(args, message);
    fprintf(stdout, "fp_offset: %u\n", args->fp_offset);
    fprintf(stdout, "gp_offset: %u\n", args->gp_offset);

    // 输出参数
    for (int i = 0; i < n, i++) {
        char *arg = va_arg(args, char *);
        fprintf(stdout, "%s\n", arg);
    }

    // 回收参数列表占用的内存
    va_end(args);
}

int main(void) {
    demo("value01: %s", "demo", "demo01", "demo02", "demo0304", "我操操操");
    return 0;
}
```

```bash
demo
demo01
demo02
demo0304
我操操操
```

<font color="red">由于没有办法获取参数列表到底有多少参数，所以需要 n 来指定参数列表有多少个参数</font>

<font color="red">va_start、va_arg和va_end不能应用于固定参数的函数中，否则会出现编译错误。如下所示</font>

```c
void demo(const char *message) {
    // 参数列表
    va_list args;
    // 初始化参数列表
    va_start(args, message);
    va_end(args);
}
```

gcc编译错误：

```txt
Scanning dependencies of target demo
[ 50%] Building C object CMakeFiles/demo.dir/main.c.o
In file included from /home/aszswaz/project/CLionProjects/demo/main.c:2:
/home/aszswaz/project/CLionProjects/demo/main.c: 在函数‘demo’中:
/home/aszswaz/project/CLionProjects/demo/main.c:8:5: 错误：‘va_start’ used in function with fixed arguments
    8 |     va_start(args, message);
      |     ^~~~~~~~
make[3]: *** [CMakeFiles/demo.dir/build.make:72：CMakeFiles/demo.dir/main.c.o] 错误 1
make[2]: *** [CMakeFiles/Makefile2:83：CMakeFiles/demo.dir/all] 错误 2
make[1]: *** [CMakeFiles/Makefile2:90：CMakeFiles/demo.dir/rule] 错误 2
make: *** [Makefile:124：demo] 错误 2
```

## GOTO

goto 用途就是挑战到 label 所在的地方：

```c++
#include <iostream>

/**
 * 循环输出10次“hello world”
 * @return
 */
int main() {
    int index = 0;
    label:
    if (index < 10) {
        std::cout << "Hello, World!" << std::endl;
        index++;
        goto label;
    }
    return 0;
}
```

goto除了跳向标签名称之外，还可以跳向标签的指针：

```c
#include <stdio.h>

void *test() {
	__label__ test;
	void *p = &&test;
test:
	printf("Hello Test\n");
	return p;
}
 
void main() {
	void *p = test();
	goto *p;
	printf("Hello Main\n");
}
```

```bash
$ gcc goto.c -o goto && ./goto
Hello Test
Hello Test
```

<font color="red">GOTO指令虽然非常的自由，程序可以利用这种自由去做很多的操作，但是滥用它也会导致代码的可读性下降。</font>

## 文件 IO 流

IO 流分为文件 IO 和网络 IO，这里主要讲文件 IO。

### 写文件

```c
#include "stdio.h"

int main(void) {
    // 创建文件句柄
    FILE *demoFile;
    demoFile = fopen("demo.txt", "w");
    const char demoStr[] = "这是一段测试文本";
    int length = sizeof(demoStr) - 1;
    // 向文件输出字节，demoStr 是要输出的内存块，1 是代表需要输出 N 次，length 是单次输出的流的大小，demoFile 是文件句柄
    int writeLength = fwrite(demoStr, 1, length, demoFile);
    // 如果内存多大，可以按照如下方式，分多次输出字节到文件流
    // int writeLength = fwrite(demoStr, 2, length / 2, demoFile);
    if (writeLength != length) {
        fprintf(stderr, "文件写出失败\n");
    }
    fclose(demoFile);
    return 0;
}
```

```bash
$ gcc main.c -o main
$ ./main
```

### 读取文件

```c
#include "stdio.h"
#include "sys/stat.h"
#include "stdlib.h"

#define FILE_NAME "demo.txt"

int main(void) {
    // 获取文件信息，仅限 Linux 系统，windows的API应该不是这个
    struct stat fileInfo;
    stat(FILE_NAME, &fileInfo);
    int size = fileInfo.st_size;
    fprintf(stdout, "文件大小：%d\n", size);

    // 创建文件句柄
    FILE *demoFile;
    demoFile = fopen(FILE_NAME, "r");
    char *buff = malloc(BUFSIZ);
    int len = 0;
    do {
        // 到达文件末尾时，只有调用 fread 后，句柄才会变为 EOF 状态
        len += fread(buff, 1, BUFSIZ, demoFile);
    } while (!feof(demoFile));
    fprintf(stdout, "读取文件长度：%d\n", len);

    fclose(demoFile);
    return 0;
}
```

### 文件打开模式

| 模式 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| r    | 只读模式打开文件，文件必须已存在                             |
| w    | 只写模式打开文件，如果文件不存在，创建新的文件，如果文件已存在则丢弃原本的内容，并将该文件视为新文件 |
| a    | 只追加模式打开文件，写出的数据总是被写在文件的末尾，<font color="red">注意：fseek、fsetpos、rewind 这些流的指针操作函数，在该模式下无效</font> |
| r+   | 读/写模式打开文件，文件必须已存在                            |
| w+   | 读/写模式打开文件，如果文件不存在，创建新的文件，如果文件已存在则丢弃原本的内容，并将该文件视为新文件 |
| a+   | 读/追加模式打开文件，可以通过fseek、fsetpos、rewind函数操作流的指针，调整追加的位置 |

