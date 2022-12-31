# Unix Shell 常用操作

## 调试

方式一：

```shell
# 读一遍脚本中的命令但不执行，用于检查脚本中的语法错误
$ sh -n demo.sh
# 一边执行脚本，一边将执行过的脚本命令打印到标准错误输出
$ sh -v demo.sh
# 提供跟踪执行信息，将执行的每一条命令和结果依次打印出来
$ sh -x demo.sh
```

方式二：在脚本开头提供参数。

```shell
#!/bin/sh -x
```

方式三：用 set 命令启用或禁用参数

```shell
# 启用脚本执行跟踪
set -x
echo "demo"
# 关闭脚本执行跟踪
set +x
```

## 并发执行指令

以java运行jar包为例

```bash
$ java -jar *.jar & # "&"的作用就是将程序挂在后台运行
# ctrl+z快捷键可将程序暂停, 并放入后台
$ jobs -l # 查看当前后台任务, 以及详细信息
[1]+ 19636 Stopped                 sh help/start-console.sh
$ bg %1 # 将上述序号为"1"的任务转为后台执行
$ fg %1 # 将上述序号为"1"的任务转为前台执行
$ kill %1 # 命令进程退出
```

<span style="background-color:yellow">以上所有的指令, 除了"kill"外, 其他指令只对当前会话运行的程序有效</span>

### 使用 nohup

以 java 运行 jar 包为例

```bash
$ nohup java -jar *.jar >nohup.out 2>&1 &
```

nohup 可以让 shell 终端（或者远程 ssh 终端退出）时，不会影响后台执行程序，要终止进程可以使用 kill pid 杀死进程，同时程序原本应该输出在
在终端的流，会被重定向到文档中。如果没有指定文件名称，则为当前目录的nohup.out文件。

但是当服务长时间运行时就会产生大量的 log，很多时候打印到控制台的信息是并不希望保存的，所以以上命令改为如下命令

```bash
$ nohup java -jar *.jar >/dev/null 2>&1 &
```

“**/dev/null**”在linux中，这个路径是一个无底洞，所有传入这个路径的字节流都会彻底消失，不会留存

**上述命令中 2>&1 的含义如下：**

**1**：在 linux 中表示标准输出流，该输出流是输出向屏幕的终端或者命令行，nohup 会对这种输出流重定向

**2**：在 linux 中表示标准错误输出流，2>&1 就是指定标准输出流执行的动作与标准输出流一致，一样需要被 nohup 重定向

## 配置文件、文件夹颜色

```bash
# 所有用户都可读写的文件夹，默认的背景颜色过亮导致看不到文字，配置用户目录下的 .dir_colors 文件的 OTHER_WRITABLE 项，值改为普通文件夹的颜色就行
$ vim ${HOME}/.dir_colors
OTHER_WRITABLE 01;34
```

