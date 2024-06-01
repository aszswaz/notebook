// noinspection SpellCheckingInspection

const publicConfig = require('./electron-builder-public')

publicConfig.electronDownload.platform = "win32"
// windows 编译配置
publicConfig.win = {
    target: "nsis",
    icon: "dist/icon.ico"
}
// 配置安装程序
publicConfig.nsis = {
    oneClick: false,
    // 允许为所有用户安装
    perMachine: true,
    // 允许用户选择安装目录
    allowToChangeInstallationDirectory: true,
    // 语言
    language: 2052,
    unicode: true,
    // 安装程序和卸载程序的图标
    installerIcon: publicConfig.win.icon,
    uninstallerIcon: publicConfig.win.icon
}

module.exports = publicConfig