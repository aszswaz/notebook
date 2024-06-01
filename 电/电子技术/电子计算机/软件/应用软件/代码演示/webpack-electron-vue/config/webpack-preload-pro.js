/**
 * 编译 electron 主进程的代码
 */
const CURRENT_DIT = process.cwd();

module.exports = {
    mode: "production",
    target: "electron-preload",
    entry: CURRENT_DIT + "/src/preload/preload.js",
    output: {
        path: CURRENT_DIT + "/dist/preload",
        filename: "preload.js"
    }
}
