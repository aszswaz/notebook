# 简介

[fish](https://fishshell.com/) 是一个专注于交互和可用性的 unix shell，相比 zsh 和 bash，fish 提供了更多的默认功能，比如常用指令的参数的自动补全、根据用户输入的指令历史记录自动补全指令等，这些功能在 zsh 和 bash 中虽然也是可用的，但是需要用户进行配置。

另外，fish 语法并不严格遵循 posix shell，因此无法使用 fish 执行 zsh 和 bash 的脚本。

# 安装 fish

以 archlinux 系统为例：

```bash
$ sudo pacman -S fish
```

# 主题

fish 的主题框架以 [oh-my-fish](https://github.com/oh-my-fish/oh-my-fish) 为主，使用方式如下：

```bash
# 安装 oh-my-fish
$ curl -L https://get.oh-my.fish | fish
# 列出已安装的和可安装的主题
$ omf theme
# 安装主题
$ omf install lambda
# 更换主题
$ omf theme default
# 检查 omf 是否有错误
$ omf doctor
# 卸载 omf
$ omf destroy
```

# 函数

fish 创建函数的方式一共有两种，一种是 alias，另一种是 funtions

**alias**

```bash
$ alias demo="echo 'Hello World'"
# 查看函数的详细信息
$ functions -v demo
# Defined via `source`
function demo --wraps=echo\ \'Hello\ World\' --description alias\ demo=echo\ \'Hello\ World\'
  echo 'Hello World' $argv; 
end
# 删除函数
$ functions -e demo
```

这样创建的函数是临时的，fish 退出就会失效，我们可以创建一个永久函数：

```bash
$ alias --save demo="echo 'Hello World'"
```

fish 会将函数保存到 $HOME/.config/fish/functions/ 目录下，在下一次启动时，它会自动加载该目录下的脚本。

**function**

function 则没啥需要特别说明的，直接看代码吧。

```bash
function demo01
	echo "Hello World"
end

function demo02
	# 打印传入的所有参数
	echo $argv
	# 打印指定的参数
	echo $argv[1]
end
```

