# VUE 基础

## mustache

mustache是一个web模板系统，其实现可用于[ActionScript](https://en.wikipedia.org/wiki/ActionScript)、[C++](https://en.wikipedia.org/wiki/C%2B%2B)、[Clojure](https://en.wikipedia.org/wiki/Clojure)、[CoffeeScript](https://en.wikipedia.org/wiki/CoffeeScript)、[ColdFusion](https://en.wikipedia.org/wiki/ColdFusion)、[Common Lisp](https://en.wikipedia.org/wiki/Common_Lisp)、[Crystal](https://en.wikipedia.org/wiki/Crystal_(programming_language))、[D](https://en.wikipedia.org/wiki/D_(programming_language))、[Dart](https://en.wikipedia.org/wiki/Dart_(programming_language))、[Delphi](https://en.wikipedia.org/wiki/Delphi_(programming_language))、[Elixir](https://en.wikipedia.org/wiki/Elixir_(programming_language))、[Erlang](https://en.wikipedia.org/wiki/Erlang_(programming_language))、[Fantom](https://en.wikipedia.org/wiki/Fantom_(programming_language))、[Go](https://en.wikipedia.org/wiki/Go_(programming_language))、[Haskell](https://en.wikipedia.org/wiki/Haskell_(programming_language))、[Io](https://en.wikipedia.org/wiki/Io_(programming_language))、[Java](https://en.wikipedia.org/wiki/Java_(programming_language))、[JavaScript](https://en.wikipedia.org/wiki/JavaScript)、[Julia](https://en.wikipedia.org/wiki/Julia_(programming_language))、[Lua](https://en.wikipedia.org/wiki/Lua_(programming_language)) , [.NET](https://en.wikipedia.org/wiki/.NET_Framework)、[Objective-C](https://en.wikipedia.org/wiki/Objective-C)、[OCaml](https://en.wikipedia.org/wiki/OCaml_(programming_language))、[Perl](https://en.wikipedia.org/wiki/Perl)、[PHP](https://en.wikipedia.org/wiki/PHP)、[Pharo](https://en.wikipedia.org/wiki/Pharo)、[Python](https://en.wikipedia.org/wiki/Python_(programming_language))、[R](https://en.wikipedia.org/wiki/R_(programming_language))、 [Racket](https://en.wikipedia.org/wiki/Racket_(programming_language))、[Raku](https://en.wikipedia.org/wiki/Raku_(programming_language))、[Ruby](https://en.wikipedia.org/wiki/Ruby_(programming_language))、[Rust](https://en.wikipedia.org/wiki/Rust_(programming_language))、[Scala](https://en.wikipedia.org/wiki/Scala_(programming_language))、[Smalltalk](https://en.wikipedia.org/wiki/Smalltalk_(programming_language))、[Swift](https://en.wikipedia.org/wiki/Swift_(programming_language))、[Tcl](https://en.wikipedia.org/wiki/Tcl_(programming_language))、[CFEngine](https://en.wikipedia.org/wiki/CFEngine)和[XQuery](https://en.wikipedia.org/wiki/XQuery)。

Mustache 被描述为“无逻辑”系统，因为它缺少任何明确的控制流语句，如if和else 条件或for 循环；然而，循环和条件评估都可以使用节标签处理列表和lambdas来实现。

它被命名为“Mustache”，因为大量使用大括号，类似于侧向[小胡子](https://en.wikipedia.org/wiki/Moustache)。

Mustache 主要用于移动和 Web 应用程序。

它有以下形式：

替换message标签到指定的位置

```txt
{{ message }}
```

两个变量相加：如果是变量是字符串则是字符串的拼接，如果变量是数值，则是数值的相加

```txt
{{message + message01}}
```

## computed

计算属性，它用于生成一个需要进行复杂计算才可以得到值的属性，比如：

```html
<div id="app">
    {{ c }}
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            a: 1,
            b: 2
        },
        /*计算属性，与 methods 类似，但是与 methods 不同的是，它概念上是作为属性使用，而不是作为一个函数使用*/
        computed: {
            c: function () {
                return this.a + this.b;
            }
        }
    })
</script>
```

computed 可以拥有 set、get 函数：

```html
<div id="app">
    {{ c }}
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            a: 0,
            b: 1
        },
        /*computed 中的属性与 data 中的属性的一个不同的地方是，computed 的属性可以拥有 getter、setter 函数，而 data 中的属性不能拥有这两个函数*/
        computed: {
            c: {
                set(obj) {
                    this.a = obj.a
                    this.b = obj.b
                },
                get() {
                    return this.a + this.b
                }
            }
        }
    })
</script>
```

之后在浏览器控制台输入`app.c = {a: 5, b: 5}`，可以看到页面上现实的 C 的值变成了10。

computed 和 methods 的区别：computed 中的属性多次使用，仅仅只会调用一次属性值的生成函数，而 methods 则是多次使用，会多次调用函数，因为在 vue 的定义当中，computed 中的函数在第一次调用后，会生成一个缓存，而 methods 则是只是对象的函数，不会生成缓存。示例如下：

```html
<div id="app">
    {{ message }}
    {{ message }}
    {{ message }}
    {{ getMessage() }}
    {{ getMessage() }}
    {{ getMessage() }}
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {},
        computed: {
            message() {
                console.info("message: i was called.")
                return "Hello World"
            }
        },
        methods: {
            getMessage() {
                console.info("getMessage: i was called.")
                return "Hello World"
            }
        }
    })
</script>
```

控制台打印：

```txt
message: i was called.
getMessage: i was called.
getMessage: i was called.
getMessage: i was called.
```

## 生命周期

VUE 对象的生命周期：对象的创建  $\Rightarrow$ 标签绑定  $\Rightarrow$ 更新视图  $\Rightarrow$ 销毁对象，在VUE对象的每个生命周期都有对应的函数回调，如下：

```html
<div id="app">{{message}}</div>
<script type="text/javascript">
    let app = new Vue({
        // 绑定避标签
        el: "#app",
        data: {
            message: "Hello World."
        },
        // 对象被创建之前
        beforeCreate: function () {
            console.info("app before create.")
        },
        // 对象创建后
        created: function () {
            console.info("app object is created.")
        },
        // 对象挂载前
        beforeMount: function () {
            console.info("app object before mount.")
        },
        // 对象挂载后
        mounted: function () {
            console.info("app object is mount.")
        },
        // 对象更新前
        beforeUpdate: function () {
            console.info("app before update.")
        },
        // 对象更新后
        updated: function () {
            console.info("app updated.")
        },
        // 对象销毁前
        beforeDestory: function () {
            console.info("app before destory")
        },
        // 对象销毁后
        destroyed: function () {
            console.info("app destroyed")
        }
    })
    // 触发对象的 beforeUpdate 和 updated 函数
    app.message = 'Hello World'
</script>
```



## 指令

### v-once

```html
<body>
<div id="app">
    <h1>{{ message }}</h1>
    <!-- v-once 指令表示这个标签只渲染一次，message有后续的任何改动，该标签都不会有变化 -->
    <h1 v-once>{{ message }}</h1>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            message: "Hello World"
        }
    })
</script>
```

v-once的作用应该只是固定视图，让视图不随着对象属性的变化而变化，标签一旦被渲染，就是固定的。

### v-html

```html
<div id="app">
    <h1 v-html="url"></h1>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            url: "<a href='https://www.example.com'>example.com</a>"
        }
    })
</script>
```

v-html的作用，就是把原本作为html代码的字符串，最为一个DOM插入到目标DOM当中。这里的演示就是把a标签插入到h1标签当中

### v-pre

```html
<div id="app">
    <h1 v-pre>{{ message }}</h1>
</div>
```

v-pre的作用是让vue不要解析标签中的mustache，本示例产生的效果就是直接让浏览器展示“{{ message }}”

### v-cloak

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script type="text/javascript" src="../js/vue.js"></script>
    <style>
        /*隐藏拥有 v-cloak 属性的标签*/
        [v-cloak] {
            display: none;
        }
    </style>
</head>
<body>
<div id="app">
    <!--v-cloak是配合CSS使用的，它最主要的作用就是防止JS的运行出现延迟，从而导致用户直接看到“{{ message }}”-->
    <h1 v-cloak>{{ message }}</h1>
</div>
<script type="text/javascript">
    // 模拟JS的延迟加载、HTTP的请求耗时等
    setTimeout(function () {
        const app = new Vue({
            el: "#app",
            data: {
                message: "Hello World"
            }
        })
    }, 1000, 1000)
</script>
</body>
</html>
```

v-cloak发挥作用的流程如下，首先head中定义的style，让浏览器隐藏所有拥有c-cloak属性的DOM标签，页面加载1秒钟后，Vue对象的初始化开始，Vue会删除标签的v-cloak属性，浏览器会重新展示这个DOM，由于此时vue对mustache的解析和替换操作已经完成，所以不会出现“{{ message }}”展示给用户的情况。

### v-bind

```html
<div id="app">
    <a v-bind:href="example">example</a>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            example: "https://www.example.com/"
        }
    })
