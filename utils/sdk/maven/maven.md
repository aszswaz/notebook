# maven

## 创建 maven 项目

```bash
# 创建一个 maven 项目
# -DgroupId: 组织名，公司网址的反写 + 项目名称
# -DartifactId: 项目名-模块名
# -Dversion：项目版本号
# -DarchetypeArtifactId: 项目骨架的 artifactId，maven-archetype-quickstart，创建一个简单的 Java 应用
$ mvn archetype:generate \
-DgroupId=org.example \
-DartifactId=example \
-Dversion=1.0-SNAPSHOT \
-DarchetypeArtifactId=maven-archetype-quickstart
```

## maven指令介绍

```bash
$ mvn clean # 清理项目, 主要是删除项目的target文件夹, 如果里面的文件被其他程序使用, 会导致删除失败

$ mvn package # 打包指令, 将项目打成jar包, 但是默认是打成一个不可运行的jar包, 打成一个可运行的jar包需要在pom.xml中引入编译插件
$ mvn package -Dmaven.test.skip=true # 打包时跳过单元测试
$ mvn package -P profile # 打包时使用定制的项目环境配置
$ mvn clean package -Dmaven.test.skip=true -P test # 组合指令, 功能不变

$ mvn compile # 编译项目
$ mvn compile # 编译项目并使用定制的项目配置
$ mvn clean compile -P test # 组合指令, 同上. 不过默认不会进行单元测试, 所以不需要配置-Dmaven.test.skip=true

$ mvn exec:java -Dexec.mainClass="com.vineetmanohar.module.Main" -P test # 通过maven来启动java程序, maven会自动将项目中依赖的jar包添加到classpath, 不过在执行该指令前需要先执行compile编译代码, 也不能缺少指定的环境, 编译时用的什么环境, 运行时也得什么环境
```

### maven dependency依赖树分析

使用 `mvn dependency:tree` 即可展示全部的

可以加上Dincludes或者Dexcludes进行筛选格式 groupId:artifactId:version的方式进行过滤
例如

```bash
$ mvn dependency:tree -Dverbose -Dincludes=com.google.guava:guava
```

maven打印依赖树到文件中：

```shell
$ mvn dependency:tree >> tree.txt
```

### 寻找依赖树中的groupId

```shell
$ mvn dependency:tree -Dverbose -Dincludes=org.slf4j
[INFO] Scanning for projects...
[INFO]
[INFO] -----------------------< com.zhiwei:data-manage >-----------------------
[INFO] Building data-manage 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @ data-manage ---
[INFO] Verbose not supported since maven-dependency-plugin 3.0
[INFO] com.zhiwei:data-manage:jar:0.0.1-SNAPSHOT
[INFO] +- org.springframework.boot:spring-boot-starter-data-mongodb:jar:2.4.1:compile
[INFO] |  \- org.springframework.data:spring-data-mongodb:jar:3.1.2:compile
[INFO] |     \- org.slf4j:slf4j-api:jar:1.7.30:compile
[INFO] \- org.springframework.boot:spring-boot-starter-log4j2:jar:2.4.1:compile
[INFO]    \- org.slf4j:jul-to-slf4j:jar:1.7.30:compile
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  4.841 s
[INFO] Finished at: 2021-01-12T13:03:12+08:00
[INFO] ------------------------------------------------------------------------
```

## 把项目发布到本地maven仓库

### install:install-file

```bash
# 安装本地的jar包到maven仓库, 然后在项目的pom.xml文件中引入即可
$ mvn install:install-file -Dfile=target/demo.jar -DgroupId=com.example -DartifactId=demo -Dversion=1.0.0 -Dpackaging=jar
```

这种方式可以把jar包安装到本地仓库，主要可以用于强制更新jar包。

<font color='red'>注意：jar包的pom.xml不带有任何的依赖声明（dependency），别的项目引用这个jar包，maven无法检查jar包的依赖关系，会导致编译出错</font>

### install

```bash
$ mvn clean install
```

这种方式与上面的方式不的是，它在安装jar到本地仓库的时候，pom.xml会加入依赖声明，别的项目引用这个jar包，maven会自动检查依赖关系，并下载依赖的jar包。

### deploy

```bash
$ mvn clean deploy -Dmaven.test.skip=true -DaltDeploymentRepository=local::default::file:${HOME}/.m2/repository
```

deploy一般用来发布到远程仓库，但它也可以发布到本地仓库，-DaltDeploymentRepository指定仓库路径即可，参数格式：`id::layout::url`，参数解释如下：

id：仓库id，可以随意指定，比如：local

layout：仓库的布局方式，default即可

url：仓库路径，可以是http、https、file

<font color="red">-DaltDeploymentRepository 会覆盖掉pom.xml文件配置的发布仓库，不过对于只发布到本地仓库来说，这是必须的</font>
