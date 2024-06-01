# 简介

mysql 官方提供的工具使用方法

# mysqldump

## 将数据库中的数据导出为 SQL 文件

1.  获得mysql客户端，与服务端的通信缓存区大小

    ```sql
     show variables like 'max_allowed_packet';
    ```

2.  获得TCP套接字缓冲区大小

    ```sql
    show variables like 'net_buffer_length';
    ```

    <span style="color: red">注意：以上两步都是针对目标数据库进行操作，不是对源数据库的操作</span>

3.  从源数据库导出数据

    ```bash
    # 为防止数据导出，导致线上服务查询出现卡顿，需要把 --max_allowed_packet 和 --net_buffer_length 参数减半
    # -e 表示开启insert into的values的批量插入
    $ mysqldump -h mysql.localhost -P 3306 -u root -proot databases -e --max_allowed_packet=2194304 --net_buffer_length=8384 > databases.sql
    ```

4.  连接目标数据库，使用 source 指令运行 sql 文件

## 从远程数据库导入到指定的服务器

```shell
$ mysqldump -h localhost -P 3306 -u root -p'password' \
	databases \
	--default-character-set=utf8mb4 \
	-e --max_allowed_packet=2097152 --net_buffer_length=16384 \
	--add-drop-table |\
	mysql databases -h localhost -P 3306 -u root -p'password'
```

