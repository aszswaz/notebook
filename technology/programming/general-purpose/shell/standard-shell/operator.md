# Shell 基本运算符

Shell 和其他编程语言一样，支持多种运算符，包括：

*   算数运算符

*   关系运算符

*   布尔运算符

*   字符串运算符

*   文件测试运算符

原生bash不支持简单的数学运算，但是可以通过其他命令来实现，例如 awk 和 expr，expr 最常用。

expr 是一款表达式计算工具，使用它能完成表达式的求值操作。

实例

```shell
#!/bin/bash

val=$(expr 2 + 2)
echo "两数之和为 : ${val}"
```

执行脚本，输出结果如下所示：

```txt
两数之和为 : 4
```

两点注意：

*   表达式和运算符之间要有空格，例如 2+2 是不对的，必须写成 2 + 2，这与我们熟悉的大多数编程语言不一样。
*   完整的表达式要被 ` ` 包含，注意这个字符不是常用的单引号，在 Esc 键下边。

## 算术运算符
下表列出了常用的算术运算符，假定变量 a 为 10，变量 b 为 20：

|   运算符   |  说明  |   举例  |
|-----------|--------|--------|
| +                       |	加法        | `expr $a + $b` 结果为 30。|
| -	| 减法 | `expr $a - $b` 结果为 -10。|
| * |乘法	| `expr $a \* $b` 结果为  200。|
| /	| 除法 | `expr $b / $a` 结果为 2。|
| %	| 取余 | `expr $b % $a` 结果为 0。|
| = | 赋值 | a=$b 将把变量 b 的值赋给 a。|
| ==	| 相等。| 用于比较两个数字，相同则返回 true。	[ $a == $b ] 返回 false。|
| != | 不相等。| 用于比较两个数字，不相同则返回 true。	[ $a != $b ] 返回 true。|
<span style="color: red">注意：条件表达式要放在方括号之间，并且要有空格，例如: [$a==$b] 是错误的，必须写成 [ $a == $b ]。</span>

实例：

算术运算符实例如下：

实例

```shell
#!/bin/bash

# author:菜鸟教程

# url:www.runoob.com

a=10
b=20

val=`expr $a + $b`
echo "a + b : $val"

val=`expr $a - $b`
echo "a - b : $val"

val=`expr $a \* $b`
echo "a * b : $val"

val=`expr $b / $a`
echo "b / a : $val"

val=`expr $b % $a`
echo "b % a : $val"

if [ $a == $b ]
then
   echo "a 等于 b"
fi
if [ $a != $b ]
then
   echo "a 不等于 b"
fi
```

执行脚本，输出结果如下所示：

```txt
a + b : 30
a - b : -10
a * b : 200
b / a : 2
b % a : 0
a 不等于 b
```

<font color="red">注意：</font>

*   乘号(\*)前边必须加反斜杠(\)才能实现乘法运算；

*   if...then...fi 是条件语句，后续将会讲解。

*   在 MAC 中 shell 的 expr 语法是：$((表达式))，此处表达式中的 "\*" 不需要转义符号 "\" 。

<span style="color: green">除了使用ecpr以外，还有一种方式同样也可以达到运算的目的</span>

```shell
#!/bin/sh

echo $[2 + 2]
echo $[2 * 2]
echo $[2 / 2]
echo $[2 - 2]
echo $[3 % 2]
```

结果：

```txt
4
4
1
0
1
```

## 关系运算符

关系运算符只支持数字，不支持字符串，除非字符串的值是数字。

下表列出了常用的关系运算符，假定变量 a 为 10，变量 b 为 20：

| 运算符 | 说明                                | 举例                       |
| ------ | ----------------------------------- | -------------------------- |
| -eq    | 检测两个数是否相等，相等返回 true。 | [ $a -eq $b ] 返回 false。 |
|  -ne	| 测两个数是否不相等，不相等返回 true。	|  [ $a -ne $b ] 返回 true。  |
|  -gt	|  检测左边的数是否大于右边的，如果是，则返回 true。|  [ $a -gt $b ] 返回 false。 |
|  -lt	|  检测左边的数是否小于右边的，如果是，则返回 true。|  [ $a -lt $b ] 返回 true。  |
|  -ge	|  检测左边的数是否大于等于右边的，如果是，则返回 true。  |  [ $a -ge $b ] 返回 false。  |
|  -le	|  检测左边的数是否小于等于右边的，如果是，则返回 true。  |  [ $a -le $b ] 返回 true。  |

