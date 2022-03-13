# VUE 组件

## 组件的创建、注册和使用

首先请看组件最基本的创建、注册和使用：

```html
<div id="app">
    <!--调用组件-->
    <hello v-for="i in 10"></hello>
</div>
<script type="text/javascript">
    // 创建一个组件对象
    const template = Vue.extend({
        template: `
            <div>
                <h1>Hello World.</h1>
            </div>
        `
    })
    // 注册一个组件，并指定组件的名称。这种方式注册的组件是全局组件，所有的 Vue 实例都是可以直接使用的
    // Vue.component('hello', template)

    const app = new Vue({
        el: "#app",
        // 注册一个局部组件，只能在当前的实例使用
        components: {
            hello: template
        }
    })
</script>
```

语法糖形式：

```html
<div id="app">
    <!--调用组件-->
    <hello v-for="i in 10"></hello>
</div>
<script type="text/javascript">
    // 注册一个组件，并指定组件的名称。这种方式注册的组件是全局组件，所有的 Vue 实例都是可以直接使用的
    /*Vue.component('hello', {
        template: `
            <div>
                <h1>Hello World.</h1>
            </div>
        `
    })*/

    const app = new Vue({
        el: "#app",
        // 注册一个局部组件，只能在当前的实例使用
        components: {
            hello: {
                template: `
                    <div>
                        <h1>Hello World.</h1>
                    </div>`
            }
        }
    })
</script>
```

上面两种写法都有不能很好的格式化组件代码缺点，可以改成以下形式：

```html
<div id="app">
    <template01></template01>
    <template02></template02>
</div>

<!--通过 script 标签写组件-->
<script type="text/x-template" id="template01">
    <div>
        <h1>template01</h1>
    </div>
</script>

<!--通过 template 写组件-->
<template id="template02">
    <div>
        <h1>template02</h1>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        components: {
            template01: {
                template: '#template01'
            },
            template02: {
                template: '#template02'
            }
        }
    })
</script>
```



## 子组件和父组件

```html
<div id="app">
    <super></super>
</div>
<script type="text/javascript">
    // 子组件
    const childTemplate = Vue.extend({
        template: `<div><p>child: Hello World</p></div>`
    })
    // 父组件
    const superTemplate = Vue.extend({
        template: `
          <div><p>super: Hello World</p>
          <child></child>
          </div>`,
        // 注册子组件
        components: {
            child: childTemplate
        }
    })

    const app = new Vue({
        el: "#app",
        components: {
            super: superTemplate
        }
    })
</script>
```

## 在组件中渲染数据

在组件中，不能直接使用 Vue 对象的数据，只能使用组件对象自己的数据：

```html
<div id="app">
    <!--suppress HtmlUnknownTag -->
    <template01></template01>
</div>

<template id="template01">
    <div>
        <h1>{{message01}}</h1>
        <h1>{{message02}}</h1>
        <h1>{{methodHello()}}</h1>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        // 组件无法直接使用 data 当中的数据
        data: {
            message01: "Hello World-01"
        },
        components: {
            template01: {
                template: '#template01',
                // 组件对象的 data 必须是一个函数
                data() {
                    return {
                        message02: "Hello World-02"
                    }
                },
                // 组件对象也有 methods
                methods: {
                    methodHello() {
                        return "Method Hello World"
                    }
                }
            }
        }
    })
</script>
```

## 组件的数据传递

组件不能直接使用 Vue 实例的数据，但是可以把 Vue 实例的数据传递给组件使用，父组件和子组件之间的数据传递也是如此：

```html
<div id="app">
    <!--template-message 和 template-books 定义在模板的 props 当中-->
    <!--suppress HtmlUnknownTag -->
    <template01 :template-message="message" :template-books="books"></template01>
</div>

<template id="template01">
    <div>
        <h1>{{templateMessage}}</h1>
        <ul>
            <li v-for="item in templateBooks">{{item}}</li>
        </ul>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {
            books: ["钢铁是怎样练成的", "废物是怎样堕落的", "我是怎样秃顶的"],
            message: "Hello World"
        },
        components: {
            template01: {
                template: "#template01",
                // 通过 props 向组件传递数据
                // props 可以是数组，它的值是模板的属性名称
                // props: ['template-message', 'template-books']
                // props 也可以是对象，为对象的时候，可以给属性设置一些参数
                props: {
                    // 声明一个模板属性，类型为 String
                    templateMessage: String,
                    // 模板属性的声明，可以设置多个参数
                    templateBooks: {
                        // 属性值的类型
                        type: Array,
                        // 属性的默认值，如果属性的值是一个 Object 或 Array，默认值必须是一个函数
                        default() {
                            return ["懒惰是怎样保持的"]
                        },
                        // 设置属性是否必须
                        required: true
                    }
                }
            }
        }
    })
</script>
```

子组件向父组件传递事件，以及数据：

```html
<div id="app">
    <!--child-call 是一个自定义事件，子组件向父组件该事件，并传递数据-->
    <!--suppress HtmlUnknownTag -->
    <template-demo @child-call="childEvent"></template-demo>
</div>

<template id="templateDemo">
    <div>
        <button @click="childClick">请你点击我</button>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        methods: {
            childEvent(childData) {
                console.info("child data:", childData)
            }
        },
        components: {
            templateDemo: {
                template: "#templateDemo",
                methods: {
                    childClick() {
                        // 向父组件发送一个自定义事件，以及事件数据
                        this.$emit("child-call", "Hello super component!")
                    }
                }
            }
        }
    })
</script>
```

