# GDB

GDB 的常用命令，以及命令的组合使用

## 常用命令

```bash
$ gdb [program name]
# 查看帮助信息
help
# 在当前文件的指定行设置断点
breakpoints 20
# 在指定文件的指定行设置断点，可以只写一个文件名
breakpoints demo.cpp:20
# 删除指定行的所有断点
clear 20
# 设置程序的运行参数
set args [arg...]
# 运行程序
run [arg...]
# 运行程序，并且将程序的 stdin 重定向到文件
run < /dev/shm/demo.txt
# 查看当前运行所在位置的源代码
list
# 查看函数源码
list [function]
# 下一步，不进入调用的函数
next
# 下一步，进入调用的函数
step
# 继续运行当前函数，直到函数返回，打印函数的返回值
finish
# 跳过指定函数，主要是结合 step 使用，用来应付一行代码有多个函数调用的情况
skip function [function]
# 直接进入函数内部条调试
until [function]
# 格式化打印结构体
set print pretty on
# 查看变量类型
whatis [var]
ptype [var]
# 查看变量声明位置
info variables [var]
# 追踪变量，每执行一步都会打印变量
display [var]
# [number] 是当前正在追踪变量的序号，序号可以通过 info display 查看
undisplay [number]
```

## 导出字符串到文件

```bash
# ${var} 为字符串变量
set variable $name = [var]
# 或
set $name = [var]
# dump binary memory 表示以二进制模式复制内存，body.json 为内存导出文件，$s 和 $s + (size_t)strlen($s) 是导出的内存地址范围
dump binary memory body.json $name $name + (size_t)strlen($name)
```

<font color="red">注意 \$name 中的 “\$” 是 gdb 的临时变量语法</font>
