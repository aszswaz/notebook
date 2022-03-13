# mysql

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

