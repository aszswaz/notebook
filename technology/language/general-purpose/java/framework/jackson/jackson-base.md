# jackson 基本应用

## 读取 json 字符串

### 方式一

通过`JsonNode`的形式读取。

`JsonNode`的好处在于可以很方便的获得数据，不用进行类型强制转换，框架内部自动完成了类型转换。

首先请看最正确的例子：

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonDemo {
    public static void main(String[] args) throws JsonProcessingException {
        String jsonString = "{\"demo\": \"Hello World\"}";
        ObjectMapper jsonMapper = new ObjectMapper();

        JsonNode jsonNode = jsonMapper.readTree(jsonString);
        System.out.println(jsonNode.at("/demo").textValue());
    }
}
```

`JsonNode.at(String path)`方法用于获得指定的属性，它的参数是一个节点路径，比如获取孙子节点的数据：

```java
String jsonString = "{\"sun\": {\"grandson\": \"Hello, grandpa.\"}}";
JsonNode jsonNode = jsonMapper.readTree(jsonString);
System.out.println(jsonNode.at("/sun/grandson").textValue());
```

```txt
Hello, grandpa.
```

也可以这样获取孙子节点的数据：

```java
System.out.println(jsonNode.at("/sun").at("/grandson").textValue());
```

```txt
Hello, grandpa.
```

`JsonNode.required(String fieldName)`和`JsonNode.get(String fieldName)`都是用于获得当前节点的子节点，示例如下：

```java
String jsonString = "{\"demo\": \"Hello World\"}";
JsonNode jsonNode = jsonMapper.readTree(jsonString);
System.out.println(jsonNode.get("demo").textValue());
System.out.println(jsonNode.required("demo").textValue());
```

他们的区别在于，required 要求请求的节点是必须存在的，否则就会出现异常，而get不会引发异常，它会返回`null`，示例如下：

```java
System.out.println("get: " + jsonNode.get("exists"));
System.out.println("required: " + jsonNode.required("exists"));
```

```txt
get: null
Exception in thread "main" java.lang.IllegalArgumentException: No value for property 'exists' of `ObjectNode`
	at com.fasterxml.jackson.databind.JsonNode._reportRequiredViolation(JsonNode.java:1161)
	at com.fasterxml.jackson.databind.node.ObjectNode.required(ObjectNode.java:138)
	at JacksonDemo.main(JacksonDemo.java:11)
```

<font color="green">建议在正常情况下，所有获取节点的操作都通过`JsonNode.at(String path)`进行，因为节点不存在，它会返回一个`MisssNode`对象，在节点允许不存在的情况下，可以有效的防止异常的出现，而 `JsonNode.get(String fieldName)`则需要进行额外的非空判断才行。我建议这三个方法的优先使用顺序是：at > required > get</font>

用于获取节点的值函数，有两种。一种是`asXxx()`，比如`JsonNode.asText()`，另一种是`xxxValue()`，比如`JsonNode.textValue()`，他们最大的区别在于对数据类型的处理方式不一样。比如`asText()`就是把数据转换成 String，而不管原本的类型是什么。以 null 类型的处理为例：

```java
String jsonString = "{\"demo\": null}";
JsonNode jsonNode = jsonMapper.readTree(jsonString);
System.out.println(jsonNode.at("/demo").asText() == null);
System.out.println(jsonNode.at("/demo").textValue() == null);
```

```txt
false
true
```

它们对于数值类型的处理，并无区别：

```java
String jsonString = "{\"demo\": null}";
JsonNode jsonNode = jsonMapper.readTree(jsonString);
System.out.println(jsonNode.at("/demo").asDouble() == 0.0);
System.out.println(jsonNode.at("/demo").doubleValue() == 0.0);
```

```txt
true
true
```

所以应该尽量使用`textValue()`，而不是`asText()`，不然很可能获得一个是字符串的null

