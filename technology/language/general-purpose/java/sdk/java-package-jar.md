# Java打包

### 打包一个不可直接运行的 jar 包

```bash
# 打包所有的class文件为demo.jar
$ jar cvf demo.jar ./**/*.class
```

<span style='color: red'>由于没有配置MET-INF文件，该jar无法通过`java -jar `执行</span>

可以通过以下方式执行jar包中的代码

创建`zhong/demo/Main.java`文件

```java
package zhong.demo;

/**
 * @author aszswaz
 * @date 2021/4/14 13:41:16
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

编译并打包

```bash
# 编译
$ javac -cp src:out -d out src/zhong/demo/Main.java
# 打包
$ cd out
$ jar cvf demo.jar ./**/*.class
# 执行
$ java -classpath demo.jar zhong.demo.Main
Hello World
```

