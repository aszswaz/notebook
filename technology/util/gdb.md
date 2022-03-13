# GDB

GDB 的常用命令，以及命令的组合使用

## 常用命令

```gdb
# 查看帮助信息
(gdb) help
# 在当前文件的指定行设置断点
(gdb) breakpoints 20
# 在指定文件的指定行设置断点，可以只写一个文件名
(gdb) breakpoints demo.cpp:20
# 运行程序
(gdb) run
# 查看当前运行所在位置的源代码
(gdb) list
# 查看函数源码
(gdb) list ${function}
# 下一步，不进入调用的函数
(gdb) next
# 下一步，进入调用的函数
(gdb) step
# 继续运行当前函数，直到函数返回，打印函数的返回值
(gdb) finish
# 跳过指定函数，主要是结合 step 使用，用来应付一行代码有多个函数调用的情况
(gdb) skip function ${function}
# 直接进入函数内部条调试
(gdb) until ${function}
```

## 导出字符串到文件

```gdb
# ${var} 为字符串变量
(gdb) set variable $s = ${var}
# dump binary memory 表示以二进制模式复制内存，body.json 为内存导出文件，$s 和 $s + (size_t)strlen($s) 是导出的内存地址范围
(gdb) dump binary memory body.json $s $s + (size_t)strlen($s)
```

