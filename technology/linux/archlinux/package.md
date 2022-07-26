# archlinux 包管理器

## pacman

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

### 删除gpg密钥

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

## makepkg

```bash
# 通过 makepkg 安装 aur 仓库中的软件包
$ git clone https://aur.archlinux.org/mysql.git
$ cd mysql
# -s：安装 PKGBUILD 文件中所声明的依赖项
# -i：软件包构建成功后，使用 pacman 安装软件包
$ makepkg -s -i
```

