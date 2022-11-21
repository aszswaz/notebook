# 清理垃圾

### 清理系统中无用的包

```zsh
# 由于不少软件有依赖关系，建议多执行几次，直到指令出错为止
$ sudo pacman -R $(pacman -Qdtq)
```

### 清除已下载的安装包

```zsh
$ sudo pacman -Scc
```

## 日志垃圾

### 查看日志文件

```zsh
$ du -t 100M /var
# 或
$ journalctl --disk-usage
```

### 删除指定操作

```zsh
$ sudo journalctl --vacuum-size=50M
```

