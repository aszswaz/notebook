

# shell 的基本语法

## 数组

**数组的定义**

数组的定义有两种方式

**第一种：字符串的“ ”（空格）或"\n"（换行符）**

<span style="color: red">这种方式声明数组，只对指令的返回结果有效</span>

成功案例：

```shell
demo='demo01 demo02\ndemo03'
# 遍历
for arg in $(echo ${demo})
do
    echo "value: ${arg}"
done
# value: demo01
# value: demo02
# value: demo03
```

错误案例：

```shell
demo='demo01 demo02\ndemo03'
# 遍历
for arg in ${demo}
do
    echo "value: ${arg}"
done
# value: demo01 demo02
# demo03
```

应用场景：

```shell
# 卸载作为依赖安装，但是不再使用的包
sudo pacman -Rc $(pacman -Qdtq)
```

**第二种：(element01 element02 ....)**

例：

```shell
demo=(element01 element02 element03)
for element in ${demo}; do
    echo "value: ${element}"
done
# value: element01
# value: element02
# value: element03
```

**获得数组的元素个数**

```shell
demo=(element01 element02 element03)
echo "数组元素的个数：${#demo[*]}"
# 或者
echo "数组元素的个数：${#demo[@]}"
```

**通过下标获取数组的元素，以及遍历数组**

```shell
demo=(element01 element02 element03)
echo "元素1：${demo[1]}"
echo "元素2：${demo[2]}"
echo "元素3：${demo[3]}"
```

执行结果：

```txt
元素1：element01
元素2：element02
元素3：element03
```

<span style="color: red">注意：数组的下标是从1开始，不同与其他变成语言的从0开始</span>

**通过while循环遍历数组**

```shell
demo=(element01 element02 element03)
index=1
while ((${index} <= ${#demo[*]})); do
    echo "第${index}个元素为：${demo[index]}"
    index=$(expr $index + 1)
done
```

结果：

```txt
第1个元素为：element01
第2个元素为：element02
第3个元素为：element03
```

**通过for循环进行遍历**

```shell
demo=(element01 element02 element03)
for elemente in ${demo}; do
    echo "value: ${elemente}"
done
```

结果：

```txt
value: element01
value: element02
value: element03
```

## 函数

**函数的声明、使用和删除**

```shell
# 声明函数
demo() {
    echo 'Hello World'
}
# 调用函数
demo
# 删除函数
unset -f demo
```

<span style="color: red">注意：在函数内，就算命令执行出错也不会停止运行，如下所示</span>

```shell
$ demo(){
    demo01
    echo 'Hello World'
}
$ demo
demo:1: command not found: demo01
Hello World
```

**函数接收参数**

```shell
# 方式一，使用“$*”
$ demo() {
    echo "参数长度：$#"
    echo "参数列表：$*"
    for arg in $*; do
        echo ${arg}
    done
}
# 验证结果
$ demo test01 test02
参数长度：2
参数列表：test01 test02
test01
test02
```

```shell
# 方式二。使用“$@”
$ demo() {
    echo "参数长度：$#"
    echo "参数列表：$*"
    for arg in $*; do
        echo ${arg}
    done
}
$ demo test01 test02
参数长度：2
参数列表：test01 test02
test01
test02
```

**函数返回值**

```shell
$ demo02() {
    echo 'Hello World!'
}
$ demo() {
    # 运行函数，并且获得返回值
    echo $(demo02)
}
# 测试
$ demo
Hello Demo!
```

## 字典

```sh
# 声明一个字典变量
declare -A dict
# 批量给字典添加元素
dict=([key1]="value1" [key2]="value2" [key3]="value3")
# 声明的同时给字典批量添加元素
declare -A dict=(key01 value01 key02 value02)
# 给字典添加一个元素
dict[key]=demo
# 打印指定的 value
echo ${dict[key]}
# 打印所有的 value
echo ${dict[*]}
# 打印所有的 key
echo ${!dict[*]}
# 遍历 key 和 value
for key in ${!dict[*]}; do
	echo "key:" $key "; value:" ${options[$key]}
done
```

# SHELL 的 IO 操作

**>**

```bash
$ echo "Hello World" > demo.txt
```

文件不存在，则创建文件并写入内容，文件存在则覆盖文件内容。

**<**

```bash
$ <demo.txt
```

读取文件内容，功能上类似于 cat，主要在脚本当中使用，比如读取文件每一行：

```bash
#!/bin/zsh
for line in $(<demo.txt); do
	echo "${line}"
done
```

**>>**

```bash
$ echo "Hello World" >> demo.txt
```

文件不存在则创建文件，文件存在，则追加内容到文件末尾。

**read**

`read` 是用于从 `stdin` 读取一行输入，它常常被用来读取用户输入：

```bash
# 读取用户输入，并赋值给变量 demo
$ read demo
$ echo $demo
# 在不换行的前提下，输出提示信息
## read -p 只能在bash使用，在zsh使用会出现：read: -p: no coprocess
# $ read -p 'Please input: ' -r demo
# Please input: demo
# $ echo $demo
# demo
# 结合 echo 的不换行输出
$ echo -n "Please input: " && read -r demo
Please input: demo
$ echo $demo
demo
```

<font color="red">注意：linux的终端模拟程序对于通过stdin输入多字节字符，存在退格键删除，只删除半个字符的问题</font>，如果运行的 shell 是 zsh，应当使用 [vared](../z-shell/commonly-used.md#vared) 获取用户输入

read 和 < 配合，可以达到按行读取文件的效果：

```bash
while read -r line; do
	echo "$line"
done < demo.txt
```

# 特殊操作符

```sh
# 输出所有的传入参数
echo $@
# 传入参数的数量
echo $#
# 获取指定位置的传入参数
echo $1 $2 ...
# 获取脚本中上一句代码的返回码，注意：是“上一句代码”，不是“上一个程序”，类似 example="demo" 这样的代码也会导致 $? 直接变成 0，要想多次使用，将它赋值给变量就行 code=$?
echo $?
```

