# Git branch

## 常用命令

```bash
# 查看本地分支
$ git branch
# 查看远程分支
$ git branch -r
# 创建本地分支，注意新分支创建后不会自动切换为当前分支
$ git branch ${branchname}
# 切换分支
$ git checkout ${branchname}
# 创建新分支并立即切换到新分支
$ git checkout -b ${branchname}
# 删除分支，-d选项只能删除已经参与了合并的分支，对于未有合并的分支是无法删除的。如果想强制删除一个分支，可以使用-D选项
$ git branch -d ${branchname}
# 合并分支，将名称为 ${name} 的分支与当前分支合并
$ git merge ${branchname}
# 创建远程分支(本地分支push到远程)
$ git push origin ${branchname}
# 删除远程分支
$ git push origin --delete ${branchname}
# 提交本地test分支作为远程的master分支
$ git push origin test:master
# 如果:左边的分支为空，那么将删除右边的远程的分支，本地分支将会保留
$ git push origin :test

# 从远程分支检出一个同名的本地分支，并且自动关联两个分支
$ git checkout --track origin/${branchname}
# 或者
$ git checkout -t origin/${branchname}

# 推送本地分支到远程仓库，--set-upstream 表示关联本地分支和远程分支
$ git push --set-upstream origin ${branchname}
# 显示本地分支与远程分支的关联关系
$ git branch -vv
# 刷新远程分支列表
$ git remote update --prune
# 从别的分支检出指定的文件
$ git checkout ${branchname} -- ${filename}
```

## 分支合并前, 检查是否存在合并冲突

假设有两个分支master和demo

1. 首先找到两个分支共同的祖先commit

   ```bash
   $ git merge-base master demo3
   4315dcbb7b1b5104645faf9a06798861a883f581
   ```
```
   
2. 提前检测合并冲突

   ```bash
   $ git merge-tree 4315dcbb7b1b5104645faf9a06798861a883f581 master demo
   changed in both # 带有changed in both就是存在冲突
     base   100644 967eef39af0a87bca94de176e8a7e4bc2aee1646 demo.txt
     our    100644 83c4c844b39d2d267d401f95aef16dbf8844371e demo.txt
     their  100644 71809f0a92b2d2db140c1f8f90278b76dd2d52c1 demo.txt
   @@ -1,2 +1,6 @@
    HelloWord
   +<<<<<<< .our
    aaaaaa
   +=======
   +demo
   +>>>>>>> .their
```

   ## 从仓库中彻底删除某个文件

```bash
$ git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch ${file}' --prune-empty --tag-name-filter cat -- --all

WARNING: git-filter-branch has a glut of gotchas generating mangled history
	 rewrites.  Hit Ctrl-C before proceeding to abort, then use an
	 alternative filtering tool such as 'git filter-repo'
	 (https://github.com/newren/git-filter-repo/) instead.  See the
	 filter-branch manual page for more details; to squelch this warning,
	 set FILTER_BRANCH_SQUELCH_WARNING=1.
Proceeding with filter-branch...

Rewrite f94a6df916023060fe72155b3e420f534780eadc (59/69) (2 seconds passed, remaining 0 predicted)    
Ref 'refs/heads/master' was rewritten
Ref 'refs/remotes/github/master' was rewritten
WARNING: Ref 'refs/remotes/github/master' is unchanged

# 强行推送
$ git push -f github master
```