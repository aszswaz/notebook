# Java编译

## Javac帮助信息

| 参数 | 说明 |
| ------ | ------ |
| -g              |           生成所有调试信息  |
| -g:none     |               不生成任何调试信息|
| -g:{lines,vars,source}  |   只生成某些调试信息|
| -nowarn         |           不生成任何警告|
| -verbose          |         输出有关编译器正在执行的操作的消息|
| -deprecation    |           输出使用已过时的 API 的源位置|
| -classpath <路径>    |        指定查找用户类文件和注释处理程序的位置|
| -cp <路径>          |         指定查找用户类文件和注释处理程序的位置|
| -sourcepath <路径>       |    指定查找输入源文件的位置|
| -bootclasspath <路径>      |  覆盖引导类文件的位置|
|-extdirs <目录>     |         覆盖所安装扩展的位置|
| -endorseddirs <目录>     |    覆盖签名的标准路径的位置|
| -proc:{none,only}    |      控制是否执行注释处理和/或编译。|
| -processor \<class1>[,\<class2>,\<class3>...]  |  要运行的注释处理程序的名称; 绕过默认的搜索进程|
| -processorpath \<路径>   |     指定查找注释处理程序的位置 |
| -parameters       |         生成元数据以用于方法参数的反射 |
| -d \<目录>        |            指定放置生成的类文件的位置|
| -s \<目录>         |           指定放置生成的源文件的位置|
| -h \<目录>            |        指定放置生成的本机标头文件的位置|
| -implicit:{none,class}  | 指定是否为隐式引用文件生成类文件 |
| -encoding \<编码>       |      指定源文件使用的字符编码|
| -source \<发行版>     |         提供与指定发行版的源兼容性|
| -target \<发行版>       |       生成特定 VM 版本的类文件|
| -profile \<配置文件>     |       请确保使用的 API 在指定的配置文件中可用|
| -version         |          版本信息|
| -help             |         输出标准选项的提要|
| -A关键字[=值]         |         传递给注释处理程序的选项|
| -X            |             输出非标准选项的提要|
| -J\<标记>          |           直接将 <标记> 传递给运行时系统|
| -Werror           |         出现警告时终止编译|
| @\<文件名>          |           从文件读取选项和文件名|

### 示例1：

创建`zhong/demo/DemoEntity.java`

```java
package zhong.demo;

/**
 * @author aszswaz
 * @date 2021/4/14 14:23:53
 */
public class DemoEntity {
    public static void demo() {
        System.out.println("demo print");
    }
}
```

创建`zhong/demo/Main.java`

```java
package zhong.demo;

/**
 * @author aszswaz
 * @date 2021/4/14 13:41:16
 */
public class Main {
    public static void main(String[] args) {
        DemoEntity.demo();
    }
}
```

```bash
# 首先需要创建目标文件夹
$ mkdir out
# 编译的时候javac会把代码中，所有调用的类文件一起进行编译
$ javac -encoding UTF-8 -cp src -d out src/zhong/demo/Main.java
# 运行编译后的代码，指定class文件所在路径，以及入口启动类
$ java -cp out zhong.demo.Main
demo print
```

### -classpath（-cp）和-sourcepath的区别

**定义：**

-classpath 类路径
 设置用户类路径，它将覆盖 CLASSPATH 环境变量中的用户类路径。若既未指定 CLASSPATH 又未指定 -classpath，则用户类路径由当前目录构成。有关详细信息，请参阅设置类路径。

若未指定 -sourcepath 选项，则将在用户类路径中查找类文件和源文件。

-sourcepath 源路径
 指定用以查找类或接口定义的源代码路径。与用户类路径一样，源路径项用分号 (:) 进行分隔，它们可以是目录、JAR 归档文件或 ZIP 归档文件。如果使用包，那么目录或归档文件中的本地路径名必须反映包名。

注意：通过类路径查找的类，如果找到了其源文件，则可能会自动被重新编译。

首先来看`-sourcepath`的示例：

