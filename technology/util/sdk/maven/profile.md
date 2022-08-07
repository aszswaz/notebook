### maven支持通过定制环境, 来配置不同环境之间的项目设置

#### 定制不同的项目环境

```xml
<profiles>
    <profile>
        <!-- 开发环境 -->
        <id>dev</id>
        <activation>
            <!--设置默认使用该环境-->
            <activeByDefault>true</activeByDefault>
        </activation>
        <properties>
            <!--环境定制变量, 与占位符配合, 可以实现在不同的环境下, 替换对应的值, 替换对象不仅仅只限于pom.xml文件-->
            <profile.active>dev</profile.active>
        </properties>
    </profile>
    <profile>
        <!-- 测试环境 -->
        <id>test</id>
        <properties>
            <profile.active>test</profile.active>
        </properties>
    </profile>
</profiles>
```

以下配置 + 以上配置, 可以实现SpringBoot项目(其他项目也可行), 在不同的环境下, 使用不同的配置文件

```xml
<build>
    <resources>
        <!--先排除所有环境相关的文件-->
        <resource>
            <directory>src/main/resources</directory>
            <excludes>
                <exclude>test/**</exclude>
                <exclude>dev/**</exclude>
                <exclude>pro/**</exclude>
                <exclude>*-dev.*</exclude>
                <exclude>*-pro.*</exclude>
                <exclude>*-test.*</exclude>
            </excludes>
            <!--替换占位符的文本-->
            <filtering>true</filtering>
        </resource>
        <!--引入环境相关的配置文件-->
        <resource>
            <directory>src/main/resources/${profile.active}</directory>
            <!--替换占位符的文本-->
            <filtering>true</filtering>
        </resource>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>*-${profile.active}.*</include>
            </includes>
            <!--替换占位符的文本-->
            <filtering>true</filtering>
        </resource>
    </resources>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-resources-plugin</artifactId>
            <configuration>
                <!--替换配置文件中指定的占位符文本-->
                <delimiters>
                    <delimiter>@</delimiter>
                </delimiters>
                <useDefaultDelimiters>false</useDefaultDelimiters>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
            <version>${spring.version}</version>
        </plugin>
        <!--跳过单元测试-->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <skip>true</skip>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <configuration>
                <skip>true</skip>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 对应的打包指令

**使用默认的环境配置**

```bash
$ mvn clean package -Dmaven.test.skip=true
```

`<activeByDefault>true</activeByDefault>`配置的哪一个环境作为默认, 就是用哪一个

**指定项目环境**

```bash
$ mvn clean package -Dmaven.test.skip=true -P test
```

指定使用test环境配置

### build配置中的操作详解

例: 执行打包指令`mvn clean package -Dmaven.test.skip=true -P test`

1.  首先排除所有和环境有关的配置文件
2.  根据test环境指定的profile.active的值, 加载对应的文件, test环境下, profile.active的值为test, 那么就加载src/main/resources/test文件夹下所有文件, 以及文件名称带有-test的文件
3.  将profile.active的值替换到项目的文件中, @作为需要替换的占位符, 例: 在application.properties中有`spring.profiles.active=@profile.active@`, 替换后为'spring.profiles.active=test', 让SpringBoot去加载`application-test.properties`文件中的配置
4.  跳过单元测试
5.  使用SpringBoot的打包插件重新写出jar包, SpringBoot会根据需要修改jar包

