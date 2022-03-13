## Mysql中索引的 创建，查看，删除，修改

### 创建索引

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

### 查看索引

```mysql
SHOW INDEX FROM demo;
```

### 删除索引

```mysql
ALTER TABLE demo DROP INDEX index_name;
```

### 修改索引

<span style="color: red">mysql并没有修改索引的指令，只能先删除，再创建</span>

