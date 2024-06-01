# mysql 的自增主键可能会出现重复冲突的问题

这个问题出现的原因，主要是由于表格的当前自增值小于id的最大值所导致的问题

**该问题的主要几个原因如下**

1.  update 更新了主键导致
    例1：首先在 mysql 中创建demo库

    ```mysql
    create database demo charset utf8mb4;
    ```

    在库中创建demo01表
    
    ```mysql
    create table demo01 (
        id      bigint unsigned auto_increment primary key comment '演示主键',
        message varchar(255) comment '测试文本'
    ) charset utf8mb4 comment '演示表';
    ```
    
    在库中插入一条记录
    
    ```mysql
    update demo01 set id = 200 where id = 100;
    ```
    
    查看所有表的自增值
    
    ```mysql
    show table status;
    ```

可以看到目前表的auto_incerment是101

使用update修改id的值

```mysql
update demo01 set id = 200 where id = 100;
```

再次查看表格的当前自增值

```mysql
show table status;
```

可以看到auto_increment没有什么改变，当auto_incretment达到200时就会发生主键冲突

# 在 docker 当中安装 mysql，从外部挂载的配置文件无效

<span style="color: red">这个问题出现的原因是linux文件权限导致的。</span>

例：

docker的mysql安装指令如下：

```bash
$ sudo docker pull mysql:5.7.25
$ sudo docker run -p 3306:3306 --name mysqld -m 1G --memory-swap -1 -v /home/mysql/my.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf -v /home/mysql/data:/var/lib/mysql:z -v /home/mysql/logs:/var/log/mysql:z -e TZ=Asia/Shanghai -e MYSQL_ROOT_PASSWORD=z199809051593 -d mysql:5.7.25
```

配置文件样本：[my.cnf](my.cnf)

异常情况如下：

1. mysql bin log 在配置文件中，配置了使用，但是这个功能并没有开启

   ```bash
   $ mysql -u root -p
   Enter password: 
   Welcome to the MySQL monitor.  Commands end with ; or \g.
   Your MySQL connection id is 6
   Server version: 5.7.25-log MySQL Community Server (GPL)
   
   Copyright (c) 2000, 2021, Oracle and/or its affiliates.
   
   Oracle is a registered trademark of Oracle Corporation and/or its
   affiliates. Other names may be trademarks of their respective
   owners.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   mysql> show variables like '%log_bin%';
   +---------------------------------+--------------------------------+
   | Variable_name                   | Value                          |
   +---------------------------------+--------------------------------+
   | log_bin                         | OFF                            |
   | log_bin_basename                | null                           |
   | log_bin_index                   | null                           |
   | log_bin_trust_function_creators | OFF                            |
   | log_bin_use_v1_row_events       | OFF                            |
   | sql_log_bin                     | ON                             |
   +---------------------------------+--------------------------------+
   6 rows in set (0.00 sec)
   ```

2. sql_mode不是想要的mode

   ```bash
   mysql> CREATE TABLE demo
       -> (
       ->     id        BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
       ->     demo_time TIMESTAMP NOT NULL,
       ->     test_time TIMESTAMP NOT NULL
       -> ) charset utf8mb4;
   ERROR 1067 (42000): Invalid default value for 'test_time'
   ```

异常原因：mysql其实扫描 /etc/mysql/mysql.conf.d/ 时，已经扫描到了配置文件，只是发现这个文件除了读权限以外，还开放了写权限。

```bash
$ ls -l
total 12
drwxrwxr-x. 6 polkitd input  4096 Apr 28 11:05 data
drwxrwx---. 2 polkitd input    51 Apr 28 11:05 logs
-rw-r--r--. 1 server  server 2709 Apr 28 10:58 my.cnf   <---有w，表示写权限
-rwxrwx---. 1 server  server  935 Apr 28 11:03 script.sh
```

解决办法：删除写权限

```bash
$ sudo chmod a-w my.cnf
$ ls -l
total 12
drwxrwxr-x. 6 polkitd input  4096 Apr 28 11:05 data
drwxrwx---. 2 polkitd input    51 Apr 28 11:05 logs
-r--r--r--. 1 server  server 2709 Apr 28 10:58 my.cnf   <----
-rwxrwx---. 1 server  server  935 Apr 28 11:03 script.sh
```

之后重新创建容器即可