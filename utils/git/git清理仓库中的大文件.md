### git清理仓库中的大文件

[转载连接](https://www.hollischuang.com/archives/1708)

1.  在清理前，先进行仓库的备份

    ```bash
    $ git clone --bare warehouse_path backup-path
    ```

    warehouse_path: 仓库路径
    backup-path：备份路径
    例(操作控制台：Git-Bash)：

    ```bash
    # 切换到项目所在目录
    $ cd /f/programme/test
    # 展示项目
    $ ls
    demo/  # 这里有个demo项目
    # 复制一个大文件到项目中（使用windows资源器复制即可，linux指令为cp [源文件路径] [目标文件路径]）
    # 查看文件大小
    $ du -sh *
    82M     file.jar # 文件有82MB
    # 提交该文件
    $ git add file.jar
    $ git commit -m "demo"
    [master (root-commit) 1be3e99] demo
     1 file changed, 0 insertions(+), 0 deletions(-)
     create mode 100644 file.jar
    # 备份仓库
    $ git clone --bare ./ ../../backup/demo.git/
    # 查看备份结果
    $ cd ../../backup/demo.git/
    $ ls
    config  description  HEAD  hooks/  info/  objects/  packed-refs  refs/ # 这些就是git版本控制必须的文件，要是清理操作出现问题可以从该仓库恢复
    # 从备份仓库恢复项目
    $ cd ../../test/
    $ rm -rf demo # 删除原项目
    $ git clone ../../backup/demo.git # 重新从备份仓库克隆
    # 之后还需要进行远程仓库的关联，可百度
    ```

2.  查看哪些历史提交过文件占用空间较大
    使用以下命令可以查看占用空间最多的五个文件：

    ```bash
    # 切换回到原项目
    cd demo
    # 查找文件
    $ git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -5 | awk '{print$1}')"
    ```

    ```txt
    rev-list命令用来列出Git仓库中的提交，我们用它来列出所有提交中涉及的文件名及其ID。 该命令可以指定只显示某个引用（或分支）的上下游的提交。
    --objects：列出该提交涉及的所有文件ID。
    --all：所有分支的提交，相当于指定了位于/refs下的所有引用。
    verify-pack命令用于显示已打包的内容。
    ```

    <span style="background-color: yellow">网友博客看到的指令，据说是可以使用的，但是不知道为什么到我这行不通，不过找不出来文件也不要紧，直接跳过该步骤就行</span>

3.  重写commit，删除大文件

    ```bash
    # 首先删除文件
    $ rm file.jar
    $ git commit -a -m "rm file.jar"
    # 因为git似乎会保护仓库，不允许commit当中一个文件都没有，所以为了确保file.jar的commit历史能够被删除成功，新建一个demo.md文件
    $ touch demo.md
    $ git add demo.md
    $ git commit -m "add demo.md file"
    # 清理commit中的文件（注意该文件必须已被删除才有效）
    $ git filter-branch --force --index-filter 'git rm -rf --cached --ignore-unmatch [filepath]' --prune-empty --tag-name-filter cat -- --all
    WARNING: git-filter-branch has a glut of gotchas generating mangled history
             rewrites.  Hit Ctrl-C before proceeding to abort, then use an
             alternative filtering tool such as 'git filter-repo'
             (https://github.com/newren/git-filter-repo/) instead.  See the
             filter-branch manual page for more details; to squelch this warning,
             set FILTER_BRANCH_SQUELCH_WARNING=1.
    Proceeding with filter-branch...
    
    Rewrite 0d5ca8661c227a3d0022dff7c61806e3634c272e (1/1) (0 seconds passed, remaining 0 predicted)    rm 'file.jar'
    
    Ref 'refs/heads/master' was deleted
    fatal: Not a valid object name HEAD
    ```

    [filepath]：为第二步查询得到的大文件，如果第一步什么也没查到，可以使用通配符“*”，我这使用的通配符：\*.jar

4.  等待第三步执行完毕，开始清理回收空间

    ```bash
    $ rm -rf .git/refs/original/
    $ git reflog expire --expire=now --all
    $ git gc --prune=now
    ```

    查看效果：

    ```bash
    $ du -sh .git/
    75K     .git/
    ```

    可以看到在`.git/`文件夹由原来的75MB减少到75K（剩余的75K应该是仓库的初始化配置 + demo.md文件）
    
5.  强行推送远程仓库

    ```bash
    # 由于demo是写文档时临时创建的项目，需要先添加远程仓库，但是这不影响
    $ git remote add origin https://github.com/username/demo.git
    # 强行推送远程仓库
    $ git push origin master -f
    ```

    

