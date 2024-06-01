// noinspection JSCheckFunctionSignatures

const {execSync} = require('child_process')
const {compiler, parseArgs} = require('./compiler')
const fs = require('fs')
const pngToIco = require('png-to-ico')

// 需要排除的运行时依赖
const excludeDependencies = [
    "vue", "vue-router"
]

function main() {
    // 解析运行参数
    const args = parseArgs()
    let system
    if (!args.hasOwnProperty("-o")) {
        throw new Error('Please specify the target operating system.')
    } else {
        system = args["-o"]
        console.info(`system: ${system}`)
    }

    // 编译代码
    compiler("pro")

    // 打包前，先把图标从 png 转换为目标操作系统所需的图标格式
    const iconPng = 'public/icon.png'
    switch (system) {
        case "mac":
            // 转换为 mac os 的图标，格式 icns
            execSync(`mk-icns ${iconPng} dist/ -n icon`, {
                encoding: "utf-8",
                stdio: [process.stdin, process.stdout, process.stderr]
            })
            electronBuilder(system)
            break
        case "win":
            // 转换 png 图片为 windows 系统图标，格式为 ico
            const icoFile = "dist/icon.ico"
            console.info("generating " + icoFile)
            pngToIco(iconPng).then(buf => {
                fs.writeFileSync(icoFile, buf)
                console.info(icoFile + " generated.")
                electronBuilder(system)
            }).catch(console.error)
            break
        case "linux":
            // linux 的图标使用 png 就行
            electronBuilder(system)
            break
        default:
            throw new Error(`Unknown platform ${system}.`)
    }
}

/**
 * 打包 electron
 */
function electronBuilder(system) {
    // 复制代码和资源到 app 文件夹下
    copySource()
    // 打包 electron 安装包
    let config_file = `config/electron-builder-${system}.js`
    execSync(`electron-builder --config ${config_file} --x64 --${system} `, {
        encoding: "utf-8",
        stdio: [process.stdin, process.stdout, process.stderr]
    })
}

/**
 * 复制资源文件到 app 文件夹
 */
function copySource() {
    if (fs.existsSync('app')) {
        // 递归删除文件夹
        fs.rmSync('app', {recursive: true})
    }

    /**
     * electron-builder 支持双重 package.json，项目的根目录和 app 文件夹下都有 package.json 这个文件，会直接使用 app 文件夹下面的 package.json，并且也只会打包 app 文件夹下的文件。
     * package.json 当中有个 main 属性决定 electron 的运行入口脚本，但是开发环境和生产环境的入口脚本的路径是不一样的。开发环境的入口脚本是直接使用源码，而生产环境的入口文件是进过 webpack 编译压缩的文件，
     * 如果直接在项目的 package.json 配置 main 为 webpack 编译后的文件路径，会直接导致 IDE 对 nodejs 的 DBUG 的功能直接失效。
     * 利用 electron-builder 双重 package.json 功能打包，首先需要两步准备：
     * 1. 从项目的 package.json 提取必要的配置，并输出到 app 文件夹下的 package.json
     * 2. webpack 编译好的代码会分别存放于 dist/main、dist/views，dist/main 是主进程的代码，复制到 app/src/main，dist/views 是渲染进程的代码，复制到 app/dist/views
     */
    const packageJson = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf-8'}))
    const appPackageJson = {
        name: packageJson.name,
        main: packageJson.main,
        description: packageJson.description,
        author: packageJson.author,
        version: packageJson.version,
        dependencies: {}
    }

    // 排除指定依赖
    for (let key in packageJson.dependencies)
        if (excludeDependencies.indexOf(key) === -1) appPackageJson.dependencies[key] = packageJson.dependencies[key]

    fs.mkdirSync('app')
    // 向app文件夹输出必要的 webpack 配置
    fs.writeFileSync('app/package.json', JSON.stringify(appPackageJson, null, "  "))

    // 复制 webpack 编译的代码
    fs.mkdirSync('app/src')
    // 递归复制文件夹
    fs.cpSync('dist/main', 'app/src/main', {recursive: true})
    fs.cpSync("dist/preload", "app/src/preload", {recursive: true})
    fs.cpSync('dist/render', 'app/dist/render', {recursive: true})
}

main()