通过 watch 实现子组件的表单控件与父组件的数据进行双向关联：

```html
<div id="app">
    <!--子组件中的表单控件，与父组件的数据进行双向关联-->
    <!--suppress HtmlUnknownTag -->
    <template-demo :super-message="message" @modify-text="modifyMessage"></template-demo>
    <h1>{{message}}</h1>
</div>

<template id="templateDemo">
    <div>
        <label>
            <input type="text" v-model="childMessage">
        </label>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const templateDemo = {
        template: "#templateDemo",
        props: {
            // 接收来自父组件的数据
            superMessage: String
        },
        data() {
            return {
                // 自己的数据与父组件的数据进行关联
                childMessage: this.superMessage
            }
        },
        watch: {
            // 将子组件的表单控件，与父组件的数据进行双向绑定
            childMessage(newValue) {
                // 修改自己的数据
                this.childMessage = newValue
                // 修改父组件的数据
                this.$emit("modify-text", newValue)
            }
        }
    }

    const app = new Vue({
        el: "#app",
        data: {
            message: "Hello World"
        },
        components: {
            templateDemo
        },
        methods: {
            // 接收来自子组件的数据
            modifyMessage(newValue) {
                this.message = newValue;
            }
        }
    })
</script>
```

## 父组件和子组件的相互调用

父组件调用子组件的方法：

```html
<div id="app">
    <demo></demo>
    <demo></demo>
    <!--通过 $refs 调用子组件，需要指定子组件的 ref 属性-->
    <demo ref="three"></demo>
    <button @click="callSon">demo button</button>
</div>

<template id="demo">
    <div>
        <h1>template demo</h1>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const demo = {
        template: "#demo",
        methods: {
            // 一个由父组件调用的函数
            superCall() {
                console.info("super call.")
            }
        }
    }

    const app = new Vue({
        el: "#app",
        components: {demo},
        methods: {
            // 调用子组件
            callSon() {
                // 通过 $children 调用
                console.info("Use $children...")
                console.info("$children:", this.$children)
                this.$children[0].superCall()

                console.info("Use $refs...")
                console.info("$refs:", this.$refs)
                this.$refs['three'].superCall()
            }
        }
    })
</script>
```

子组件调用父组件：

```html
<div id="app">
    <son-template></son-template>
</div>

<template id="son">
    <div>
        <h1>son template</h1>
        <grandson-template></grandson-template>
    </div>
</template>
<template id="grandson">
    <div>
        <h1>grandson template</h1>
        <button @click="callSuper">点击</button>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        data: {name: "ancestor"},
        components: {
            // 子组件
            sonTemplate: {
                template: "#son",
                data() {
                    return {
                        name: "son"
                    }
                },
                // 孙子组件
                components: {
                    grandsonTemplate: {
                        template: "#grandson",
                        methods: {
                            callSuper() {
                                // 调用父组件
                                console.info("$parent:", this.$parent)
                                console.info("super name:", this.$parent.name)
                                // 调用根组件
                                console.info("$root:", this.$root)
                                console.info("root name:", this.$root.name)
                            }
                        }
                    }
                }
            }
        }
    })
</script>
```

组件当中插槽的使用：

```html
<div id="app">
    <!--suppress HtmlUnknownTag -->
    <demo>
        <h1>Hello World</h1>
        <h1>这是第二个值</h1>
        <!--替换到指定插槽-->
        <h1 slot="demo">我被替换了</h1>
        <!--
        在父组件中使用来自子组件的数据展示列表，
        找到 name 为“data-slot”的插槽，映射为插槽对象“data”，在插槽对象中具有通过 v-bin 绑定的属性“books”，而这个属性是指向组件的数据“books”，这样就达到了父组件通过插槽使用子组件数据的目的
        -->
        <template v-slot:data-slot="data">
            <ul>
                <li v-for="item in data.books">super: {{item}}</li>
            </ul>
        </template>
    </demo>
</div>

<template id="demo">
    <div>
        <h3>demo</h3>
        <!--插槽，调用组件时，组件的标签包裹的内容会被替换到这里-->
        <!--<slot></slot>-->
        <!--这是一个具有默认内容的插槽。另外，同一个组件当中存在多个 slot，那么插槽的内容会被复制多份-->
        <slot><h1>你好！世界！</h1></slot>
        <!--通过插槽的名字指定要被替换的插槽-->
        <slot name="demo"><h1>我没被替换</h1></slot>
        <!--这个插槽用于演示父组件使用子组件的数据-->
        <slot name="data-slot" :books="books">
            <ul>
                <li v-for="item in books">son: {{item}}</li>
            </ul>
        </slot>
    </div>
</template>

<!--suppress JSAnnotator -->
<script type="text/javascript">
    const app = new Vue({
        el: "#app",
        components: {
            demo: {
                template: "#demo",
                data() {
                    return {
                        books: ["计算机程序设计艺术", "算法导论", "论程序员是什么修炼的"]
                    }
                }
            }
        }
    })
</script>
```

