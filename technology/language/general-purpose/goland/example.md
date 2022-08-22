# GO 语言的常用库使用示例

## 实现最简单的 http 服务器

```go
package main

import (
	"fmt"
	"io"
	"net/http"
)

// GO 不支持 /** ... */（c、java、javascript，python的是 """ ... """） 这种的文档注释，只有 // 和 /* ... */ 这两种注释
// 响应客户端，给给客户端打个招呼
func hello(response http.ResponseWriter, request *http.Request) {
	userAgent := request.Header.Get("user-agent")
	fmt.Println(userAgent)
	// 响应客户端
	writeString, err := io.WriteString(response, "<h1 style='text-align: center'>Hello World</h1>")
	// nil 是指针变量为零的指针，就是空指针，函数执行成功，err就是一个空指针，函数执行失败，err就不是空指针，这种异常处理方式，让我想起了 C
	if err != nil {
		fmt.Println(writeString)
		return
	}
}

// 处理图标请求
func favicon(response http.ResponseWriter, request *http.Request) {
	// 执行永久重定向，这个倒是很方便，例如 http.StatusMovedPermanently 301 这种的 HTTP 状态码不需要自己去进行繁琐的定义
	http.Redirect(response, request, "https://www.baidu.com/favicon.ico", http.StatusMovedPermanently)
}

func main() {
	// 注册 API 接口的处理函数
	http.HandleFunc("/", hello)
	// 即便没有任何网页源码，浏览器也会发送一条图标请求
	http.HandleFunc("/favicon.ico", favicon)

	// 打开端口号
	err := http.ListenAndServe(":8080", nil)
	// 通过空指针判断是否发生异常
	if err != nil {
		fmt.Println("端口号打开失败")
		return
	}
}
```

## excelize

excelize 用于操作 exel 文件

安装：

```bash
$ go get "github.com/xuri/excelize/v2"
```

读取文件示例：

把下列内容插入 demo.xlsx

| column01 | column02 | column03 |
| -------- | -------- | -------- |
| value01  | value02  | value03  |
| value04  | value04  | value05  |

代码如下：

```go
package main

import (
	"fmt"
	"github.com/xuri/excelize/v2"
)

func main() {
	file, err := excelize.OpenFile("demo.xlsx")
	if err != nil {
		println(err.Error())
		return
	}
	streetName := file.GetSheetName(0)
	rows, err := file.GetRows(streetName)
	for _, row := range rows {
		for _, cell := range row {
			fmt.Print(cell, " ")
		}
		fmt.Println()
	}
}
```

程序输出：

```bash
column01 column02 column03 
value01 value02 value03 
value04 value04 value05
```

