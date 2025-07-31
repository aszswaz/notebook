# Shell 单引号 '' 双引号 "" 反引号 `` 和 \$() 的区别和用法

单引号''和双引号"” 两者都是解决变量中间有空格的问题。

在bash中“空格”是一种很特殊的字符，比如在bash中这样定义str=this is String，这样就会报错，为了避免出错就得使用单引号''和双引号""。

## 单引号 ''

单引号剥夺了所有字符的特殊含义，被 '' 引用的文本只是单纯的字符串

例：

```shell
$ demo='Hello World'
$ echo 'demo的变量值为：${demo}'
```

结果：

```txt
demo的变量值为：${demo}
```

## 双引号 ""

双引号会对字符串的特殊符号做替换

例：

把当前日期替换到字符串当中

```shell
$ echo "当前时间：$(date)"
```

结果：

```txt
当前时间：2021年 05月 09日 星期日 15:57:18 CST
```

## 反引号 `` 和表达式 \$()

这两个都是用于执行指令，并获得程序的输出结果。

例1：

```shell
$ demo01=`demo`
$ demo02=$(demo)
# 结果
$ echo ${demo01}
# 2021年 05月 09日 星期日 16:09:32 CST
$ echo ${demo02}
# 2021年 05月 09日 星期日 16:10:31 CST
```

<span style="color: red">建议使用\$()，``是老式 shell 写法，而且不支持嵌套，\$() 支持嵌套</span>

例：通过嵌套的 echo 输出日期

```shell
$ echo `echo "当前日期是：`date`"`
# zsh: unmatched "
# zsh: parse error in command substitution
$ echo $(echo "当前日期是：$(date)")
# 当前日期是：2021年 05月 09日 星期日 16:16:07 CST
```

