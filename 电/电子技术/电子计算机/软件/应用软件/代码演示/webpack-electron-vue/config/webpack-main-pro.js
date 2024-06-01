/**
 * 编译 electron 主进程的代码
 */
const CURRENT_DIT = process.cwd();

module.exports = {
    mode: "production",
    target: "electron-main",
    entry: CURRENT_DIT + "/src/main/main.js",
    output: {
        path: CURRENT_DIT + "/dist/main",
        filename: "main.js"
    }
}
