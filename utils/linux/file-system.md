# 查找文件所在路径

```bash
$ find ${path} -type f -iname '*.log'
```

path：查找的目录

-type：指定文件类型，比如 f 表示查找文件，而不是文件夹

-iname：使用正在表达式匹配文件名，同时忽略大小写，-name 也是查找文件名，但是不忽略大小写

# 搜索文件内容

```bash
$ grep 'demo' demo.log
```

grep可使用正则表达式搜索文件的内存

# find 和 grep 搭配使用

```bash
$ find ${path} -type f | xargs grep 'demo'
```

xargs会把find的查找结果，当作参数传输给grep，

但是以上方式不能查找文件名或者路径当中带有空格的文件，需要改称如下形式

```bash
$ find ${path} -type f -print0 | xargs -0 grep 'demo'
```

find 把空格替换为 null，xargs 对 null 进行处理

# 展示文件目录结构

```bash
# 安装软件包，tree，这里以archlinux为例
$ sudo pacman -S tree
$ tree src
src
└── zhong
    └── demo
        ├── DemoEntity.java
        └── Main.java

2 directories, 2 files
```

# 查看指定的文件或者文件夹的磁盘使用空间

```bash
$ du -h --max-depth=1 ${path}
```

**--max-depth**：递归的深度, 1为当前层

**${path}**：指定的文件或文件夹的路径

示例：

```shell
du -h --max-depth=1 logs
```

输出结果

```shell
16M     logs
```

# 磁盘

## 修改磁盘分区名称

根据不同的分区格式，使用不同的工具修改卷的标签（名称）

```bash
# swap，所属工具包：util-linux
$ swaplabel -L "new label" /dev/XXX
# ext2/3/4，所属工具包：e2fsprogs
$ e2label /dev/XXX "new label"
# btrfs，所属工具包：btrfs-progs
$ btrfs filesystem label /dev/XXX "new label"
# reiserfs，所属工具包：reiserfsprogs
$ reiserfstune -l "new label" /dev/XXX
# jfs，所属工具包：using jfsutils
$ jfs_tune -L "new label" /dev/XXX
# xfs，所属工具包：xfsprogs
$ xfs_admin -L "new label" /dev/XXX
# fat/vfat，所属工具包：dosfstools
$ fatlabel /dev/XXX "new label" 
# exfat，所属工具包：exfatprogs
$ exfatlabel /dev/XXX "new label" using exfatprogs
# ntfs，所属工具包：ntfs-3g
$ ntfslabel /dev/XXX "new label"
# udf，所属工具包：udftools
$ udflabel /dev/XXX "new label"
# crypto_LUKS (LUKS2 only)，所属工具包：cryptsetup
$ cryptsetup config --label="new label" /dev/XXX
```

## 外部磁盘分区的挂载与卸载

```bash
# 挂载外部磁盘，设备会被挂载到 /run/media/$HOME 文件夹下
$ udisksctl mount -b /dev/sdb1
# 卸载外部磁盘，相当于 umount /dev/sdb1
$ udisksctl unmount -b /dev/sdb1
# 关闭驱动器
$ udisksctl power-off -b /dev/sdb1
$ ll /dev/sd*
# 这里 /dev/sdc1 和 /dev/sdc 都消失了(因为已经被安全分离)
```

## 查看磁盘详细信息，以及文件、文件夹的大小

**df 命令是 linux 系统以磁盘分区为单位查看文件系统，可以加上参数查看磁盘剩余空间信息**

```bash
$ du
Filesystem              1K-blocks    Used Available Use% Mounted on
devtmpfs                  8099804       0   8099804   0% /dev
tmpfs                     8117028       0   8117028   0% /dev/shm
tmpfs                     8117028   18260   8098768   1% /run
tmpfs                     8117028       0   8117028   0% /sys/fs/cgroup
/dev/mapper/centos-root  52403200 9891348  42511852  19% /
/dev/sda2                 1038336  212904    825432  21% /boot
/dev/sda1                  204580   11596    192984   6% /boot/efi
/dev/mapper/centos-home 172398340  318836 172079504   1% /home
tmpfs                     1623408       0   1623408   0% /run/user/1000
```

Filesystem：文件系统（磁盘分区名称）
1K-blocks：磁盘总大小
Used：已用大小
Available：剩余可用大小
Use%：磁盘已用百分比
Mounted on：磁盘挂载目录

**df 得出的参数的单位字节，不方便查看，可以通过指令参数进行格式化：`-hl`**

```bash
$ df -hl
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                 7.8G     0  7.8G   0% /dev
tmpfs                    7.8G     0  7.8G   0% /dev/shm
tmpfs                    7.8G   18M  7.8G   1% /run
tmpfs                    7.8G     0  7.8G   0% /sys/fs/cgroup
/dev/mapper/centos-root   50G   10G   41G  20% /
/dev/sda2               1014M  208M  807M  21% /boot
/dev/sda1                200M   12M  189M   6% /boot/efi
/dev/mapper/centos-home  165G  312M  165G   1% /home
tmpfs                    1.6G     0  1.6G   0% /run/user/1000
```

Size：同`1K-blocks`，为磁盘总大小

**其余参数一致**

**其余类似指令如下**

```shell
df -h #查看每个根路径的分区大小
du -sh [目录名] #返回该目录的大小
du -sm [文件夹] #返回该文件夹下文件总数
du -h [目录名] #查看指定文件夹下的所有文件大小（包含子文件夹）
```