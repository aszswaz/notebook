const publicConfig = require('./webpack-render-public')

// 设置 webpack 的编译模式为开发模式
publicConfig.mode = "development"

module.exports = publicConfig
