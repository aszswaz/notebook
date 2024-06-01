# 环境变量配置

环境变量的配置脚本建议放在`/etc/profile.d/`文件夹下，系统会自动加载该文件夹下所有的`.sh`结尾的脚本文件。

如果想把配置脚本防止在其他地方，可以通过修改`/etc/profile`以达到目的。

`/etc/profile`文件的样本如下：

```shell
# /etc/profile

# Set our umask
umask 022

# 这个函数是专门用于给PATH变量追加变量的，它可以保证不会重复添加一个路径到PATH，/etc/profile.d/ 文件夹下所有的脚本都能直接使用这个函数
append_path() {
    case ":$PATH:" in
    *:"$1":*) ;;

    *)
        PATH="${PATH:+$PATH:}$1"
        ;;
    esac
}

# 在PATH变量，添加最基本的bin目录，如果没有这些目录，大部分的命令都无法正常运行
append_path '/usr/local/sbin'
append_path '/usr/local/bin'
append_path '/usr/bin'

# 提升PATH变量为子进程可继承的变量
export PATH

# 加载 /etc/profile.d/ 文件夹下的所有脚本
if test -d /etc/profile.d/; then
    for profile in /etc/profile.d/*.sh; do
    	# test -r 指令测试文件可读性，文件可读就以当前进程运行脚本，由于是以当前进程运行脚本，所以 append_path 函数在脚本中是可用的
        test -r "$profile" && . "$profile"
    done
fi

# 清理变量
unset profile

# 删除函数
unset -f append_path

# Source global bash config, when interactive but not posix or sh mode
if test "$BASH" &&
    test "$PS1" &&
    test -z "$POSIXLY_CORRECT" &&
    test "${0#-}" != sh &&
    test -r /etc/bash.bashrc; then
    . /etc/bash.bashrc
fi

# Termcap is outdated, old, and crusty, kill it.
unset TERMCAP

# Man is much better than us at figuring this out
unset MANPATH
```

<font color="red">不过直接编辑`/etc/profile`文件有些危险，如果出现语法错误什么的，容易导致X11无法启动，如果遇到这种情况，进入tty界面恢复该文件就行。但是不建议直接修改它，如果登陆 shell 是zsh，就修改`${HOME}/.zshrc` 如果是 bash 就修改 `${HOME}/.bashrc`</font>