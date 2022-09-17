# Hash Map源码解读

首先准备以下代码

```java
package cn.aszswaz.hash;

import java.util.HashMap;

@SuppressWarnings("JavaDoc")
public class Main {
    public static void main(String[] args) {
        String text = "Hello World";
        System.out.println("hashcode: " + text.hashCode());
        HashMap<String, String> map = new HashMap<>();
        map.put(text, text);
        System.out.println(map.get("Hello World"));
    }
}
```

## 1. 初始化HashMap

设置hash table的负载因子为0.75f

```java
static final float DEFAULT_LOAD_FACTOR = 0.75f;

public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR;
}
```

## 2. 第一次PUT

1. 计算KEY的hash code：

    ```java
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
    ```

    将key的hashcode右移16bit，int变量为32bit，也就是去除低位的16bit，保留高位的16bit，与原本的值做异或操作，两个位相同为0，相异为1，得到一个掩码。这样可以==增加扰动，优化散列值的分布==。至于为什么要把hashcode的高16位和低16位进行一次异或操作，原因是元素在hashtable的位置计算公式为: table.length % hashcode，由于 table.length 总是为 2 的 N 次方，在 table.length 很小的时候，hashcode参与计算的位数是有限的。举个例子，假设 hashcode = 63，table.length = 2，那么 63 % 2 = 3 % 2 = 1，实质上只有个位数可以影响取模结果，把 hashcode 改为 73，那么 73 % 2 = 3 % 2 = 1，这就出现了冲突。table.length 的默认值是 16，能够影响的位数是很有限的。所以 hashcode 高16位与低16位进行异或，就是为了保证高16位在这种情况下可以参与到元素在 hashtable 的位置计算当中。
    
2. 构造一个大小为 16 的 hashtable，它可以存储的元素数量为 $16 \times 0.75 = 12$。==为什么是0.75？它有什么特殊的含义吗？==

