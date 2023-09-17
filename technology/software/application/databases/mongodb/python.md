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
