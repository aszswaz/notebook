# mysql

## 安装

archlinux：

```bash
# linux 的各大软件仓库基本都不直接在提供 mysql 的软件包，在 archlinux 需要通过 aur 进行安装
$ git clone https://aur.archlinux.org/mysql.git && cd mysql
# 编译 mysql 的时间有些久，半小时到一小时左右，编译完成后 makepkg 会自动执行安装
$ makepkg -s -i --noconfirm
# 创建 mysql 保存数据的文件夹，注意权限问题，如果权限不对，无法启动 mysql
$ sudo mkdir /var/lib/mysql && sudo chown mysql:mysql /var/lib/mysql && sudo chmod u+rwx /var/lib/mysql
# 使用 mysql 账户初始化数据库
$ sudo -u mysql mysqld --initialize
2022-06-27T06:29:34.354665Z 0 [Warning] [MY-010915] [Server] 'NO_ZERO_DATE', 'NO_ZERO_IN_DATE' and 'ERROR_FOR_DIVISION_BY_ZERO' sql modes should be used with strict mode. They will be merged with strict mode in a future release.
2022-06-27T06:29:34.354712Z 0 [System] [MY-013169] [Server] /usr/bin/mysqld (mysqld 8.0.29) initializing of server in progress as process 55058
2022-06-27T06:29:34.363909Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2022-06-27T06:29:35.267628Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2022-06-27T06:29:36.811173Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: W(<gqee,p58i
# 上面输出的 log 中，“root@localhost: W(<gqee,p58i” 就表示 root 账户的初始密码为“W(<gqee,p58i”，登陆 mysql 修改密码
$ mysql -u root '-pW(<gqee,p58i'
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
mysql> exit
```

## 对于重复数据的处理

### 不存在则插入，存在则更新

```sql
INSERT INTO demo
    (`key`, `value`)
VALUES ('key01', 'value01')
ON DUPLICATE KEY UPDATE value = 'value02';
```

如果`key`重复，则更新对应的value，如果`key`没有重复，则新增一条记录。

### 不存在则插入，存在则忽略

```sql
INSERT IGNORE INTO demo
    (`key`, `value`)
VALUES ('key01', 'value01')
ON DUPLICATE KEY UPDATE value = 'value02';
```

<font color="red">注意：`key`和`value`列，其中一个必须要有唯一索引或者主键索引</font>

## 帐号

### 修改root账户密码

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
```

### 创建帐号

```sql
# 创建一个具有远程访问权限的帐号
CREATE USER 'example'@'%' IDENTIFIED BY 'password';
# 创建一个数据库，并把该数据库权限给账户
CREATE DATABASE demo CHARSET utf8mb4;
GRANT ALL ON demo TO 'example'@'%';
# 刷新用户授权
FLUSH PRIVILEGES;
# 查看用户授权
SHOW GRANTS FOR 'example'@'%';
# 撤销权限
REVOKE ALL ON demo FROM 'example'@'%';
```

### 删除帐号

```sql
DROP USER 'example'@'%';
```

