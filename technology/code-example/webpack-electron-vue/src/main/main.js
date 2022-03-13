const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

// 关闭 electron 的安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

app.whenReady().then(() => {
    // 窗口对象
    const win = new BrowserWindow({
        width: 1600,
        height: 1200,
        webPreferences: {
            // 开启渲染进程和主进程的通信
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "../preload/preload.js")
        },
        show: false
    })

    // 打开窗口主页
    win.loadFile(path.join(__dirname, "../../dist/render/index.html")).then(() => {
        console.info("open window success.")
        win.show()
        // 添加ipc事件监听
        ipcMain.on("demo", (event, arguments) => {
            console.info("message:", arguments)
            event.returnValue = {message: "Hello Renderer!"}
        })
    })
})
