# 简介

fedora 系列 Linux 发行版的软件包管理系统介绍

# dnf

dnf 是 fedora 的新一代软件包管理器，以前的软件包管理器是 yum，在大多数 fedora 发行版中，通常将 yum 软连接到 dnf。这里主要介绍 dnf 的一些常见操作。

安装一个软件仓库，由于 CentOS 默认软件仓库中的软件包版本比较旧，通常都要启用 epel 源，因此这里以 [epel-release](https://packages.fedoraproject.org/index.html) 为例：

```bash
$ sudo yum install epel-release -y
$ sudo yum config-manager --enable epel
```

其他的一些操作：

```bash
# 更新系统中的软件包
$ sudo yum update
# 搜索软件包
$ yum search fish
# 查看已安装的软件包
$ yum list installed
$ yum list install fish
# 查看软件包的详细信息
$ yum info fish
# 查看软件包的依赖
$ yum deplist fish
```

# 构建 RPM 软件包

以 GCC 为例，使用 GCC 源码构建一个 GCC 软件包。

首先是准备构建环境

```bash
# 安装软件包构建工具
$ sudo dnf install rpmdevtools rpmlint
# 创建用于构建软件包的用户和目录
$ sudo useradd -m -r -s /bin/fish rpmbuild
$ sudo -u rpmbuild -i
# 创建一个 $HOME/rpmbuild 文件夹
$ rpmdev-setuptree
```

