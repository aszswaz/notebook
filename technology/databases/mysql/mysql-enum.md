# mysql的枚举

### 首先创建demo表

```mysql
CREATE TABLE enum_demo
(
    id     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `enum` ENUM ('类型1', '类型2', '类型3') DEFAULT NULL COMMENT '文本'
) CHARACTER SET utf8mb4;
```

### 通过字符串插入预定义的值

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

### 通过枚举索引插入

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

在mysql当中，每个枚举都用对应的索引，索引的顺序安装建表时，枚举的声明顺序来排序。在本实例中枚举索引如下：

| 枚举  | 索引 |
| ----- | ---- |
| 类型1 | 1    |
| 类型2 | 2    |
| 类型3 | 3    |

<font color="red">在非严格的SQL模式下，如果在ENUM列中插入无效值，MySQL将使用空字符串''，插入数字索引为0。 如果启用了严格的SQL模式，尝试插入无效的ENUM值将导致错误。</font>

<span style='background-color: yellowgreen'>因为枚举被映射为数字的缘故，所以枚举也可以进行比较和排序</span>