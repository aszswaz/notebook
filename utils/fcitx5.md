# 简介

fcitx 是 Linux 操作系统下的输入法工具，它对中文的输入支持非常好。

# 安装

```bash
# 安装 fcitx5 的基本框架，fcitx5-im 是一个软件包组，它带有四个软件包：fcitx5、fcitx5-qt、fcitx-configtool、fcitx5-gtk
$ sudo pacman -S fcitx5-im
# 安装一些 fcitx5 的中文输入法引擎
$ sudo pacman -S fcitx5-chewing fcitx5-chinese-addons fcitx5-rime
```

**设置开机启动**

```bash
$ nvim /etc/environment
GTK_IM_MODULE=fcitx5
QT_IM_MODULE=fcitx5
XMODIFIERS=@im=fcitx5
SDL_IM_MODULE=fcitx
```

### 设置中文的特殊符号输出映射

fcitx5 的默认配置对于中文“【”、“】”和“·”的处理存在问题，需要进行自定义配置：

```bash
# fcitx5
$ sudo nvim /usr/share/fcitx5/punctuation/punc.mb.zh_CN
```

修改【”、“】”和“·”的中文映射

```txt
. 。
, ，
? ？
" “ ”
: ：
; ；
' ‘ ’
< 《
> 》
\ 、
! ！
$ ￥
^ ……
_ ——
( （
) ）
[ 【
] 】
~ ～
` •
```
