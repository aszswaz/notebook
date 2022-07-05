## mysql中timestamp与datetime的区别

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
   `timestamp` 只占 4 个字节，而且是以`utc`的格式储存， 它会自动检索当前时区并进行转换。

   `datetime`以 8 个字节储存，不会进行时区的检索.

   也就是说，对于`timestamp`来说，如果储存时的时区和检索时的时区不一样，那么拿出来的数据也不一样。对于`datetime`来说，存什么拿到的就是什么。

   还有一个区别就是如果存进去的是`NULL`，`timestamp`会自动储存当前时间，而 `datetime`会储存 `NULL`。

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