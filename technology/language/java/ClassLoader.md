# ClassLoader

## 热加载 CLASS

将 Target01.java 和 Target02.java 编译为 class 文件，然后通过自定义 ClassLoader 进行加载并执行

```java
package org.example.classloaderdemo;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.Objects;

/**
 * @author aszswaz
 * @createTime 2022-06-08 21:15:20
 * @ide IntelliJ IDEA
 */
@SuppressWarnings({"JavaDoc"})
public class Bootstrap {
    public static void main(String[] args) throws ReflectiveOperationException {
        CompileDemo.compile();
        demo();
        demo();
        demo();
    }

    private static void demo() throws ReflectiveOperationException {
        ClassLoaderDemo classLoader = new ClassLoaderDemo();
        Class<?> aClass = classLoader.loadClass("Target01");
        Method main = aClass.getMethod("start");
        Objects.requireNonNull(main);
        Constructor<?> constructor = aClass.getConstructor();
        Objects.requireNonNull(constructor);
        main.invoke(constructor.newInstance());
    }
}
```

```java
package org.example.classloaderdemo;

import java.util.ArrayList;
import java.util.List;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

/**
 * Java 动态编译
 *
 * @author aszswaz
 * @createTime 2022-06-08 22:21:00
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class CompileDemo {
    public static void compile() {
        // 编译器对象
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        StandardJavaFileManager fileManager = compiler.getStandardFileManager(null, null, null);

        Iterable<? extends JavaFileObject> compilationUnits = fileManager.getJavaFileObjects("Target01.java", "Target02.java");

        // 设置编译参数，由于本身就是调用的 javac，所以参数是和 javac 一样的
        List<String> options = new ArrayList<>();
        // 设置输出文件夹
        options.add("-d");
        options.add("out/production");

        JavaCompiler.CompilationTask task = compiler.getTask(null, fileManager, null, options, null, compilationUnits);
        task.call();
    }
}
```


```java
package org.example.classloaderdemo;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * 类加载器演示
 *
 * @author aszswaz
 * @createTime 2022-06-08 20:45:40
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class ClassLoaderDemo extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            String classPath = "out/production/" + name.replaceAll("\\.",  "/") + ".class";
            System.out.println("load class: " + classPath);
            byte[] classBytes = Files.readAllBytes(Path.of(classPath));
            System.out.println("class: " + name + ", byte length: " + classBytes.length);
            return super.defineClass(name, classBytes, 0, classBytes.length);
        } catch (IOException e) {
            throw new ClassNotFoundException(e.getMessage(), e);
        }
    }
}
```

```java
/**
 * @author aszswaz
 * @createTime 2022-06-08 21:17:41
 * @ide IntelliJ IDEA
 */
@SuppressWarnings({"JavaDoc", "unused"})
public class Target01 {
    private static int i = 0;

    static {
        System.out.println("static init: " + Target01.class.getName());
    }

    public void start() {
        Target02 t = new Target02();
        t.start();
        System.out.println("i: " + i++);
    }
}
```

```java
/**
 * @author aszswaz
 * @createTime 2022-06-08 21:30:52
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class Target02 {
    static {
        System.out.println("static init: " + Target02.class.getName());
    }

    public void start() {
        System.out.println("Hello World");
    }
}
```