</script>
```

v-bind可以把指定的值，放到属性当中，本示例就是达到a标签的超链接的链接地址为动态的目的。除了这些，v-bind还可以控制class属性：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>v-bind:class</title>
    <script type="text/javascript" src="../js/vue.js"></script>
    <style>
        /*激活状态下的字体颜色*/
        .activation {
            color: red;
        }

        .underscore {
            /*下划线*/
            text-decoration-line: underline;
        }

        .original {
            font-size: 16px;
        }
    </style>
</head>
<body>
<div id="app">
    <!-- :class 是 v-bind:class 的语法糖，v-bind:class 除了直接填充固定的值以外，支持通过对象和数组来控制，同时支持通过函数获取对象和数组。标签原本的 class 属性能够与 v-bind:class 同时使用 -->
    <h1 class="original" :class="{activation: isActivation, underscore: isUnderscore}">{{ message }}</h1>
    <h1 class="original" :class="getClassObject()">{{ message }}</h1>
    <h1 class="original" :class="getClassArray()">{{ message }}</h1>
    <button @click="cutover">切换</button>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            message: "Hello World",
            isActivation: true,
            isUnderscore: false,
            activation: 'activation',
            underscore: 'underscore'
        },
        methods: {
            cutover() {
                this.isActivation = !this.isActivation;
                this.isUnderscore = !this.isUnderscore;
            },
            getClassObject() {
                return {activation: this.isActivation, underscore: this.isUnderscore}
            },
            getClassArray() {
                return [this.activation, this.underscore]
            }
        }
    })
</script>
</body>
</html>
```

