# C 和 C++ 基础 - 02

## 内存管理

C 的内存管理很简单，就是通过 malloc() 申请内存，然后再通过 free() 释放内存。C++ 的内存管理稍微复杂一些，C++ 内存获取主要是通过 new 关键字获得，虽然因为 C++ 支持 C 的特性，malloc() 和 free() 在 C++ 程序当中也可用，但是不符合 C++ 的规范要求。C++ 的规范要求获取内存需要通过 new 关键字，因为它会在创建对象的时候，执行对象的构造函数，释放内存需要通过 delete 关键字释放内存，因为它会调用析构函数。

### delete 析构函数

new 关键字的内容非常简单，这里不做讲解。先来讲讲 delete 关键字。

delete 关键字的重点在于释放普通内存（如对象、结构体、一块存储数据的内存）和数组是不一样的，释放普通内存只需要写 delete pointer 就行，释放数组需要加上“[]”。示例如下：

```C++
int main() {
    std::string s = new std::string("Hello World.");
    std::string *ss = new std::string[10];
    delete s;
    delete[] ss;
}
```

<font color="red">“delete[]”只是回收数组，如果数组当中存储了指针，“delete[]” 是不会回收指针的，需要程序员遍历这个数组，把数组中保存的指针一个一个回收掉。</font>

接下来讲解一些析构函数，首先创建一个类：

```C++
#include <iostream>

class Demo {
public:
    std::string *message;

    Demo() {
        this->message = new std::string("Hello World.");
    }

    ~Demo() {
        std::cout << __FUNCTION__ << " " << __LINE__ << ": " << "Hello World" << std::endl;
        delete this->message;
    }
};
```

析构函数在这两种情况下会被调用：

1. 使用 delete 释放对象所占用的内存时

```C++
void demo() {
    Demo *demo = new Demo;
    delete demo;
    std::cout << __FUNCTION__ << " " << __LINE__ << ": " << *demo->message << std::endl;
}
```

输出：

```txt
~Demo 13: Hello World
// 访问了已经被回收的内存，程序被强制杀死
```


2. 函数当前函数运行结束，回收函数的栈内存时

```c++
void demo() {
    Demo demo;
    std::cout << __FUNCTION__ << " " << __LINE__ << ": " << *demo.message << std::endl;
}
```

输出：

```txt
demo 20: Hello World.
~Demo 13: Hello World
```

### string 的内存管理规则

C++ string 的内存管理，其他没啥好讲的，主要就是两方面：

**const char * 转为 string**

C++ 在做这种转换时，会开辟新的内存，然后复制原本的字符串内容。

**string 转为 const char ***

string 主要通过 c_str() 函数转换为 const char *，但是这个函数的返回结果是 string 内部用于存储字符串的内存指针，并非拷贝一份副本的结果。最显而易见的特点就是使用 delete 释放 string 后，通过 c_str() 函数获取的指针同样无效了。

以下关于 string 的内存管理规则一些测试：

```C++
#include <iostream>
#include <cstring>

using namespace std;

/**
 * 测试函数结束后，通过 c_srt() 函数获得的字符串指针是否有效
 */
const char *demo01() {
    string str = "Hello World";
    cout << __FUNCTION__ << " " << __LINE__ << ": " << str.c_str() << endl;
    return str.c_str();
}

/**
 * 测试函数结束后，原来的字符串会不会和 string 一起被回收，也可以达到测试 const char * 转为 string 是直接使用指针 s，还是拷贝一份 s 指向的内存的副本。
 */
void demo02(const char *str) {
    string s(str);
    cout << __FUNCTION__ << " " << __LINE__ << ": " << s << endl;
}

void demo04(const char *o) {
    cout << __FUNCTION__ << " " << __LINE__ << ": " << o << endl;
}

int main() {
    cout << __FUNCTION__ << " " << __LINE__ << ": " << "demo01 return: " << demo01() << endl;

    const char *o = "Hello World.";
    char *ob = static_cast<char *>(malloc(strlen(o) + 1));
    strcpy(ob, o);
    cout << __FUNCTION__ << " " << __LINE__ << ": " << "ob: " << ob << endl;
    demo02(ob);
    cout << __FUNCTION__ << " " << __LINE__ << ": " << "ob: " << ob << endl;

    demo04(string(o).c_str());
    return 0;
}
```

