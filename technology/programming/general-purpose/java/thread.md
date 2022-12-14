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

