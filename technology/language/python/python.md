# Python

## 创建项目

通过 venv 虚拟环境创建项目：

```bash
# 创建项目文件夹，并创建venv前一个venv是python模块，后一个venv是虚拟环境的文件夹
$ mkdir demo && cd demo && python -m venv venv && source ./venv/bin/active
```

## 迭代器与生成器

迭代器有两个基本的方法：**iter()** 和 **next()**。

字符串，列表或元组对象都可用于创建迭代器：

```python
#!/usr/bin/python3
 
list=[1,2,3,4]
it = iter(list)    # 创建迭代器对象
for x in it:
    print (x, end=" ")
```

执行以上程序，输出结果如下：

```txt
1 2 3 4
```

也可以使用 next() 函数：

```python
#!/usr/bin/python3
 
import sys         # 引入 sys 模块
 
list=[1,2,3,4]
it = iter(list)    # 创建迭代器对象
 
while True:
    try:
        print (next(it))
    except StopIteration:
        sys.exit()
```

执行以上程序，输出结果如下：

```txt
1
2
3
4
```

**创建一个迭代器**

```python
class MyNumbers:
  def __iter__(self):
    self.a = 1
    return self
 
  def __next__(self):
    x = self.a
    self.a += 1
    return x
 
myclass = MyNumbers()
myiter = iter(myclass)
 
print(next(myiter))
print(next(myiter))
print(next(myiter))
print(next(myiter))
print(next(myiter))
```

```txt
1
2
3
4
5
```

**StopIteration**

StopIteration 异常用于标识迭代的完成，防止出现无限循环的情况，在 __next__() 方法中我们可以设置在完成指定循环次数后触发 StopIteration 异常来结束迭代。

```python
class MyNumbers:
  def __iter__(self):
    self.a = 1
    return self
 
  def __next__(self):
    if self.a <= 20:
      x = self.a
      self.a += 1
      return x
    else:
        # 终止迭代
      raise StopIteration
 
myclass = MyNumbers()
myiter = iter(myclass)
 
for x in myiter:
  print(x)
```

```txt
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
```

### 生成器

在 Python 中，使用了 `yield` 的函数被称为生成器（generator）。

<span style="background-color: yellow">跟普通函数不同的是，生成器是一个返回迭代器的函数，只能用于迭代操作，更简单点理解生成器就是一个迭代器。</span>

== 在调用生成器运行的过程中，每次遇到 yield 时函数会暂停并保存当前所有的运行信息，返回 yield 的值, 并在下一次执行 next() 方法时从当前位置继续运行。

调用一个生成器函数，返回的是一个迭代器对象。

以下实例使用 yield 实现斐波那契数列：

```python
#!/usr/bin/python3
 
import sys
 
def fibonacci(n): # 生成器函数 - 斐波那契
    a, b, counter = 0, 1, 0
    while True:
        if (counter > n): 
            return
        yield a
        a, b = b, a + b
        counter += 1
f = fibonacci(10) # f 是一个迭代器，由生成器返回生成
 
while True:
    try:
        print (next(f), end=" ")
    except StopIteration:
        sys.exit()
```

执行以上程序，输出结果如下：

```txt
0 1 1 2 3 5 8 13 21 34 55
```

## 枚举

1. 实例化 Enum 类

    ```python
    from enum import Enum, EnumMeta
    
    if __name__ == '__main__':
        # 创建 month 枚举
        month: EnumMeta = Enum(
            'Month',
            ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')
        )
        # 遍历枚举
        for name, member in month.__members__.items():
            print("name: ", name, "member: ", member, "value: ", member.value)
        pass
    
    ```

    输出结果：

    ```txt
    name:  Jan member:  Month.Jan value:  1
    name:  Feb member:  Month.Feb value:  2
    name:  Mar member:  Month.Mar value:  3
    name:  Apr member:  Month.Apr value:  4
    name:  May member:  Month.May value:  5
    name:  Jun member:  Month.Jun value:  6
    name:  Jul member:  Month.Jul value:  7
    name:  Aug member:  Month.Aug value:  8
    name:  Sep member:  Month.Sep value:  9
    name:  Oct member:  Month.Oct value:  10
    name:  Nov member:  Month.Nov value:  11
    name:  Dec member:  Month.Dec value:  12
    ```

    `value`属性是自动赋给成员的`int`常量，默认从`1`开始计数。

