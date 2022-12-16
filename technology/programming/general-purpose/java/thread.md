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

