# Mongodb 笔记

## Mongo Shell

mongo shell 是一组JavaScript的Mongodb接口，基本的CRUD操作如下：

[insert](https://docs.mongodb.com/v4.4/tutorial/insert-documents/)

```javascript
// 插入单个文档
db.example.insertOne({"message": "Hello World"});
// 批量插入文档
db.example.insertMany({"message": "Hello World"}, {"message": "Hello World"});
```

[update](https://docs.mongodb.com/v4.4/tutorial/update-documents/)

```javascript
// 更新一条文档
db.inventory.updateOne(
   { item: "paper" },
   {
     $set: { "size.uom": "cm", status: "P" },
     $currentDate: { lastModified: true }
   }
);
// 更新多条文档
db.inventory.updateMany(
   { "qty": { $lt: 50 } },
   {
     $set: { "size.uom": "in", status: "P" },
     $currentDate: { lastModified: true }
   }
)
```

<font color="red">mongodb会自动给每条文章都创建一个“\_id”作为文档主键，这个主键的类型默认是ObjectId，可以在插入文档的时候指定主键，但是主键是不可修改的，如果使用update直接修改主键，会直接导致数据更新失败。</font>

[find](https://docs.mongodb.com/v4.4/tutorial/query-documents/)

```javascript
// 查询一条数据
db.demo.findOne({"message": "Hello Word"})
// 查询多条数据
db.demo.findMany({"message": "Hello Word"})
```

[delete](https://docs.mongodb.com/v4.4/tutorial/remove-documents/)

```javascript
// 删除一条数据
db.demo.deleteOne({});
// 删除多条数据
db.demo.deleteMany({});
```

<font color="green">除了delete，还有 remove，它们都是用于删除文档的函数，它们的不同点有两处：一个是函数的返回值不同，delete的返回值是Bson对象，remove的返回值是WriteResult对象，另一个是remove没有removeOne或removeMany的区分，默认是删除多条数据。</font>

## 嵌套查询

假设 mongodb 的 demo 数据库中，存在以下数据：

```json
{
    "message": "Hello World",
    "user": {
        "username": "demo"
    }
}
```

要查询`username`的值为`demo`的数据，该如何传入查询条件？

以下是错误的做法：

```javascript
db.demo.find({user: {username: "demo"}});
```

这样做虽然没有什么异常，但是也无法获得任何数据。正确的方式如下：

```javascript
db.demo.find({"user.username": "demo"})
```

## Mongo shell 终端

### 登陆

```bash
# 通过 mongodb uri 登陆
# 不需要账户名和密码
$ mongo mongodb://localhost:27017/database
# 这个效果等同于上面的指令，直接连接本地数据库
$ mongo database
# 需要账户名和密码
$ mongo -u admin -p password mongodb://localhost:27017/database?authSource=admin
# 不通过uri登陆
$ mongo -u admin -p password --host 192.168.24.1 --port 27017 --authenticationDatabase admin database
```

<font color="red">uri中的authSource和终端参数--authenticationDatabase，用途一致，都是指定认证数据库，默认是admin数据库，如果这个参数错误，会导致认证失败</font>

### 运行 script 脚本

除了交互式，还可以直接运行js脚本：

```bash
# 直接读取脚本文件并运行
$ mongo mongodb://localhost:27017/database demo.json
# 从stdin读取脚本并运行
$ echo "printjson(db.demo.findOne({}))" | mongo mongodb://localhost:27017/demo
# 在交互模式下执行脚本，脚本文件的路径必须是绝对路径，Mongo Shell提供pwd()函数获取程序执行路径
$ mongo demo
load("/home/aszswaz/demo.js")
```

还可以直接在脚本中连接 mongodb：

```javascript
var client = new Mongo("localhsot:27017");
// 另一种连接方式为直接使用 connect() 函数
// db = connect("localhost:27020/demo");
database = client.getDB("demo");
var cursor = database.demo.find({}).limit(10);
while (cursor.hasNext()) {
    printjson(cursor.next());
}
cursor.close()
client.close()
```

```bash
# nodb 表示不要连接数据库，连接由脚本自己创建
$ mongo --nodb demo.json
```

## 字段为空、非空、存在查询

首先插入数据：

```javas
db.test.insert({"num":1, "check":"check value"});
db.test.insert({"num":2, "check":null});
db.test.insert({"num":3});
```

字段为空查询：

```javascript
db.test.find({"check":null})
```

字段非空查询：

```javascript
db.test.find({"check":{$ne:null}});
```

字符串存在查询：

```javascript
db.test.find({"check":{$exists:true}});
```

