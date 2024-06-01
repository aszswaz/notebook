# 简介

linux 的用户管理

# 管理用户账户

```shell
# 添加用户
# -m：创建用户的同时，也在 /home 目录下创建用户的主目录
$ useradd -m username
# 给用户初始化一个密码
$ passwd username
# 完全删除用户
# -r：将用户的主目录也一起删除
$ userdel -r username
```

<font color="red">注意：useradd 有个- p 选项也可以设置账户的密码，但这是直接把选项的参数添加到 /etc/shadow 文件中，/etc/shandow 文件存储的是密码的密文，而且 /etc/shadow 对于密码的存储格式也有要求，比如要设置密码的加密算法是什么，因此直接给 -p 选项设置密码的明文是无效的。</font>

/etc/shandow 的格式可以通过指令 `man shandow` 查看手册。

# 授权

个人用户的权限只可以在本 home 下有完整权限，其他目录要看别人授权。而经常需要 root 用户的权限，这时候 sudo 可以化身为 root 来操作。我记得我曾经 sudo 创建了文件，然后发现自己并没有读写权限，因为查看权限是 root 创建的。新创建的用户并不能使用 sudo 命令，需要给它添加授权。

给用户添加 sudo 的使用权限有两种办法，第一种是修改 /etc/sudoers，直接在该文件中添加用户的权限配置：

```bash
# /etc/sudoers 默认是只读的，需要给 root 用户添加可写权限
$ sudo chmod u+w /etc/sudoers
# 编辑 /etc/sudoers 文件，在 root	ALL=(ALL) 	ALL 的下方添加用户权限配置
$ sudo nvim /etc/sudoers
...
root	  ALL=(ALL) 	ALL
username ALL=(ALL)           ALL
...
# 删除可写权限
$ sudo chmod a-w /etc/sudoers
```

第二种是在 /etc/sudoers.d/ 目录中添加配置文件：

```bash
# 查看 /etc/sudoers 中是否配置了 includedir /etc/sudoers.d
# 在不同的发行版中，由于 sudo 的版本不同，includedir 的前缀字符也会不同，在旧版本的 sudo 中是 #includedir，这个 # 不代表注释，在新版本的 sudo 是 @includedir
$ grep 'includedir /etc/sudoers.d' /etc/sudoers
# 将用户的 sudo 配置放到 /etc/sudoers.d/10-installer，文件名叫什么都行，就是不要带后缀名
$ echo "username ALL=(ALL) ALL" >> /etc/sudoers.d/10-installer
```

<font color="green">直接修改 /etc/sudoers 存在一些风险，如果 /etc/sudoers 中的语法不正确，会导致 sudo 无法使用，因此使用第二种方式会更好。如果 /etc/sudoers 出现语法错误，可以使用其它能够获取超级用户权限的工具，对 /etc/sudoers 进行修复，比如 su 或 pkexec。</font>

# 设置用户的登陆 shell

```bash
$ usermod -s /bin/zsh $USER && grep $USER /etc/passwd
```

