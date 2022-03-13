# linux 的文件系统

对于linux操作系统来说，一切都是文件。进程是文件，进程的相关信息都保存在`/proc`文件夹下。设备是文件，所有的设备在`/dev`文件夹下有对应的文件描述符。TCP、UDP socket 也是文件，读写都通过 sydio库的 read 和 write 函数进行。

## 特殊文件夹和文件

/dev/shm

这个文件夹不存在于硬盘，它只在内存当中，它的大小默认是可用物理内存的一半。

/dev/stdin、/dev/stdout、/dev/stderr

它们分别是程序的输入流、输出流、错误输出流，它们作用就是让当前进程，与父进程进行交互。

## 文件链接

硬链接和软链接都是文件的另一个入口，它的主要区别在于：

当一个文件存在它的硬链接时，删除源文件，文件实体并未被删除，只有把文件原入口和硬链接入口都删除，文件的实体才会被删除。

当一个文件存在它的软链接时，删除源文件，文件实体会被删除，软链接会失效。

```bash
# 创建一个硬链接，然后删除原文件，尝试是否可以读取硬链接
content=$RANDOM
echo "content: $content"
echo $content > link-demo.txt
ln link-demo.txt link-demo-fl.txt
rm link-demo.txt
< link-demo-fl.txt

# 创建一个软链接，然后删除原文件，尝试是否可以通过软链接读取文件
content=$RANDOM
echo "content: " $content
echo $content > link-demo.txt
ln -s link-demo.txt link-demo-sl.txt
rm link-demo.txt
< link-demo-sl.txt
```

<font color="green">无论是软链接还是硬链接，删除链接本身并不会删除文件。</font>