输出：

```txt
main 28: demo01 return: demo01 11: Hello World
**************************
main 33: ob: Hello World.
demo02 20: Hello World.
main 35: ob: Hello World.
demo04 24: Hello World.
```

“*”表示无法显示的字节，代表对应的内存被回收了。

## const

const 用于修饰变量，让变量不可修改。这里重点讲述 const 修饰指针。

先声明一个类：

```c++
class Demo {
public:
    int code;
}
```

const 修饰指针指向的内存：

```c++
const Demo *demo = new Demo;
// 直接修改属性的值会导致编译错误
demo->code = 10;
// 指针本身可以直接修改
demo = new Demo;
```

const 修饰指针本身：

```c++
Demo *const demo = new Demo;
// 此时属性是可以直接修改的
demo->code = 100;
// 指针本身不可直接修改，这行代码编译出错
demo = new Demo;
```

<font style="background-color: yellow">const 上述的的两种方式限制指针不可修改，是可以通过中间指针进行修改的，代码如下。在实际的开发中，不要这样做。</font>

```c++
// 修改 const 修饰的内存
const Demo *demo = new Demo;
Demo *demo01 = (Demo *) demo;
demo01->code = 10;

// 修改 const 修饰的指针
Demo *const demo02 = new Demo;
Demo *demo03 = new Demo;
demo03->code = 3;
*((size_t *) &demo02) = (size_t) demo03;
std::cout << demo02->code << std::endl;
```

## 引用

引用的本质就是加了很多语言级别限制的指针，在汇编层面，引用和指针并无区别，在64位操作系统中，引用和指针都是64位的内存地址。

```c++
#include <iostream>

#define log_out(arg) std::cout << __LINE__ << ": " << arg << std::endl

void demo(int &q1) {
    q1 = 500;
}

int main() {
    int n1 = 100;
    // 相当于 int *q1 = (int *)&n;
    int &q1 = n1;
    // 相当于 std::cout << __LINE__ << ": " << *q1 << std::endl;
    log_out(q1);

    int n2 = 200;
    // const 对于引用的作用是禁止通过引用去修改原变量的值
    const int &q2 = n2;
    // 因为引用的本质就是在语言级别加了很多限制的指针，所以对原本变量进行修改，通过引用去到的值也是被修改后的。
    n2 = 300;
    log_out(q2);

    // 反过来操作，通过引用修改变量也是同一个道理
    q1 = 400;
    log_out(n1);

    // 对引用进行获取物理地址的操作获得结果是引用所指向的原内存的地址，不是引用自身占用的内存地址
    std::string result = &q1 == &n1 ? "true" : "false";
    log_out(result);

    // 引用作为函数参数时，作用也和指针差不多，可以说就是指针的一个语法糖
    demo(n1);
    log_out(n1);
    return 0;
}
```



## 异常处理

C++ 的异常处理需要注意两个点：

1. 异常尽量作为引用抛出，而不是作为指针抛出。这点并非强制性，C++ 的引用是一种加了很多语言层面限制和语法糖的指针，如果从汇编的层面看待，都是64位的内存地址。
2. 异常的传入参数需要从原内存拷贝一份副本。尤其是从 `std::string.c_str()` 获取的字符串，这个变量被回收了，那么上层函数无法获得具体信息

完整的自定义异常的声明如下：

```c++
#include <iostream>

class DemoException : public std::exception {
private:
    std::string *message;

public:
    explicit DemoException(const char *message) {
        this->message = new std::string(message);
    }

    explicit DemoException(std::string *message) {
        this->message = message;
    }

    explicit DemoException(std::string &message) {
        this->message = new std::string(message);
    }

    ~DemoException() override {
        delete this->message;
    }

    std::string *what() {
        return this->message;
    }
};
```

如果只是向上层函数传递说明具体的异常信息的字符串，不用做异常类型判断什么的，那么可以直接使用标准库的 `std::runtime_error("Hello Wolrd")`。

标准库当中比较常用的异常如下：

| 异常                  | 说明                                             |
| --------------------- | ------------------------------------------------ |
| std::logic_error      | 检查异常，理论上可以通过读取代码来检测到的异常。 |
| std::invalid_argument | 当使用了无效的参数时，会抛出该异常。             |
| std::runtime_error    | 理论上不可以通过读取代码来检测到的异常。         |

