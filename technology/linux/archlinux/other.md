# 去除ls指令的文件夹背景色，防止文件夹名称无法看清楚

```zsh
$ echo "OTHER_WRITABLE 01;33" >> $HOME/.dir_colors
$ vim ~/.zshrc
eval `dircolors $HOME/.dir_colors`
```

# 配置镜像源

archlinux:

```txt
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
```

manjaro:

```bash
# 从 manjaro 服务器下载所有中国镜像源的配置文件，有阿里云、清华等
$ sudo pacman-mirrors -c China
```

更新软件源并导入公钥

```zsh
sudo pacman -Syy && sudo pacman -S archlinuxcn-keyring
```

# 打开控制台，出现以下问题

```zsh
_p9k_init_params:72: character not in range
manjaro% 
```

 原因：是语言环境配置不正确

解决方法：

```zsh
# 打开语言环境配置文件
sudo gedit /etc/locale.gen
```

```txt
# 去除对应的语言注释
zh_CN.UTF-8 UTF-8
```

```zsh
# 执行指令
sudo locale-gen
``` 

# 清理垃圾

清理系统中无用的包

```zsh
# 由于不少软件有依赖关系，建议多执行几次，直到指令出错为止
sudo pacman -R $(pacman -Qdtq)
```

清除已下载的安装包

```zsh
sudo pacman -Scc
```

查看日志文件

```zsh
du -t 100M /var
# 或
journalctl --disk-usage
```

删除历史操作记录

```zsh
sudo journalctl --vacuum-size=50M
```
