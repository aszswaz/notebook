# Mongodb 常用脚本

## 源数据库与目标数据库同步

```javascript
/**
 * 本脚本用于把源数据库，覆盖到目标数据库
 */

// 建立远程连接
var source_client = new Mongo("mongodb://localhost:27017/demo01");
var source_database = source_client.getDB("demo01")

// 建立本地连接
var target_client = new Mongo("mongodb://localhost:27017/demo02");
var target_database = target_client.getDB("demo02")

// 临时存储数据的集合
var data = []

// 删除目标数据库的表，并从源数据库复制到目标数据库
target_database.demo.drop()
// 先查询全部的数据到内存
source_cursor = source_database.demo.find({})
while (source_cursor.hasNext()) {
    data.push(source_cursor.next())
}
print("get data " + data.length)
// 批量插入数据
target_database.demo.insertMany(data)
print("copy collection application success.")
source_cursor.close()

source_client.close()
target_client.close()
```

