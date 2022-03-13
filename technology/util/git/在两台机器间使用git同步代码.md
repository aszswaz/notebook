### 在两台机器间，使用git同步代码

机器A: windows系统（使用git bash进行操作，代码源，代码在该机器上编辑）       机器B：centos7（测试机，只需要拉取代码并编译运行）

### 第一种方式

1.  B: 创建demo文件夹

    ```bash
    $ mkdir demo
    # 进入文件夹
    $ cd demo
    ```

2.  B: 初始化仓库

    ```bash
    $ git init
    Initialized empty Git repository in /home/server/test/demo/.git/
    ```

    <span style="color: red">注意“/home/server/test/demo/.git/”就是仓库路径，在机器B上指定远程仓库的路劲就需要这个</span>

3.  B: 创建一个文件并提交

    ```bash
    # 编辑或新建文件
    $ vim test.txt
    # 输入文件内容
    Hello World
    # 提交
    $ git add -A
    $ git commit -m "test"
    ```

4.  A: clone远程仓库

    ```bash
    $ git clone 
    ```

<span style="color: red">如果想要实现机器B从机器A clone代码，机器A首先得安装ssh server才可，windows系统不自带ssh server，无法使用ssh连接到windows的机器。该种方式只能clone或者pull代码，不能在机器A上进行push操作，因为git不知道机器B是否也进行了commit</span>

### 第二种方式

1.  B: 创建demo文件夹

    ```bash
    $ mkdir demo
    # 进入文件夹
    $ cd demo
    ```

2.  B: 初始化仓库

    ```bash
    $ git init
    Initialized empty Git repository in /home/server/test/demo/.git/
    ```

    <span style="color: red">注意“/home/server/test/demo/.git/”就是仓库路径，在机器B上指定远程仓库的路劲就需要这个</span>

3.  B: 创建一个文件并提交

    ```bash
    # 编辑或新建文件
    $ vim test.txt
    # 输入文件内容
    Hello World
    # 提交
    $ git add -A
    $ git commit -m "test"
    ```

4.  B: 复制一个新的库

    ```bash
    # 从刚才的库复制一个新的仓库，不含源码
    git clone --bare ./demo
    Cloning into bare repository 'demo.git'...
    done.
    ```

5.  A: clone远程仓库

    ```bash
    # server：用户名  desktop.computer：域名或ip地址，端口使用默认的22端口 /home/server/test/demo.git：仓库在机器上的路径
    $ git clone ssh://server@desktop.computer/home/server/test/demo.git
    Cloning into 'demo'...
    # 输入用户密码
    server@desktop.computer's password:
    # 看到以下信息，clone成功
    remote: Counting objects: 3, done.
    remote: Total 3 (delta 0), reused 0 (delta 0)
    Receiving objects: 100% (3/3), done.
    ```

6.  A: 查看文件

    ```bash
    $ cd demo
    $ ls
    test.txt
    ```

7.  B: 关联刚才复制的仓库

    ```bash
    $ cd demo
    $ git remote add local ../demo.git
    ```

8.  测试
    机器A:

    ```bash
    $ vim test.txt
    # 输入内容
    Hello World server
    $ git add -A
    $ git commit -m "测试"
    # 推送
    $ git push origin
    # 要求输入密码
    server@desktop.computer's password:
    # 推送成功
    Enumerating objects: 5, done.
    Counting objects: 100% (5/5), done.
    Writing objects: 100% (3/3), 263 bytes | 263.00 KiB/s, done.
    Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
    To ssh://desktop.computer/home/server/test/demo.git
       a678c8b..d806d4b  master -> master
    ```

    机器B: 

    ```bash
    # 拉取代码，注意不能缺少分支名称，由于还没有创建分支关联，git不会自动合并代码
    $ git pull local master
    # 查看文件
    $ vim test.txt
    Hello World
    Hello World Sever
    ```

### 方式三

1.  机器A：开启git的服务端模式，监听默认端口9418

    ```bash
    $ git daemon --export-all --base-path=projectPath --reuseaddr --informative-errors —verbose
    # 如果需要在后台运行，可以使用git bash的nohup
    $ nohup git daemon --export-all --base-path=projectPath > /dev/null 2>&1 &
    # 开启write权限, 最后一个projectPath作用是告诉git在哪里寻找项目
    $ git daemon --base-path=projectPath --export-all --enable=receive-pack --reuseaddr --informative-errors —verbose projectPath
    ```

2.  机器B: 直接clone代码即可

    ```bash
    $ git clone git://ip/projectPath
    ```

<span style="color: red">如果需要允许机器B可以进行push操作，需要在机器A的启动参数添加：--enable=receive-pack</span>