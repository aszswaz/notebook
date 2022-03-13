# **分支(branch)操作相关命令**

```txt
查看本地分支：$ git branch
查看远程分支：$ git branch -r
创建本地分支：$ git branch [name] ----注意新分支创建后不会自动切换为当前分支
切换分支：$ git checkout [name]
创建新分支并立即切换到新分支：$ git checkout -b [name]
删除分支：$ git branch -d [name] ---- -d选项只能删除已经参与了合并的分支，对于未有合并的分支是无法删除的。如果想强制删除一个分支，可以使用-D选项
合并分支：$ git merge [name] ----将名称为[name]的分支与当前分支合并
创建远程分支(本地分支push到远程)：$ git push origin [name]
删除远程分支：$ git push origin --delete [name]
我从master分支创建了一个issue5560分支，做了一些修改后，使用git push origin master提交，但是显示的结果却是'Everything up-to-date'，发生问题的原因是git push origin master 在没有track远程分支的本地分支中默认提交的master分支，因为master分支默认指向了origin master 分支，这里要使用git push origin issue5560：master 就可以把issue5560推送到远程的master分支了。

    如果想把本地的某个分支test提交到远程仓库，并作为远程仓库的master分支，或者作为另外一个名叫test的分支，那么可以这么做。

$ git push origin test:master         // 提交本地test分支作为远程的master分支 //好像只写这一句，远程的github就会自动创建一个test分支
$ git push origin test:test              // 提交本地test分支作为远程的test分支

如果想删除远程的分支呢？类似于上面，如果:左边的分支为空，那么将删除:右边的远程的分支。

$ git push origin :test              // 刚提交到远程的test将被删除，但是本地还会保存的，不用担心
```

### 如果远程新建了一个分支，本地没有该分支。

可以利用 `git checkout --track origin/branch_name` ，这时本地会新建一个分支名叫 branch_name ，会自动跟踪远程的同名分支 branch_name。

```shell
$ git checkout --track origin/branch_name
```

### 如果本地新建了一个分支 branch_name，但是在远程没有。

```shell
$ git push --set-upstream origin branch_name
```

### 刷新远程分支列表

```shell
$ git remote update origin --prune
```

<span style="color: red">在git服务器的web端删除分支后，本地git并不会刷新远程的分支列表（fetch，pull命令也不会刷新远程的分支列表，branch -r 还是可以看到已被删除的远程分支），需要使用该指令刷新远程的仓库信息</span>

### 显示本地分支与远程分支的映射关系

```bash
$ git branch -vv
```

### 从别的分支检出指定的文件

```bash
$ git checkout [branch-name] -- [filename]
```

branch-name: 分支名称

filename: 文件路径

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