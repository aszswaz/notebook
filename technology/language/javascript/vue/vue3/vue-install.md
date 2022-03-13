# VUE 安装

可以通过 CDN，或者 vue-cli 使用 vue

### CDN（内容分发网络）

对于制作原型或学习，你可以这样使用最新版本：

```html
<script src="https://unpkg.com/vue@next"></script>
```

对于生产环境，我们推荐链接到一个明确的版本号和构建文件，以避免新版本造成的不可预期的破坏。

### 下载并自托管

如果你想避免使用构建工具，但又无法在生产环境使用 CDN，那么你可以下载相关 `.js` 文件并自行托管在你的服务器上。然后你可以通过 `<script>` 标签引入，与使用 CDN 的方法类似。

这些文件可以在 [unpkg](https://unpkg.com/browse/vue@next/dist/) 或者 [jsDelivr](https://cdn.jsdelivr.net/npm/vue@next/dist/) 这些 CDN 上浏览和下载。各种不同文件将在[以后解释](https://v3.cn.vuejs.org/guide/installation.html#对不同构建版本的解释)，但你通常需要同时下载开发环境构建版本以及生产环境构建版本。

### vue-cli

Vue 提供了一个[官方的 CLI](https://github.com/vuejs/vue-cli)，为单页面应用 (SPA) 快速搭建繁杂的脚手架。它为现代前端工作流提供了功能齐备的构建设置。只需要几分钟的时间就可以运行起来并带有热重载、保存时 lint 校验，以及生产环境可用的构建版本。更多详情可查阅 [Vue CLI 的文档](https://cli.vuejs.org/)。

1. 从官网下载nodejs lts（稳定版），避免兼容性问题，[下载地址](https://nodejs.org/en/download/)

2. 把 nodejs 添加到path

3. 给 nodejs 添加代理

   ```bash
   $ npm config set proxy http://localhost:8080/
   ```

4. 安装 vue-cli

   ```bash
   $ npm install -g @vue/cli
   ```

5. 创建vue项目

   ```bash
   $ vue create hello-world
   # 启动项目
   $ cd hello-world
   $ npm rum serve
   # 浏览器访问 http://localhost:808
   ```

