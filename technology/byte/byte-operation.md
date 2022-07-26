# 字节操作

### 大小端模式

**大端模式**

大端模式，是指数据的高位字节，保存在内存的低地址中，而数据的低位字节保存在内存的高地址中，这样的存储模式有点儿类似于把数据当作字符串顺序处理：地址由小向大增加，而数据从高位往低位放；这和我们的阅读习惯一致。

**小端模式**

小端模式，是指数据的高字节保存在内存的高地址中，而数据的低字节保存在内存的低地址中，这种存储模式将地址的高低和数据位权有效地结合起来，高地址部分权值高，低地址部分权值低。

#### 例1：

以十进制689为例，它的二进制是这样的

```txt
字节：低                高
     ------------------->
     0000 0010 1011 0001
     ------------------->
内存：高                低
```

将其写为java代码：

大端模式：

```java
public static byte[] intToByteArray(int i) {
    byte[] targets = new byte[4];
    targets[3] = (byte) (i & 0xFF);
    targets[2] = (byte) (i >> 8 & 0xFF);
    targets[1] = (byte) (i >> 16 & 0xFF);
    targets[0] = (byte) (i >> 24 & 0xFF);
    return targets;
}
```

小端模式：

```java
public static byte[] intToByteArray(int i) {
    byte[] targets = new byte[4];
    targets[0] = (byte) (i & 0xFF);
    targets[1] = (byte) (i >> 8 & 0xFF);
    targets[2] = (byte) (i >> 16 & 0xFF);
    targets[3] = (byte) (i >> 24 & 0xFF);
    return targets;
}
```

