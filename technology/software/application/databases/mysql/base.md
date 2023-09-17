# 安装

archlinux：

```bash
# linux 的各大软件仓库基本都不直接在提供 mysql 的软件包，在 archlinux 需要通过 aur 进行安装
$ git clone https://aur.archlinux.org/mysql.git && cd mysql
# 编译 mysql 的时间有些久，半小时到一小时左右，编译完成后 makepkg 会自动执行安装
$ makepkg -s -i --noconfirm
# 创建 mysql 保存数据的文件夹，注意权限问题，如果权限不对，无法启动 mysql
$ sudo mkdir /var/lib/mysql && sudo chown mysql:mysql /var/lib/mysql && sudo chmod u+rwx /var/lib/mysql
# 使用 mysql 账户初始化数据库
$ sudo mysqld --initialize --user=mysql --basedir=/usr --datadir=/var/lib/mysql
2022-06-27T06:29:34.354665Z 0 [Warning] [MY-010915] [Server] 'NO_ZERO_DATE', 'NO_ZERO_IN_DATE' and 'ERROR_FOR_DIVISION_BY_ZERO' sql modes should be used with strict mode. They will be merged with strict mode in a future release.
2022-06-27T06:29:34.354712Z 0 [System] [MY-013169] [Server] /usr/bin/mysqld (mysqld 8.0.29) initializing of server in progress as process 55058
2022-06-27T06:29:34.363909Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2022-06-27T06:29:35.267628Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2022-06-27T06:29:36.811173Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: W(<gqee,p58i
$ sudo systemctl start mysqld
# 上面输出的 log 中，“root@localhost: W(<gqee,p58i” 就表示 root 账户的初始密码为“W(<gqee,p58i”，登陆 mysql 修改密码
$ mysql -u root '-pW(<gqee,p58i'
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
mysql> exit
```

# 对于重复数据的处理

## 不存在则插入，存在则更新

```sql
INSERT INTO demo
    (`key`, `value`)
VALUES ('key01', 'value01')
ON DUPLICATE KEY UPDATE value = 'value02';
```

如果 key 重复，则更新对应的 value，如果 key 没有重复，则新增一条记录。

## 不存在则插入，存在则忽略

```sql
INSERT IGNORE INTO demo
    (`key`, `value`)
VALUES ('key01', 'value01')
ON DUPLICATE KEY UPDATE value = 'value02';
```

<font color="red">注意：key 和 value 列，其中一个必须要有唯一索引或者主键索引</font>

# 帐号

