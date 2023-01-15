# 简介

fish 是一个专注于交互和可用性的 unix shell，相比 zsh 和 bash，fish 提供了更多的默认功能，比如常用指令的参数的自动补全、根据用户输入的指令历史记录自动补全指令等，这些功能在 zsh 和 bash 中虽然也是可用的，但是需要用户进行配置。

另外，fish 语法并不严格遵循 posix shell，因此无法使用 fish 执行 zsh 和 bash 的脚本。

# 安装 fish 和主题

```bash
$ sudo pacman -S fish
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

# 官网

fish: <https://fishshell.com/>

oh-my-fish: <https://github.com/oh-my-fish/oh-my-fish>