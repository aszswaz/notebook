# VIM

由于 VIM 的插件系统非常强大，插件种类很多，这里仅仅只介绍一些比较常用的 vim 命令和插件管理器的安装，我在使用的 vim 配置，直接写在 vim 脚本当中。

[vim 配置脚本](../../../scripts/config/vimrc)

## 插件管理器

### vim-plug

一款基于 vimscript 的插件管理器，vim-plug 相比于 vunble，它支持异步安装插件，所以建议优先使用它。官方推荐在 neovim 中使用。

github: [https://github.com/junegunn/vim-plug](https://github.com/junegunn/vim-plug)

### vundle

这也是一款基于 vimscript 的插件管理器，但是它比较老旧，不过有些插件仍然只支持通过它进行安装。

github: [https://github.com/VundleVim/Vundle.vim](https://github.com/VundleVim/Vundle.vim)

## 常用指令

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
# 递归扫描 src 文件夹中的所有文件，比如 .cpp 文件，或者 .c 文件
$ ctags -R ./src
```

ctags 会在当前目录生成一个 tags 文件，在 vim 当中进行加载就行：

```vimscript
:tags ./tags
```

在 vim 当中，使用 `Ctrl + ]` 快捷键就可以跳转到函数当中，`Ctrl + T` 跳转到原来的位置。



