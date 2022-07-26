# Git

## 初始化仓库

```sehll
git init
```

## 添加文件关联

1. 添加指定的文件关联

    ```shell
    git add Readme.md
    ```

2. 添加指定文件夹下所有文件的关联

    ```shell
    git add "src/**"
    ```

    ""可以避免命令行对参数的干扰

3. 添加所有的文件关联

    ```shell
    git add -A .
    ```

4. 在添加文件关联时忽略指定的文件
    在本地仓库创建`.gitignore`文件并`git add .gitignore`，在文件中写入希望忽略的文件和文件夹

    ```ini
    # 忽略指定的文件夹，及文件夹下所有的文件
    .idea/**
    # 忽略指定文件
    Readme.md
    # 忽略指定后缀名的文件
    *.class
    ```

## git lfs的使用

git lfs可以避免二进制文件的提交问题，同时可以避免版本库过大的问题

1. 网上下载对应的git lfs版本（windows、mac、linux等）

2. 启动安装程序

3. 在命令行输入以下命令，表示使用lfs插件

    ```shell
    git lfs install
    ```

4. 使用 LFS 追踪文件

    1. 追踪指定文件

        ```shell
        git lfs track "design-resources/design.psd"
        ```

    2. 追踪指定文件夹

        ```shell
        git lfs track "data/**"
        ```

    执行以上的命令会生成一个`.gitattributes`文件，该文件也需要`git add .gitattributes`加入关联。提交方式可以使用`git commit`-`git push `或只推送lfs`git lfs commit`-`git lfs push`

## 设置git的文件对比能够正常的显示中文

```bash
$ git config --global core.quotepath false          # 显示 status 编码
$ git config --global gui.encoding utf-8            # 图形界面编码
$ git config --global i18n.commit.encoding utf-8    # 提交信息编码
$ git config --global i18n.logoutputencoding utf-8  # 输出 log 编码
```

git log 默认使用 less 分页，所以需要 bash 对 less 命令进行 utf-8 编码

需要添加环境变量

```properties
LESSCHARSET=utf-8
```

## 远程仓库相关命令

```txt
检出仓库：$ git clone git://github.com/jquery/jquery.git
查看远程仓库：$ git remote -v
添加远程仓库：$ git remote add [name] [url]
删除远程仓库：$ git remote rm [name]
修改远程仓库：$ git remote set-url --push[name][newUrl]
拉取远程仓库：$ git pull [remoteName] [localBranchName]
推送远程仓库：$ git push [remoteName] [localBranchName]
```

## 模块操作相关命令

```text
添加子模块：$ git submodule add [url] [path]
如：$ git submodule add git://github.com/soberh/ui-libs.git src/main/webapp/ui-libs
初始化子模块：$ git submodule init ----只在首次检出仓库时运行一次就行
更新子模块：$ git submodule update ----每次更新或切换分支后都需要运行一下
删除子模块：（分4步走哦）
1)$ git rm --cached [path]
2) 编辑“.gitmodules”文件，将子模块的相关配置节点删除掉
3) 编辑“.git/config”文件，将子模块的相关配置节点删除掉
4) 手动删除子模块残留的目录
```

## git操作-删除文件

```shell
rm add2.txt
git rm add2.txt
git commit -m "rm test"
git push web
```

## git配置CRLF<->LF转换（不建议修改，默认就好）

```shell
# 查看设置
git config core.autocrlf
# 开启CRLF->LF
git config --global core.autocrlf true
# 关闭CRLF->LF
git config --global core.autocrlf false
# 默认，在提交(commit)时把CRLF转换成LF，检出(git checkout)时不转换
git config --global core.autocrlf input
```

## git回滚到上一个版本操作

1. 还没有push远程仓库，本地回滚

    ```bash
    git reset --hard HEAD~1
    ```

2. 已经push到远程仓库，先本地回滚再push

    ```shell
    git reset --hard <commit_id> //回滚到你想回滚的commit
    git push origin HEAD --force //重新push到你的远程仓库
    ```

