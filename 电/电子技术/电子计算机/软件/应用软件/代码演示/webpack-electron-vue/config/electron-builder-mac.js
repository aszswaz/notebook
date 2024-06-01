// noinspection SpellCheckingInspection

const publicConfig = require('./electron-builder-public')

publicConfig.electronDownload.platform = "win32"
// mac 编译配置
publicConfig.mac = {
    target: "dmg",
    icon: "dist/icon.icns"
}
publicConfig.dmg = {}

module.exports = publicConfig