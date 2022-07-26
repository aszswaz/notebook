# mysql数据表操作

### 查看表的详细信息

```mysql
desc tableName;
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

### 查看所有数据库的大小总和

```mysql
select concat(round(sum(DATA_LENGTH/1024/1024),2),'MB') as data  from information_schema.TABLES;
```

### 查看指定数据库的大小

```mysql
select concat(round(sum(DATA_LENGTH/1024/1024),2),'MB') as data  from information_schema.TABLES where table_schema='mysql';
```

### 查看指定数据表的大小

```mysql
select concat(round(sum(DATA_LENGTH/1024/1024),2),'MB') as data  from information_schema.TABLES where information_schema.table_schema='jishi' and table_name='a_ya';
```

### 查看指定库的索引大小

```mysql
SELECT CONCAT(ROUND(SUM(index_length)/(1024*1024), 2), ' MB') AS 'Total Index Size' FROM information_schema.TABLES  WHERE table_schema = 'jishi'; 
```

### 查看指定库指定表的索引大小

```mysql
SELECT CONCAT(ROUND(SUM(index_length)/(1024*1024), 2), ' MB') AS 'Total Index Size' FROM information_schema.TABLES  WHERE table_schema = 'test' and table_name='a_yuser';
select count(*) from test.a_yuser;
```

### 查看一个库中的情况

```mysql
 SELECT CONCAT(table_schema,'.',table_name) AS 'Table Name', CONCAT(ROUND(table_rows/1000000,4),'M') AS 'Number of Rows', CONCAT(ROUND(data_length/(1024*1024*1024),4),'G') AS 'Data Size', CONCAT(ROUND(index_length/(1024*1024*1024),4),'G') AS 'Index Size', CONCAT(ROUND((data_length+index_length)/(1024*1024*1024),4),'G') AS'Total'FROM information_schema.TABLES WHERE table_schema LIKE 'mysql';
```

### 查看表的DDL

```mysql
SHOW CREATE TABLE demo;
```

