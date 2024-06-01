# Webpack

本文档使用的Webpack版本为`5.65.0`，Webpack-cli 版本是`4.9.1`。

## 简介

Webpack 是 Web 的模块化开发打包工具，JavaScript 的模块系统有 CommonJS、ES6 moudle 等，但是大多数浏览器仅仅只支持 ES6 moudle，CommonJS 主要是用于 NodeJS，Webpack 的其中一个作用就是把诸多的模块系统转化为浏览器可执行的 JavaScript 代码，以及对 JavaScript 代码进行优化、压缩、编译。

## 安装

```bash
$ sudo npm install webpack --save-dev
```

## 打包

首先创建一个 src 文件夹，在 src 文件夹中准本两个文件 main.js、demo.js：

demo.js：

```javascript
module.exports = {
    packageDemo() {
        console.info("package demo.")
    }
}
```

main.js：

```javascript
const {packageDemo} = require("./demo.js")
packageDemo()
```

打包：

```bash
$ webpack ./src/main.js -o ./dist --mode production
asset main.js 248 bytes [compared for emit] [minimized] (name: main)
./src/main.js 56 bytes [built] [code generated]
./src/demo.js 84 bytes [built] [code generated]
webpack 5.65.0 compiled successfully in 247 ms
```

`--mode`参数有两个值：development 和 production，它们的区别如下：

development: 开发模式，仅仅只是对 js 文件进行整合，不会对js代码进行优化、压缩、编译。

production: 生产模式，对js文件进行整合、优化、压缩和编译。

## 配置文件

webpack 默认会读取当前文件夹下的 webpack.config.js 文件作为模块的打包配置。基本的打包配置如下：

```javascript
const path = require("path")

module.exports = {
    // 打包模式为开发模式
    mode: "development",
    // 入口文件
    entry: path.join(__dirname, './src/main.js'),
    // 输出路径
    output: {
        path: path.join(__dirname, "./dist"),
        filename: "bundle.js"
    }
}
```

之后在 package.json 中添加一个 build 指令，用于打包生产环境的文件：

```json
{
  "name": "demo-webpack",
  "version": "1.0.0",
  "description": "webpack 演示",
  "main": "src/main.js",
  "scripts": {
    "build": "webpack --mode production"
  },
  "author": "aszswaz",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^5.65.0",
    "webpack-cli": "^4.9.1"
  }
}
```

现在就可以打包了，想要开发模式下打包就运行 `webpack`，生产环境打包就执行 `num run build`。

## 打包 css 文件

### 安装 webpack 插件 `css-loader` 和 `style-loader`，前者加载 css 文件到 js 文件，后者应用加载到 js 文件的 css 代码到 DOM 当中

```bash
$ npm --save-dev install css-loader style-loader
```

