# vue

## Hello World

使用vue把Hello World替换到DOM当中

```html
<!DOCTYPE html>
<!--suppress JSUnresolvedVariable, JSUnresolvedFunction, JSUnusedGlobalSymbols -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>vue-study</title>
    <script type="text/javascript" src="js/vue/vue.global.js"></script>
</head>
<body>
<div id="counter">
    <!--Hello World 会被替换到这里-->
    {{ counter }}
</div>
<script type="text/javascript">
    let object = {
        counter: "Hello Word"
    }

    function data() {
        return object;
    }

    const counter = {data};
    // 把 vue 对象关联到 id 为counter的DOM标签
    Vue.createApp(counter).mount('#counter');
</script>
</body>
</html>
```

以下是上面代码的简写：

```javascript
const counter = {
    data() {
        return {
            counter: "Hello World"
        }
    }
};
Vue.createApp(counter).mount('#counter');
```

## 定时修改DOM

通过 VUE 的定时触发功能，实现 A 和 B 对话：

```javascript
let index = 0;
let messages = ["A: Nice to meet you!", "B: Nice to meet you, too!", "A: Where are you come from?", "B: I' come from China."];

const counter = {
    data() {
        return {
            counter: messages[index++]
        }
    },
    mounted() {
        setInterval(() => {
            this.counter = messages[index++ % messages.length];
        }, 1000)
    }
};
Vue.createApp(counter).mount('#counter');
```

## 绑定标签属性

```html
<div id="demo">
  <span v-bind:title="message">
    鼠标悬停几秒钟查看此处动态绑定的提示信息！
  </span>
</div>
```

```javascript
const demo = {
    data() {
        return {
            message: "别看了，再看你也不会比我帅。"
        }
    }
};
Vue.createApp(demo).mount('#demo');
```

`v-bind`是一个vue的指令，它的作用就是把标签属性帮顶到js对象的属性。上述代码就是把标签的title属性绑定到对象的meessage属性。

<font color="red">如果这个属性已经被显式声明，那么`v-bind`将无法绑定该属性。如下，显式的声明了`title`属性，导致`v-bind:title`指令无效</font>

```html
<div id="demo">
  <span title="你个冒牌货，有什么资格比我帅？" v-bind:title="message">
    这里有一条隐藏信息！鼠标悬停在这里即可查看！
  </span>
</div>
```

以下两份代码的结果与上述结果等同，都会导致 `v-bind:title`失效。

```html
<div id="demo">
  <span title="" v-bind:title="message">
    这里有一条隐藏信息！鼠标悬停在这里即可查看！
  </span>
</div>
```

```html
<div id="demo">
  <span title v-bind:title="message">
    这里有一条隐藏信息！鼠标悬停在这里即可查看！
  </span>
</div>
```

## 用户事件监听

`v-on`可以添加一个事件监听器。

```html
<div id="event-handling">
    <p>{{ message }}</p>
    <button v-on:click="reverseMessage">反转</button>
</div>
```

```javascript
const demo = {
    data() {
        return {
            message: "还有谁？比我帅？"
        }
    },
    methods: {
        reverseMessage() {
            this.message = this.message.split('').reverse().join('');
        }
    }
};
Vue.createApp(demo).mount('#event-handling');
```

`v-model`可以实现表单输入和DOM的双向绑定，比如：把用户输入到文本框内的文字同步显式在 \<P\> 标签

```html
<div id="two-way-binding">
    <p>{{ message }}</p>
    <label>
        <!--同步用户的输入到P标签中，P标签的内容也会同步显示在文本框当中-->
        <input v-model="message"/>
    </label>
</div>
```

````javascript
const TwoWayBinding = {
    data() {
        return {
            message: '没我帅的家伙。'
        }
    }
}

Vue.createApp(TwoWayBinding).mount('#two-way-binding')
````

`v-if`可以控制一个标签是否展示

```html
<div id="conditional-rendering">
    <span v-if="seen">现在你看到我了</span>
    <button v-on:click="show">{{ text }}</button>
</div>
```

```javascript
const ConditionalRendering = {
    data() {
        return {
            // 显式标签
            seen: true,
            text: "隐藏"
        }
    },
    methods: {
        show() {
            // 反转标签的“展示/隐藏”状态
            this.seen = !this.seen;
            if (this.seen) {
                this.text = "隐藏";
            } else {
                this.text = "展示";
            }
        }
    }
}

Vue.createApp(ConditionalRendering).mount('#conditional-rendering')
```

## 数据列表展示

`v-for`可以绑定数组的数据来渲染一个项目列表

