# 在 Webpack 当中使用 vue

## vue 的完全（开发）版本使用

### 安装

```bash
# 安装 vue2
$ npm install --save vue
```

index.html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="demo"><h1>{{ message }}</h1></div>
<script src="./dist/bundle.js"></script>

</body>
</html>
```

src/main:

```javascript
import Vue from 'vue'
const app = new Vue({
    el: "#demo",
    data: {
        message: "Hello World"
    }
})
```

webpack.config.js:

```javascript
const path = require("path")

module.exports = {
    mode: "development",
    // 入口文件
    entry: path.join(__dirname, './src/main.js'),
    // 输出路径
    output: {
        path: path.join(__dirname, "./dist"),
        filename: "bundle.js"
    },
    resolve: {
        alias: {
            // 直接在项目中使用 vue，默认用的是 vue 的 runtime 版本，它不能编译 vue 组件，在本示例中，需要使用 vue 的完全版本，这里学要修改 vue 指向完全版本
            'vue$': 'vue/dist/vue.esm.js'
        }
    }
}
```

<font color="red">vue 完全版本当中有组件的编译代码，占全部代码的 30% 左右，vue 的 runtime 版本则没有这部分代码，需要使用 vue 官方提供的工具，预编译组件，才可以使用 runtime 版本。在生产环境中使用 vue 的 runtime 版本可以获得一些新能提升。</font>

## 使用 Webpack 编译 .vue 文件

安装 webpack 的 loader 插件：

```bash
$ npm install -D vue-loader vue-template-compiler vue-style-loader css-loader
```

main.js：

```javascript
import App from './js/App.vue'
import Vue from 'vue'

new Vue({
    el: "#demo",
    template: "<App></App>",
    components: {
        App
    }
})
```

vue/App.vue：

```vue
<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      message: "Hello World"
    }
  }
}
</script>

<style scoped>
h1 {
  color: green;
}
</style>
```

index.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="demo"></div>
<script src="./dist/bundle.js"></script>

</body>
</html>
```

webpack.config.js：

```javascript
const path = require("path")
const {VueLoaderPlugin} = require("vue-loader")

module.exports = {
    mode: "development",
    // 入口文件
    entry: path.join(__dirname, './src/main.vue'),
    // 输出路径
    output: {
        path: path.join(__dirname, "./dist"),
        filename: "bundle.vue"
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            // 使用 vue 完整（开发）版
            'vue$': 'vue/dist/vue.esm.vue'
        }
    },
    module: {
        rules: [
            {
                // .vue 编译器
                test: /\.vue$/,
                use: ['vue-loader']
            },
            {
                // vue 中的 style 块需要这项配置
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            }
        ]
    }
}
```
