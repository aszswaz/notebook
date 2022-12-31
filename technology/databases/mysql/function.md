# 简介

除了保存数据外，mysql 其它的功能笔记，通常是可用于调试的功能。

# 数据表操作

## 常规操作

```sql
# 查看所有数据库的大小总和
select concat(round(sum(DATA_LENGTH / 1024 / 1024), 2), 'MB') as data from information_schema.TABLES;
# 查看指定数据库的大小
select concat(round(sum(DATA_LENGTH / 1024 / 1024), 2), 'MB') as data from information_schema.TABLES where table_schema = 'mysql';
# 查看指定数据表的大小
select concat(round(sum(DATA_LENGTH / 1024 / 1024), 2), 'MB') as data from information_schema.TABLES where information_schema.table_schema = 'jishi' and table_name='a_ya';
# 查看指定库的索引大小
SELECT CONCAT(ROUND(SUM(index_length) / (1024 * 1024), 2), ' MB') AS 'Total Index Size' FROM information_schema.TABLES WHERE table_schema = 'jishi'; 
# 查看指定库指定表的索引大小
SELECT CONCAT(ROUND(SUM(index_length) / (1024 * 1024), 2), ' MB') AS 'Total Index Size' FROM information_schema.TABLES WHERE table_schema = 'test' and table_name='a_yuser';
# 查看一个库中的情况
 SELECT CONCAT(table_schema, '.', table_name) AS 'Table Name', CONCAT(ROUND(table_rows / 1000000, 4), 'M') AS 'Number of Rows', CONCAT(ROUND(data_length/ (1024 * 1024 * 1024), 4), 'G') AS 'Data Size', CONCAT(ROUND(index_length / (1024 * 1024 * 1024), 4), 'G') AS 'Index Size', CONCAT(ROUND((data_length + index_length) / ( 1024 * 1024 * 1024), 4), 'G') AS'Total'FROM information_schema.TABLES WHERE table_schema LIKE 'mysql';
# 查看表的 DDL
SHOW CREATE TABLE demo;
```

## 查看表的详细信息

```mysql
desc table_name;
```

例：

```mysql
desc general_log;

+--------------+---------------------+------+-----+----------------------+--------------------------------+
| Field        | Type                | Null | Key | Default              | Extra                          |
+--------------+---------------------+------+-----+----------------------+--------------------------------+
| event_time   | timestamp(6)        | NO   |     | CURRENT_TIMESTAMP(6) | on update CURRENT_TIMESTAMP(6) |
| user_host    | mediumtext          | NO   |     | NULL                 |                                |
| thread_id    | bigint(21) unsigned | NO   |     | NULL                 |                                |
| server_id    | int(10) unsigned    | NO   |     | NULL                 |                                |
| command_type | varchar(64)         | NO   |     | NULL                 |                                |
| argument     | mediumblob          | NO   |     | NULL                 |                                |
+--------------+---------------------+------+-----+----------------------+--------------------------------+
6 rows in set (0.00 sec)
```

# mysql 日志

mysql 日志默认是关闭，需要手动开启：

```mysql
set global general_log = on;
```

**查看是否开启成功**

```mysql
show variables like '%general_log%';
+------------------+------------------------------+
| Variable_name    | Value                        |
+------------------+------------------------------+
| general_log      | ON                          |
| general_log_file | /var/lib/mysql/DB-Server.log |
+------------------+------------------------------+
2 rows in set (0.00 sec)
```

**另外，MySQL的查询日志支持写入文件或写入数据表两种形式，这个由参数log_output控制，如下所示：**

```mysql
show variables like 'log_output';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_output    | FILE  |
+---------------+-------+
1 row in set (0.00 sec)
```

这三个参数 general_log、 general_log_file、 log_output 都是动态参数，可以随时动态修改。

1. 开启 MySQL 查询日志

    ```mysql
    show variables like 'general_log';
    +---------------+-------+
    | Variable_name | Value |
    +---------------+-------+
    | general_log   | ON    |
    +---------------+-------+
    1 row in set (0.02 sec)
    
    # 开启sql日志
    set global general_log = on;
    ```

2. 关闭 MySQL 查询日志

    ```mysql
    # 查看状态
    show variables like 'general_log';
    +---------------+-------+
    | Variable_name | Value |
    +---------------+-------+
    | general_log   | ON    |
    +---------------+-------+
    1 row in set (0.01 sec)
    
    # 关闭mysql日志
    set global general_log=off;
    Query OK, 0 rows affected (0.01 sec)
    
    show variables like 'general_log';
    +---------------+-------+
    | Variable_name | Value |
    +---------------+-------+
    | general_log   | OFF   |
    +---------------+-------+
    1 row in set (0.00 sec)
    ```

3. 设置日志输出方式为表（如果设置 log_output = table 的话，则日志结果会记录到名为 gengera_log 的表中，这表的默认引擎是 CSV）

    ```mysql
    show variables like 'log_output';
    +---------------+-------+
    | Variable_name | Value |
    +---------------+-------+
    | log_output    | FILE  |
    +---------------+-------+
    1 row in set (0.00 sec)
     
    set global log_output='table';
    Query OK, 0 rows affected (0.00 sec)
     
    show variables like 'log_output';
    +---------------+-------+
    | Variable_name | Value |
    +---------------+-------+
    | log_output    | TABLE |
    +---------------+-------+
    1 row in set (0.01 sec)
    ```

    
