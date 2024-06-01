# NodeJS

NodeJS 当中比较常用的操作。

## 更新项目的软件包

安装 npm-check-updates

```bash
$ sudo npm install -g npm-check-updates
```

```bash
# 检查可以更新的模块
$ ncu
# 编译 package.json，把软件包版本更新到最新版本
$ ncu -u
# 重新安装软件包
$ rm -rf node_modules && npm install
```