webpack.config.js 文件内容如下：

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
    module: {
        rules: [
            {
                // 打包 css 文件，test 使用正则匹配文件后缀，use 是命中匹配规则后，使用的打包插件
                test: /\.css$/,
                // webpack 执行 use 的顺序是从右向左的，所以这里实际上是先执行 css-loader，后执行 style-loader
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}
```

新建一个 index.html 文件：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <script src="dist/bundle.js"></script>
</head>
<body>

<h1>Hello World</h1>

</body>
</html>
```

在 src 文件夹下，新建以下文件：

main.js：

```javascript
// 这里导入 css 文件的目的是为了让 webpack 打包 css 文件
require("./css/demo.css")
```

css/demo.css：

```css
h1 {
    text-align: center;
}
```

关于 webpack 对文件的打包模块，可以在 [webpack loaders](https://webpack.js.org/loaders/) 找到，另外还有个 [webpack 中文网站](https://www.webpackjs.com/loaders/)，不过这个网站的部分文档已过时。

## 打包图片

 webpack 4 以及之前的版本，通过 `url-loader` 和 `file-loader` 来打包图片，在 webpack 5，`url-loader` 已经废弃，同时新增一个内置模块 `asset` 来打包图片。

在 src 目录下创建 img 文件夹，在 img 文件夹下准备两个图片：demo01.jpg 和 demo02.jpg，要求 demo01.jpg 的大小不能超过 10kb，demo02.jpg 的大小必须超过 10kb。然后准备以下文件：

src/css/demo.css：

```css
#demo01 {
    width: 100px;
    height: 100px;
    background-image: url("../img/demo01.jpg");
}

#demo02 {
    width: 100px;
    height: 100px;
    background-image: url("../img/demo02.jpg");
}
```

index.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <script src="dist/bundle.js"></script>
</head>
<body>

<div id="demo01"></div>
<div id="demo02"></div>

</body>
</html>
```

src/main.js：

```javascript
// 这里导入 css 文件的目的是为了让 webpack 打包 css 文件
require("./css/demo.css")
```

webpack.config.js：

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
    module: {
        rules: [
            {
                // 打包 css 文件，test 使用正则匹配文件后缀，use 是命中匹配规则后，使用的打包插件
                test: /\.css$/,
                // webpack 执行 use 的顺序是从右向左的，所以这里实际上是先执行 css-loader，后执行 style-loader
                use: ['style-loader', 'css-loader']
            },
            {
                // 处理图片
                test: /\.(jpg|jpeg|png|gif)/,
                // webpack5中使用assets-module（url-loader已废弃）
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        // 小于 10kb 的图片转换为 Base64
                        maxSize: 10 * 1024
                    }
                },
                generator: {
                    // 图片的输出路径，[name] 是图片原本的名称，[hash:8] 是给图片生成一个8位的 hashcode，[ext] 是文件的后缀名
                    filename: 'img/[name]-[hash:8][ext]'
                }
            }
        ]
    }
}
```

和 `url-loader` 不一样的是，asset 不需要给图片设置一个基本路径，比如在 generator 添加一个 `publicPath: "dist"`，asset 会在最终生成的 bundle.js 添加一些代码用于自动识别是否需要在图片的路径当中添加 dist。

## 打包 index.html 文件

安装 HtmlWebpackPlugin 插件：

```bash
$ npm install --save-dev html-webpack-plugin
```

webpack.config.js：

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    ...
    plugins: [
        new HtmlWebpackPlugin({
            // 指定 html 文件模板
            template: "index.html"
        })
    ]
    ...
}
```

html-webpack-plugin 会自动在 html 文件中引入经过 webpack 打包的 js 文件，并且在 webpack 的生产模式下，会压缩 html 代码。

## webpack-dev-server

webpack-dev-server 是一个本地测试服务器。它会在 webpack 编译后的 js 代码中加入一段代码以通过 websocket 控制浏览器，达到开发人员修改源代码后，及时刷新网页的目的。它并不会生成编译后的文件，只是把编译 js 和 html 得到的结果保存在内存当中，以减少硬盘的读写。

安装：

```bash
$ npm install -D webpack-dev-server
```

webpack.config.js：

```javascript
const path = require("path")

module.exports = {
    ...
    devServer: {
        // 图片等静态资源的路径
        static: {
            directory: path.join(__dirname, "dist")
        },
        // 压缩
        compress: true,
        // 端口
        port: 8080
    }
    ...
}
```

package.json：

```json
{
  ...
  "scripts": {
    // 启动 webpack-dev-server 并打开默认浏览器
    "serve": "webpack-dev-server --open"
  }
  ...
}
```

## 针对不同的环境拆分配置文件

由于开发环境和生产环境的不同，有必要对 webpack 的配置进行拆分。这需要借助于 webpack-merge，安装方式如下：

```bash
$ npm install --save-dev webpack-merge
```

通用配置文件 public.config.js：

```javascript
const path = require("path")
const {VueLoaderPlugin} = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    // 入口文件
    entry: "./src/main.js",
    // 输出路径
    output: {
        path: path.join(__dirname, "./dist"),
        filename: "bundle.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html"
        })
    ]
    ...
}
```

生常环境配置文件 pro.config.js：

```javascript
const {merge} = require("webpack-merge")
const publicConfig = require("./public.config")

module.exports = merge(publicConfig, {
        mode: "production",
    }
)
```

开发环境配置文件 dev.config.js：

```javascript
const {merge} = require("webpack-merge")
const publicConfig = require("./public.config")
const path = require("path");

module.exports = merge(publicConfig, {
        mode: "development",
        devServer: {
            // 图片等静态资源的路径
            static: {
                directory: path.join(__dirname, "dist")
            },
            // 压缩
            compress: true,
            // 端口
            port: 8080
        }
    }
)
```

最后配置项目的 package.json：

```json
{
  ...
  "scripts": {
    "build": "webpack --config ./webpack/pro.config.js",
    "serve": "webpack-dev-server --open --config ./webpack/dev.config.js"
  },
  ...
}

```

