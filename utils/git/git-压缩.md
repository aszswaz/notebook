## git 压缩多个 commit

1. 查看 commit 列表，确认压缩范围

    ```shell
    $ git log
    commit deea344d5e36bac38e374429a285e51dd660f817
    Author: 朽木不可雕也 <aszswaz@163.com>
    Date:   2023-02-25 23:33:41
    
        添加 git_option 函数
    
    commit c3e42867ef519546d637bc2428340a2b5384d150
    Author: 朽木不可雕也 <aszswaz@163.com>
    Date:   2023-02-24 23:17:14
    
        backup
    
    commit df505705d3c3650f8b40d677f779cac2cfc5b8a5
    Author: 朽木不可雕也 <aszswaz@163.com>
    Date:   2023-02-23 23:03:43
    
        添加获取 libgit2 版本号的函数
    
    commit 49feb4b93e2dced9f5dbde32055ebf9c6b30c460
    Author: 朽木不可雕也 <aszswaz@163.com>
    Date:   2023-02-22 23:43:33
    ```

2.  复制 commit 版本号，执行压缩命令（<span style="color: red">这里需要注意，版本号不要粘贴错误，要选择压缩范围外的版本号，该指令压缩动作是不包括作为参数的版本号的</span>）

    ```shell
    $ git rebase -i df505705d3c3650f8b40d677f779cac2cfc5b8a5
    ```

    **第一个版本保留，作为压缩基准，其余版本全部把`pick`修改为`squash`，表示该版本需要压缩**

3.  再次编辑commit信息

<span style="color: red">如果出现文件冲突，需要先处理冲突文件: [git版本冲突处理](./git-help.md)</span>，处理完毕后执行以下指令

```shell
# 取消压缩：git rebase --abort
# 如果没有冲突打断压缩的话，不用执行 continue
$ git rebase --continue
$ git push -f origin branch_name
# 操作完 git push 后，会看到压缩情况的信息
```