v-bind 绑定 style 属性：

```html
<div id="app">
    <!-- 与 v-bind:class 一样，v-bind 也可以绑定 style，也支持对象和数组，对象的 KEY 是 css 属性，值也是 css 规定的值，与 css 不同的是，一些使用“-”分割单词的 css 属性，在这里需要写驼峰形式，比如 background-color 需要写成 backgroundColor -->
    <!-- 错误的写法 -->
    <!--<div style="width: 100px; height: 100px" :style="{background-color: 'red'}"></div>-->
    <!-- 正确的写法 -->
    <div style="width: 100px; height: 100px" :style="{backgroundColor: 'red'}"></div>
    <!-- 直接使用对象的值 -->
    <h1 v-bind:style="{color: color}">{{ message }}</h1>
    <!-- 通过函数获取 style 对象 -->
    <h1 v-bind:style="getStyle()">{{ message }}</h1>
    <!-- style 的对象绑定 -->
    <h1 v-bind:style="getStyles()">{{ message }}</h1>
</div>
<script type="text/javascript">
    new Vue({
        el: '#app',
        data: {message: "Hello World", color: 'red'},
        methods: {
            getStyle() {
                return {color: this.color}
            },
            getStyles() {
                return [
                    {color: 'red'},
                    {backgroundColor: 'black'}
                ]
            }
        }
    })
</script>
```

