# 文件的相关工具

## 查找文件所在路径

```bash
$ find ${path} -type f -iname '*.log'
```

path：查找的目录

-type：指定文件类型，比如 f 表示查找文件，而不是文件夹

-iname：使用正在表达式匹配文件名，同时忽略大小写，-name 也是查找文件名，但是不忽略大小写

## 搜索文件内容

```bash
$ grep 'demo' demo.log
```

grep可使用正则表达式搜索文件的内存

## find和grep搭配使用

```bash
$ find ${path} -type f | xargs grep 'demo'
```

xargs会把find的查找结果，当作参数传输给grep，

但是以上方式不能查找文件名或者路径当中带有空格的文件，需要改称如下形式

```bash
$ find ${path} -type f -print0 | xargs -0 grep 'demo'
```

find把空格替换为null，xargs对null进行处理

## 展示文件目录结构

```bash
# 安装软件包，tree，这里以archlinux为例
$ sudo pacman -S tree
$ tree src
src
└── zhong
    └── demo
        ├── DemoEntity.java
        └── Main.java

2 directories, 2 files
```