```html
<div id="list-rendering">
    <ol>
        <li v-for="todo in todos">
            {{ todo.text }}
        </li>
    </ol>
</div>
```

```javascript
const ListRendering = {
    data() {
        return {
            todos: [
                {text: 'Learn JavaScript'},
                {text: 'Learn Vue'},
                {text: 'Build something awesome'}
            ]
        }
    }
}

Vue.createApp(ListRendering).mount('#list-rendering')
```

## 组件

在 Vue 中，组件本质上是一个具有预定义选项的实例。在 Vue 中注册组件很简单：如对 `App` 对象所做的那样创建一个组件对象，并将其定义在父级组件的 `components` 选项中：

```html
<div id="list-rendering">
    <ol>
        <todo-item></todo-item>
    </ol>
</div>
```

```js
const todoItem = {
    template: `<li>This is a todo</li>`
}

const app = Vue.createApp({
    components: {
        todoItem
    }
})

app.mount("#list-rendering")
```

以上代码的效果就是把注册一个名称为`todoItem`的组件，组件帮顶的标签根据组件名称而定，组件名称支持驼峰命名法。在上面代码中，组件名称`todoItem`对应的标签就是`todo-item`。另外允许组件名称的首字母大写。最终实现的效果就是`todoItem`组件的`template`替换到`todo-item`标签，从而得到以下结果：

```html
<div id="list-rendering">
    <ol>
        <li>This is a todo</li>
    </ol>
</div>
```

`<todo-item></todo-item>`写成`<todo-item/>`也是可以的，作为vue组件，它们的效果等同。不过HTML并不支持自闭合标签，虽然有作用，但是不建议写在.html文件中，可以写在.vue文件中

组件还可以结合vue指令使用，比如结合`v-bind`和`v-for`：

```html
<div id="list-rendering">
    <ol>
        <todo-item
                v-for="item in groceryList"
                v-bind:todo="item"
                v-bind:key="item.id"></todo-item>
    </ol>
</div>
```

```js
const data = {
    data() {
        return {
            groceryList: [
                {id: 0, text: 'Vegetables'},
                {id: 1, text: 'Cheese'},
                {id: 2, text: 'Whatever else humans are supposed to eat'}
            ]
        }
    }
}

const app = Vue.createApp(data)

app.component('todo-item', {
    // 这里是使用todo-item标签的属性todo，todo属性被v-bind指定为item。由于这里是通过组件生成列表，原本的标签会被组件替代，所以只能使用这种麻烦的方式才能成功的遍历数组，并生成数据列表
    props: ['todo'],
    template: '<li>id: {{ todo.id }}, text: {{ todo.text }}</li>'
})

app.mount("#list-rendering")
```

<font color="red">VUE官方规范要求，使用for遍历数组时，必须要指定每一个数据标签的key。原因是，vue可以根据原列表标签的key与新列表标签的key进行一个对比，从而在操作单条或多条数据的时候，确定哪些标签受到了影响，从而做出正确的响应。以删除列表中的数据为例，示例如下：</font>

首先是正确的例子：

```html
<div id="list-rendering">
    <ol>
        <li v-for="item in groceryList" v-bind:key="item.id">
            <label>{{ item }}<input/></label>
        </li>
    </ol>

    <button v-on:click="deleteOne">删除</button>
</div>
```

```javascript
const data = {
    data() {
        return {
            groceryList: [
                {id: 1, text: 'text01'},
                {id: 2, text: 'text02'},
                {id: 3, text: 'text03'},
                {id: 4, text: 'text04'}
            ]
        }
    },
    methods: {
        deleteOne() {
            // 数据的splice函数作用是从 xxx 位置开始，删除 n 个元素
            this.groceryList.splice(0, 1);
        }
    }
}

const app = Vue.createApp(data)
app.mount("#list-rendering")
```

在四个文本框当中随便输入一些不同的内容，然后单击“删除”按钮，列表第一行会被删除，其余行上移。文本框也会随同行一起上移，内容保持不变。

反面例子如下：

删除`v-bind:key="item.id"`，js代码不变

```html
<div id="list-rendering">
    <ol>
        <!--删除了 v-bind:key="item.id"-->
        <li v-for="item in groceryList">
            <label>{{ item }}<input/></label>
        </li>
    </ol>

    <button v-on:click="deleteOne">删除</button>
</div>
```

执行相同的操作。但是文本框是不会随行移动，只会相应的减少一行。比如，文本框中的值依次是：01、02、03、04，删除一行就会变成：01、02、03，而不是预期的：02、03、04。
