## 问题一

**系统：**

manjaro

**桌面环境：**

kde

**起因：**

想要将用户目录下的“下载”、“文档”等几个文件夹改为英文名称，由于之前重命名过文件夹，“下载”改成了“Download”，“文档”改为“Document”，其他的文件夹类似。但是这也仅仅只是给文件夹改了一个名字罢了。

重启系统后，由于 x session无法在用户目录下找到“桌面”、“下载”等文件夹，一律会把`XDG_DESKTOP_DIR`、`XDG_DOWNLOAD_DIR`...这些和主目录相关的变量改为`$HOME`（变量的配置文件目录：${HOME}/.config/user-dirs.dirs）。

由于`XDG_DESKTOP_DIR`变成了`${HOME}`，可以看到`${HOME}`目录下所有的文件夹和文件都会出现在KDE的桌面上。这个问题，只需要手动修改`${HOME}/.config/user-dirs.dirs`文件，然后重启系统即可。

<span style="color: red">我在修改这个配置文件的同时，为了符合英语的复数使用规范，重命名文件夹`Document`为`Documents`。</span>

重启系统后，我发现，登陆用户之后，迟迟无法进入桌面。之后检查了`/var/log`下的日志，没有发现异常。`systemctl status sddm`可以看到`closed session`用户会话退出，但是也没有异常信息。

之后打算通过U盘的live系统重新安装manjaro，安装系统前，先进行整理文件，将一些重要的文件进行备份。

无意中发现，在`${HOME}/.local/share/sddm/`有个`xorg-session.log`，看这名字应该是sddm的session会话记录，文件当中只有一条日志：`source: No such file or directory: /home/user/Document/script/console/fcitx5.sh`，这个文件是我配置tcitx5输入法的脚本文件，最后我在`/etc/profile`中看到`source /home/user/Document/script/console/fcitx5.sh`，好像知道问题在哪了，把`Document`改为`Documents`，然后重启系统，成功了，好险。。。

**发现：**

<span style="color: green">`${HOME}/.local/share/sddm/xorg-session.log`这个文件应该是记录GUI程序的启动日志的，正常情况下，可以在这个文件可以看到GUI程序输出的所有log</span>

