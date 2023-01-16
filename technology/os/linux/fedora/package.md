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
$ sudo useradd -m -s /bin/fish rpmbuild
$ sudo -u rpmbuild -i
# 创建一个 $HOME/rpmbuild 文件夹
$ rpmdev-setuptree
```

此时在 $HOME/rpmbuild 目录中会生成四个目录：

| 目录    | 说明                                                         |
| ------- | ------------------------------------------------------------ |
| BUILD   | 编译软件时临时存储文件的地方，可以存放软件的源码和得到的可执行文件。 |
| RPMS    | 构建得到的软件包存放在该目录下                               |
| SOURCES | 构建软件包所需的资源，比如源码的压缩包                       |
| SPECS   | 存放软件包构建脚本的地方                                     |
| SRPMS   | 存放 .src.rpm 包的目录                                       |

开始编写打包脚本：

```bash
# 创建一个打包脚本
$ rpmdev-newspec demo -o SPECS/demo.spec
```

以打包 v2ray 软件为例：

```bash
Name:           v2ray-server
Version:        v5.2.1
Release:        1%{?dist}
Summary:        A unified platform for anti-censorship.

License:        MIT
URL:            https://github.com/v2fly/v2ray-core

BuildRequires:  go
Requires:       glibc

%description
A unified platform for anti-censorship.

# 编译程序前，先准备好源代码和依赖项
%prep
BUILD_DIR="%{_builddir}/${RPM_PACKAGE_NAME}"
if [[ -d "$BUILD_DIR" ]]; then
    cd "$BUILD_DIR"
    git checkout master
    git pull --all --tags
else
    git clone https://github.com/v2fly/v2ray-core.git "$BUILD_DIR"
    cd "$BUILD_DIR"
    git checkout -b "${RPM_PACKAGE_VERSION}"
fi
go mod download

# 声明软件包中的文件
%files
%{_bindir}/v2ray
/usr/lib/systemd/system/v2ray.service
/etc/v2ray
/etc/firewalld/services/v2ray.xml
/var/log/v2ray

# 编译程序
%build
cd "%{_builddir}/${RPM_PACKAGE_NAME}"
go build -o "%{_builddir}/v2ray" -trimpath -ldflags "-s -w -buildid=" ./main

# 准备软件包中的文件
%install
mkdir -m755 -p "$RPM_BUILD_ROOT/var/log/v2ray"
mkdir -m755 -p "$RPM_BUILD_ROOT/%{_bindir}"
mkdir -m755 -p "$RPM_BUILD_ROOT/usr/lib/systemd/system"
mkdir -m755 -p "$RPM_BUILD_ROOT/etc/v2ray"
mkdir -m755 -p "$RPM_BUILD_ROOT/etc/firewalld/services"

SOURCE_DIR="%{_sourcedir}/${RPM_PACKAGE_NAME}"
install -m755 "%{_builddir}/v2ray"          "$RPM_BUILD_ROOT/%{_bindir}/v2ray"
install -m644 "$SOURCE_DIR/v2ray.service"   "$RPM_BUILD_ROOT/usr/lib/systemd/system/v2ray.service"
install -m644 "$SOURCE_DIR/config.json"     "$RPM_BUILD_ROOT/etc/v2ray/config.json"
install -m644 "$SOURCE_DIR/server.crt"      "$RPM_BUILD_ROOT/etc/v2ray/server.crt"
install -m644 "$SOURCE_DIR/ca.crt"          "$RPM_BUILD_ROOT/etc/v2ray/ca.crt"
install -m644 "$SOURCE_DIR/server.key"      "$RPM_BUILD_ROOT/etc/v2ray/server.key"
install -m644 "$SOURCE_DIR/ca.key"          "$RPM_BUILD_ROOT/etc/v2ray/ca.key"
install -m644 "$SOURCE_DIR/firewall.xml"    "$RPM_BUILD_ROOT/etc/firewalld/services/v2ray.xml"

# 软件包安装前的钩子
%pre
# $1 为 1 表示用户正在安装软件包，$1 为 2 表示用户正在更新软件包
if [ $1 == 1 ]; then
    echo -e "\033[92mStart installing packages...\033[0m"
elif [ $1 == 2 ]; then
    echo -e "\033[92mStart updating packages...\033[0m"
fi

# 软件包安装后的钩子
%post
if [ $1 == 1 ]; then
    # 设置文件夹和文件权限
    chown nobody /var/log/v2ray

    firewall-cmd --permanent '--new-service-from-file=/etc/firewalld/services/v2ray.xml' '--name=v2ray' >>/dev/null
    firewall-cmd --permanent '--add-service=v2ray' >>/dev/null
fi
firewall-cmd --reload >>/dev/null

# 删除软件包之前
%preun
# $1 为 0 表示用户正在卸载软件包，$1 为 1 表示用户正在更新软件包
if [ $1 == 0 ]; then
    echo -e "\033[93mUninstalling package...\033[0m"
    systemctl stop v2ray
    systemctl disable v2ray
elif [ $1 == 1 ]; then
    echo -e "\033[93mUninstalling old packages...\033[0m"
fi

# 删除软件包后的钩子
%postun
systemctl daemon-reload
if [ $1 == 0 ]; then
    firewall-cmd --permanent '--remove-service=v2ray' >>/dev/null
fi
firewall-cmd --reload >>/dev/null
```

最后，开始构建软件包：

```bash
# 安装 spec 文件中 BuildRequires 和 Requires 声明依赖的软件包
$ sudo dnf builddep SPECS/demo.spec
# 构建二进制软件包
$ rpmbuild -bb SPECS/demo.spec
```

