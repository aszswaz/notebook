# fcitx5安装

```bash
# 安装云输入以及qt和gtk的桌面程序模块，和主题
$ sudo pacman -S fcitx5 fcitx5-chinese-addons fcitx5-qt fcitx5-gtk fcitx5-material-color
```

**设置开机启动**

```bash
$ vim ~/.pam_environment
GTK_IM_MODULE DEFAULT=fcitx
QT_IM_MODULE  DEFAULT=fcitx
XMODIFIERS    DEFAULT=\@im=fcitx
SDL_IM_MODULE DEFAULT=fcitx
```

**解决JetBrains全家桶与fcitx的冲突问题，可以写在/etc/profile，也可以写在对应的启动脚本当中**、

```bash
# 解决JetBrains软件与fcitx的冲突问题
export XMODIFIERS=@im=fcitx
export QT_IM_MODULE=fcitx
export LC_ALL=zh_CN.UTF-8
```

### 设置中文的特殊符号输出映射（以“【”和“】”为例）

```bash
# fcitx5
$ sudo vim /usr/share/fcitx5/punctuation/punc.mb.zh_CN
# fcitx4
$ sudo vim /usr/share/fcitx/data/punc.mb.zh_CN
```

修改 “[” “]” 的中文映射

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
```