## git 压缩多个commit

1.  查看commit列表，确认压缩范围

    ```shell
    $ git log
    ```

    ![image-20201230215145323](image/git-压缩/image-20201230215145323.png)

2.  复制commit版本号，执行压缩命令（<span style="color: red">这里需要注意，版本号不要粘贴错误，要选择压缩范围外的版本号，该指令压缩动作是不包括作为参数的版本号的</span>）

    ```shell
    $ git rebase -i 99ee41316a215a359756e813d9007b28f5b68b48
    ```

    **第一个版本保留，作为压缩基准，其余版本全部把`pick`修改为`squash`，表示该版本需要压缩**

3.  再次编辑commit信息

<span style="color: red">如果出现文件冲突，需要先处理冲突文件: [git版本冲突处理](./git-help.md)</span>，处理完毕后执行以下指令

```shell
# 取消压缩：git rebase --abort

# 如果没有冲突打断压缩的话，不用执行continue
$ git rebase --continue

$ git push -f origin branch_name
# 操作完git push 后，会看到压缩情况的信息
```

