# 简介

在 Linux 中使用 samba 服务，以支持通过 windows 资源管理器访问 Linux 文件。

# 安装 samba

```bash
$ sudo apt install samba -y
```

# 配置 samba

```bash
# 添加 samba 账户
$ sudo smbpasswd -a $USER
# 查看配置文件手册
$ man smb.conf
```

```bash
$ sudo nano /etc/samba/smb.conf
......
# 添加名为 backup 的共享文件夹
[backup]
   comment = Backup File
   path = /mnt/backup
   read only = no
   guest ok = no
   browseable = yes
```

