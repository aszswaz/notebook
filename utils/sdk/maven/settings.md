## maven 下载依赖的流程

以编译工程下载依赖为例：`localRepository`本地仓库 ➔ nexus ➔ 私服（如果有） ➔ 中央仓库
具体如下： 

1.  `maven`去`settings`配置的`localRepository`本地仓库查找依赖
2.  本地仓库没有，根据`pom`文件或者`settings`配置的`repository`仓库查找依赖
3.  如果`settings`配置了`mirror`，第二步的请求会被拦截，并使用`mirror`配置的`url`仓库查找依赖，即`mirrorOf`的配置会影响拦截的请求，一般情况下配置的是自己公司的私服
    3.1.`mirrorOf`配置*，无论`pom`和`settings`配置的`repository`仓库的`url`是什么，仓库`url`都会被替换成`mirror`中配置的`url`
    3.2.`mirrorOf`配置业界公认可选值，此时`mirror`的`url`也应该是其匹配的仓库地址
    3.3.`mirrorOf`自定义，一般情况下和`pom`和`settings`配置的`repository`的`id`保持一致，这样镜像会拦截匹配的仓库的请求，不匹配的走中央仓库；如果都不匹配，遍历镜像并下载依赖；部分匹配，拦截匹配并下载，其他不匹配的遍历镜像并下载。
    3.4.其他配置，例如一个镜像以逗号分隔，配置多个`mirrorOf`，所有拦截的请求使用同一个仓库
    3.5.**实际上`mirrorOf`只是镜像`url`的一个别名，用来拦截仓库请求并转发到镜像配置的`url`中**
4.  如果镜像中拦截所有请求到私服，但私服中没有，私服会和中央仓库打交道拉取依赖

## mirrorOf 配置原则

1.  自定义时，和`pom`和`settings`配置的`repository`的`id`保持一致
2.  如果所有的请求都拦截到自己的私服，那么使用*
3.  没什么原则，符合你的需求即可

## 配置案例

`settings`的镜像，`id`和`name`自定义，`id`保证唯一，`mirrorOf`配置`*`拦截所有请求到私服

`settings.xml`配置

```xml
<mirrors>
	<mirror>
		<id>nexus</id>
		<name>nexus</name>
		<mirrorOf>*</mirrorOf>
		<url>http://localhost:8081/nexus/content/groups/public</url>
	</mirror>
</mirrors>
<!--激活配置 -->
<activeProfiles>
	<activeProfile>nexus</activeProfile>
</activeProfiles>
<profiles>
	<profile>
		<id>nexus</id>
		<repositories>
			<repository>
				<id>nexus</id>
				<name>Nexus</name>
				<url>http://localhost:8081/nexus/content/groups/public</url>
				<releases>
					<enabled>true</enabled>
				</releases>
				<snapshots>
					<enabled>true</enabled>
				</snapshots>
			</repository>
		</repositories>
		<pluginRepositories>
			<pluginRepository>
				<id>nexus</id>
				<name>Nexus</name>
				<url>http://localhost:8081/nexus/content/groups/public</url>
				<releases>
					<enabled>true</enabled>
				</releases>
				<snapshots>
					<enabled>true</enabled>
				</snapshots>
			</pluginRepository>
		</pluginRepositories>
	</profile>
	<profile>
		<id>env-dev</id>
		<activation>
			<activeByDefault>true</activeByDefault>
			<jdk>1.7</jdk>
		</activation>
		<properties>
			<maven.compiler.source>1.7</maven.compiler.source>
			<maven.compiler.target>1.7</maven.compiler.target>
			<maven.compiler.compilerVersion>1.7</maven.compiler.compilerVersion>
		</properties>
	</profile>
</profiles>
```

在`settings`的`profile`配置仓库或者项目`pom`文件中配置仓库

`pom.xml`中的配置

```xml
<repositories>
	<repository>
		<id>nexus</id>
		<name>Nexus</name>
		<url>http://localhost:8081/nexus/content/groups/public</url>
		<releases>
			<enabled>true</enabled>
		</releases>
		<snapshots>
			<enabled>true</enabled>
			<updatePolicy>always</updatePolicy>
		</snapshots>
	</repository>
</repositories>

<pluginRepositories>
	<pluginRepository>
		<id>nexus</id>
		<name>Nexus</name>
		<url>http://localhost:8081/nexus/content/groups/public</url>
		<releases>
			<enabled>true</enabled>
		</releases>
		<snapshots>
			<enabled>true</enabled>
			<updatePolicy>always</updatePolicy>
		</snapshots>
	</pluginRepository>
</pluginRepositories>
```