关系运算符实例如下：

实例

```shell
#!/bin/bash

# author:菜鸟教程
# url:www.runoob.com

a=10
b=20

if [ $a -eq $b ]
then
   echo "$a -eq $b : a 等于 b"
else
   echo "$a -eq $b: a 不等于 b"
fi
if [ $a -ne $b ]
then
   echo "$a -ne $b: a 不等于 b"
else
   echo "$a -ne $b : a 等于 b"
fi
if [ $a -gt $b ]
then
   echo "$a -gt $b: a 大于 b"
else
   echo "$a -gt $b: a 不大于 b"
fi
if [ $a -lt $b ]
then
   echo "$a -lt $b: a 小于 b"
else
   echo "$a -lt $b: a 不小于 b"
fi
if [ $a -ge $b ]
then
   echo "$a -ge $b: a 大于或等于 b"
else
   echo "$a -ge $b: a 小于 b"
fi
if [ $a -le $b ]
then
   echo "$a -le $b: a 小于或等于 b"
else
   echo "$a -le $b: a 大于 b"
fi
```

执行脚本，输出结果如下所示：

```txt
10 -eq 20: a 不等于 b
10 -ne 20: a 不等于 b
10 -gt 20: a 不大于 b
10 -lt 20: a 小于 b
10 -ge 20: a 小于 b
10 -le 20: a 小于或等于 b
```

# 布尔运算符

下表列出了常用的布尔运算符，假定变量 a 为 10，变量 b 为 20：

| 运算符 | 说明 | 举例|
|-----------|--------|-------|
| ! | 非运算，表达式为 true 则返回 false，否则返回 true。 | [ ! false ] 返回 true。 |
| -o | 或运算，有一个表达式为 true 则返回 true。 | [ a -lt 20 -o b -gt 100 ] 返回 true。 |
| -a | 与运算，两个表达式都为 true 才返回 true。 | [ a -lt 20 -a b -gt 100 ] 返回 false。 |

布尔运算符实例如下：

```shell
#!/bin/bash
# author:菜鸟教程
# url:www.runoob.com

a=10
b=20

if [ $a != $b ]
then
   echo "$a != $b : a 不等于 b"
else
   echo "$a == $b: a 等于 b"
fi
if [ $a -lt 100 -a $b -gt 15 ]
then
   echo "$a 小于 100 且 $b 大于 15 : 返回 true"
else
   echo "$a 小于 100 且 $b 大于 15 : 返回 false"
fi
if [ $a -lt 100 -o $b -gt 100 ]
then
   echo "$a 小于 100 或 $b 大于 100 : 返回 true"
else
   echo "$a 小于 100 或 $b 大于 100 : 返回 false"
fi
if [ $a -lt 5 -o $b -gt 100 ]
then
   echo "$a 小于 5 或 $b 大于 100 : 返回 true"
else
   echo "$a 小于 5 或 $b 大于 100 : 返回 false"
fi
```

执行脚本，输出结果如下所示：

```txt
10 != 20 : a 不等于 b
10 小于 100 且 20 大于 15 : 返回 true
10 小于 100 或 20 大于 100 : 返回 true
10 小于 5 或 20 大于 100 : 返回 false
```

## 逻辑运算符

以下介绍 Shell 的逻辑运算符，假定变量 a 为 10，变量 b 为 20:

| 运算符 | 说明 | 举例 |
|-----------|--------|--------|
| && | 逻辑的 AND | [[  a -lt 100 && b -gt 100 ]] 返回 false |
| \|\| | 逻辑的 OR | [[ a -lt 100 \|\| b -gt 100 ]]返回 true |

逻辑运算符实例如下：