2. 如果需要更精确地控制枚举类型，可以从`Enum`派生出自定义类：

    ```python
    from enum import Enum, unique
    
    
    class DemoEnum(Enum):
        # 给定枚举的值
        Sun = 0
        Mon = 1
        Tue = 2
        Wed = 3
        Thu = 4
        Fri = 5
        Sat = 6
    
    
    if __name__ == '__main__':
        for name, member in DemoEnum.__members__.items():
            print("name: ", name, "member: ", member, "value: ", member.value)
        pass
    
    ```

    ```txt
    name:  Sun member:  DemoEnum.Sun value:  0
    name:  Mon member:  DemoEnum.Mon value:  1
    name:  Tue member:  DemoEnum.Tue value:  2
    name:  Wed member:  DemoEnum.Wed value:  3
    name:  Thu member:  DemoEnum.Thu value:  4
    name:  Fri member:  DemoEnum.Fri value:  5
    name:  Sat member:  DemoEnum.Sat value:  6
    ```


## 正则表达式

导入模块

```python
import re
```

### 匹配模式

| 模式                  | 说明                                                    |
| --------------------- | ------------------------------------------------------- |
| re.I（re.IGNORECASE） | 使匹配对大小写不敏感                                    |
| re.L（re.LOCALE）     | 做本地化识别（locale-aware）匹配                        |
| re.M（re.MULTILINE）  | 多行匹配，影响 ^ 和 $                                   |
| re.S（re.DOTALL）     | 使 . 匹配包括换行在内的所有字符                         |
| re.U（re.UNICODE）    | 根据Unicode字符集解析字符。这个标志影响 \w, \W, \b, \B. |
| re.X（re.VERBOSE）    | 忽略空格和注释                                          |
| re.A（re.ASCII）      | 假设“本地”ascii                                         |
| re.T（re.TEMPLATE）   | 禁用回溯                                                |
| re.DEBUG              | 编译后的转储模式                                        |

### re 模块函数

| 函数       | 函数原型                                         | 说明                                                         |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------ |
| re.search  | re.search(pattern, string, flags=0)              | 扫描整个字符串并返回第一个成功的匹配。                       |
| re.match   | re.match(pattern, string, flags=0)               | 从字符串的开始位置进行匹配                                   |
| re.sub     | re.sub(pattern, repl, string, count=0, flags=0)  | 替换字符串                                                   |
| re.compile | re.compile(pattern[, flags])                     | compile 函数用于编译正则表达式，生成一个正则表达式（ Pattern ）对象，供 match() 和 search() 这两个函数使用。预先进行编译，可以显著提升在大量数据的匹配时的性能。 |
| re.findall | findall(string[, pos[, endpos]])                 | 在字符串中找到正则表达式所匹配的所有子串，并返回一个列表，如果没有找到匹配的，则返回空列表。 |
| re.split   | re.split(pattern, string[, maxsplit=0, flags=0]) | split 方法按照能够匹配的子串将字符串分割后返回列表，它的使用形式如下： |

### search 和 match 的区别

search的匹配是全文匹配，而match的匹配是从文本起始位置开始的匹配，详见代码：

```python
import re

if __name__ == '__main__':
    text = "本人是宇宙无敌第一帅"
    regex_compile = re.compile(r"帅", re.VERBOSE)

    if regex_compile.search(string=text) is not None:
        print("search: 正则表达式匹配成功")
    else:
        print("search: 正则表达式匹配失败")

    if regex_compile.match(string=text) is not None:
        print("match: 正则表达式匹配成功")
    else:
        print("match: 正则表达式匹配失败")
    pass

```

程序运行结果：

```bash
search: 正则表达式匹配成功
match: 正则表达式匹配失败
```

## 单元测试

### unittest

python 自带 unittest 模块可以用于做单元测试。<font color="green">使用时，继承 unitest.TestCase，并且函数名称以 test_ 开头</font>，如下所示：

```python
from unittest import TestCase


class UnitTestDemo(TestCase):
    # noinspection PyMethodMayBeStatic
    def test_demo01(self):
        print("test demo01")
        pass

    # noinspection PyMethodMayBeStatic
    def test_demo02(self):
        print("test demo02\n")
        pass

    pass

```

运行单元测试：

```bash
$ python -m unittest UnitTestDemo.UnitTestDemo.test_demo02
test demo02

.
----------------------------------------------------------------------
Ran 1 test in 0.000s

OK
```

### 断言

#### assertEqual

对比两个传入参数是否相等，如果不相等，抛出 `AssertionError` 异常。

例：

```python
from unittest import TestCase


class UnitTestDemo(TestCase):
    # noinspection PyMethodMayBeStatic
    def test_demo01(self):
        demo = 'Hello World'
        self.assertEqual(demo, 'Hello World wo cao')
        pass

    pass

```

运行结果：

```txt
F
======================================================================
FAIL: test_demo01 (UnitTestDemo.UnitTestDemo)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/home/aszswaz/project/data-tools/bilibili-comment/UnitTestDemo.py", line 8, in test_demo01
    self.assertEqual(demo, 'Hello World wo cao')
AssertionError: 'Hello World' != 'Hello World wo cao'
- Hello World
+ Hello World wo cao
?            +++++++


----------------------------------------------------------------------
Ran 1 test in 0.000s

FAILED (failures=1)
```