### v-on

标签的事件监听指令。

监听点击事件

```html
<div id="app">
    <!--如果方法需要参数，但是调用方法时又没有传入参数，vue会从浏览器获取 event 对象，作为参数传给方法-->
    <button v-on:click="clickOn01">点击01</button>
    <!--方法即需要参数，又需要 event 对象-->
    <button v-on:click="clickOn02('Hello World', $event)">点击02</button>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {},
        methods: {
            clickOn01(event) {
                console.info("event: ", event)
            },
            clickOn02(message, event) {
                console.info("message: ", message, ", event: ", event)
            },
        }
    })
</script>
```

事件监听的修饰符：

```html
<div id="app">
    <div v-on:click="clickOn01">
        <h1>我是一个DIV</h1>
        <!--子标签被点击，子标签的鼠标点击事件优先被触发，然后会触发父标签的点击事件-->
        <button v-on:click="clickOn02">我是一个BUTTON-01</button>
        <!--stop是对点击事件的一个修饰，它表示子标签的点击事件被触发后，不要触发父标签的点击事件-->
        <button v-on:click.stop="clickOn02">我是一个BUTTON-02</button>
    </div>

    <form action="https://www.baidu.com" method="get">
        <!--这种情况下，v-on 监听的点击事件和表单的提交动作会被同时触发-->
        <input type="submit" value="提交-01" @click="clickOn03">
        <!--prevent也是对点击事件的一个修饰，它表示 v-on:click 监听的点击事件，强行覆盖标签默认的点击事件，这里的效果就是让表单提交无效-->
        <input type="submit" value="提交-02" @click.prevent="clickOn03">
    </form>

    <label>
        <!--键盘监听-->
        <input type="text" @keyup="keyUp">
        <!--监听回车键-->
        <input type="text" @keyup.enter="keyUp">
    </label>

    <!--once 表示这个标签只能被点击一次-->
    <button @click.once="clickOn04">我是一个BUTTON-04</button>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {},
        methods: {
            clickOn01() {
                console.info("clickOn01")
            },
            clickOn02() {
                console.info("clickOn02")
            },
            clickOn03() {
                console.info("clickOn03")
            },
            keyUp() {
                console.info("enter")
            },
            clickOn04() {
                console.info("clickOn04")
            },
        }
    })
</script>
```

### v-if

通过判断条件控制标签的显示和隐藏

```html
<div id="app">
    <!--通过 v-if、v-else-if、v-else 可以控制标签的展示和隐藏-->
    <div v-if="code >= 0 && code < 10">code >= 0 && code < 10</div>
    <div v-else-if="code >= 10 && code < 100">code >= 10 && code < 100</div>
    <div v-else>code >= 100</div>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            code: Math.random() * 1000
        }
    })
</script>
```

### v-show

v-show 也是用来决定元素是否展示在页面上，与 v-if 不同的是，在不显示元素的情况下，v-if 控制的元素根本不在DOM当中，而 v-show 控制元素任然在DOM当中，仅仅只是将元素的CSS属性添加一个 `display: none;`。

```html
<div id="app">
    <div v-show="show">Hello World</div>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            show: true
        }
    })
</script>
```

### v-for

v-for 可以用来遍历数组和对象。

```html
<div id="app">
    <!--遍历数组-->
    <ul>
        <li v-for="item in elements" :key="item">{{item}}</li>
    </ul>
    <ul>
        <li v-for="(item, index) in elements" :key="item">{{item}} - {{index + 1}}</li>
    </ul>

    <!--遍历对象-->
    <ul>
        <!--只输出 value-->
        <li v-for="item in object" :key="item">{{item}}</li>
    </ul>
    <ul>
        <li v-for="(value, key) in object" :key="key">{{key}} - {{value}}</li>
    </ul>
    <ul>
        <li v-for="(value, key, index) in object" :key="key">{{index + 1}} - {{key}} - {{value}}</li>
    </ul>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            elements: ["element01", "element02", "element03"],
            object: {
                field01: "field01",
                field02: "field02",
                field03: "field03"
            }
        }
    })
</script>
```

