# python 操作 elasticsearch

## 导入 python 的 es 库 

```bash
$ pip install elasticsearch
```

## 简单统计 es 的数据量

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