```shell
#!/bin/bash
# author:菜鸟教程
# url:www.runoob.com

a=10
b=20

if [[ $a -lt 100 && $b -gt 100 ]]
then
   echo "返回 true"
else
   echo "返回 false"
fi

if [[ $a -lt 100 || $b -gt 100 ]]
then
   echo "返回 true"
else
   echo "返回 false"
fi
```

执行脚本，输出结果如下所示：

```txt
返回 false
返回 true
```

字符串运算符

下表列出了常用的字符串运算符，假定变量 a 为 "abc"，变量 b 为 "efg"：

| 运算符 | 说明 | 举例 |
|-----------|--------|--------|
| = | 检测两个字符串是否相等，相等返回 true。 | [ $a = $b ] 返回 false。 |
| != | 检测两个字符串是否不相等，不相等返回 true。 | [ $a != $b ] 返回 true。 |
| -z | 检测字符串长度是否为0，为0返回 true。 | [ -z $a ] 返回 false。 |
| -n | 检测字符串长度是否不为 0，不为 0 返回 true。 | [ -n "$a" ] 返回 true。 |
| $ | 检测字符串是否为空，不为空返回 true。 | [ $a ] 返回 true。 |

字符串运算符实例如下：

```shell
#!/bin/bash
# author:菜鸟教程
# url:www.runoob.com

a="abc"
b="efg"

if [ $a = $b ]
then
   echo "$a = $b : a 等于 b"
else
   echo "$a = $b: a 不等于 b"
fi
if [ $a != $b ]
then
   echo "$a != $b : a 不等于 b"
else
   echo "$a != $b: a 等于 b"
fi
if [ -z $a ]
then
   echo "-z $a : 字符串长度为 0"
else
   echo "-z $a : 字符串长度不为 0"
fi
if [ -n "$a" ]
then
   echo "-n $a : 字符串长度不为 0"
else
   echo "-n $a : 字符串长度为 0"
fi
if [ $a ]
then
   echo "$a : 字符串不为空"
else
   echo "$a : 字符串为空"
fi
```

执行脚本，输出结果如下所示：

```txt
abc = efg: a 不等于 b
abc != efg : a 不等于 b
-z abc : 字符串长度不为 0
-n abc : 字符串长度不为 0
abc : 字符串不为空
```

## 文件测试运算符

文件测试运算符用于检测 Unix 文件的各种属性。

属性检测描述如下：

| 操作符 | 说明 | 举例 |
|-----------|--------|--------|
| -b file | 检测文件是否是块设备文件，如果是，则返回 true。 | [ -b $file ] 返回 false。 |
| -c file | 检测文件是否是字符设备文件，如果是，则返回 true。 | [ -c $file ] 返回 false。 |
| -d file | 检测文件是否是目录，如果是，则返回 true。 | [ -d $file ] 返回 false。 |
| -f file | 检测文件是否是普通文件（既不是目录，也不是设备文件），如果是，则返回 true。 | [ -f $file ] 返回 true。 |
| -g file | 检测文件是否设置了 SGID 位，如果是，则返回 true。 | [ -g $file ] 返回 false。 |
| -k file | 检测文件是否设置了粘着位(Sticky Bit)，如果是，则返回 true。 | [ -k $file ] 返回 false。 |
| -p file | 检测文件是否是有名管道，如果是，则返回 true。 | [ -p $file ] 返回 false。 |
| -u file | 检测文件是否设置了 SUID 位，如果是，则返回 true。 | [ -u $file ] 返回 false。 |
| -r file | 检测文件是否可读，如果是，则返回 true。 | [ -r $file ] 返回 true。 |
| -w file | 检测文件是否可写，如果是，则返回 true。 | [ -w $file ] 返回 true。 |
| -x file | 检测文件是否可执行，如果是，则返回 true。 | [ -x $file ] 返回 true。 |
| -s file | 检测文件是否为空（文件大小是否大于0），不为空返回 true。 | [ -s $file ] 返回 true。 |
| -e file | 检测文件（包括目录）是否存在，如果是，则返回 true。 | [ -e $file ] 返回 true。 |

其他检查符：