## 修改 root 账户密码

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
```

## 创建帐号

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

## 删除帐号

```sql
DROP USER 'example'@'%';
```

# 枚举

## 首先创建demo表

```mysql
CREATE TABLE enum_demo
(
    id     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `enum` ENUM ('类型1', '类型2', '类型3') DEFAULT NULL COMMENT '文本'
) CHARACTER SET utf8mb4;
```

## 通过字符串插入预定义的值

```mysql
INSERT INTO enum_demo (`enum`) VALUES ('类型1');
```

```bash
+----+---------+
| id | enum    |
+----+---------+
|  1 | 类型1   |
+----+---------+
1 row in set (0.00 sec)
```

## 通过枚举索引插入

```mysql
INSERT INTO enum_demo (`enum`) VALUES (1);
```

```bash
+----+---------+
| id | enum    |
+----+---------+
|  1 | 类型1   |
|  2 | 类型1   |
+----+---------+
2 rows in set (0.00 sec)
```

在 mysql 当中，每个枚举都用对应的索引，索引的顺序安装建表时，枚举的声明顺序来排序。在本实例中枚举索引如下：

| 枚举  | 索引 |
| ----- | ---- |
| 类型1 | 1    |
| 类型2 | 2    |
| 类型3 | 3    |

<font color="red">在非严格的SQL模式下，如果在ENUM列中插入无效值，MySQL将使用空字符串''，插入数字索引为0。 如果启用了严格的SQL模式，尝试插入无效的ENUM值将导致错误。</font>

<span style='background-color: yellowgreen'>因为枚举被映射为数字的缘故，所以枚举也可以进行比较和排序</span>

# 索引

## 创建索引

```mysql
CREATE UNIQUE INDEX index_name USING BTREE ON demo(name);
```

**索引类型**

UNIQUE：唯一索引，被唯一索引关联的列，不允许出现重复的数据

FULLTEXT：全文索引

SPATIAL：空间索引

<span style="color: red">不指定索引类型，为普通索引</span>

**索引的结构**

BTREE：BTREE树状数据结构

HASH：hash表索引结构

<span style="color: red">在存储引擎为MyISAM和InnoDB的表中只能使用BTREE，其默认值就是BTREE；在存储引擎为MEMORY或者HEAP的表中可以使用HASH和BTREE两种类型的索引，其默认值为HASH。</span>

**其他**

demo：表名

name：索引关联的字段名，多个字段名以“,”分隔

index_name：索引名称

## 查看索引

```mysql
SHOW INDEX FROM demo;
```

## 删除索引

```mysql
ALTER TABLE demo DROP INDEX index_name;
```

## 修改索引

<span style="color: red">mysql 并没有修改索引的指令，只能先删除，再创建</span>

# timestamp 和 datetime

timestamp 和 datetime 在 mysql 中都是用来存储时间的数据类型，它们的区别如下：

1. 占用空间

    | **类型**  | **占据字节** | **表示形式**        |
    | --------- | ------------ | ------------------- |
    | datetime  | 8 字节       | yyyy-mm-dd hh:mm:ss |
    | timestamp | 4 字节       | yyyy-mm-dd hh:mm:ss |

2. 表示范围

    | 类型      | 表示范围                                                     |
    | --------- | ------------------------------------------------------------ |
    | datetime  | '1000-01-01 00:00:00.000000' to '9999-12-31 23:59:59.999999' |
    | timestamp | '1970-01-01 00:00:01.000000' to '2038-01-19 03:14:07.999999' |

3. 时区
    timestamp 只占 4 个字节，而且是以 utc 的格式储存， 它会自动检索当前时区并进行转换。

    datetime 以 8 个字节储存，不会进行时区的检索.

    也就是说，对于 timestamp 来说，如果储存时的时区和检索时的时区不一样，那么拿出来的数据也不一样。对于 datetime 来说，存什么拿到的就是什么。

    还有一个区别就是如果存进去的是 NULL，timestamp 会自动储存当前时间，而 datetime 会储存  NULL。

### 测试

```mysql
create table mysql_demo (
    timestamp_demo timestamp(3), 
    datetime_demo datetime
);

# Check the time zone settings for mysql, SYSTEM indicates that the mysql server's opertaing system time zone setting is used
select @@global.time_zone, @@session.time_zone;
+--------------------+---------------------+
| @@global.time_zone | @@session.time_zone |
+--------------------+---------------------+
| SYSTEM             | SYSTEM              |
+--------------------+---------------------+

# Insert test data
insert into mysql_demo (timestamp_demo, datetime_demo) value (current_timestamp(3), now());
# show data
select * from mysql_demo;
+-------------------------+---------------------+
| timestamp_demo          | datetime_demo       |
+-------------------------+---------------------+
| 2022-07-01 11:59:36.748 | 2022-07-01 11:59:36 |
+-------------------------+---------------------+
# Modify the timezone setting for the current session
set time_zone = '+00:00';
# Then, query the data again
select * from mysql_demo;
+-------------------------+---------------------+
| timestamp_demo          | datetime_demo       |
+-------------------------+---------------------+
| 2022-07-01 03:59:36.748 | 2022-07-01 11:59:36 |
+-------------------------+---------------------+
```

<font color='red'>Obviously, the timestamp field will return different results depending on the time zone of the session, the datetime field will not change depending on the time zone of the session.</font>
