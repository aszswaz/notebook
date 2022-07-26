# mysql日志相关

### 开启mysql日志功能

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

这三个参数general_log、 general_log_file、 log_output都是动态参数，可以随时动态修改。

1.  开启MySQL查询日志

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

2.  关闭MySQL查询日志

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

3.  设置日志输出方式为表（如果设置log_output=table的话，则日志结果会记录到名为gengera_log的表中，这表的默认引擎是CSV）

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

    

