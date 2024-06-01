# VUE 2

## 安装方式

### 直接在HTML当中引入

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>vue demo</title>
    <!--引入VUE-->
    <script type="text/javascript" src="../js/vue.js"></script>
</head>
<body>
</body>
</html>
```

## 简短的vue示例

### Hello World

演示内容：vue对象的创建，以及vue对象和标签的绑定

```html
<div id="app">{{ message }}</div>
<script type="text/javascript">
    const app = new Vue({
        // 通过id绑定标签
        el: "#app",
        // 设置对象的属性，这里其实是做了对象代理，data当中所有书许属性都会被映射为app对象的属性，对属性的修改也会被同步到标签
        data: {
            message: "Hello World"
        }
    })
</script>
```

### 遍历数组

演示内容：通过`v-for`指令展示数组

```html
<div id="app">
    <ul>
        <!--suppress JSUnresolvedVariable -->
        <li v-for="item in masterpiece">{{ item.name }} 作者：{{ item.author }}</li>
    </ul>
</div>

<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            masterpiece: [
                {
                    name: "红楼梦",
                    author: "曹雪芹"
                },
                {
                    name: "西游记",
                    author: "吴承恩"
                },
                {
                    name: "水浒传",
                    author: "施耐庵"
                },
                {
                    name: "三国演义",
                    author: "罗贯中"
                }
            ]
        }
    })
</script>
```

### 计数器

演示内容：通过`v-on`监听用户事件，这个演示的是监听按钮的点击事件

```html
<div id="app">
    <h1>当前计数：{{ counter }}</h1>
    <!--简单方式-->
    <!--
    <button v-on:click="counter++">+</button>
    <button v-on:click="counter--;">-</button>
    -->
    <!--函数方式-->
    <button v-on:click="add">+</button>
    <button v-on:click="reduce">-</button>
</div>

<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            counter: 0
        },
        methods: {
            add: function () {
                this.counter++
            },
            reduce: function () {
                this.counter--
            }
        }
    })
</script>
```

