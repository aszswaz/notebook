# 注意事项

## C/C++ 中的核心转储（分段错误）：segmentation fault (core dumped)

segmentation fault (core dumped) 错误是由于访问不属于应用程序的内存，而导致的一种特定类型的错误。

*   当一段代码试图在内存的只读位置或不属于应用程序的内存进行读写操作时，它被称为核心转储。
*   这是一个指示内存损坏的错误

**常见的分段故障场景：**

例1：下面的程序会崩溃（给出分段错误），因为 \*(str+1) = 'n' 行试图写入只读内存。 

```c
int main() {
   char *str;
 
   /* Stored in read only part of data segment */
   str = "GfG";    
 
   /* Problem:  trying to modify read only memory */
   *(str + 1) = 'n';
   return 0;
}
```

例2：下面的程序会崩溃（给出分段错误），因为函数demoFunc试图访问不属于程序的内存。 

```c
#include "stdio.h"

void demoFunc(int *demo);

int main(void) {
    fprintf(stdout, "Starting program...\n");

    int demo = 404;

    fprintf(stdout, "example 1\n");
    demoFunc(&demo);
    fprintf(stdout, "example 1 success.\n");

    fprintf(stdout, "example 2\n");
    demoFunc(demo);
    fprintf(stdout, "example 2 success.\n");

    fprintf(stdout, "The program runs successfully.\n");
    return 0;
}

void demoFunc(int *demo) {
    fprintf(stdout, "demo value is %d\n", *demo);
}
```

运行程序：

```bash
$ gcc demo.c -o demo
$ ./demo
```

```txt
Starting program...
example 1
demo value is 404
example 1 success.
example 2
[1]    9314 segmentation fault (core dumped)  ./demo
```

例3：

程序访问不属于程序的内存

```c
#include "stdio.h"

int main(void) {
    fprintf(stdout, "Starting program...\n");

    int *demo;
    // 给指针随便指定一块内存逻辑地址
    demo = 0x55f97c4d86b0;
    // 这里程序访问不属于程序的内存，发生核心转储异常，程序崩溃退出
    fprintf(stdout, "%d\n", *demo);

    fprintf(stdout, "The program runs successfully.\n");
    return 0;
}
```

运行程序：

```bash
$ gcc demo.c -o demo
$ ./demo
```

```txt
Starting program...
[1]    15708 segmentation fault (core dumped)  ./demo
```

## 刚刚申请的内存一定要初始化

刚刚申请得到的内存，一定要进行初始化，否则，就会存在如下漏洞：

```c
#include "stdio.h"
#include "stdlib.h"

int main(void) {
    fprintf(stdout, "Starting program...\n");

    int *demo = malloc(4);
    fprintf(stdout, "%d: point is %p\n", __LINE__, demo);
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);
    // 给内存赋值
    *demo = 200;
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);

    // 释放内存
    free(demo);
    fprintf(stdout, "%d: point is %p\n", __LINE__, demo);
    // 释放内存后访问内存，这里打印一个未知的值，不是0，也不是200
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);
    // 尝试写入该内存，不会引发程序漰溃
    *demo = 200;
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);

    // 再次申请同样大小的内存，这次申请的内存，逻辑内存地址和上一次申请的内存逻辑地址是一样的，因为上一次申请的内存已经被释放，本次申请复用了这块内存
    demo = malloc(4);
    fprintf(stdout, "%d: point is %p\n", __LINE__, demo);
    // 这快内存的值，很明显的受到了第一次释放内存后，对该内存的写入操作的影响，这是一种程序漏洞，可能被黑客利用
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);

    fprintf(stdout, "The program runs successfully.\n");
    return 0;
}
```

内存的初始化，可以使用 string.h 的 memset 函数，该函数用于给内存的每一个字节填充指定内容，使用效果如下：

