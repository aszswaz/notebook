# jackson

java 的json处理框架

## maven

```xml
<!--核心API-->
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-core -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-core</artifactId>
    <version>2.13.0-rc1</version>
</dependency>
<!--Json <=> Object 转换工具包-->
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.13.0-rc1</version>
</dependency>
<!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-annotations -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-annotations</artifactId>
    <version>2.13.0-rc1</version>
</dependency>
```

## 格式化json

使用jackson自带的`com.fasterxml.jackson.core.util.DefaultPrettyPrinter`，格式化json

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author aszswaz
 * @createTime 2021-08-05 21:48:34
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class JacksonDemo {
    public static void main(String[] args) throws JsonProcessingException {
        final Map<String, Object> root = new HashMap<>();
        final List<Map<String, Object>> subList = new ArrayList<>();
        Map<String, Object> subElement = new HashMap<>();
        subElement.put("subElemenetKey", "subElemenet");
        subList.add(subElement);
        root.put("subList", subList);
        System.out.println(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(root));
    }
}
```

输出结果：

```json
{
  "subList" : [ {
    "subElemenetKey" : "subElemenet"
  } ]
}
```

这样输出的数组格式，并不是我想要的。

通过自定义的格式化处理器，格式化json，创建 `JsonPertty`类

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonStreamContext;
import com.fasterxml.jackson.core.PrettyPrinter;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import org.jetbrains.annotations.NotNull;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;

/**
 * json格式化输出，
 * 请注意，本json格式化工具类，对json进行了换行、缩进、高亮，因此增加了CPU的资源消耗，最适合应用于本地开发时的json日志打印，不建议应用于大量的json数据场景
 *
 * @author aszswaz
 * @createTime 2021-08-05 22:57:40
 * @ide IntelliJ IDEA
 */
@SuppressWarnings({"JavaDoc", "unused"})
public class JsonPretty implements PrettyPrinter {
    /**
     * 缩进层次
     */
    private int indentation = 0;
    /**
     * 制表符
     */
    private static final String TABS = "  ";
    /**
     * 字段的高亮颜色
     */
    private static final String KEY_COLOR = "\033[35m";
    /**
     * null 布尔值高亮
     */
    private static final String NULL_BOOLEAN_COLOR = "\033[33m";
    /**
     * 数值颜色
     */
    private static final String NUMBER_COLOR = "\033[34m";
    /**
     * 字符串颜色
     */
    private static final String STRING_COLOR = "\033[32m";
    /**
     * 是否需要高亮
     */
    private final boolean ansi;

    public JsonPretty() {
        this.ansi = true;
    }

    public JsonPretty(boolean ansi) {
        this.ansi = ansi;
    }

    /**
     * 根元素分割符
     */
    @Override
    public void writeRootValueSeparator(@NotNull JsonGenerator gen) throws IOException {
        gen.writeRaw(',');
        gen.writeRaw(System.lineSeparator());
    }

    /**
     * 一个新的对象开始输出之前，由于可能会出现空对象，所以，层级缩进操作放在 {@link #beforeObjectEntries(JsonGenerator)}
     */
    @Override
    public void writeStartObject(@NotNull JsonGenerator gen) throws IOException {
        gen.writeRaw('{');
    }

    /**
     * 对象输出完毕
     */
    @Override
    public void writeEndObject(@NotNull JsonGenerator gen, int nrOfEntries) throws IOException {
        // 关闭上一个值的高亮
        this.closureAnsi(gen);
        if (nrOfEntries > 0) {
            gen.writeRaw(System.lineSeparator());
            // 递减缩进的层级
            this.indentation = Math.max(0, this.indentation - 1);
            this.writeTabs(gen);
        }
        gen.writeRaw("}");
    }

    /**
     * 对象属性分割符
     */
    @Override
    public void writeObjectEntrySeparator(@NotNull JsonGenerator gen) throws IOException {
        // 关闭上一个值的高亮
        this.closureAnsi(gen);
        gen.writeRaw(',');
        gen.writeRaw(System.lineSeparator());
        this.writeTabs(gen);
        // 开启下一个 KEY 的高亮
        if (this.ansi) gen.writeRaw(KEY_COLOR);
    }

    /**
     * 对象的字段和值的分割符
     */
    @Override
    public void writeObjectFieldValueSeparator(@NotNull JsonGenerator gen) throws IOException {
        try {
            // 关闭上一个 KEY 的高亮
            this.closureAnsi(gen);
            gen.writeRaw(": ");

            if (!this.ansi) return;
            JsonStreamContext streamContext = gen.getOutputContext();
            final String name = streamContext.getCurrentName();
            final Object obj = streamContext.getCurrentValue();
            Object value;

            if (obj instanceof Map) {
                value = ((Map<?, ?>) obj).get(name);
                this.writeAnsi(gen, value);
            } else if (obj instanceof JsonNode) {
                value = ((JsonNode) obj).get(name);
                this.writeAnsi(gen, value);
            } else {
                Class<?> aClass = obj.getClass();
                while (nonNull(aClass) && aClass != Object.class) {
                    // 先对比注解
                    final Field[] fields = aClass.getDeclaredFields();
                    for (Field field : fields) {
                        if (field.isAnnotationPresent(JsonProperty.class)) {
                            if (name.equals(field.getAnnotation(JsonProperty.class).value())) {
                                value = this.invokeGet(aClass, obj, field);
                                this.writeAnsi(gen, value);
                                return;
                            }
                        }
                    }
                    // 对比属性名称
                    for (Field field : fields) {
                        if (name.equals(field.getName())) {
                            value = this.invokeGet(aClass, obj, field);
                            this.writeAnsi(gen, value);
                            return;
                        }
                    }
                    // 当前类没发现对应的属性，就去扫描父类
                    aClass = aClass.getSuperclass();
                }
            }
        } catch (ReflectiveOperationException e) {
            throw new JsonGenerationException(e.getMessage(), e, gen);
        }
    }

    /**
     * 一个数组开始输出之前，由于可能会出现空数据，所以，缩进层级操作放在{@link #beforeArrayValues(JsonGenerator)}
     */
    @Override
    public void writeStartArray(@NotNull JsonGenerator gen) throws IOException {
        gen.writeRaw('[');
    }

    /**
     * 一个数组输出完毕
     */
    @Override
    public void writeEndArray(@NotNull JsonGenerator gen, int nrOfValues) throws IOException {
        this.closureAnsi(gen);
        if (nrOfValues > 0) {
            gen.writeRaw(System.lineSeparator());
            this.indentation = Math.max(0, this.indentation - 1);
            this.writeTabs(gen);
        }
        gen.writeRaw(']');
    }

    /**
     * 数组中的元素分割符
     */
    @Override
    public void writeArrayValueSeparator(@NotNull JsonGenerator gen) throws IOException {
        this.closureAnsi(gen);
        gen.writeRaw(',');
        gen.writeRaw(System.lineSeparator());
        this.writeTabs(gen);
        // 高亮下一个元素
        JsonStreamContext context = gen.getOutputContext();
        // 这个索引已经指向下一个元素，所以直接获取就行
        int index = context.getCurrentIndex();

        Object currentValue = context.getCurrentValue();
        Object value;

        if (currentValue instanceof List) {
            value = ((List<?>) currentValue).get(index);
        } else if (currentValue instanceof JsonNode) {
            value = ((JsonNode) currentValue).get(index);
        } else throw new ClassCastException("Unknown type: " + currentValue.getClass().getName());

        this.writeAnsi(gen, value);
    }

    /**
     * 数组第一个元素开始输出之前
     */
    @Override
    public void beforeArrayValues(@NotNull JsonGenerator gen) throws IOException {
        gen.writeRaw(System.lineSeparator());
        // 递增缩进层级
        this.indentation += 1;
        this.writeTabs(gen);
        // 给 value 设置高亮
        JsonStreamContext context = gen.getOutputContext();
        int index = context.getCurrentIndex();

        Object value;
        Object currentValue = context.getCurrentValue();
        if (currentValue instanceof List) {
            value = ((List<?>) context.getCurrentValue()).get(index);
        } else if (currentValue instanceof JsonNode) {
            value = ((JsonNode) currentValue).get(index);
        } else throw new ClassCastException("Unknown type: " + currentValue.getClass().getName());

        this.writeAnsi(gen, value);
    }

    /**
     * 一个对象的第一个字段输出之前
     */
    @Override
    public void beforeObjectEntries(@NotNull JsonGenerator gen) throws IOException {
        gen.writeRaw(System.lineSeparator());
        this.indentation += 1;
        this.writeTabs(gen);
        if (this.ansi) gen.writeRaw(KEY_COLOR);
    }

    /**
     * 输出 ANSI 颜色
     */
    private void writeAnsi(JsonGenerator generator, Object value) throws IOException {
        if (this.ansi) {
            if (value instanceof JsonNode) {
                JsonNode jsonNode = (JsonNode) value;
                if (jsonNode.isNull() || jsonNode.isBoolean()) {
                    generator.writeRaw(NULL_BOOLEAN_COLOR);
                } else if (jsonNode.isTextual()) {
                    generator.writeRaw(STRING_COLOR);
                } else if (jsonNode.isNumber()) {
                    generator.writeRaw(NUMBER_COLOR);
                }
            } else {
                if (isNull(value) || value instanceof Boolean) {
                    generator.writeRaw(NULL_BOOLEAN_COLOR);
                } else if (value instanceof String) {
                    generator.writeRaw(STRING_COLOR);
                } else if (value instanceof Number) {
                    generator.writeRaw(NUMBER_COLOR);
                }
            }
        }
    }

    /**
     * 执行对象属性的get方法
     */
    private Object invokeGet(@NotNull Class<?> aClass, Object obj, @NotNull Field field) throws ReflectiveOperationException {
        char[] chars = field.getName().toCharArray();
        chars[0] = Character.toUpperCase(chars[0]);
        String camelCase = new String(chars);
        Class<?> type = field.getType();
        if (type == boolean.class) {
            return aClass.getMethod("is" + camelCase).invoke(obj);
        } else {
            return aClass.getMethod("get" + camelCase).invoke(obj);
        }
    }

    /**
     * 闭合 ANSI颜色
     */
    private void closureAnsi(@NotNull JsonGenerator jsonGenerator) throws IOException {
        if (this.ansi) {
            jsonGenerator.writeRaw("\033[0m");
        }
    }

    /**
     * 按照层级，输出制表符
     */
    private void writeTabs(JsonGenerator generator) throws IOException {
        for (int i = 0; i < this.indentation; i++) {
            generator.writeRaw(TABS);
        }
    }
}
```

main方法

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author aszswaz
 * @createTime 2021-08-05 23:31:38
 * @ide IntelliJ IDEA
 */
@SuppressWarnings("JavaDoc")
public class JacksonDemo {
    public static void main(String[] args) throws JsonProcessingException {
        Map<String, Object> jsonMap = new HashMap<>();
        List<Object> list = new ArrayList<>();
        list.add(1);
        list.add(2);
        list.add("demo");
        Map<String, Object> subMap = new HashMap<>();
        subMap.put("subKey", "subValue");
        subMap.put("integer", 110);
        subMap.put("boolean", true);
        list.add(subMap);

        jsonMap.put("list", list);
        System.out.println(new ObjectMapper().writer(new JsonPretty()).writeValueAsString(jsonMap));
    }
}
```

结果

```json
{
  "list": [
    1,
    2,
    "demo",
    {
      "boolean": true,
      "subKey": "subValue",
      "integer": 110
    }
  ]
}
```

<font color="red">注意：本文档中，自定义的 JsonPretty 不建议用于数据库的数据存储，只适用于 log 美化，因为，在 json 加入了 ANSI 的文本高亮代码</font>

