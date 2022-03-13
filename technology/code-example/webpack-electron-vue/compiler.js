// noinspection JSCheckFunctionSignatures

const {execSync} = require('child_process')

function main() {
    let args = parseArgs()
    let profile = null
    if (!args.hasOwnProperty("-p")) {
        console.error("Please specify the build environment.")
        process.exit(1)
    } else {
        profile = args['-p']
        console.info(`profile: ${profile}`)
    }
    // 编译代码
    compiler(profile)
}

/**
 * 解析控制台参数
 */
function parseArgs() {
    const args = {}
    for (let index = 0; index < process.argv.length; index++) {
        let arg = process.argv[index]
        if (arg.startsWith('-')) {
            index++
            args[arg] = process.argv[index]
        }
    }
    return args
}

/**
 * 编译程序
 */
function compiler(profile) {
    let renderer_file = "config/webpack-render-" + profile + ".js"

    // 编译渲染进程的代码，同步模式运行，并且把进程的 stdio 和子进程的 stdio 对接，如果 指令的状态非0，则会抛出异常
    execSync(`webpack --config ${renderer_file}`, {
        stdio: [process.stdin, process.stdout, process.stderr],
        encoding: "utf-8"
    })

    // 开发模式下主进程是直接运行源代码的，所以生产模式再编译主进程的代码
    if (profile === "pro") {
        execSync(`webpack --config config/webpack-main-pro.js`, {
            encoding: "utf-8",
            stdio: [process.stdin, process.stdout, process.stderr]
        })
        execSync(`webpack --config config/webpack-preload-pro.js`, {
            encoding: "utf-8",
            stdio: [process.stdin, process.stdout, process.stderr]
        })
    }
}

// 必须在该脚本为入口脚本的情况下，才可以执行
if (require.main.filename === __filename) main()

module.exports = {
    compiler,
    parseArgs
}
