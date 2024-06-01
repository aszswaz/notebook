# VUE 练习题

## 结合 v-bind:class 和 v-for，实现用户点击列表的某一个元素，就高亮那个元素

准备HTML文件：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>v-bind:style</title>
    <script type="text/javascript" src="../js/vue.js"></script>

    <style>
        .active {
            color: red;
        }
    </style>
</head>
<body>

</body>
</html>
```

第一种方式，直接把对象表达式写在标签的属性当中：

```html
<div id="app">
    <ul>
        <li v-for="(item, index) in movies" :class="{active: index === select}" @click="clickOn(index)">{{item}}</li>
    </ul>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            movies: ["复仇者联盟", "江河湖海"],
            select: 0
        },
        methods: {
            clickOn(index) {
                this.select = index
            }
        }
    })
</script>
```

第二种方式，通过函数获取 class 对象：

```html
<div id="app">
    <ul>
        <li v-for="(item, index) in movies" :class="active(index)" @click="clickOn(index)">{{item}}</li>
    </ul>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            movies: ["复仇者联盟", "江河湖海"],
            select: 0
        },
        methods: {
            clickOn(index) {
                this.select = index
            },
            active(index) {
                return {active: this.select === index}
            }
        }
    })
</script>
```

## 让用户切换账户登陆和邮箱登陆

```html
<div id="app">
    <span v-if="user">
        <label for="username">用户帐号</label>
        <input type="text" id="username" placeholder="用户帐号">
    </span>
    <span v-else>
        <label for="email">用户邮箱</label>
        <input type="text" id="email" placeholder="用户邮箱">
    </span>
    <button @click="cutover">切换</button>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            user: true
        },
        methods: {
            cutover() {
                this.user = !this.user
            }
        }
    })
</script>
```

这里有一个需要注意的地方，vue在更新视图的时候，会尽可能的重复使用一个DOM元素，它会通过虚拟DOM将新的DOM与原本的DOM进行一个对比，保留元素不变的属性，更新元素有变化的属性，这会直接导致输入框中的内容被保留下来，不会清空输入框。解决办法是给元素加一个KEY属性，只要两个元素的key属性不相同，vue就会任务为两个元素完全不同，从而实现用户切换登陆方式时，清空输入框的效果。

```html
<div id="app">
    <span v-if="user">
        <label for="username">用户帐号</label>
        <input type="text" id="username" placeholder="用户帐号" key="username">
    </span>
    <span v-else>
        <label for="email">用户邮箱</label>
        <input type="text" id="email" placeholder="用户邮箱" key="email">
    </span>
    <button @click="cutover">切换</button>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            user: true
        },
        methods: {
            cutover() {
                this.user = !this.user
            }
        }
    })
</script>
```

## 书本购物车

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>书本购物车</title>

    <script src="../js/vue.js"></script>
    <style>
        table {
            border: 1px solid #e9e9e9;
            border-collapse: collapse;
            border-spacing: 0;
        }

        th, td {
            padding: 8px 16px;
            border: 1px solid #e9e9e9;
            text-align: left;
        }

        th {
            background-color: #f7f7f7;
            color: #5c6b77;
            font-weight: 600;
        }
    </style>
</head>
<body>

<div id="app">
    <table>
        <thead>
        <tr>
            <th>序号</th>
            <th>书籍名称</th>
            <th>出版日期</th>
            <th>价格</th>
            <th>购买数量</th>
            <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in books" :key="item.id">
            <td>{{item.id}}</td>
            <td>{{item.name}}</td>
            <td>{{item.datetime}}</td>
            <td>{{showPrice(item.price)}}</td>
            <td>
                <button @click="item.number++">+</button>
                {{item.number}}
                <button @click="item.number--" v-bind:disabled="item.number <= 1">-</button>
            </td>
            <td>
                <button @click="removeBook(index)">移除</button>
            </td>
        </tr>
        </tbody>
    </table>
    <div v-if="books.length">
        <h3>总价：{{totalPrice}}</h3>
    </div>
    <div v-else>
        <h5>购物车为空</h5>
    </div>
</div>
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            books: [
                {id: 1, name: "计算机程序设计艺术", datetime: "2022-01-01", price: 100, number: 1},
                {id: 2, name: "算法导论", datetime: "2022-01-01", price: 50, number: 1},
                {id: 3, name: "朽木不可雕也", datetime: "2022-01-01", price: 0.5, number: 1},
                {id: 4, name: "HTTP权威指南", datetime: "2022-01-01", price: 20, number: 1},
                {id: 5, name: "笔记本", datetime: "2022-01-01", price: 10, number: 1}
            ]
        },
        computed: {
            // 计算总价
            totalPrice() {
                return "￥" + this.books.reduce((preValue, book) => preValue + book.number * book.price, 0)
            }
        },
        methods: {
            // 价格保留两位小时
            showPrice(price) {
                return '￥' + price.toFixed(2)
            },
            // 从购物车删除指定书籍
            removeBook(index) {
                this.books.splice(index, 1)
            }
        }
    })
</script>

</body>
</html>
```