## git从远程仓库更新代码

```bash
git pull <远程主机名> <远程分支名>:<本地分支名>
```

1. 将远程master分支拉取过来，与本地的master分支合并

    ```bash
    $ git pull
    $ git pull origin
    ```

2. 将远程主机 origin 的 master 分支拉取过来，与本地的 brantest 分支合并。

    ```bash
    git pull origin master:brantest
    ```

3. 如果远程分支是与当前分支合并，则冒号后面的部分可以省略。

    ```bash
    git pull origin master
    ```


## git tag的使用

如果你达到一个重要的阶段，并希望永远记住那个特别的提交快照，你可以使用 git tag 给它打上标签。

比如说，我们想为我们的 runoob 项目发布一个"1.0"版本。 我们可以用 git tag -a v1.0 命令给最新一次提交打上（HEAD）"v1.0"的标签。

-a 选项意为"创建一个带注解的标签"。 不用 -a 选项也可以执行的，但它不会记录这标签是啥时候打的，谁打的，也不会让你添加个标签的注解。 我推荐一直创建带注解的标签。

```shell
$ git tag -a v1.0
```

当你执行 git tag -a 命令时，Git 会打开你的编辑器，让你写一句标签注解，就像你给提交写注解一样。

现在，注意当我们执行 `git log --decorate` 时，我们可以看到我们的标签了

如果我们忘了给某个提交打标签，又将它发布了，我们可以给它追加标签。

例如，假设我们发布了提交 `85fc7e7`(上面实例最后一行)，但是那时候忘了给它打标签。 我们现在也可以：

```shell
$ git tag -a v0.9 85fc7e7
$ git log --oneline --decorate --graph
*   d5e9fc2 (HEAD -> master) Merge branch 'change_site'
|\  
| * 7774248 (change_site) changed the runoob.php
* | c68142b 修改代码
|/  
* c1501a2 removed test.txt、add runoob.php
* 3e92c19 add test.txt
* 3b58100 (tag: v0.9) 第一次版本提交
```

如果我们要查看所有标签可以使用以下命令：

```shell
$ git tag
v0.9
v1.0
```

指定标签信息命令：

```shell
git tag -a <tagname> -m "runoob.com标签"
```

PGP签名标签命令：

```shell
git tag -s <tagname> -m "runoob.com标签"
```

**默认情况下，git不会推送tag到远程仓库，需要执行如下命令**

```shell
# 推送指定的tag
$ git push origin <tagname>
# 推送所有tag
$ git push origin --tags
```

## git证书库配置

在windows的git是不会使用windows的证书库验证https证书的办法者，这样在使用自签名的https证书的时候就会出现无法clone库的问题，所以需要手动的配置git的证书库为使用windows的证书库

````bash
git config --global http.sslBackend schannel
````

## 中文乱码问题解决

中文乱码的根源在于 windows 基于一些历史原因无法全面支持 utf-8 编码格式，并且也无法通过有效手段令其全面支持。

解决方法是让 Git 支持 utf-8 编码

在命令行下输入以下命令：

```
$ git config --global core.quotepath false  		# 显示 status 编码
$ git config --global gui.encoding utf-8			# 图形界面编码
$ git config --global i18n.commit.encoding utf-8	# 提交信息编码
$ git config --global i18n.logoutputencoding utf-8	# 输出 log 编码
$ export LESSCHARSET=utf-8
# 最后一条命令是因为 git log 默认使用 less 分页，所以需要 bash 对 less 命令进行 utf-8 编码
```

## 设置git log日期格式

```shell
$ git config --global --replace-all log.date format:'%Y-%m-%d %H:%M:%S'
```

## 设置git的http(s)方式推送，不需要输入密码

```bash
$ vim ~/.git-credentials
```

键入内容：

```txt
https://{username}:{passwd}@{hostname}
```

配置git，开启密码自动保存

```bash
$ git config --global credential.helper store
```

测试：

```bash
$ git push
```

