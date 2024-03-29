# 操作 mysql

## 导入 mysql 驱动

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

