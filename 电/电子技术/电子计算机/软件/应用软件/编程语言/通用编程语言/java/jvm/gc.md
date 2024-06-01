# Java的引用

实例代码：

```java
package zhong.gc;

import java.lang.ref.PhantomReference;
import java.lang.ref.ReferenceQueue;
import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

/**
 * @author aszswaz
 * @date 2021/4/13 20:37:59
 */
public class GcDemo {
    public static void main(String[] args) throws InterruptedException {
        final DemoEntity strong = new DemoEntity("强引用");

        SoftReference<DemoEntity> softReference = new SoftReference<>(new DemoEntity("软引用"));

        WeakReference<DemoEntity> weakReference = new WeakReference<>(new DemoEntity("弱引用"));

        ReferenceQueue<DemoEntity> referenceQueue = new ReferenceQueue<>();
        PhantomReference<DemoEntity> phantomReference = new PhantomReference<>(new DemoEntity("虚引用"), referenceQueue);

        System.gc();
        Thread.sleep(500);
        // 模拟内存不够用的情况
        //noinspection MismatchedQueryAndUpdateOfCollection
        List<DemoEntity> demoEntities = new ArrayList<>();
        for (int i = 0; i < Integer.MAX_VALUE; i++) {
            demoEntities.add(new DemoEntity("我不要被销毁"));
        }
    }
}

class DemoEntity {
    private final String name;

    public DemoEntity(String name) {
        this.name = name;
    }

    @Override
    protected void finalize() {
        System.out.println(this.name + "被GC回收了");
    }
}
```

```c
虚引用被GC回收了
弱引用被GC回收了
软引用被GC回收了
强引用被GC回收了
```

| 引用类型                | 生命周期                        | 说明                                                         |
| ----------------------- | ------------------------------- | ------------------------------------------------------------ |
| 强引用                  | 对象不可达之前                  | 对象不再被使用的时候，就满足了GC的对象回收条件               |
| 软引用（SoftReference） | 代码运行离开作用域，程序OOM之前 | 程序内存不足时，GC会回收软引用对象，优先回收长时间不使用的对象，这一点用来做数据缓存非常适合 |
| 弱引用（WeakReference） | 下一次GC之前                    | GC一次就回收一次，回收时间不固定                             |

<span style='color: red'>光看运行结果，其实强引用的对象也被回收了，看上去很矛盾的样子。不过并不矛盾，GC是判断 main 方法的最后，已经没有代码还会使用到 strong 变量，满足了不可达条件</span>