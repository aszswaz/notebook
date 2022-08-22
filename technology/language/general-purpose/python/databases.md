# python 操作 elasticsearch

## 导入python的es库

```bash
$ pip install elasticsearch
```

## 简单统计es的数据量

```python
from elasticsearch import Elasticsearch

if __name__ == '__main__':
    try:
        print("正在建立es连接")
        es = Elasticsearch(["localhost:9400"], http_auth="username:password")
        print("es连接成功")
        count: int = 0
        # 获取es的索引列表
        for index in es.indices.get("*"):
            # 跳过无关的索引
            if "remove" in index:
                continue

            # 索引包含指定的关键字, 就进行统计
            if "index" in index:
                print("正在查询索引: ", index)

                query = {
                    "query": {
                        "term": {
                            "cid": 1001
                        }
                    }
                }
                # es统计查询
                current_count = es.count(body=query, index=index)["count"]
                count = count + current_count
                print(f"index: {index}; {str(current_count)}")
        print("2020年数据总计: ", count)
    except Exception as e:
        print(e)
```

# python 操作 mongodb

## 安装 pymongo

```bash
$ pip install pymongo
```

## 查询

```python
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.cursor import Cursor
from bson.objectid import ObjectId
import json

if __name__ == '__main__':
    mongo_client = MongoClient("mongodb://username:password@example/")
    # 获取数据库
    database: Database = mongo_client['demo']
    # 获取数据表
    collection: Collection = database['demo']
    # 查询数据
    cursor: Cursor = collection.find()
    for documment in cursor:
        object_id: ObjectId = documment['_id']
        print("object_id: ", object_id)
        # object_id 替换为 字符串
        documment['_id'] = object_id.__str__()
        print(json.dumps(documment, indent=2, ensure_ascii=False))
    pass

```

如果服务器的mongodb版本比较老，使用pymongo可能会存在版本兼容问题，可以使用`motor`，这是官方的另一款python驱动。

# 操作mysql

## 导入mysql驱动

```bash
$ pip install mysql.connector
```

以下是操作mysql，去除数据表当中的重复数据示例

```python
#!/usr/bin/python
from mysql.connector import connect

# 对重复数据进行去重
if __name__ == '__main__':
    mysqlConnect = connect(
        host="desktop.localhost",
        port=3306,
        user="root",
        passwd="root",
        charset="utf8mb4",
        database="demo"
    )
    print("连接成功")

    try:
        print("正在锁定表")
        cursor = mysqlConnect.cursor()
        sql = "LOCK TABLES demo WRITE"
        cursor.execute(sql)
        mysqlConnect.commit()
        print("表锁定完毕")
        while True:
            sql = "SELECT MIN(id), name, time, COUNT(*) FROM demo GROUP BY name, time HAVING COUNT(*) > 1"
            cursor.execute(sql)
            index = 0
            limit = 500
            data = cursor.fetchall()
            if data is None or len(data) == 0:
                break
            print("获得重复的数据：", len(data))
            while index < len(data):
                subList = data[index: min(index + limit, len(data))]
                ids = ""
                names = ""
                times = ""
                for pointer in range(len(subList)):
                    ids = f"{ids}{str(subList[pointer][0])}"
                    template_ids = f"{template_ids}{str(subList[pointer][1])}"
                    times = f"{times}{str(subList[pointer][2])}"
                    # 判断是否需要追加逗号
                    if pointer < len(subList) - 1:
                        ids = f"{ids},"
                        names = f"{names},"
                        times = f"{times},"
                        pass
                    pass
                sql = f"DELETE FROM demo WHERE id NOT IN ({ids}) AND name IN ({names}) AND `time` IN ({times})"
                cursor.execute(sql)
                mysqlConnect.commit()
                index += len(subList)
                print("已完成: ", index)
                pass
            pass
        print("开始建立唯一索引")
        sql = "ALTER TABLE demo DROP INDEX `statistics_index`"
        cursor.execute(sql)
        mysqlConnect.commit()
        sql = "ALTER TABLE demo ADD UNIQUE INDEX `statistics_index` (`template_id`, `time`)"
        cursor.execute(sql)
        mysqlConnect.commit()
        print("唯一索引建立完毕，解锁数据表")
        sql = "UNLOCK TABLES"
        cursor.execute(sql)
        mysqlConnect.commit()
        print("数据表解锁完毕")
    finally:
        mysqlConnect.close()
    pass

```