官方建议在使用`v-for`遍历数组的时候，给元素指定key，可以让 vue 快速找到新插入的元素的目标位置，做好元素的重排列工作，这样有助于提高在列表中插入一个元素时，页面的渲染效率，key需要与元素相关，数组的下标与元素没有特定的关系，不建议使用 index 作为 key，需要展现为列表的数据，一般会带有唯一标识符，将它设置为key就行。

### v-model

v-model 用于绑定对象的属性和表单输入框，使得输入框当中的值和对象属性的值进行一个动态帮顶，输入框的内容是什么，对象属性的值就是什么，反过来说，对象属性是什么，输入框内容就是什么。

```html
<div id="app">
    <label>
        2的<input type="text" v-model="power">次方是{{result}}
    </label>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            power: null
        },
        computed: {
            result() {
                let number

                if (this.power == null || this.power === "")
                    return 0
                else if (this.power === "1")
                    return 2
                else
                    number = parseInt(this.power)

                let result = 2
                for (let i = 0; i < number; i++) {
                    result *= 2
                }
                return result
            }
        }
    })
</script>
```

v-model 结合单选按钮使用：

```html
<div id="app">
    <label>
        <!-- v-model 指向同一个属性时，可以获得单选项互斥的效果，等同于表单的 name 相同的互斥效果 -->
        <input type="radio" v-model="gender" value="男">男
        <input type="radio" v-model="gender" value="女">女
    </label>
    <h3>当前性别：{{gender}}</h3>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            gender: "男"
        }
    })
</script>
```

v-model 结合复选按钮的使用：

```html
<div id="app">
    <!--单选框-->
    <label>
        <input type="checkbox" v-model="protocol">用户隐私协议
    </label>
    <h3>protocol: {{protocol}}</h3>

    <!--多选框-->
    <label><input type="checkbox" value="篮球" v-model="hobbies">篮球</label>
    <label><input type="checkbox" value="足球" v-model="hobbies">足球</label>
    <label><input type="checkbox" value="羽毛球" v-model="hobbies">羽毛球</label>
    <h3>hobbies: {{hobbies}}</h3>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            protocol: false,
            hobbies: ["羽毛球"]
        }
    })
</script>
```

v-model 集合复选框的使用：

```html
<div id="app">
    <!--单选-->
    <label>
        <select name="appearance" v-model="appearance">
            <option value="帅">帅</option>
            <option value="好帅">好帅</option>
            <option value="特别帅">特别帅</option>
        </select>
    </label>
    <h3>{{appearance}}</h3>

    <!--多选-->
    <label>
        <select name="appearances" v-model="appearances" multiple>
            <option value="帅">帅</option>
            <option value="好帅">好帅</option>
            <option value="特别帅">特别帅</option>
        </select>
    </label>
    <h3>{{appearances}}</h3>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            appearance: "特别帅",
            appearances: []
        }
    })
</script>
```

v-model 的几个修饰符：

```html
<div id="app">
    <!--懒加载修饰符，只有在用户按了回车之后，输入库中的内容才会与对象的属性同步-->
    <label>
        <input type="text" v-model.lazy="text01">
    </label>
    <h3>text01: {{text01}}</h3>

    <!--number 修饰符表示从输入框接收的内容为数字，这样可以不需要进行类型转换-->
    <label>
        <input type="number" v-model.number="number">
    </label>
    <h3>number: {{number}} - {{typeof number}}</h3>

    <!--trim 修饰符可以去除空格-->
    <label>
        <input type="text" v-model.trim="text02">
    </label>
    <h3>text02: {{text02}}</h3>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            text01: null,
            number: null,
            text02: null
        }
    })
</script>
```

