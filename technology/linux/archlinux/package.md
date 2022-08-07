# 简介

archlinux 使用 [pacman](https://wiki.archlinux.org/title/pacman) 作为包管理器

# pacman

```bash
# 安装指定软件包
$ sudo pacman -S xxx
# 先更新软件源再安装
$ sudo pacman -Sy xxx
# 非显式安装软件包，通常是从 aur 安装软件包的时候，安装所需的依赖项，比如安装 mysql 8.0.29 软件包的依赖项
$ pacman -S --asdeps rpcsvc-proto libfido2 rapidjson
# 从软件镜像仓库查找软件包
$ pacman -Ss xxx
# 查找本地已经安装的软件
$ pacman -Qs xxx
# 单个删除软件包
$ sudo pacman -R xxx
# 批量删除软件包，以ibus为例， 同时删除ibus和ibus-pinyin
$ sudo pacman -Rc ibus
# 删除作为其他软件包的依赖，但已经不需要的软件包
$ sudo pacman -Rc $(pacman -Qdtq)
# 从官方镜像列表中获取200个最近同步过的源，并对这200个源进行大文件下载来，根据在你电脑里的下载速度进行排序，写入mirrorlist
$ reflector --verbose -l 200 -p http --sort rate --save /etc/pacman.d/mirrorlist
```

## 删除gpg密钥

以sublime为例：

```bash
# 查找sublime gpg的密钥序列号
$ pacman-key --list-keys > gpg.keys
# 使用vim在gpg.keys文件中，sublime作为关键词，查找sublime gpg的序列号
$ vim gpg.keys
# 指定序列号，删除gpg的key
$ sudo pacman-keys -d 1EDDE2CDFC025D17F6DA9EC0ADAE6AD28A8F901A
# 删除/etc/pacman.conf文件中的sublime仓库
$ vim /etc/pacman-conf
# 同步数据库
$ sudo pacman -Sy
# 查看删除结果
$ pacman-key --list-keys
```

# makepkg

简单使用：

```bash
# 通过 makepkg 安装 aur 仓库中的软件包
$ git clone https://aur.archlinux.org/mysql.git
$ cd mysql
# -s：安装 PKGBUILD 文件中所声明的依赖项
# -i：软件包构建成功后，使用 pacman 安装软件包
$ makepkg -s -i
```

## PKGBUILD

PKGBUILD 文件是 makepkg 工具的软件包打包脚本，用户可以通过编写该脚本，自行构建软件包。用户可以通过 `man PKGBUILD` 命令查看 PKGBUILD 的手册。

以构建 coredns 的软件包为例：

PKGBUILD：

```PKGBUILD
# 软件包的名称
pkgname=coredns
# 软件包的描述信息
pkgdesc="a DNS server"
# 软件包的版本
pkgver=v1.9.3
# 软件包当前版本的发布序列号
pkgrel=1
# 项目地址
url=https://github.com/coredns/coredns
# 系统架构
arch=(x86_64)
# 构建软件包所需的文件，makepkg 会自动通过 curl 进行下载并解压
source=('coredns.tar.gz::https://github.com/coredns/coredns/releases/download/v1.9.3/coredns_1.9.3_linux_amd64.tgz')
# source 中，文件的签名，顺序要正确，这是一一对应的，可以通过 makepkg -g 快速生成
sha256sums=('d0d5be374b4d28f63289ffef8a38559bf006ab05865f2bf8b0ac9f27c17f96db')
# 更新软件包时，需要保留的文件，路径的第一个字符不可以是“/”
backup=('etc/coredns/Corefile')
# 安装、更新和删除软件包时执行的脚本，需要放置在 PKGBUILD 的同一目录，脚本详细信息请参见下方 coredns.install 文件
install=$pkgname.install

# 软件包的打包函数
package() {
    mkdir -p "$pkgdir/usr/bin" && cp coredns "$pkgdir/usr/bin"
    mkdir -p "$pkgdir/etc/coredns" && cp Corefile "$pkgdir/etc/coredns"
    mkdir -p "$pkgdir/usr/lib/systemd/system" && cp coredns.service "$pkgdir/usr/lib/systemd/system"
}
```

coredns.install：

```sh
# 在用户安装软件包时，包内文件解压之前执行
# arg 1:  软件包的版本
pre_install() {
}

# 在用户安装软件包时，包内文件解压之后执行
# arg 1:  软件包的版本
post_install() {
    systemctl daemon-reload
    systemctl enable coredns
}

# 在用户更新软件包时，包内文件解压之前执行
# arg 1:  新的软件包的版本
# arg 2:  旧的软件包的版本
pre_upgrade() {
    systemctl stop coredns
}

# 在用户更新软件包时，包内文件解压之后执行
# arg 1:  新的软件包的版本
# arg 2:  旧的软件包的版本
post_upgrade() {
    systemctl daemon-reload
    systemctl start coredns
}

# 在用户卸载软件包时，软件包被删除之前执行
# arg 1:  旧的软件包的版本
pre_remove() {
    systemctl stop coredns
    systemctl disable coredns
}

# 在用户卸载软件包时，软件包被删除之后执行
## arg 1:  旧的软件包的版本
post_remove() {
}
```

