# 字节序

## 大端模式

大端模式是指数据的高位字节，保存在内存的低地址中，而数据的低位字节保存在内存的高地址中，这样的存储模式有点儿类似于把数据当作字符串顺序处理：地址由小向大增加，而数据从高位往低位放；这和我们的阅读习惯一致。

以十六进制数 0x1ABF 为例，字节分布如下：

```text
0x1  0xA  0xB  0xF
0001 1010 1011 1111
```

代码演示：

```java
public static byte[] intToByteArray(int num) {
    byte[] targets = new byte[4];
    // “& 0xFF” 是为了去除符号位
    targets[0] = (byte) (num >> 24 & 0xFF);
    targets[1] = (byte) (num >> 16 & 0xFF);
    targets[2] = (byte) (num >> 8 & 0xFF);
    targets[3] = (byte) (num & 0xFF);
    return targets;
}
```

## 小端模式

小端模式是指数据的高字节保存在内存的高地址中，而数据的低字节保存在内存的低地址中，这种存储模式将地址的高低和数据位权有效地结合起来，高地址部分权值高，低地址部分权值低。

以十六进制 0x1ABF 为例，内存分布如下：

```text
0xF  0xB  0xA  0x1
1111 1011 1010 0001
```

代码演示：

```java
public static byte[] intToByteArray(int num) {
    byte[] targets = new byte[4];
    // // “& 0xFF” 是为了去除符号位
    targets[0] = (byte) (num & 0xFF);
    targets[1] = (byte) (num >> 8 & 0xFF);
    targets[2] = (byte) (num >> 16 & 0xFF);
    targets[3] = (byte) (num >> 24 & 0xFF);
    return targets;
}
```

# 参考文章

[什么是大端序和小端序，为什么要有字节序？](https://zhuanlan.zhihu.com/p/352145413)
