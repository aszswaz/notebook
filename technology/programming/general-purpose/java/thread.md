# [线程](https://www.runoob.com/java/java-multithreading.html)

一条线程指的是进程中一个单一顺序的控制流，一个进程中可以并发多个线程，每条线程并行执行不同的任务。

# 线程的生命周期

线程是一个动态执行的过程。它也有一个从产生到死亡的过程。

线程有以下几个状态：

**新建状态**

使用 new 关键字和 Thread 类或其子类的建立一个线程对象后，该线程就处于新建状态。它保持这个状态直到程序 start() 这个线程。

**就绪状态**

当线程对象调用了 start() 方法之后，该线程就进入就绪状态。就绪状态的线程处于就绪队列中，要等待 OS 线程调度器的调度。

**运行状态**

如果就绪状态的线程获取到 CPU 资源，就会开始运行 run()，此时线程处于运行状态。处于运行状态的线程可以变为阻塞状态、就绪状态和死亡状态。

**阻塞状态**

如果一个线程执行了 sleep、supend 等方法，失去所占用的资源后，该线程就从运行状态进入阻塞状态。在睡眠时间已到或获得设备资源后可以重新进入就绪状态。可以分为三种：

* 等待阻塞：运行状态中的线程执行 wait() 方法，使线程进入到等待阻塞状态。
* 同步阻塞：线正程在获取 synchronized 同步锁。
* 其他阻塞：通过调用线程的 sleep() 或 join() 发出了 I/O 请求，线程就会进入到阻塞状态。当 sleep() 状态超市，join() 等待线程终止或超时，或者 I/O 处理完毕，线程就重新进入就绪状态。

**死亡状态**

一个运行状态的线程完成任务或者其他条件终止发生时，该线程就切换到终止状态，线程死亡后，不可以再次调用 start() 运行，必须重新创建一个 Thread 对象。

# 线程的优先级

每一个线程都有优先级，这样有助于 OS 确定程序的调度程序。

Java 线程的优先级是一个整数，其取值范围是 1 ~ 10，默认优先级是 5。

具有较高优先级的线程对进程更重要，并且分配的 CPU 资源应该更多。但是，线程优先级不能保证线程的执行顺序，而且非常依赖于平台。

# 线程的创建方式

通过实现 Runnable 接口创建线程：

```java
public class Demo implements Runnable {
    public static void main(String[] args) {
        Thread t = new Thread(new Demo());
        t.start();
        System.out.println(Thread.currentThread().getId() + ": Hello World");
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getId() + ": Hello World");
    }
}
```

通过继承 Thread 类创建线程：

```java
public class Demo extends Thread {
    public static void main(String[] args) {
        Demo t = new Demo();
        t.start();
        System.out.println(Thread.currentThread().getId() + ": Hello World");
    }

    /**
     * 这种方式创建线程和实现 Runnable 接口创建接口没什么区别，因为 Thread 的 run() 方法也是来自 Runnable 接口。
     * 这种方式的优点如下：
     * 1. 可以少创建一个 Runnable 的对象
     * 2. 不需要通过 Thread.currentThread() 获得当前线程对象，this 或 super 关键字就是当前线程对象。
     */
    @Override
    public void run() {
        System.out.println(super.getId() + ": Hello World");
    }
}
```

通过实现 Callable 接口创建线程：

```java
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

public class Demo implements Callable<Integer> {
    public static void main(String[] args) throws Exception {
        FutureTask<Integer> ft = new FutureTask<>(new Demo());
        Thread t = new Thread(ft);
        t.start();
        System.out.println(Thread.currentThread().getId() + ": Hello World");
        // 获取线程返回值
        System.out.println(ft.get());
    }

    /**
     * 这种方式创建线程允许获取线程的返回值
     */
    @Override
    public Integer call() {
        System.out.println(Thread.currentThread().getId() + ": Hello World");
        return 1;
    }
}
```

# 虚拟线程

虚拟线程，英文是 virtual thread，它是一种用户线程，它的调度不是由 OS 完成的，而是由用户进程中的线程调度器完成调度。为了表示区别，Java 把普通线程改称为平台线程（英文：platform thread）。

虚拟线程本质上只是一个调度任务，虚拟线程依赖于平台线程，它的调度就是用单个平台线程运行一个调度器，调度器从自己的任务队列中取出一个任务执行，如果该任务进行了 BIO 操作，或者是调用了 sleep() 进入休眠状态，调度器就会执行另一个任务。

虚拟线程是为 I/O 密集型任务而生，它不适合计算密集型任务，计算密集型任务还是使用平台线程效果更佳。

