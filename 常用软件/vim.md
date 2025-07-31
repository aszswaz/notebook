# VIM

现在比较流行的终端编辑器有 neovim、vim 和 vi，原本 vi 的功能非常少，在绝大多数 Linux 发行版中，它都是 vim 的软连接，因此在本文中不会提到 vi。neovim 是 vim 的衍生版本，它支持 [lua](https://github.com/junegunn/vim-plug)，lua 的执行效率要比 vimscript 要高的多，再加上只有 vim 只有原作者一个人把关，更新迭代是很慢的，neovim 则是由 github 社区管理，更新速度很快，加上 lua 的加持，使得 neovim 逐渐超过了 vim，因此本文如果没有特别指明，稳重出现的单词“vim”都是指 neovim。

vim 的插件系统和功能都非常强大，插件种类很多，这里仅仅只介绍一些比较常用的 vim 操作。

# 插件管理器

[vim-plug](https://github.com/junegunn/vim-plug)

一款基于 vimscript 的插件管理器，vim-plug 相比于 vunble，它支持异步安装插件，所以建议优先使用它。官方推荐在 neovim 中使用。

[vundle](https://github.com/VundleVim/Vundle.vim)

这也是一款基于 vimscript 的插件管理器，它已经停止开发，也不支持异步安装插件，不过有些插件仍然只支持通过它进行安装。

[packer.vim](https://github.com/wbthomason/packer.nvim)

这是一款使用 [lua](https://github.com/junegunn/vim-plug) 编写的插件管理器，支持异步安装插件，与 vim-plug 相比，界面也更加好看，但它只适用于 neovim。

# 常用指令

## Termdebug

可以通过 gdb 来调试 C++/C 程序。它会打开三个窗口，一个窗口显示当前位置的源代码，一个窗口显示程序的输出，一个窗口显示 gdb 的输出。

使用：

```vimscript
# 加载 termdebug 插件，这个插件被内置在 vim 当中
:packadd termdebug
# 启动 gdb
:Termdebug
# 启动时，指定要调试的程序，相当于 gdb ./xxx
:Termdebug ./xxx
```

## Tags

vim 的 tags 功能可以加载函数索引文件，为 C++/C 项目的函数跳转功能提供支持。

使用方式如下：

```bash
# 需要使用 ctags 生成函数索引文件
$ sudo pacman -S ctags
# 扫描指定的文件夹或文件中的头文件，生成所有的函数、枚举、类等引用标签
$ ctags -R --c++-kinds=+p+l+x+c+d+e+f+g+m+n+s+t+u+v --fields=+liaS --extras=+q \
	/usr/include/c++ \
	./src
```

ctags 会在当前目录生成一个 tags 文件，在 vim 当中进行加载就行：

```vimscript
:set tags+=./tags
```

在 vim 当中，使用 Ctrl + ] 快捷键就可以跳转到函数当中，Ctrl + T 跳转到原来的位置。

## Substiute

substiute 指令将匹配的文本替换为指定内容

指令格式：:[range]s[ubstitute]/{pattern}/{string}/[flags] [count]

```vimscript
" 查看帮助文档
:help :s
" 第 10 行到第 20 行中的 demo 替换为 Hello World
:10,20s/demo/Hello World
" 所有的 demo 都替换为 Hello World
:%s/demo/Hello World
```

# 常用功能

## 批量添加文本

假设要在第 1 行到第 10 行行首插入“//”，操作步骤如下：

1. 按 Ctrl + v 进入 VISUAL BLOCK 模式光标移动到第 10 行，也就是选择要插入的行。VISUAL BLOCK 模式不同于普通的 VISUAL 模式，它可以竖向选择文本。
2. 按 Shift + i 进入 INSERT 模式，此时光标会回到第 1 行，在第一行行首输入“//”。
3. 按 esc 退出 INSERT 模式，vim 就会在其他被选中的行插入刚才输入的文本。

## 批量删除行尾字符

指令格式：\<start\>,\<end\>normal $x

| 指令参数 | 说明           |
| -------- | -------------- |
| start    | 要操作的起始行 |
| end      | 要操作的终止行 |

例 1：删除第 10 行到第 20 行所有的行尾字符，指令如下：

```vimscript
:10,20$normal $x
```

例 2：删除所有的行尾字符，指令如下：

```vimscript
:0,$normal $x
```

## 在多个连续行的末尾添加字符

第一种：

指令格式：\<start\>,\<end\>normal A\<char\>

第二种：

指令格式：\<start\>,\<end\>s/$/\<char\>

| 指令参数 | 说明         |
| -------- | ------------ |
| start    | 起始行       |
| end      | 终止行       |
| char     | 要添加的字符 |

例：在指定的行末尾添加“;”：

```vimscript
:10,20normal A;
" 或者
:10,20s/$/;
```

## 删除多个连续行指定列到行首的文本

指令格式：\<start\>,\<end\>normal \<column\>|d^

指令 \<start\>,\<end\>normal \<column\>|d\$ 可以删除指定列之后的文本。
