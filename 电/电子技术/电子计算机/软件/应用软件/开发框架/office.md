# python excel 文件操作

## 几个框架介绍

| 类型   | xlrd&xlwt&xlutils | XlsxWriter | OpenPyXL | Excel开放接口 |
| :----- | :---------------- | :--------- | :------- | :------------ |
| 读取   | 支持              | 不支持     | 支持     | 支持          |
| 写入   | 支持              | 支持       | 支持     | 支持          |
| 修改   | 支持              | 不支持     | 支持     | 支持          |
| xls    | 支持              | 不支持     | 不支持   | 支持          |
| xlsx   | 高版本支持        | 支持       | 支持     | 支持          |
| 大文件 | 不支持            | 支持       | 支持     | 不支持        |
| 效率   | 快                | 快         | 快       | 超慢          |
| 功能   | 较弱              | 强大       | 一般     | 超强大        |

## xlrd xlwt xlutils操作介绍

### 安装依赖库

```bash
$ pip3 install xlrd xlwt xlutils
```

### 输出文件

```python
#!/usr/bin/python
import xlwt

if __name__ == '__main__':
    # 创建 xls 文件对象
    wb = xlwt.Workbook()

    # 新增两个表单页
    sh1 = wb.add_sheet('成绩')
    sh2 = wb.add_sheet('汇总')

    # 然后按照位置来添加数据,第一个参数是行，第二个参数是列
    # 写入第一个sheet
    sh1.write(0, 0, '姓名')
    sh1.write(0, 1, '成绩')
    sh1.write(1, 0, '张三')
    sh1.write(1, 1, 88)
    sh1.write(2, 0, '李四')
    sh1.write(2, 1, 99.5)

    # 写入第二个sheet
    sh2.write(0, 0, '总分')
    sh2.write(1, 0, 187.5)

    # 最后保存文件即可
    wb.save('test_w.xlsx')
    pass

```

### 读取文件

```python
#!/usr/bin/python
import xlrd

if __name__ == '__main__':
    # 打开刚才我们写入的 test_w.xls 文件
    wb = xlrd.open_workbook("test_w.xlsx")

    # 获取并打印 sheet 数量
    print("sheet 数量:", wb.nsheets)

    # 获取并打印 sheet 名称
    print("sheet 名称:", wb.sheet_names())

    # 根据 sheet 索引获取内容
    sh1 = wb.sheet_by_index(0)
    # 或者
    # 也可根据 sheet 名称获取内容
    # sh = wb.sheet_by_name('成绩')

    # 获取并打印该 sheet 行数和列数
    print(u"sheet %s 共 %d 行 %d 列" % (sh1.name, sh1.nrows, sh1.ncols))

    # 获取并打印某个单元格的值
    print("第一行第二列的值为:", sh1.cell_value(0, 1))

    # 获取整行或整列的值
    rows = sh1.row_values(0)  # 获取第一行内容
    cols = sh1.col_values(1)  # 获取第二列内容

    # 打印获取的行列值
    print("第一行的值为:", rows)
    print("第二列的值为:", cols)

    # 获取单元格内容的数据类型
    print("第二行第一列的值类型为:", sh1.cell(1, 0).ctype)

    # 遍历所有表单内容
    for sh in wb.sheets():
        for r in range(sh.nrows):
            # 输出指定行
            print(sh.row(r))
    pass

```

```bash
sheet 数量: 2
sheet 名称: ['成绩', '汇总']
sheet 成绩 共 3 行 2 列
第一行第二列的值为: 成绩
第一行的值为: ['姓名', '成绩']
第二列的值为: ['成绩', 88.0, 99.5]
第二行第一列的值类型为: 1
[text:'姓名', text:'成绩']
[text:'张三', number:88.0]
[text:'李四', number:99.5]
[text:'总分']
[number:187.5]
```

单元格内容的数据类型对应的数字如下：

| 数值 | 类型    | 说明   |
| :--- | :------ | :----- |
| 0    | empty   | 空     |
| 1    | string  | 字符串 |
| 2    | number  | 数字   |
| 3    | date    | 日期   |
| 4    | boolean | 布尔值 |
| 5    | error   | 错误   |

### 修改文件

```python
#!/usr/bin/python
import xlrd
from xlutils.copy import copy

if __name__ == '__main__':
    # 打开 excel 文件
    read_book = xlrd.open_workbook("test_w.xlsx")

    # 复制一份
    wb = copy(read_book)

    # 选取第一个表单
    sh1 = wb.get_sheet(0)

    # 在第四行新增写入数据
    sh1.write(3, 0, '王亮')
    sh1.write(3, 1, 59)

    # 选取第二个表单
    sh1 = wb.get_sheet(1)

    # 替换总成绩数据
    sh1.write(1, 0, 246.5)

    # 保存
    wb.save('test_w1.xls')
    pass

```

# openpyxl

## 简介

openpyxl 是 python 一个用于才做 excel 文件的框架

**安装**

````bash
$ pip install openpyxl
````

## 写出数据到文件

### 方式一

通过 列名 + 行号 确定单元格的坐标，对单元格进行填充：

```python
from openpyxl import Workbook
from openpyxl.worksheet.worksheet import Worksheet

if __name__ == '__main__':
    # excel 文件对象
    workbook = Workbook()
    worksheet: Worksheet = workbook.active

    # 输出标题
    worksheet['A1'] = '域名'
    worksheet['B1'] = '说明'

    # 输出表格主要内容
    for index in range(2, 10):
        worksheet[f"A{index}"] = 'www.example.com'
        worksheet[f"B{index}"] = '这是一个示例域名'
        pass

    workbook.save('demo.xlsx')
    pass

```

**方式二**

通过元组填充 excel

```python
from openpyxl import Workbook
from openpyxl.worksheet.worksheet import Worksheet

if __name__ == '__main__':
    # excel 文件对象
    workbook = Workbook()
    worksheet: Worksheet = workbook.active

    worksheet.append(('域名', '说明'))

    for index in range(10):
        worksheet.append(('www.example.com', '这是一个示例域名'))
        pass

    workbook.save('demo.xlsx')
    pass

```

### 方式三

通过单元格的 x 轴和 y 轴坐标确定单元格的位置，并且填充内容

```python
from openpyxl import Workbook
from openpyxl.worksheet.worksheet import Worksheet

if __name__ == '__main__':
    # excel 文件对象
    workbook = Workbook()
    worksheet: Worksheet = workbook.active

    worksheet.cell(row=1, column=1, value='域名')
    worksheet.cell(row=1, column=2, value='说明')

    for index in range(2, 10):
        worksheet.cell(row=index, column=1, value='www.example.com')
        worksheet.cell(row=index, column=2, value='这是一个示例域名')
        pass

    workbook.save('demo.xlsx')
    pass

```

