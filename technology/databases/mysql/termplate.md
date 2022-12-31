# 简介

常用的 SQL 模板

# 数据去重

现有一个数据表，其表结构如下：

```mysql
CREATE TABLE demo_table(
    id BIGINT,
    `time` TIMESTAMP
);
```

表中 id 存在大量重复，需要对数据进行去重，操作步骤如下：

```mysql
# 锁定数据表
LOCK TABLES demo_table WRITE;

# 查找重复的数据记录，并且把查询结果存储到临时表
CREATE TEMPORARY TABLE repeat_table
SELECT id, `time`, COUNT(id)
FROM demo_table
GROUP BY id, `time`
HAVING COUNT(id) > 1;

# 查看临时表保存的查询结果
SELECT *
FROM repeat_table;

# 查询所有重复的数据中，最小的主键，保存到临时表
CREATE TEMPORARY TABLE repeat_min_id_table
SELECT MIN(`id`) as id, `time`
FROM demo_table
GROUP BY `time`
HAVING COUNT(*) > 1;

# 查看临时表中的查询结果
SELECT *
FROM repeat_min_id_table;

# 删除多余的重复数据，保留 id 最小的一条
DELETE
FROM demo_table
WHERE (id, `time`) IN (SELECT id, `time` FROM repeat_table)
  AND `id` NOT IN (SELECT `id` FROM repeat_min_id_table);

# 检查是否删除成功
SELECT *
FROM demo_table
WHERE (id, `time`) IN (SELECT id, `time` FROM repeat_table)
ORDER BY id;

# 清理临时建立的数据表
DROP TABLE repeat_table;
DROP TABLE repeat_min_id_table;

# 释放锁
UNLOCK TABLES;
```

