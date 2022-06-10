# Maven plugin

## 准备工作

**创建  maven plugin 项目，项目名称为 example**

```bash
# artifactId 就是项目名称，必须符合 ${project}-maven-plugin 的命名规则
# -DarchetypeGroupId 和 -DarchetypeArtifactId 指定创建项目所使用的骨架
$ mvn archetype:generate \
-DgroupId=com.example \
-DartifactId=example-maven-plugin \
-DarchetypeGroupId=org.apache.maven.archetypes \
-DarchetypeArtifactId=maven-archetype-plugin
# 对插件进行测试，单元测试执行成功，会创建 target/test-classes/project-to-test/target/touch.txt 文件
$ mvn test
```
