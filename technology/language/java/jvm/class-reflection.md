# Java类反射

## 通过反射判断字段的类型

<span style="color: green">class对象不能使用equals判断，因为Class类根本没有重写这个方法，但是可以直接使用==判断</span>

```java
package com.zhiweidata.demo;

/**
 * @author aszswaz
 * @date 2021/4/30 09:43:21
 */
@SuppressWarnings("JavaDoc")
public class Demo {
    public static void main(String[] args) {
        Class<Integer> integerClass = Integer.class;
        Class<Integer> intClass = int.class;
        System.out.println("integer class: " + integerClass);
        System.out.println("int class: " + intClass);
        System.out.println("integer.equals(int): " + integerClass.equals(intClass));
        System.out.println("integer.class == int.class: " + (intClass == intClass));
    }
}
```

```bash
integer class: class java.lang.Integer
int class: int
integer.equals(int): false
integer.class == int.class: true
```

