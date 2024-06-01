# Git

## git mode change

git 在记录文件的同时，也会记录文件的可执行权限。

演示操作如下：

初始化一个仓库

```bash
$ touch demo.txt
$ git init
$ git add -A
$ git commit -m "demo"
```

赋予文件可执行权限：

```bash
$ chmod u+x demo.txt
```

查看git

```bash
$ git status
```

```txt
位于分支 master
尚未暂存以备提交的变更：
  （使用 "git add <文件>..." 更新要提交的内容）
  （使用 "git restore <文件>..." 丢弃工作区的改动）
        修改：     demo.txt

修改尚未加入提交（使用 "git add" 和/或 "git commit -a"）
```

```bash
$ git diff demo.txt
```

```txt
diff --git a/demo.txt b/demo.txt
old mode 100644
new mode 100755
```

**解决办法**

禁用文件可执行权限的记录

```bash
$ git config --global core.fileMode
```

<span style="color: red">如果无效，可能是仓库本身的 git config 覆盖了 git config --global</span>

## 配置代理

由于国内访问github很慢，需要对github进行翻墙，首先是配置http/https代理

```bash
# 只对github进行代理，其他不代理
$ git config --global https.https://github.com.proxy socks5h://192.168.0.119:10808
$ git config --global http.https://github.com.proxy socks5h://192.168.0.119:10808
```

socks5h是把域名解析的工作交给代理服务器，防止DNS污染

配置ssh代理：

```bash
# 编辑ssh配置文件
$ vim ~/.ssh/config
Host github.com
    ProxyCommand=nc -X 5 -x 192.168.0.119:10808 %h %p
```

ssh的代理需要安装netcat，archlinux安装步骤请参阅：[utils](../utils.md#netcat（nc）)

## diff

对比不同分支的差异

```bash
# 查看两个分支之间有差异的文件，a是基准分支，a分支有的代码，而b分支没有的代码，行首显示“-”，字体为红色，也就是被git认为是已经删除的代码。b分支有的，a分支没有的，会被git认为是新增的代码
$ git diff a b --stat
# 查看两个分支指定的文件的差异
$ git diff a b src/main/java/com/demo.java
# 查看两个分支所有的差异
$ git diff a b
```