我的猜测是，虚拟线程等于 GO 的协程，主要的目的在于简化 NIO 的操作，它主要的核心思想是以 BIO 的方式操作 NIO，将 BIO 操作的便利性与 NIO 的异步相结合，换言之，就是以操作阻塞 IO 的方式去操作异步 IO，降低异步 IO 操作的繁琐步骤。

虚拟线程的操作方式如下：

```java
import java.util.concurrent.Executors;

public class Demo {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("main thread id: " + Thread.currentThread().threadId());
        // 通过三种方式创建并执行虚拟线程
        v1();
        v2();
        v3();
        v4();
        // 防止 main 函数退出时，虚拟线程还没有启动
        Thread.sleep(1000);
    }

    private static void v1() {
        // 创建并执行虚拟线程
        Thread.startVirtualThread(() ->
                System.out.println("v1, thread id: " + Thread.currentThread().threadId()));
    }

    private static void v2() {
        // 创建虚拟线程
        var t = Thread.ofVirtual().unstarted(() ->
                System.out.println("v2, thread id: " + Thread.currentThread().threadId()));
        // 执行虚拟线程
        t.start();
    }

    /**
     * 通过 ThreadFactory 创建虚拟线程
     */
    private static void v3() {
        // 创建 ThreadFactory
        var tf = Thread.ofVirtual().factory();
        // 创建虚拟线程
        var t = tf.newThread(() ->
                System.out.println("v3, thread id: " + Thread.currentThread().threadId()));
        t.start();
    }

    /**
     * 直接调用虚拟线程的 start()，实际上是由 ForkJoinPool 的线程来进行调度的，我们也可以自己创建调度线程，然后运行虚拟线程
     */
    private static void v4() {
        try (var service = Executors.newVirtualThreadPerTaskExecutor()) {
            var tf = Thread.ofVirtual().factory();
            service.submit(() -> System.out.println("v4, thread id: " + Thread.currentThread().threadId()));
        }
    }
}
```

```bash
$ javac --source 19 --enable-preview Demo.java
$ java --enable-preview Demo
main thread id: 1
v1, thread id: 20
v2, thread id: 22
v3, thread id: 25
v4, thread id: 26
```

虚拟线程一样会出现死循环问题，详细代码如下：

```java
import java.util.concurrent.Executors;

@SuppressWarnings({"StatementWithEmptyBody", "LoopConditionNotUpdatedInsideLoop"})
public class Demo02 {
    /**
     * 向虚拟线程的调度器添加一定数量的虚拟线程，并且使用死循环让虚拟线程无法终止
     */
    public static void main(String[] args) throws InterruptedException {
        // 使用自行创建的调度线程运行虚拟线程
        try (var service = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10; i++) {
                int num = i;
                service.submit(() -> {
                    System.out.println("i: " + num);
                    // 通过死循环永久占有平台线程
                    while (args.length == 0){}
                });
            }
        }

        Thread.sleep(500);
    }
}
```

运行结果如下：

```bash
$ javac --source 19 --enable-preview Demo02.java
$ java --enable-preview Demo02
i: 2
i: 1
i: 0
i: 3
```

用于调度虚拟线程的平台线程数量是根据 CPU 的核心数决定的，在我这台四核的电脑上，调度线程就是 4 个。

下面这段代码验证了在虚拟线程中调用 Thread.sleep() 会不会切换到其他线程，同时还反映了一个可能会遇到的 BUG：虚拟线程中的死循环，可以让其他虚拟线程永远的处于 sleep 状态。

```java
import java.util.concurrent.Executors;

@SuppressWarnings({"StatementWithEmptyBody", "LoopConditionNotUpdatedInsideLoop"})
public class Demo02 {
    /**
     * 测试当虚拟线程进行 BIO 操作或 sleep() 时，是否真的切换到其他的虚拟线程去运行了
     */
    public static void main(String[] args) throws InterruptedException {
        // 使用自行创建的调度线程运行虚拟线程
        try (var service = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10; i++) {
                int num = i;
                service.submit(() -> {
                    try {
                        System.out.println("i: " + num);
                        // BIO 操作有些麻烦，这里用 sleep 代替，暂停当前虚拟线程，执行其他虚拟线程
                        Thread.sleep(5000);
                        // 由于死循环的存在，只有部分虚拟线程可以继续执行，其他虚拟线程会永远的处于 sleep 状态
                        System.out.println("wait, i: " + num);
                        while (args.length == 0) {}
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }
        }

        Thread.sleep(500);
    }
}
```