```bash
# -verbose：打印所有的编译步骤
$ javac -sourcepath src -verbose -d out src/zhong/demo/Main.java
[解析开始时间 RegularFileObject[src/zhong/demo/Main.java]]
[解析已完成, 用时 15 毫秒]
[源文件的搜索路径: src]
[类文件的搜索路径: /opt/jdk/jre/lib/resources.jar,/opt/jdk/jre/lib/rt.jar,/opt/jdk/jre/lib/sunrsasign.jar,/opt/jdk/jre/lib/jsse.jar,/opt/jdk/jre/lib/jce.jar,/opt/jdk/jre/lib/charsets.jar,/opt/jdk/jre/lib/jfr.jar,/opt/jdk/jre/classes,/opt/jdk/jre/lib/ext/dnsns.jar,/opt/jdk/jre/lib/ext/sunjce_provider.jar,/opt/jdk/jre/lib/ext/sunec.jar,/opt/jdk/jre/lib/ext/zipfs.jar,/opt/jdk/jre/lib/ext/localedata.jar,/opt/jdk/jre/lib/ext/jfxrt.jar,/opt/jdk/jre/lib/ext/cldrdata.jar,/opt/jdk/jre/lib/ext/nashorn.jar,/opt/jdk/jre/lib/ext/jaccess.jar,/opt/jdk/jre/lib/ext/sunpkcs11.jar,.]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Object.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/String.class)]]
[正在检查zhong.demo.Main]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Serializable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/AutoCloseable.class)]]
[正在加载RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析开始时间 RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析已完成, 用时 1 毫秒]
[已写入RegularFileObject[out/zhong/demo/Main.class]]
[正在检查zhong.demo.DemoEntity]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Byte.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Character.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Short.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Long.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Float.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Integer.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Double.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Boolean.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Void.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/System.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/PrintStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Appendable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Closeable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/FilterOutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/OutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Flushable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Comparable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/CharSequence.class)]]
[已写入RegularFileObject[out/zhong/demo/DemoEntity.class]]
[共 250 毫秒]
```

-sourcepath：用来指定搜索源文件(*.java文件)的路径

可以看到`[源文件的搜索路径: src]`

再看`-classpath`：

```bash
$ javac -cp src -verbose -d out src/zhong/demo/Main.java
[解析开始时间 RegularFileObject[src/zhong/demo/Main.java]]
[解析已完成, 用时 17 毫秒]
[源文件的搜索路径: src]
[类文件的搜索路径: /opt/jdk/jre/lib/resources.jar,/opt/jdk/jre/lib/rt.jar,/opt/jdk/jre/lib/sunrsasign.jar,/opt/jdk/jre/lib/jsse.jar,/opt/jdk/jre/lib/jce.jar,/opt/jdk/jre/lib/charsets.jar,/opt/jdk/jre/lib/jfr.jar,/opt/jdk/jre/classes,/opt/jdk/jre/lib/ext/dnsns.jar,/opt/jdk/jre/lib/ext/sunjce_provider.jar,/opt/jdk/jre/lib/ext/sunec.jar,/opt/jdk/jre/lib/ext/zipfs.jar,/opt/jdk/jre/lib/ext/localedata.jar,/opt/jdk/jre/lib/ext/jfxrt.jar,/opt/jdk/jre/lib/ext/cldrdata.jar,/opt/jdk/jre/lib/ext/nashorn.jar,/opt/jdk/jre/lib/ext/jaccess.jar,/opt/jdk/jre/lib/ext/sunpkcs11.jar,src]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Object.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/String.class)]]
[正在检查zhong.demo.Main]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Serializable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/AutoCloseable.class)]]
[正在加载RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析开始时间 RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析已完成, 用时 0 毫秒]
[已写入RegularFileObject[out/zhong/demo/Main.class]]
[正在检查zhong.demo.DemoEntity]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Byte.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Character.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Short.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Long.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Float.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Integer.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Double.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Boolean.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Void.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/System.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/PrintStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Appendable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Closeable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/FilterOutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/OutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Flushable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Comparable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/CharSequence.class)]]
[已写入RegularFileObject[out/zhong/demo/DemoEntity.class]]
[共 229 毫秒]
```

