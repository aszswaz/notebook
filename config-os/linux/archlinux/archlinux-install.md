# arch linux安装教程

## 1. 从官网下载 iso 镜像

[archlinux.iso](https://archlinux.org/download/)

本教程使用的iso: archlinux-2021.02.01-x86_64.iso

## 2. 制作一个 U 盘启动盘(本教程是使用 linux 的工具制作，windows 需要自行下载 Rufus 软件，该软件操作很简单，这里不做说明)

1. 将 U 盘插入电脑

2. 查询 U 盘的驱动器代号

```bash
$ sudo fdisk -l
```

得到结果(硬件不一样结果也是不一样的，这里仅贡参考)：

```txt
WARNING: fdisk GPT support is currently new, and therefore in an experimental phase. Use at your own discretion.

Disk /dev/sda: 240.1 GB, 240057409536 bytes, 468862128 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: gpt
Disk identifier: 835A052A-3092-4BE7-871A-48A5A32CFA0C


#         Start          End    Size  Type            Name
 1         2048       411647    200M  EFI System      EFI System Partition
 2       411648      2508799      1G  Microsoft basic 
 3      2508800    468860927  222.4G  Linux LVM

Disk /dev/mapper/centos-root: 53.7 GB, 53687091200 bytes, 104857600 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/centos-swap: 8455 MB, 8455716864 bytes, 16515072 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/centos-home: 176.6 GB, 176622141440 bytes, 344965120 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/sdb: 8053 MB, 8053063680 bytes, 15728640 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x264d4ec2

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1               1     1424023      712011+  ee  GPT
/dev/sdb2   *           0           0           0+   0  Empty

```

通过对比驱动器的大小，我的U盘是8G的大小，`Disk /dev/sdb: 8053 MB`的大小符合，那么我的U盘驱动器代号就是`/dev/sdb`，`/dev/sdb1``/dev/sdb2`是我U盘上的两个分区，需要删除

3. 删除U盘分区

```bash
# 编辑U盘
$ sudo fdisk /dev/sdb
```

控制台输出：

```txt
Welcome to fdisk (util-linux 2.23.2).

Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): 
```

fidsk的指令解释：本步骤主要用到的有三个指令：q（展示驱动器的分区），d(删除分区)，w(写出分区修改，并退出程序)

所有操作如下：

```txt
Command (m for help): p # 输入指令p展示分区

Disk /dev/sdb: 8053 MB, 8053063680 bytes, 15728640 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x264d4ec2

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1               1     1424023      712011+  ee  GPT
/dev/sdb2   *           0           0           0+   0  Empty

Command (m for help): d # 指令删除分区
Partition number (1,2, default 2): 1 # 1表示分区/dev/sdb1分区
Partition 1 is deleted

Command (m for help): d
Selected partition 2 # 由于1已经被删除，只剩下/dev/sdb2，那么再次执行d指令，会直接删除/dev/sdb2
Partition 2 is deleted

Command (m for help): w # 保存改动
The partition table has been altered!

Calling ioctl() to re-read partition table.

WARNING: Re-reading the partition table failed with error 16: Device or resource busy.
The kernel still uses the old table. The new table will be used at
the next reboot or after you run partprobe(8) or kpartx(8)
Syncing disks.
```

4. 把iso镜像写入U盘

```bash
# if是iso镜像路径，of是输出的驱动器（这里指U盘）
$ sudo dd if=archlinux-2021.02.01-x86_64.iso of=/dev/sdb
```

等待镜像写入完成，整个过程为几分钟到几十分钟不等

## 2. 将U盘插入目标电脑，目标电脑以U盘启动系统

这里以华硕 U4000U电脑为例，电脑的电源启动后，一直按Esc键，直到屏幕出现：

```txt
                                 Please select boot device:
Windows Boot Manager(P2:Micron_1100_MTFDDAV256TBN) # 我早已完全卸载windows系统，尝试过在BIOS删除这个启动项，但是不知道为啥不行，删除了也会自动出现
UEFI: 5.00,Partition 2 # 这个就是我的U盘启动项，不同的设备和不同的U盘格式化软件，可能会造成名称不一样
Enter Setup # 进入BIOS完整菜单
```

操作方向键，选择UEFI，回车

之后会出现选项：

```txt
Arch Linux install medium (x86_64, UEFI)
Arch Linux install medium (x86_64, UEFI) with speech
EFI Shell
Reboot Into Firmware Interface
```
选择`Arch Linux install medium (x86_64, UEFI)`，回车

如果看到`Welcome to Arch Linux`说明系统加载成功，等待一段事时间后，会出现`root@archiso ~ # `以及一个光标不停的闪烁，到这里U盘系统就启动成功

## 3. 连接 wifi 无线网络

1. 连接网络

```bash
$ iwctl # 启动wifi连接程序
[iwd]# station list # 查看无线网卡
                  Devices in Station Mode
--------------------------------------------------------
  Name        State          Scanning
--------------------------------------------------------
  wlan0      disconnected

[iwd]# station wlan0 scan # 命令无线网卡扫描无线网络
[iwd]# station wlan0 get-networks # 获取扫描结果
           Available networks
--------------------------------------------------------
    Network  name              Security Signal
--------------------------------------------------------
   wangxiaoming                psk      ******
   360**WIFI-11                psk      ******           # 这个带有中文，所以中文部分无法现实
[iwd]# station wlan0 connect wangxiaoming # 指定无线网卡设备，连接无线wifi
type the network passphrase for wangxiaoming psk.
Passphrase: ********                                     # 输入wifi密码
[iwd]# station wlan0 show                               # 查看连接状态
                     Station: wlan0
-------------------------------------------------------
  Settable Property            Value
-------------------------------------------------------
   Scanning                    no
   State                       connected                # 连接成功
   Connected  network          wangxiaoming
[iwd]# exit                                             # 退出程序
root@arch ~ # ping www.baidu.com                        # 检查网络连通性
```

2. 设置时间

```bash
$ timedatectl set-ntp true
$ timedatectl set-timezone Asia/Shanghai
```

## 4. 电脑的磁盘进行分区，给安装系统做准备

1. 查看电脑分区列表

```bash
$ fdisk -l
Disk /dev/sda 230.47GB ...
```

2. 清理硬盘中的分区（如果是双系统安装，只要清理出来一块空闲空间即可，这里是单系统安装，所以直接删除全部分区）

```bash
$ fdisk /dev/sda # 编辑硬盘，这个不能乱选，需要把操作系统安装到哪一个硬盘，就编辑哪一个硬盘，查询硬盘代号请看上一步
# 删除分区
Command (m for help): d # 删除分区，单系统安装：删除所有分区，有几个分区，就删除几次。
Fartition number (1,2,3,4, default 4): # 输入分区对应的数字，删除分区，也可以直接回车
```

3. 新建分区

```bash
# 新建分区，新建四个分区：uefi、swap、/、home
# 新建UEFI分区
Commadn (m for help): n # 新建分区
Fartition number (1-128, default 1): # 输入新的分区对应的数字，范围是1~128，或者直接回车，默认也可
First sector (2078-500118158, default 2048): # 输入分区开始位置，没有特殊需求直接默认即可
Last sector, +/-sectors or +/-size(K,M,G,T,P) (2048-500118158, default 500118158): +512M # 新建一个分区，大小为512M，这个是作为UEF分区，大小不建议小于512M，也不建议过大

# 新建boot分区
Commadn (m for help): n
Fartition number (2-128, default 2): # 输入新的分区对应的数字，范围是1~128，或者直接回车，默认也可
First sector (1050624-500118158, default 1050624): # 输入分区开始位置，没有特殊需求直接默认即可
Last sector, +/-sectors or +/-size(K,M,G,T,P) (1050624-500118158, default 500118158): +1G # 建议大小1G

# 新建swap分区
Commadn (m for help): n
Fartition number (3-128, default 3): # 输入新的分区对应的数字，范围是1~128，或者直接回车，默认也可
First sector (314776-500118158, default 314776): # 输入分区开始位置，没有特殊需求直接默认即可
Last sector, +/-sectors or +/-size(K,M,G,T,P) (314776-500118158, default 500118158): +24G # 内存不足时使用的交换空间，等于内存两倍

# 新建tmp分区
Commadn (m for help): n
Fartition number (4-128, default 4): # 输入新的分区对应的数字，范围是1~128，或者直接回车，默认也可
First sector (1050624-500118158, default 1050624): # 输入分区开始位置，没有特殊需求直接默认即可
Last sector, +/-sectors or +/-size(K,M,G,T,P) (1050624-500118158, default 500118158): +5G # 5G即可

# 新建系统主分区
Commadn (m for help): n
Fartition number (5-128, default 5): # 输入新的分区对应的数字，范围是1~128，或者直接回车，默认也可
First sector (11536384-500118158, default 11536384): # 输入分区开始位置，没有特殊需求直接默认即可
Last sector, +/-sectors or +/-size(K,M,G,T,P) (11536384-500118158, default 500118158): +100G # 大小随便指定，不超过物理上限就行

# 新建home分区，这个分区可以不要，不过为了备份方便，以及保护文件不受系统崩溃的影响，还是建一个分区比较好
Commadn (m for help): n
Fartition number (6-128, default 6): # 输入新的分区对应的数字，范围是1~128，或者直接回车，默认也可
First sector (221251504-500118158, default 221251504): # 输入分区开始位置，没有特殊需求直接默认即可
Last sector, +/-sectors or +/-size(K,M,G,T,P) (221251504-500118158, default 500118158): # 直接回车，使用剩余的空间建立分区

Command (m for help): w # 保存分区更改
```

如果遇到`Do you want to remove the signature? [Y]es/[N]o: `，没事，这是在询问是否覆盖旧的分区，直接输入`Y`确认即可。

4. 格式化分区

我新建的分区表，是这样的：

| ---- 分区号 ----- | ------- 预计挂载点 ------- |
| -----------------| -------------------------|
|  /dev/sda1       |         UEFI             |
|  /dev/sda2       |         /boot            |
|  /dev/sda3       |         swap交换空间      |
|  /dev/sda4        |         /tmp            |
|  /dev/sda5       |         /（系统目录）      |
|  /dev/sda6       |         /home(用户目录)   |

首先格式化UEFI，以FAT32模式格式化

```bash
$ mkfs.fat -F 32 /dev/sda1
```

格式化swap

```bash
$ mkswap /dev/sda2
```

格式化/boot、/tmp、/、/home

```bash
$ mkfs.ext4 /dev/sda2
$ mkfs.ext4 /dev/sda4
$ mkfs.ext4 /dev/sda5
$ mkfs.ext4 /dev/sda6
```

查看是否格式化成功

```bash
$ lsblk -f
```

## 5. 挂载分区

1. 挂载 swap 分区

```bash
$ swapon /dev/sda3
```

2. 挂载系统分区到 /mnt 目录

```bash
$ mount /dev/sda5 /mnt
```

4. 切换目录

```
$ cd /mnt
```

3. 挂载UEFI分区

```bash
$ mkdir efi
$ mount /dev/sda1 efi
```

4.  挂载home分区

```bash
$ mkdir home
$ mount /dev/sda6 home
```

5. 挂载tmp

```bash
$ mkdir tmp
$ mount /dev/sda4 /tmp
```

6. 挂载boot

```bash
$ mkdir boot
$ mount /dev/sda2 boot
```

## 6. 分区准备就绪，开始安装系统，以及基本工具包

```bash
$ pacstrap /mnt base linux linux-firmware vim iwd man-db man-pages texinfo
```

## 7. 配置系统

1. Fstab

用以下命令生成 fstab 文件 (用 -U 或 -L 选项设置UUID 或卷标)：

```bash
$ genfstab -U /mnt >> /mnt/etc/fstab
```

官方强烈建议在执行完以上命令后，后检查一下生成的 /mnt/etc/fstab 文件是否正确。不过我是看不出来什么问题的

2. Chroot

Change root(就是变更当前进程及其子进程的可见根路径。变更后，程序无法访问可见根目录外文件和命令。) 到新安装的系统：

```bash
$ arch-chroot /mnt
```

3. 时区

设置时区

```bash
$ ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

运行 hwclock 以生成 /etc/adjtime：

```bash
$ hwclock --systohc
```

4. 本地化

本地化的程序与库若要本地化文本，都依赖 Locale，后者明确规定地域、货币、时区日期的格式、字符排列方式和其他本地化标准。

需在这两个文件设置：locale.gen 与 locale.conf。

编辑/etc/locale.gen 然后移除需要的 地区 前的注释符号 #。

接着执行 locale-gen 以生成 locale 信息：

```bash
$ vim /etc/locale.gen
# 找到zh_CN.UTF-8 去除‘#’

$ locale-gen # 生成local信息
$ vim /etc/locale.conf
# 输入“LANG=en_GB.UTF-8”，不推荐在此设置任何中文 locale，会导致控制台乱码。
$ vim /etc/vconsole.conf # 设置键盘按键
# 输入“KEYMAP=de-latin1”
```

4. 网络配置

创建 hostname 文件:

```bash
$ echo "myhostname" >> /etc/hostname
```

添加对应的信息到 hosts(5):

```bash
$ vim /etc/hosts
127.0.0.1	localhost
::1		localhost
127.0.1.1	myhostname.localdomain	myhostname
# 如果系统有一个永久的 IP 地址，请使用这个永久的 IP 地址而不是 127.0.1.1。

5. 设置root密码

​```bash
passwd
```

## 8. 安装引导程序

1. 安装grub，和UEFI编辑器

```bash
$ pacman -Sy grub efibootmgr
```

2. 更换UEFI挂载点到esp

```bash
$ umount /efi
$ mkdir /esp
$ mount /dev/sda1 /esp
$ rm -r /efi
```

3. 安装启动引导项

```bash
$ grub-install --target=x86_64-efi --efi-directory=esp --bootloader-id=GRUB 
```

上述安装完成后 GRUB 的主目录将位于 /boot/grub/。注意上述例子中，grub-install 还将在固件启动管理器中创建一个条目，名叫 GRUB。

```txt
提示： 如果你使用了 --removable 选项，那 GRUB 将被安装到 esp/EFI/BOOT/BOOTX64.EFI （当使用 i386-efi 时是 esp/EFI/BOOT/BOOTIA32.EFI），此时即使 EFI 变量被重设或者你把这个驱动器接到其他电脑上，你仍可从这个驱动器上启动。通常来说，你只要像操作 BIOS 设备一样在启动时选择这个驱动器就可以了。如果和 Windows 一起多系统启动，注意 Windows 通常会在那里安装一个 EFI 可执行程序，这只是为了重建 Windows 的 UEFI 启动项。
```

上面的提示是官网的原话，暂时还没试过

4. 生成 grub.cfg

安装后,需要生成主配置文件 /boot/grub/grub.cfg。

```bash
$ grub-mkconfig -o /boot/grub/grub.cfg
```

如果想要自动为其他操作系统添加条目，请见[官网-探测其他操作系统](https://wiki.archlinux.org/index.php/GRUB_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)#%E6%8E%A2%E6%B5%8B%E5%85%B6%E4%BB%96%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F), 如要参考自定义菜单条目的例子，请看[官网-启动菜单条目示例](https://wiki.archlinux.org/index.php/GRUB_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)#%E5%90%AF%E5%8A%A8%E8%8F%9C%E5%8D%95%E6%9D%A1%E7%9B%AE%E7%A4%BA%E4%BE%8B)

## 9. 基本系统安装完毕，进行善后工作

1. 退出Chroot状态

```bash
$ exit
```

2. 卸载`/mnt`下所有分区

```bash
$ cd / # 退出`/mnt`目录
$ umount -R /mnt # 卸载所有`/mnt`分区
```

3. 重启电脑，并拔出U盘

```bash
$ reboot
```

## 10. 配置网络

1. 登陆系统

```bash
archlinux login: root
Password: 
```

2. 建立网络连接

```bash
# 启动无线服务
$ systemctl start iwd
# 设置无线服务开机自启动
$ systemctl enable iwd
# 连接无线网络
$ iwctl
# 查看无线网卡列表
[iwd] station list
......
wlan0
......
# 使用wlan0网卡扫描无线网
[iwd] station wlan0 scan
wangxiaoming
........
# 连接wifi，需要输入wifi密码
[iwd] station wlan0 connection wangxiaoming
[iwd] exit
# 配置网络服务使用的网卡接口
$ vim /etc/systemd/network/25-wireless.network
[Match]
Name=wlan0

[Network]
DHCP=ipv4

# 启动网络服务
$ systemctl start systemd-networkd
$ systemctl enable systemd-networkd
# 启动域名解析服务
$ systemctl start systemd-resolved
$ systemctl enable systemd-resolved
# 验证网路连通
$ ping www.baidu.com
```

## 11. 创建普通用户，用于平时使用

1. 安装sudo

```bash
$ pacman -Sy sudo
```

2. 创建用户

```bash
$ useradd -m username
```

3. 添加到root用户组

```bash
$ gpasswd -a username root
```

4. 添加密码

```bash
$ passwd username
```

5. 添加可申请超级模式的权限

```bash
# 设置/etc/sudoers文件的权限，该文件本来只有只读权限，
# 设置文件所有者为root
$ chown root /etc/sudoers
# 设置文件权限为：拥有者，可读写文件
$ chmod u+rw /etc/sudoers
$ vim /etc/sudoers
# 在root下面添加用户
root ALL=(ALL) ALL
username ALL=(ALL) ALL
```

## 12. 启用早期微码

微码：
处理器制造商发布对处理器微码的稳定性和安全性更新。这些更新提供了对系统稳定性至关重要的错误修复。如果没有这些更新，您可能会遇到不明原因的崩溃或难以跟踪的意外停机。

使用 AMD 或 Intel CPU 的用户都应该安装这些微代码更新，以确保系统稳定性。

通常主板的固件会包含微代码更新，并在初始化时使用最新的微代码版本。但是 OEM 可能无法给所有机型提供及时的最新固件，所以 Linux 内核提供了启动时应用最新微代码的功能。Linux microcode 加载器 支持三种加载方式：

早期加载 在非常早的启动阶段生效，比 initramfs 阶段还早，所以是推荐的方式，如果 CPU 有严重的硬件问题时尤其如此，比如 Intel Haswell 和 Broadwell 处理器。
后期加载 在启动后生效，有时这个时间太晚了，因为 CPU 可能已经执行了有问题的指令集。即使已经启用了早加载，晚加载依然有价值，可以让系统不重启的时候也应用到最新的微代码更新。
内置微代码 可以编译到内核中，在启动的早期阶段应用。.

1. 根据 cpu 厂商安装对应微码包（以 intel 为例）

```bash
$ pacman -Sy intel-ucode
```

2. 重新生成 grub.cfg

grub-mkconfig 会自动发现微码更新并更新 GRUB 配置信息。安装微码软件包后，重新生成GRUB 配置以激活更新：

```bash
$ grub-mkconfig -o /boot/grub/grub.cfg
```

## 13. 安装 gnome 图形界面

X.Org 项目提供了 X 窗口系统的开源实现。开发工作是在 freedesktop.org 社区的通力合作下完成。Xorg （通常简称为 X）在 Linux 用户中非常流行，已经成为图形用户程序的必备条件，所以大部分发行版都提供了它。

1. 显卡驱动安装

```bash
# 查看显卡型号
$ lspci | grep -e VGA -e 3D
```

以Nvidia显卡为例

```bash
$ pacman -Sy nvidia
```

2. 重启计算机

```bash
$ reboot
```

6. 安装gnome图形界面

```bash
# 安装基本桌面
$ pacman -S gnome
# 这个不是必须的，只是一些gnome的工具包和小游戏
$ pacman -S gnome-extra
# 启动gdm
$ systemctl enable gdm
$ systemctl start gdm
```