-S: 判断某文件是否 socket。

-L: 检测文件是否存在并且是一个符号链接。

实例

变量 file 表示文件 /var/www/runoob/test.sh，它的大小为 100 字节，具有 rwx 权限。下面的代码，将检测该文件的各种属性：

实例

```shell
#!/bin/bash
# author:菜鸟教程
# url:www.runoob.com

file="/var/www/runoob/test.sh"
if [ -r $file ]
then
   echo "文件可读"
else
   echo "文件不可读"
fi
if [ -w $file ]
then
   echo "文件可写"
else
   echo "文件不可写"
fi
if [ -x $file ]
then
   echo "文件可执行"
else
   echo "文件不可执行"
fi
if [ -f $file ]
then
   echo "文件为普通文件"
else
   echo "文件为特殊文件"
fi
if [ -d $file ]
then
   echo "文件是个目录"
else
   echo "文件不是个目录"
fi
if [ -s $file ]
then
   echo "文件不为空"
else
   echo "文件为空"
fi
if [ -e $file ]
then
   echo "文件存在"
else
   echo "文件不存在"
fi
```

执行脚本，输出结果如下所示：

```txt
文件可读
文件可写
文件可执行
文件为普通文件
文件不是个目录
文件不为空
文件存在
```

## 三元运算符

```shell
# 简单语句
[[ a < 0 ]] && echo "a < 0"
# 文件测试
-e demo.txt && echo "file demo.txt exists" || echo "The file demo.txt does not exist"
# 配合块语句
[[ a < 0 ]] && { echo "a < 0" && echo "true" }
```

# 字符串操作

## 删除指定字符

```shell
demo="demo.tar.gz"
# 从左往右算，删除第一个“.”及其前边的字符串，结果是 tar.gz
echo ${demo#*.}
# 从左往右算，删除最后一个“.”及其前边的字符串，结果是 gz
echo ${demo##*.}
# 从右往左算，删除第一个“.”及其前面的字符串，结果是 demo.tar
echo ${demo%.*}
# 从右往左算，删除最后一个“.”及其前面的字符串，结果是 demo
echo ${demo%%.*}
```

以上操作一般用于提取文件名，比如文件名是数字，需要改为“第N集”的形式，也就是去除文件后缀名：

```shell
for file in *.mp4; do
	mv $file "XXX-第${file%.*}集.mp4"
done
```

## 截取字符串

```shell
demo="Hello World"
echo "${demo:0:5}"
```

## 替换字符串

```shell
demo="Hello World"
# 通过正则表达式替换，这种正则表达式不支持正则表达式的拓展部分，比如\w、\s都是不支持的
echo "${demo/[a-zA-Z]/a}"
# “//”与“/”的不同之处在于，“/”只能匹配一次，“//”是全文匹配
echo "${demo//[a-zA-Z]/a}"
```

## 拆分字符串

shell 有一个特殊的变量 IFS（Internal Field Seprator），全称是内部域分隔符，shell 使用存储在 IFS 中的值（默认情况下为空格、制表符和换行符）来分隔指令的参数、解析指令的输出，以及分割字符串。

```bash
#!/bin/bash

# 保存 IFS 原本的值
ORIGINAL_IFS="$IFS"
IFS='|'

string="abcdefg|higklmn|opqrst|uvwxyz"
strings=($string)
for iterm in ${strings[*]}; do
    echo "iterm: $iterm"
done

# 恢复 IFS 的值
IFS="$ORIGINAL_IFS"
```

此外，还要特别说明一下该怎么正确的使用不可见字符作为字符串的分隔符，以换行符为例：

```bash
#!/bin/bash

ORIGINAL_IFS="$IFS"

# 在 shell 中 \n 所代表的只是一个字符串 \n，而不是换行符，只有加上 $，shell 才会把 \n 转义为换行符
IFS=$'\n'
# 把本文件夹下所有文件的文件名中的所有空格替换为“-”，包括子文件夹
for iterm in $(find -type f); do
	mov "$iterm" "${iterm// /-}"
done

IFS="$ORIGINAL_IFS"
```