可以看到，在没有指定`-sourcepath`的情况下，默认使用`-classpath`的参数作为源文件搜索路径，同时在`类文件的搜索路径: `的最后出现指定的目录`src`

**验证源文件是否会被重新编译：**

```bash
# 清理编译文件，重新创建out文件夹
$ rm -rf out | mkdir out
# 编译代码，并且out目录和src一起要被`-classptah`加载
$ javac -classpath src:out -d out -verbose src/zhong/demo/Main.java
[解析开始时间 RegularFileObject[src/zhong/demo/Main.java]]
[解析已完成, 用时 16 毫秒]
[源文件的搜索路径: src,out]
[类文件的搜索路径: /opt/jdk/jre/lib/resources.jar,/opt/jdk/jre/lib/rt.jar,/opt/jdk/jre/lib/sunrsasign.jar,/opt/jdk/jre/lib/jsse.jar,/opt/jdk/jre/lib/jce.jar,/opt/jdk/jre/lib/charsets.jar,/opt/jdk/jre/lib/jfr.jar,/opt/jdk/jre/classes,/opt/jdk/jre/lib/ext/dnsns.jar,/opt/jdk/jre/lib/ext/sunjce_provider.jar,/opt/jdk/jre/lib/ext/sunec.jar,/opt/jdk/jre/lib/ext/zipfs.jar,/opt/jdk/jre/lib/ext/localedata.jar,/opt/jdk/jre/lib/ext/jfxrt.jar,/opt/jdk/jre/lib/ext/cldrdata.jar,/opt/jdk/jre/lib/ext/nashorn.jar,/opt/jdk/jre/lib/ext/jaccess.jar,/opt/jdk/jre/lib/ext/sunpkcs11.jar,src,out]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Object.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/String.class)]]
[正在检查zhong.demo.Main]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Serializable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/AutoCloseable.class)]]
[正在加载RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析开始时间 RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析已完成, 用时 0 毫秒]
[已写入RegularFileObject[out/zhong/demo/Main.class]]
[正在检查zhong.demo.DemoEntity]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Byte.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Character.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Short.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Long.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Float.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Integer.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Double.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Boolean.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Void.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/System.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/PrintStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Appendable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Closeable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/FilterOutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/OutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Flushable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Comparable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/CharSequence.class)]]
[已写入RegularFileObject[out/zhong/demo/DemoEntity.class]]
[共 233 毫秒]
```

可以看到`[已写入RegularFileObject[out/zhong/demo/Main.class]]`和`[已写入RegularFileObject[out/zhong/demo/DemoEntity.class]]`两条日志

```bash
# 再次执行相同的指令
$ javac -classpath src:out -d out -verbose src/zhong/demo/Main.java
[解析开始时间 RegularFileObject[src/zhong/demo/Main.java]]
[解析已完成, 用时 17 毫秒]
[源文件的搜索路径: src,out]
[类文件的搜索路径: /opt/jdk/jre/lib/resources.jar,/opt/jdk/jre/lib/rt.jar,/opt/jdk/jre/lib/sunrsasign.jar,/opt/jdk/jre/lib/jsse.jar,/opt/jdk/jre/lib/jce.jar,/opt/jdk/jre/lib/charsets.jar,/opt/jdk/jre/lib/jfr.jar,/opt/jdk/jre/classes,/opt/jdk/jre/lib/ext/dnsns.jar,/opt/jdk/jre/lib/ext/sunjce_provider.jar,/opt/jdk/jre/lib/ext/sunec.jar,/opt/jdk/jre/lib/ext/zipfs.jar,/opt/jdk/jre/lib/ext/localedata.jar,/opt/jdk/jre/lib/ext/jfxrt.jar,/opt/jdk/jre/lib/ext/cldrdata.jar,/opt/jdk/jre/lib/ext/nashorn.jar,/opt/jdk/jre/lib/ext/jaccess.jar,/opt/jdk/jre/lib/ext/sunpkcs11.jar,src,out]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Object.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/String.class)]]
[正在检查zhong.demo.Main]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Serializable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/AutoCloseable.class)]]
[正在加载RegularFileObject[out/zhong/demo/DemoEntity.class]]
[已写入RegularFileObject[out/zhong/demo/Main.class]]
[共 206 毫秒]
```

