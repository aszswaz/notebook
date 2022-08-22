# VUE 规范

## `v-for`和`v-if`不要一起使用

正面例子：

```html
<div id="list-rendering">
    <ol>
        <template v-for="item in groceryList" v-bind:key="item.id">
            <li v-if="item.show">{{ item }}</li>
        </template>
    </ol>
</div>
```

```javascript
const data = {
    data() {
        return {
            groceryList: [
                {id: 1, text: 'text01', show: true},
                {id: 2, text: 'text02', show: false},
                {id: 3, text: 'text03', show: true},
                {id: 4, text: 'text04', show: false}
            ]
        }
    }
}

const app = Vue.createApp(data)
app.mount("#list-rendering")
```

反面例子：

```html
<div id="list-rendering">
    <ol>
        <li v-for="item in groceryList" v-if="item.show" v-bind:key="item.id">
            {{ item }}
        </li>
    </ol>
</div>
```

js代码不变，这种情况会导致vue出错，无法遍历数据数组。