```c
#include "stdio.h"
#include "stdlib.h"
#include "string.h"

int main(void) {
    fprintf(stdout, "Starting program...\n");

    int *demo = malloc(4);
    fprintf(stdout, "%d: point is %p\n", __LINE__, demo);
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);
    // 给内存赋值
    *demo = 200;
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);

    // 释放内存
    free(demo);
    fprintf(stdout, "%d: point is %p\n", __LINE__, demo);
    // 释放内存后访问内存，这里打印一个未知的值，不是0，也不是200
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);
    // 尝试写入该内存，不会引发程序漰溃
    *demo = 200;
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);

    // 再次申请同样大小的内存，这次申请的内存，逻辑内存地址和上一次申请的内存逻辑地址是一样的，因为上一次申请的内存已经被释放，本次申请复用了这块内存
    demo = malloc(4);
    fprintf(stdout, "%d: point is %p\n", __LINE__, demo);
    // 这快内存的值，很明显的受到了第一次释放内存后，对该内存的写入操作的影响，这是一种程序漏洞，可能被黑客利用
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);

    // 初始化内存，向内存的每一个字节填充 0
    memset(demo, 0, 4);
    fprintf(stdout, "%d: code is %d\n", __LINE__, *demo);

    fprintf(stdout, "The program runs successfully.\n");
    return 0;
}
```

## linux系统下，stdout的缓冲模式

linux的stdout缓冲模式默认是行缓冲，具体现象，请看如下代码：

```c
#include "stdio.h"
#include "stdlib.h"

int main(void) {
    fprintf(stdout, "Hello C!");
    system("echo 'Hello echo'");
    // 输出 \n stdout 才会输出
    fprintf(stdout, "\n");
    return 0;
}
```

执行结果：

```txt
Hello echo
Hello C!
```

看上去 system() 函数的执行顺序优先于 fprintf() 函数，实际并不是，除了输出 \n 外，应用程序退出，也会刷新 stdout 的缓冲区，所以 echo 退出就打印了 `Hello echo`，可以使用 `setvbuf()` 修改stdout的缓冲模式。代码如下：

```c
#include "stdio.h"
#include "stdlib.h"

int main(void) {
    // 行缓冲
    // setvbuf(stdout, NULL, _IOLBF, 0);
    // 也是使用行缓冲
    // setlinebuf(stdout);
    // 无缓冲
    setvbuf(stdout, NULL, _IONBF, 0);

    fprintf(stdout, "Hello C!");
    system("echo 'Hello echo'");
    // 输出 \n stdout 才会输出
    fprintf(stdout, "\n");
    return 0;
}
```

运行结果：

```txt
Hello C!Hello echo


```

## 指针与数组

### 得到一个指向数组的某一块内存的指针

首先创建main.c，写入以下代码

```c
#include <stdio.h>

#define LENGTH 10

int main() {
    char buff[LENGTH];
    // 给数组赋值
    for (int i = 0; i < LENGTH; ++i) {
        buff[i] = (char) i;
    }
    return 0;
}
```

**假设需要获取数组第五个元素，但是只能通过指针操作，不能直接使用数组索引。**

错误的代码示例：

```c
#include <stdio.h>

#define LENGTH 10

int main() {
    char buff[LENGTH];
    // 给数组赋值
    for (int i = 0; i < LENGTH; ++i) {
        buff[i] = (char) i;
    }

    fprintf(stdout, "The 5th value is %d.\n", *(&buff + 5));
    return 0;
}
```

运行结果：`The 5th value is 2022573264.`

删除代码的`*(&buff + 5)`指针是`char buff[LENGTH]`没有经过任何的强制转换，这时候使用“+”做指针运算，得到的结果<font color="red">不是在原本的逻辑内存地址上加5个1</font>，具体结果请看下面的实验代码：

```c
fprintf(stdout, "Memory address opening interval: %p\n", &buff);
fprintf(stdout, "Memory address closed interval: %p\n", &buff + 5);
```

得到输出：

```txt
Memory address opening interval: 0x7ffcbd0f565e
Memory address closed interval: 0x7ffcbd0f5690
```

运算逻辑内存地址：

0x7ffcbd0f5690 - 0x7ffcbd0f565e
= 0x90 - 0x5e
= 144 - 94
= 50

很明显，指针按照数组的大小对指针进行了偏移：0x7ffcbd0f565e + (10 $\times$ 5) = 0x7ffcbd0f5690​​

<font color="green">正确代码如下：</font>

```c
#include <stdio.h>

#define LENGTH 10

int main() {
    char buff[LENGTH];
    // 给数组赋值
    for (int i = 0; i < LENGTH; ++i) {
        buff[i] = (char) i;
    }

    char *p = (char *) &buff;
    p += 5;
    fprintf(stdout, "The 5th value is %d\n", *p);
    // 简写
    fprintf(stdout, "The 5th value is %d\n", *(((char *) &buff) + 5));
    return 0;
}
```

结果如下：

```txt
The 5th value is 5
The 5th value is 5
```