只能看到`[已写入RegularFileObject[out/zhong/demo/Main.class]]` ，而`DemoEntity`只是被加载，class文件没有被重写，至于`Main`为什么会被重写，我想应该是在指令中，被显式的指定为源文件的缘故，切换为`DemoEntity`可会出现同样的情况

修改`DemoEntity.java`文件，可以随便加点注释什么的

```java
package zhong.demo;

/**
 * @author aszswaz
 * @date 2021/4/14 14:23:53
 */
public class DemoEntity {
    /**
     * 我是大帅哥
     */
    public static void demo() {
        System.out.println("demo print");
    }
}
```

再次编译

```bash
$ javac -cp src:out -d out -verbose src/zhong/demo/Main.java
[解析开始时间 RegularFileObject[src/zhong/demo/Main.java]]
[解析已完成, 用时 15 毫秒]
[源文件的搜索路径: src,out]
[类文件的搜索路径: /opt/jdk/jre/lib/resources.jar,/opt/jdk/jre/lib/rt.jar,/opt/jdk/jre/lib/sunrsasign.jar,/opt/jdk/jre/lib/jsse.jar,/opt/jdk/jre/lib/jce.jar,/opt/jdk/jre/lib/charsets.jar,/opt/jdk/jre/lib/jfr.jar,/opt/jdk/jre/classes,/opt/jdk/jre/lib/ext/dnsns.jar,/opt/jdk/jre/lib/ext/sunjce_provider.jar,/opt/jdk/jre/lib/ext/sunec.jar,/opt/jdk/jre/lib/ext/zipfs.jar,/opt/jdk/jre/lib/ext/localedata.jar,/opt/jdk/jre/lib/ext/jfxrt.jar,/opt/jdk/jre/lib/ext/cldrdata.jar,/opt/jdk/jre/lib/ext/nashorn.jar,/opt/jdk/jre/lib/ext/jaccess.jar,/opt/jdk/jre/lib/ext/sunpkcs11.jar,src,out]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Object.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/String.class)]]
[正在检查zhong.demo.Main]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Serializable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/AutoCloseable.class)]]
[正在加载RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析开始时间 RegularFileObject[src/zhong/demo/DemoEntity.java]]
[解析已完成, 用时 0 毫秒]
[已写入RegularFileObject[out/zhong/demo/Main.class]]
[正在检查zhong.demo.DemoEntity]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Byte.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Character.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Short.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Long.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Float.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Integer.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Double.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Boolean.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Void.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/System.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/PrintStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Appendable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Closeable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/FilterOutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/OutputStream.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/io/Flushable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/Comparable.class)]]
[正在加载ZipFileIndexFileObject[/opt/jdk/lib/ct.sym(META-INF/sym/rt.jar/java/lang/CharSequence.class)]]
[已写入RegularFileObject[out/zhong/demo/DemoEntity.class]]
[共 231 毫秒]
```

可以看到`[已写入RegularFileObject[out/zhong/demo/DemoEntity.class]]`。

<span style="color: green">结论：除了在源文件当中，被显式指定的源文件以外，别的java文件在生成class文件时，会首先判断 java 文件是否有过修改（具体的判断算法不清楚，不过以前使用IDEA编译过大项目，编译第一次特别慢以外，之后的每一次编译都挺快的，所以，至少不是“先把源代码编译，把生成的class文件与已经存在的class进行比对”这种愚蠢也没有用处的做法）</span>