```bash
$ javac --source 19 --enable-preview Demo02.java
$ java --enable-preview Demo02
i: 1
i: 0
i: 3
i: 4
i: 5
i: 6
i: 7
i: 8
i: 9
i: 2
wait, i: 1
wait, i: 0
wait, i: 3
wait, i: 4
```

# 线程锁

线程锁的存在是为了解决资源占用问题，保证一段时间内一个资源只能被一个线程访问，以此来保证数据的安全性。

## 线程锁的种类

线程锁的种类划分如下

### 公平锁与非公平锁

公平锁是指多个线程在等待同一个锁时，必须按照申请锁的顺序依次获得锁。非公平锁与公平锁相反，是指多个线程在等待同一个锁时，不需要按照申请锁的顺序依次获得锁。

公平锁的好处是等待锁的线程不会被饿死，但是效率相对低些，非公平锁的好处是效率相对高些，但是有些线程可能会饿死，或者说很早就在等待锁，但要很久才会获得锁。其中的原因是公平锁是严格按照请求锁的顺序来依次获得锁的，而非公平锁是可以抢占的，即如果在某个时刻有线程需要获取锁，而这个时候刚好锁可用，那么这个线程会直接抢占，而这是阻塞在等待队列的线程不会被唤醒。

代码示例：

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class ReentrantLockDemo extends Thread {
    private static int num;

    private final Lock lock;

    public ReentrantLockDemo(Lock lock) {
        this.lock = lock;
    }

    public static void main(String[] args) {
        // 公平锁
        Lock lock = new ReentrantLock(true);
        // 非公平锁
        // Lock lock = new ReentrantLock(false);

        for (int i = 0; i < 10; i++) {
            Thread t1 = new ReentrantLockDemo(lock);
            t1.start();
        }
    }

    @Override
    public void run() {
        lock.lock();

        try {
            num++;
            Thread.sleep(100);
            System.out.println("thread id: " + super.getId() + ", " + num);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}
```

### 互斥锁与非互斥锁

**互斥锁**，又称独占锁、独享锁或排他锁，是指不允许多个线程同时持有的锁，常见的互斥锁有：synchronized、ReentrantLock 和 ReentrantReadWriteLock 中的 WriteLock。**非互斥锁**，又称非共享锁，是指允许多个线程同时持有的锁，常见的非互斥锁有：ReentrantReadWriteLock 中的 ReadLock。

### 可重入锁与不可重入锁

**可重入锁**，又称递归锁，是指同一个线程可以多次获取的锁，并且获取多少次就要释放多少次，这种锁多用于函数的递归调用，常见的可重入锁有：synchronized 和 ReentrantLock。**不可重入锁**，是指不可以多次获取的锁，本质上是不对锁的获取次数进行统计的[自旋锁](#自旋锁与非自旋锁)。

### 读写锁

**读写锁**分为**读锁**和**写锁**，读锁是一种[非互斥锁](#互斥锁与非互斥锁)，写锁是一种[互斥锁](#互斥锁与非互斥锁)，读锁和写锁是互斥的，它们不能同时被获取。例子如下：

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReentrantReadWriteLockDemo extends Thread {
    private static final Lock READ_LOCK;
    private static final Lock WRITE_LOCK;

    static {
        ReadWriteLock lock = new ReentrantReadWriteLock();
        READ_LOCK = lock.readLock();
        WRITE_LOCK = lock.writeLock();
    }

    public static void main(String[] args) {
        for (int i = 0; i < 4; i++) {
            new ReentrantReadWriteLockDemo().start();
        }
    }

    /**
     * ReadLock 是共享锁，它允许被多个线程同时持有
     * WriteLock 是独占锁，同一时间内只允许单个线程持有
     * ReadLock 和 WriteLock 是互斥的，ReadLock 被获取时，无法获取 WriteLock，反过来说，WriteLock 被获取时，无法获取 ReadLock
     */
    @Override
    public void run() {
        try {
            READ_LOCK.lock();
            System.out.println(System.currentTimeMillis() % 100000 + " thread id: " + this.getId() + ", get ReadLock.");
            Thread.sleep(500);
            READ_LOCK.unlock();

            WRITE_LOCK.lock();
            System.out.println(System.currentTimeMillis() % 100000 + " thread id: " + this.getId() + ", get WriteLock.");
            Thread.sleep(1000);
            WRITE_LOCK.unlock();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```

```bash
$ javac ReentrantReadWriteLockDemo.java
$ java ReentrantReadWriteLockDemo
29284 thread id: 10, get ReadLock.
29284 thread id: 11, get ReadLock.
29285 thread id: 12, get ReadLock.
29285 thread id: 13, get ReadLock.
29785 thread id: 13, get WriteLock.
30786 thread id: 11, get WriteLock.
31786 thread id: 10, get WriteLock.
32787 thread id: 12, get WriteLock.
```

从上面的例子就不难看出，ReadLock 虽然允许被多个线程持有，但是在 ReadLock 被所有线程释放之前，是无法获取 WriteLock 的。如果把 `Thread.sleep(500);` 这行代码删除，执行结果如下：

```bash
$ javac ReentrantReadWriteLockDemo.java && java ReentrantReadWriteLockDemo
80493 thread id: 10, get ReadLock.
80493 thread id: 12, get ReadLock.
80493 thread id: 11, get ReadLock.
80494 thread id: 10, get WriteLock.
81494 thread id: 12, get WriteLock.
82495 thread id: 13, get ReadLock.
82495 thread id: 13, get WriteLock.
83495 thread id: 11, get WriteLock.
```

从上面的结果可以看出，当 thread 10 和 thread 12 持有 WriteLock 时，thread 13 无法获得 ReadLock。

### 乐观锁和悲观锁

**乐观锁**，是指每次获取资源时别的线程不会修改，所以不会上锁，但是在更新数据时会判断一下别的线程有没有去更新这个数据，可以使用版本号机制和 CAS 算法实现。乐观锁适用于读数据比较多的应用场景，比如数据库的 write_condition 机制就是提供的乐观锁，`java.util.concurrent.atomic` 包下的类就是使用 CAS 算法实现的乐观锁。

**悲观锁**，是指每次获取资源时别的线程很可能会修改，所以在每次获取资源的时候都会上锁。传统的关系型数据库里边就用到了很多这种锁机制，比如行锁，表锁等，读锁，写锁等，Java 中的 synchronized、ReentrantLock、WriteLock 等独占锁就是悲观锁的实现。

### 自旋锁与非自旋锁

**自旋锁**（spinlock），是指当一个线程在获取锁的时候，如果该锁已经被其它线程获取，那么该线程将不断的尝试获取锁，直到获得锁时退出循环。**非自旋锁**，是指一个线程在获取锁的时候，如果该锁已经被其它线程线程获取，它会进入阻塞状态，直到锁被释放。

通过 CAS 实现非自旋锁：

```java
import java.util.Locale;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 自旋锁演示
 */
@SuppressWarnings("unused")
public class SpinLockDemo {
    private static final AtomicReference<Object> CAS = new AtomicReference<>();
    private final Object lock = new Object();

    @SuppressWarnings("StatementWithEmptyBody")
    public void lock() {
        // 利用 CAS 实现自旋锁
        while (!CAS.compareAndSet(null, this.lock)) ;
    }

    public void unlock() {
        CAS.compareAndSet(this.lock, null);
    }
}
```

自旋锁不会使线程状态发生切换，一直处于用户态，即线程一直都是活跃的；不会使线程进入阻塞状态，减少了不必要的上下文切换，执行速度快。但它的缺点也很明显，如果某个线程持有锁的时间过长，就会导致其它线程在获取锁时进入不停的循环，这会导致 CPU 消耗过高。

## 分段锁

**分段锁**是一种锁的使用方式，并不是具体的一种锁，它是指使用多个锁对不同的数据进行保护，降低多个线程对同一个锁的竞争。最常见的例子就是 ConcurrentHashMap，在 ConcurrentHashMap 中就是使用 Node 对象自己作为线程锁，以此保证对该 Node 的更新不会出现线程安全问题[^@1]。

## CAS

**CAS**，全称是 Compare and Swap（比较并交换），指的是不使用线程锁，而是直接以原子的方式将给变量设置为新的值。在 Java 中，要想使用 CAS 算法，只有两种方式：

1. 使用 `java.util.concurrent.atomic` 包中的类。
2. 自行编写一个 JNI 函数，因为 CAS 算法在进行变量更新，对于变量原子性保证，依赖于一个 Intel 汇编指令 [cmpxchgl](../assembly/x86.md#cmpxchg) 和一个指令前缀 [lock](../assembly/x86.md#lock)。

文章写到这里似乎出现了一个自相矛盾的地方：前面明明是说：“CAS 不使用线程锁的，为啥还是用了汇编中的 lock？”，其实它们不是一个等价的东西，类似 synchronized 这种普通的线程锁，线程进入等待锁的时候和成功获得锁被唤醒的时候，是要切换线程的上下文的，这会带来额外的开销，而汇编中的 lock 不会带来这种开销。

[^@1]: 线程安全问题是指多个线程访问同一个资源，从而发生数据不一致的问题。

