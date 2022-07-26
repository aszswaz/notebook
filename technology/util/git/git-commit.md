# git-commit 操作帮助

### 提交文件版本

```zsh
# 首先将所有的文件添加到暂存区
git add -A # 注意和 git add . 的区别, 该指令是真正的添加仓库的中的所有文件, 而git add . 是添加当前目录下的所有的文件
# 提交文件版本
git commit -m "这是一个注释"
# 或者
git commit # 此时或启动vim用于写入注释, 适用于需要写入多行注释的时候
```

### 修改上一个版本的commit注释信息

```zsh
git commit --amend
```

