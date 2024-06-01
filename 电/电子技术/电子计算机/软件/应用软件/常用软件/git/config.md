# Git 常规配置

```bash
$ git config --global core.quotepath false && \
git config --global gui.encoding utf-8 && \
git config --global i18n.commit.encoding utf-8 && \
git config --global i18n.logoutputencoding utf-8 && \
git config --global --replace-all log.date format:'%Y-%m-%d %H:%M:%S' && \
git config --global credential.helper store && \
git config --global http.https://github.com.proxy socks5://proxy.localhost:10808 && \
git config --global https.https://github.com.proxy socks5://proxy.localhost:10808
```

配置项介绍：

core.quotepath：执行 git status 时，是否将多字节字符转换为 16 进制

gui.encoding：windows 版本的 git 有个 gui 工具，该选项用于配置该工具的编码

i18n.commit.encoding：设置 commit 时使用的字符集

i18n.logoutputencoding：设置 git log 使用的字符集

log.date：设置 git log 显示的时间格式

credential.helper store：用户名和密码自动保存，保存在 `$HOME/.git-credentials` 文件

http.https://github.com.proxy 和 https.https://github.com.proxy：对 github 设置代理