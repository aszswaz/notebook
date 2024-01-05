# 简介

在 Manjaro 中使用 pacman 和 archlinux 中的 pacman 有一点区别，需要进行额外的配置。

# 软件源配置

```bash
# 设置中国的源
$ sudo pacman-mirrors -i -c China -m rank # 之后会弹出框,进行选择即可
#更新系统软件
$ sudo pacman -Syu
```

manjaro 的软件仓库更新要比 archlinux 的软件仓库慢一些，可以考虑添加 archlinuxcn 源

```bash
$ sudo nvim /etc/pacman.conf
[archlinuxcn]
SigLevel = TrustAll
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
# 更新软件密钥
$ sudo pacman -S archlinuxcn-keyring
```

# 更新镜像源

在滚动更新的时候，有可能会遇到软件开发已发布最新版本，但目前使用的镜像源还没有同步的情况，比如 manjaro-mirrors 的更新失败：

```bash
$ sudo pacman -Syyu
:: Synchronizing package databases...
 core                                                                            159.8 KiB  1141 KiB/s 00:00 [################################################################] 100%
 extra                                                                          1834.7 KiB  6.11 MiB/s 00:00 [################################################################] 100%
 community                                                                         7.5 MiB  6.85 MiB/s 00:01 [################################################################] 100%
 multilib                                                                        167.0 KiB  3.47 MiB/s 00:00 [################################################################] 100%
:: Starting full system upgrade...
:: Replace pacman-mirrors with core/manjaro-mirrors? [Y/n] Y
resolving dependencies...
looking for conflicting packages...

Packages (4) libpamac-11.4.1-3  manjaro-mirrors-4.23.2+2+g2f58b3c-2  pacman-6.0.2-6  pacman-mirrors-4.23.2-2 [removal]

Total Download Size:    0.15 MiB
Total Installed Size:   9.07 MiB
Net Upgrade Size:      -0.05 MiB

:: Proceed with installation? [Y/n] Y
:: Retrieving packages...
 manjaro-mirrors-4.23.2+2+g2f58b3c-2-any.pkg.tar.xz failed to download
error: failed retrieving file 'manjaro-mirrors-4.23.2+2+g2f58b3c-2-any.pkg.tar.xz' from mirror.nju.edu.cn : The requested URL returned error: 404
error: failed retrieving file 'manjaro-mirrors-4.23.2+2+g2f58b3c-2-any.pkg.tar.xz' from mirrors.huaweicloud.com : The requested URL returned error: 404
error: failed retrieving file 'manjaro-mirrors-4.23.2+2+g2f58b3c-2-any.pkg.tar.xz' from mirrors.sjtug.sjtu.edu.cn : The requested URL returned error: 404
warning: failed to retrieve some files
error: failed to commit transaction (failed to retrieve some files)
Errors occurred, no packages were upgraded.
```

这时就需要把当前使用的镜像源更改为有最新镜像的镜像源，操作方式如下：

```bash
# 获取当前国家中，有最新镜像的镜像源，将其设置为当前使用的镜像源
$ sudo pacman-mirrors -f
::INFO Downloading mirrors from Manjaro
::INFO => Mirror pool: https://repo.manjaro.org/mirrors.json
::INFO => Mirror status: https://repo.manjaro.org/status.json
::INFO Using custom mirror file
::INFO Querying mirrors - This may take some time
  0.329 China          : https://mirrors.sjtug.sjtu.edu.cn/manjaro/
::INFO Writing mirror list
::China           : https://mirrors.sjtug.sjtu.edu.cn/manjaro/stable/$repo/$arch
::INFO Mirror list generated and saved to: /etc/pacman.d/mirrorlist
```

