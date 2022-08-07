### maven打包时的文件编码设置

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
</properties>
```

### maven打包插件的引入和配置

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

#### 上面的spring-boot插件的打包方式, 使用apache的插件打包也可以达到相同的目的

```xml
<build>
    <finalName>log4j2-p2p-windows-client</finalName>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>8</source>
                <target>8</target>
                <encoding>UTF-8</encoding>
                <compilerArguments>
                    <verbose/>
                    <!--需要引入一些jdk的工具包, 不然会报错-->
                    <bootclasspath>${java.home}/lib/rt.jar${path.separator}${java.home}/lib/jce.jar</bootclasspath>
                </compilerArguments>
            </configuration>
        </plugin>
        <!-- https://mvnrepository.com/artifact/org.apache.maven.plugins/maven-assembly-plugin -->
        <!--maven打包插件-->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-assembly-plugin</artifactId>
            <version>3.3.0</version>
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>zhong.log4j2.p2p.windows.client.LogP2pWindowsClient</mainClass>
                    </manifest>
                </archive>
                <descriptorRefs>
                    <!--指定为jar打包模式-->
                    <descriptorRef>jar-with-dependencies</descriptorRef>
                </descriptorRefs>
            </configuration>
            <executions>
                <!--指定打包时需要执行指令-->
                <execution>
                    <id>make-assembly</id>
                    <phase>package</phase>
                    <goals>
                        <goal>single</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

