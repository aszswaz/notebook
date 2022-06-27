# Secure Shell

**Secure Shell**（安全外壳协议，简称**SSH**）是一种加密的[网络传输协议](https://zh.wikipedia.org/wiki/网络传输协议)，可在不安全的网络中为网络服务提供安全的传输环境[[1\]](https://zh.wikipedia.org/wiki/Secure_Shell#cite_note-rfc4251-1)。SSH通过在网络中创建[安全隧道](https://zh.wikipedia.org/w/index.php?title=安全隧道&action=edit&redlink=1)来实现SSH客户端与服务器之间的连接[[2\]](https://zh.wikipedia.org/wiki/Secure_Shell#cite_note-rfc4252-2)。SSH最常见的用途是远程登录系统，人们通常利用SSH来传输[命令行界面](https://zh.wikipedia.org/wiki/命令行界面)和远程执行命令。SSH使用频率最高的场合是[类Unix系统](https://zh.wikipedia.org/wiki/类Unix系统)，但是[Windows](https://zh.wikipedia.org/wiki/Windows)操作系统也能有限度地使用SSH。2015年，微软宣布将在未来的操作系统中提供原生SSH协议支持[[3\]](https://zh.wikipedia.org/wiki/Secure_Shell#cite_note-3)，[Windows](https://zh.wikipedia.org/wiki/Windows) 10 1803版本已提供[OpenSSH](https://zh.wikipedia.org/wiki/OpenSSH)工具[[4\]](https://zh.wikipedia.org/wiki/Secure_Shell#cite_note-4)。

## 使用ssl密钥登陆服务器

#### 第一种，给服务器上，已经存在的，并且可以使用ssh用户名和密码登陆的账户，配置密钥登陆

生成公钥和私钥对：

```bash
# 生成rsa的公钥和私钥
$ ssh-keygen
# 把 ${HOME}/.ssh/id_rsa.pub 文件，上传到 ${HOME}/.ssh/authorized_keys 文件，如果已经存在这个文件，追加公钥
$ ssh-copy-id -i ${HOME}/.ssh/id_rsa example@example.com
```

```bash
# 登陆服务器，
$ ssh example@example
# 修改服务器的/etc/ssh/sshd_config文件，关闭用户名和密码登陆，把PasswordAuthentication yes改为PasswordAuthentication no
$ vim /etc/ssh/sshd_config
# 重启sshd服务
$ sudo systemctl restart sshd
```

### 第二种，在服务器上创建一个新的账户，并且该服务器已经禁用ssh用过用户名密码登陆，这种情况的密钥登陆配置方式

```bash
# 登陆服务器的root账户
$ ssh root@example.com
# 创建账户
$ useradd example
# 设置账户密码
$ passwd example
# 给账户创建.ssh文件夹
$ mkdir /home/example/.ssh
```

客户端这边：

```bash
# 生成rsa密钥对
$ ssh-keygen
# 上传公钥到服务器
$ scp ${HOME}/.ssh/id_rsa.pub root@example.com:/home/example/.ssh/authorized_keys
```

服务器这边：

```bash
# 设置账户专属文件夹，以及该文件夹下所有文件的权限
# 设置所有者
$ chown -R example /home/example
# 添加读写权限
$ chmod -R u+rw /home/example
```

测试账户是否可以登陆

如果登陆成功，可以根据需要，选择是否禁止通过ssh登陆root账户，本人不太喜欢root账户的权限过于开放，这对于服务器来说很危险，服务器配置方式如下：

```bash
# 用root账户进行操作
# 首先把新创建的用户，添加到/etc/sudoers文件，这样新的账户就可以在有需要的时候通过sudo命令申请超级权限
# 文件默认是只读的，临时添加写权限
$ chmod u+w /etc/sudoers
$ vim /etc/sudoers
# 在 root ALL=(ALL)   ALL 下新添加一行
example ALL=(ALL)    ALL
# 编辑/etc/ssh/sshd_config文件，找到: # PermitRootLogin yes，改为 PermitRootLogin no
$ vim /etc/ssh/sshd_config
PermitRootLogin no
# 重启sshd服务
$ sudo systemctl restart sshd
```

验证是否可以登陆root账户

## 使用 SSH 创建隧道

```bash
# 本地端口与远程端口绑定
$ ssh -NCPf example@example.com -L 8080:localhost:8080
# 本地socket文件与远程socket文件绑定
$ ssh -NCPf example@example.com -L example.sock:/home/example/example.sock
```

`example@example.com`就是服务器的账户和地址，-L 的参数参数的格式为：本地的端口或socket文件:远程地址（IP 或域名 + 端口）或socket文件。

