const {VueLoaderPlugin} = require("vue-loader")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const CURRENT_DIT = process.cwd();

// HTML 压缩配置
const minify = {
    collapseWhitespace: true,
    keepClosingSlash: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    // 压缩 HTML 中的 CSS
    minifyCSS: true,
    // 压缩 HTML 中的 JS
    minifyJS: true
}

/**
 * webpack 的公共配置
 */
module.exports = {
    // 指定编译目标为 electron 的渲染进程
    target: "electron-renderer",
    // 渲染进程入口文件，process.cwd() 是 node 的工作环境
    entry: CURRENT_DIT + "/src/render/main.js",
    output: {
        path: CURRENT_DIT + "/dist/render",
        filename: "render.js"
    },
    resolve: {
        // 没有后缀的模块，尝试添加指定的后缀
        extensions: ['*', '.js', '.vue']
    },
    plugins: [
        // vue 插件
        new VueLoaderPlugin(),
        // html 插件，与下面的文件复制插件不一样的是，它能给 webpack 编译生成的脚本加个引用标签
        new HtmlWebpackPlugin({
            template: "public/index.html",
            minify
        })
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [
                    {loader: "vue-loader"}
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {loader: "vue-style-loader"},
                    {loader: "css-loader"}
                ]
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
