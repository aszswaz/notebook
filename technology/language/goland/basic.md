# GO

## GO简介

**Go**（又称**Golang**[[4\]](https://zh.wikipedia.org/wiki/Go#cite_note-4)）是[Google](https://zh.wikipedia.org/wiki/Google)开发的一种[静态](https://zh.wikipedia.org/wiki/静态类型)[强类型](https://zh.wikipedia.org/wiki/強類型)、[编译型](https://zh.wikipedia.org/wiki/編譯語言)、[并发型](https://zh.wikipedia.org/wiki/並行計算)，并具有[垃圾回收功能](https://zh.wikipedia.org/wiki/垃圾回收_(計算機科學))的[编程语言](https://zh.wikipedia.org/wiki/编程语言)。

[罗伯特·格瑞史莫](https://zh.wikipedia.org/w/index.php?title=羅伯特·格瑞史莫&action=edit&redlink=1)、[罗勃·派克](https://zh.wikipedia.org/wiki/羅勃·派克)及[肯·汤普逊](https://zh.wikipedia.org/wiki/肯·汤普逊)于2007年9月开始设计Go，[[3\]](https://zh.wikipedia.org/wiki/Go#cite_note-langfaq-3)稍后伊恩·兰斯·泰勒（Ian Lance Taylor）、拉斯·考克斯（Russ Cox）加入项目。Go是基于[Inferno](https://zh.wikipedia.org/wiki/Inferno)操作系统所开发的。[[5\]](https://zh.wikipedia.org/wiki/Go#cite_note-5)Go于2009年11月正式宣布推出，成为[开放源代码](https://zh.wikipedia.org/wiki/開放原始碼)项目，支持[Linux](https://zh.wikipedia.org/wiki/Linux)、[macOS](https://zh.wikipedia.org/wiki/MacOS)、[Windows](https://zh.wikipedia.org/wiki/Windows)等操作系统。[[6\]](https://zh.wikipedia.org/wiki/Go#cite_note-6)

在2016年，Go被软件评价公司[TIOBE](https://zh.wikipedia.org/w/index.php?title=TIOBE_Programming_Community_Index&action=edit&redlink=1)选为“TIOBE 2016年最佳语言”。[[7\]](https://zh.wikipedia.org/wiki/Go#cite_note-7)

目前，Go每半年发布一个二级版本（即从a.x升级到a.y）。

Go的语法接近[C语言](https://zh.wikipedia.org/wiki/C语言)，但对于[变量的声明](https://zh.wikipedia.org/w/index.php?title=变量的声明&action=edit&redlink=1)有所不同。Go支持[垃圾回收功能](https://zh.wikipedia.org/wiki/垃圾回收_(計算機科學))。Go的[并行计算](https://zh.wikipedia.org/wiki/并行计算)模型是以[东尼·霍尔](https://zh.wikipedia.org/wiki/東尼·霍爾)的[通信顺序进程](https://zh.wikipedia.org/wiki/交談循序程式)（CSP）为基础，采取类似模型的其他语言包括[Occam](https://zh.wikipedia.org/wiki/Occam)和[Limbo](https://zh.wikipedia.org/wiki/Limbo)[[3\]](https://zh.wikipedia.org/wiki/Go#cite_note-langfaq-3)，Go也具有这个模型的特征，比如[通道](https://zh.wikipedia.org/wiki/通道_(编程))传输。通过goroutine和通道等并行构造可以建造[线程池](https://zh.wikipedia.org/wiki/线程池)和[管道](https://zh.wikipedia.org/wiki/管道_(软件))等[[8\]](https://zh.wikipedia.org/wiki/Go#cite_note-8)。在1.8版本中开放插件（Plugin）的支持，这意味着现在能从Go中动态加载部分函数。

与C++相比，Go并不包括如[枚举](https://zh.wikipedia.org/wiki/枚举)、[异常处理](https://zh.wikipedia.org/wiki/异常处理)、[继承](https://zh.wikipedia.org/wiki/繼承_(計算機科學))、[泛型](https://zh.wikipedia.org/wiki/泛型)、[断言](https://zh.wikipedia.org/wiki/斷言_(程式))、[虚函数](https://zh.wikipedia.org/wiki/虚函数)等功能，但增加了 切片(Slice) 型、并发、管道、[垃圾回收功能](https://zh.wikipedia.org/wiki/垃圾回收_(計算機科學))、[接口](https://zh.wikipedia.org/wiki/介面_(資訊科技))等特性的语言级支持[[3\]](https://zh.wikipedia.org/wiki/Go#cite_note-langfaq-3)。Go 2.0版本将支持泛型[[9\]](https://zh.wikipedia.org/wiki/Go#cite_note-9)，对于[断言](https://zh.wikipedia.org/wiki/斷言_(程式))的存在，则持负面态度，同时也为自己不提供类型[继承](https://zh.wikipedia.org/wiki/繼承_(計算機科學))来辩护。

不同于[Java](https://zh.wikipedia.org/wiki/Java)，Go原生提供了[关联数组](https://zh.wikipedia.org/wiki/关联数组)（也称为[哈希表](https://zh.wikipedia.org/wiki/哈希表)（Hashes）或字典（Dictionaries））。

2007年，[Google](https://zh.wikipedia.org/wiki/Google)设计Go，目的在于提高在[多核](https://zh.wikipedia.org/wiki/多核心處理器)、网络机器（networked machines）、大型[代码库](https://zh.wikipedia.org/wiki/代码库)（codebases）的情况下的开发效率。[[12\]](https://zh.wikipedia.org/wiki/Go#cite_note-12)当时在Google，设计师们想要解决其他语言使用中的缺点，但是仍保留他们的优点。[[13\]](https://zh.wikipedia.org/wiki/Go#cite_note-13)

-   静态类型和[运行时](https://zh.wikipedia.org/wiki/运行时)效率。（如：[C++](https://zh.wikipedia.org/wiki/C%2B%2B)）
-   可读性和易用性。（如：[Python](https://zh.wikipedia.org/wiki/Python) 和 [JavaScript](https://zh.wikipedia.org/wiki/JavaScript)）[[14\]](https://zh.wikipedia.org/wiki/Go#cite_note-14)
-   高性能的网络和[多进程](https://zh.wikipedia.org/wiki/多进程)。

设计师们主要受他们之间流传的“不要像C++”启发。[[15\]](https://zh.wikipedia.org/wiki/Go#cite_note-15)[[16\]](https://zh.wikipedia.org/wiki/Go#cite_note-16)[[17\]](https://zh.wikipedia.org/wiki/Go#cite_note-17)

Go于2009年11月正式宣布推出，[[18\]](https://zh.wikipedia.org/wiki/Go#cite_note-18)版本1.0在2012年3月发布。[[19\]](https://zh.wikipedia.org/wiki/Go#cite_note-19)[[20\]](https://zh.wikipedia.org/wiki/Go#cite_note-20)之后，Go广泛应用于Google的产品[[21\]](https://zh.wikipedia.org/wiki/Go#cite_note-faq-21)以及许多其他组织和开源项目。

在2016年11月，Go（一种[无衬线体](https://zh.wikipedia.org/wiki/无衬线体)）和Go Mono 字体（一种[等宽字体](https://zh.wikipedia.org/wiki/等宽字体)）分别由设计师[查尔斯·比格洛](https://zh.wikipedia.org/w/index.php?title=查爾斯·比格洛&action=edit&redlink=1)和[克莉丝·荷姆斯](https://zh.wikipedia.org/w/index.php?title=克莉絲·荷姆斯&action=edit&redlink=1)发布。两种字体均采用了[WGL4](https://zh.wikipedia.org/w/index.php?title=WGL4&action=edit&redlink=1)，并且依照着 DIN 1450 标准，可清晰地使用了 large x-height 和 letterforms 。[[22\]](https://zh.wikipedia.org/wiki/Go#cite_note-22)[[23\]](https://zh.wikipedia.org/wiki/Go#cite_note-23)

在2018年8月，本地的图标更换了。待描述完整 然而，Gopher mascot 仍旧命相同的名字。[[24\]](https://zh.wikipedia.org/wiki/Go#cite_note-24)

在2018年8月，Go的主要贡献者发布了两个关于语言新功能的“草稿设计——[泛型](https://zh.wikipedia.org/wiki/泛型)和[异常处理](https://zh.wikipedia.org/wiki/异常处理)，同时寻求Go用户的反馈。[[25\]](https://zh.wikipedia.org/wiki/Go#cite_note-25)[[26\]](https://zh.wikipedia.org/wiki/Go#cite_note-26)Go 由于在1.x时，缺少对[泛型](https://zh.wikipedia.org/wiki/泛型)编程的支持和冗长的[异常处理](https://zh.wikipedia.org/wiki/异常处理)而备受批评。

# 基本语法

<font color="red">由于本人是一名 Java 开发工程师，对于类型、变量、数组、字符串、if else、switch case、for、while 十分的熟悉，所以这里不打算详细讲解这些最基础的东西。在这些基础方面，GO 与 Java 的不同之处会记录的比较多。</font>

## 变量的声明

**完整的变量声明和初始化**

```go
package main

import "fmt"

func main() {
	/*
	数值类型有 int8（8字节） int16（16字节） int32（32字节） int64（64字节），还有 uint8 ... uint64 无符号整数类型
	小数类型 float32 float64
	还有 bye（int8） int（int32）这类的类型别名
	 */
	var demo int
	demo = 100
	fmt.Println(demo)
}
```

**根据子面值自动推断变量类型**

```go
package main

import "fmt"

func main() {
	// 根据子面值推断变量类型主要是一下两种方式
	var demo01 = 100
	fmt.Println(demo01)
	demo02 := 100
	fmt.Println(demo02)
}
```

**多个参数声明 + 类型自动推断 = 数值和字符串可以一起声明**

```go
package main

import "fmt"

func main() {
	var demo01, demo02, demo03 = 1, "Hello World", 50
	fmt.Println(demo01, demo02, demo03)
}
```

**变量类型转换**

```go
demoInt := 10
demoFloat := float32(demoInt)
```

## for 循环遍历数组

```go
package main

import "fmt"

func main() {
	// := 是声明变量并赋值，等同于：var numbers [6]int
	numbers := [6]int{1, 2, 3, 5}
    // 有些类似 fori + foreach 的结合体
	for i, number := range numbers {
		fmt.Printf("第 %d 位 x 的值 = %d\n", i, number)
	}
}
```

输出：

```txt
第 0 位 x 的值 = 1
第 1 位 x 的值 = 2
第 2 位 x 的值 = 3
第 3 位 x 的值 = 5
第 4 位 x 的值 = 0
第 5 位 x 的值 = 0
```

## 结构

<font color="green">GO 的结构体本质上与 C 的结构体差别不是太大，这里只记录一些注意事项</font>

结构的声明格式：

```go
type Demo struct {
    // 变量名在前，变量类型在后，而 C 是类型在前，变量名在后
	code int
}
```

<font color="red">结构作为函数的参数时，需要注意：</font>

<font color="red">函数的传参会以值传递的方式，复制一个结构，这样会造成内存浪费，代码如下</font>

```go
package main

import "fmt"

type Demo struct {
	code int
}

func demoFunction(demo Demo) {
	demo.code = 100
}

func main() {
	var demo Demo
	demo.code = 10
	demoFunction(demo)
	fmt.Println("main: demo code is ", demo.code)
}
```

运行结果：

```txt
main: demo code is  10
```

<font color="red">为避免这种情况，需要把结构体的传递形式改为指针传递（也叫引用传递）</font>

```go
package main

import "fmt"

type Demo struct {
	code int
}

func demoFunction(demo *Demo) {
	demo.code = 100
}

func main() {
	var demo Demo
	demo.code = 10
	demoFunction(&demo)
	fmt.Println("main: demo code is ", demo.code)
}
```

运行结果：

```txt
main: demo code is  100
```

## 指针

### 指针的类型强制转换

<font color="red">go 的指针类型强转不能直接使用 c 的`(char *)example` 需要通过 `unsafe.Pointer()` 来实现，代码如下：</font>

```go
package main

import (
	"unsafe"
)

func main() {
	demo := 1000
	// 把 int 转换为无符号的 uint8
	var ptr *uint8 = (*byte)(unsafe.Pointer(&demo))
}
```

```bash
$ go run demo.go
232
```

## 函数

函数方面主要得知道：GO 语言的函数支持多个返回值，示例如下：

```go
package main

import "fmt"

func main() {
	str01, str02 := demo()
	// 多个参数间会自动添加空格
	fmt.Println(str01, str02)
	// 并且和大多数语言一样，string 是可以拼接的
	fmt.Println(str01 + str02)
}

// (string, string) 是声明函数返回值的类型
func demo() (string, string) {
	return "Hello", "Word"
}
```

## 切片

所谓的切片就是一个没有长度的数组，声明和初始化如下：

```go
var demo []int
demo = []int{1, 2, 3}
```

简写：

```go
demo := []int{1, 2, 3, 4, 5, 10}
```

可以使用`func make(t Type, size ...IntegerType) Type`构建切片：

```go
var demo []int
demo = make([]int, 10)
```

简写：

```go
demo := make([]int, 10)
```

构建切片指定切片的初始长度，最大长度：

```go
length, maxLength := 10, 20
demo := make([]int, length, maxLength)
```

以切片的形式截取数组：

```go
demo := [10]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
// 通过切片截取数组
slice := demo[4:7]
```

获取切片的长度：

```go
demo := make([]int, 10, 20)
// len() 获得切片当前长度，cap获得切片的最大长度
fmt.Println("length:", len(demo), "max length", cap(demo))
```

<font color="red">make 的切片最大长度没有什么硬性的约束力，可以使用 append 函数对切片进行扩容并追加元素，并不受到这个最大长度的限制，示例代码如下：</font>

```go
package main

import "fmt"

func main() {
	demo := make([]int, 10, 20)

	for i := 0; i < 10; i++ {
		demo[i] = i
	}

	for i := 10; i < 30; i++ {
		demo = append(demo, i)
	}

	for i := range demo {
		fmt.Println(demo[i])
	}
}
```

使用 copy() 函数复制数组：

```go
package main

import "fmt"

const length = 10

func main() {
	source := make([]int, length)

	for i := 0; i < 10; i++ {
		source[i] = i
	}

	target := make([]int, length)
    // 复制 source 到 target
	copy(target, source)

	for i := 0; i < length; i++ {
		fmt.Println(source[i], target[i])
	}
}
```

## Map

Map 的使用示例：

```go
package main

func main() {
	// 声明一个 map
	demoMap := make(map[string]string)

	demoMap["china"] = "中国"
	demoMap["usa"] = "美国"

	// 从Map中，删除元素
	delete(demoMap, "use")
}
```

## Range

range 关键字用于遍历数组、切片、Map，以及输出字符串每个字符的 Unicode，示例如下：

```go
package main

import (
	"fmt"
)

func main() {
	demoArray := []int{1, 2, 3, 4, 5, 6, 7, 8, 9}
	for index, value := range demoArray {
		fmt.Println("index:", index, "value:", value)
	}

	// 声明一个 map
	demoMap := make(map[string]string)
	demoMap["china"] = "中国"
	demoMap["usa"] = "美国"
	for key, value := range demoMap {
		fmt.Println("key:", key, "value:", value)
	}

	// 输出字符串每个字符的 Unicode 值
	for index, value := range "Hello World" {
		fmt.Println("index:", index, "value:", value)
	}
}
```

## 并发

使用 go 关键字开启 goroutine 并发运行函数：

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	// 并发运行函数
	go run("Hello word 01")
	run("Hello word 02")
}

func run(message string) {
	for i := 0; i < 100; i++ {
		fmt.Println(message)
		time.Sleep(100 * time.Millisecond)
	}
}
```

使用 chan 关键字建立线程间的通道：

```go
package main

import "fmt"

func sum(s []int, c chan int) {
	sum := 0
	// _ 表示不需要这个参数
	for _, v := range s {
		sum += v
	}
	c <- sum // 把 sum 发送到通道 c
}

func main() {
	s := []int{7, 2, 8, -9, 4, 0}

	c := make(chan int)
	go sum(s[:len(s)/2], c)
	go sum(s[len(s)/2:], c)
	x, y := <-c, <-c // 从通道 c 中接收

	fmt.Println(x, y, x+y)
}
```

chan 通道缓冲区：

```go
package main

import "fmt"

func main() {
	// 这里我们定义了一个可以存储整数类型的带缓冲通道
	// 缓冲区大小为2
	ch := make(chan int, 2)

	// 因为 ch 是带缓冲的通道，我们可以同时发送两个数据
	// 而不用立刻需要去同步读取数据
	ch <- 1
	ch <- 2

	// 获取这两个数据
	fmt.Println(<-ch)
	fmt.Println(<-ch)
}
```

chan 通道关闭：

```go
package main

import (
	"fmt"
)

func fibonacci(n int, c chan int) {
	x, y := 0, 1
	for i := 0; i < n; i++ {
		c <- x
		x, y = y, x+y
	}
	// 关闭通道
	close(c)
}

func main() {
	c := make(chan int, 10)
	go fibonacci(cap(c), c)
	// range 函数遍历每个从通道接收到的数据，因为 c 在发送完 10 个
	// 数据之后就关闭了通道，所以这里我们 range 函数在接收到 10 个数据
	// 之后就结束了。如果上面的 c 通道不关闭，那么 range 函数就不
	// 会结束，从而在接收第 11 个数据的时候就阻塞了。
	for i := range c {
		fmt.Println(i)
	}
}
```

## 错误处理

Go 语言通过内置的错误接口提供了非常简单的错误处理机制。

error类型是一个接口类型，这是它的定义：

```go
type error interface {
    Error() string
}
```

我们可以在编码中通过实现 error 接口类型来生成错误信息。

函数通常在最后的返回值中返回错误信息。使用errors.New 可返回一个错误信息：

```go
func Sqrt(f float64) (float64, error) {
    if f < 0 {
        return 0, errors.New("math: square root of negative number")
    }
    // 实现
}
```

在下面的例子中，我们在调用Sqrt的时候传递的一个负数，然后就得到了non-nil的error对象，将此对象与nil比较，结果为true，所以fmt.Println(fmt包在处理error时会调用Error方法)被调用，以输出错误，请看下面调用的示例代码：

```go
result, err:= Sqrt(-1)

if err != nil {
   fmt.Println(err)
}
```

实例：

```go
package main

import (
	"fmt"
)

// DivideError 定义一个 DivideError 结构
type DivideError struct {
	dividee int
	divider int
}

// 实现 `error` 接口
func (de *DivideError) Error() string {
	strFormat := `
    Cannot proceed, the divider is zero.
    dividee: %d
    divider: 0
`
	return fmt.Sprintf(strFormat, de.dividee)
}

// Divide 定义 `int` 类型除法运算的函数
func Divide(varDividee int, varDivider int) (result int, errorMsg string) {
	if varDivider == 0 {
		dData := DivideError{
			dividee: varDividee,
			divider: varDivider,
		}
		errorMsg = dData.Error()
		return
	} else {
		return varDividee / varDivider, ""
	}

}

func main() {
	// 正常情况
	if result, errorMsg := Divide(100, 10); errorMsg == "" {
		fmt.Println("100/10 = ", result)
	}
	// 当除数为零的时候会返回错误信息
	if _, errorMsg := Divide(100, 0); errorMsg != "" {
		fmt.Println("errorMsg is: ", errorMsg)
	}
}
```

运行结果：

```txt
100/10 =  10
errorMsg is:  
    Cannot proceed, the divider is zero.
    dividee: 100
    divider: 0
```

