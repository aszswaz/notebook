### linux

从[官网](https://mirrors.edge.kernel.org/pub/software/scm/git/)下载git源码, 例如git-2.9.5.tar.gz

```bash
$ yum install perl-devel # 安装git依赖的编译环境
$ make configure# 初始化make配置
$ ./configure prefix=/usr/local/git/ # 配置git安装目录
$ make && make install  # 编译并且安装
$ vim /etc/profie # 添加环境变量
export GIT=/usr/local/git
export PATH=.:$PATH:$GIT/bin
$ source /etc/profile # 加载配置的环境变量
$ git version # 查看git版本
```

