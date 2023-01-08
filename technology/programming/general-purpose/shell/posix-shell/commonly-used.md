# Unix Shell 常用操作

## 配置文件、文件夹颜色

```bash
# 所有用户都可读写的文件夹，默认的背景颜色过亮导致看不到文字，配置用户目录下的 .dir_colors 文件的 OTHER_WRITABLE 项，值改为普通文件夹的颜色就行
$ vim ${HOME}/.dir_colors
OTHER_WRITABLE 01;34
```

