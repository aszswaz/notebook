// noinspection SpellCheckingInspection
const path = require("path")

// 获得项目使用的 electron 版本
const electronVersion = require(path.join(__dirname, "../node_modules/electron/package.json")).version

/**
 * electron-builder 的公共配置文件
 */
module.exports = {
    appId: "cn.aszswaz.demo.webpack-electron-vue",
    // 最终生成的可执行文件名称
    productName: "hanna",
    // 版权
    copyright: "aszswaz",
    /**
     * 使用 electron 的存档格式打包代码到存档当中，asar 是 electron 专用的文件压缩格式，把打包得到的 AppImage 文件解压会得到一个 squashfs-root 文件夹，所有的代码和资源都在这个文件夹的 resourses 文件夹下，
     * 应用程序启动时 resources 文件夹下的这些文件都会从 AppImage 包当中解压到 /tmp 当中，所以 electron 的运行目录在 /tmp 当中。
     * 如果开启 asar，所有的代码和静态资源都会被压缩为一个 asar 文件，软件运行时进行解压
     */
    asar: true,
    // 要打包或排除的文件
    files: [
        "**/*",
        "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
        "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
        "!**/node_modules/*.d.ts",
        "!**/node_modules/.bin",
        "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
        "!.editorconfig",
        "!**/._*",
        "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
        "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
        "!**/{appveyor.yml,.travis.yml,circle.yml}",
        "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
    ],
    // 打包得到的文件名称
    artifactName: "${productName}-${arch}-${version}.${ext}",
    directories: {
        // 打包时，相关资源会被存放到该文件夹
        app: "./app",
        output: "./dist/electron-builder"
    },
    // 重建依赖项
    npmRebuild: false,
    // 是否使用 electron-compiler 编译项目，由于 webpack 已经编译过了，不需要再编译
    electronCompile: false,
    buildDependenciesFromSource: false,
    // electron 下载
    electronDownload: {
        version: electronVersion,
        arch: "x64",
        cache: process.cwd() + "/cache"
    },
    electronVersion: `v${electronVersion}`
}
