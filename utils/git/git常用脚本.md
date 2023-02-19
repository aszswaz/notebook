### 本地禁止提交到 master 分支

在git项目目录下添加 **.git/hooks/pre-commit** 文件

```bash
#!/bin/sh
branch=$(git rev-parse --symbolic --abbrev-ref HEAD)
if [ "master" == "$branch" ]; then
  echo "不能commit到 $branch 分支"
  exit 1
fi
```

<span style="background-color: yellow">这里是防止意外提交和开发者随意提交到master分支，一般master分支只能从其他分支合并代码。</span>

