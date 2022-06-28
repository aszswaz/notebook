# SSL证书

## 证书的制作

首先制作一个CA机构的证书：

```bash
# 生成CA认证机构的证书密钥key，注意：启用 -des3 就需要强制输入私钥密码
$ openssl genrsa -out ca.key 2048
# 生成一个有效期为10年的证书
$ openssl req -new -x509 -key ca.key -out ca.crt -days 3650 -subj "/CN=los.aszswaz.cn" -addext "subjectAltName = DNS:los.aszswaz.cn"
Enter pass phrase for aszswaz-ca.key:
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
# 国家
Country Name (2 letter code) [AU]:
# 省、州
State or Province Name (full name) [Some-State]: 
# 市
Locality Name (eg, city) []:
# 公司、组织
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
# 部门
Organizational Unit Name (eg, section) []:
# 服务器域名
Common Name (e.g. server FQDN or YOUR name) []:
# 邮箱地址
Email Address []:
```

用CA证书制作网站证书

```bash
# 生成私钥
$ openssl genrsa -out server.key 2048
# 生成证书请求文件
$ openssl req -new -key server.key -out server.csr
# 设置证书拓展字段，subjectAltName 字段用于表示证书的域名信息，很多客户端采用该字段来验证证书的有效性
$ nvim openssl.ext
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = example.com
DNS.2 = www.example.com
DNS.3 = net.example.com

# 用CA颁发证书，-set_serial 参数是指定证书的序列号，注意不要与本地证书库当中已经存在的证书的序列号相同，具体原因在下面的“注意事项”当中讲解
$ openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt -days 3650 -extfile openssl.ext
```

在某些情况下，需要把私钥和公钥组合为一个文件

```bash
# 生成 pem 文件
$ cat server.crt server.key > server.pem
# 生成 keystore 文件，通常用于 Java 应用程序
$ openssl pkcs12 -export -in server.crt -inkey server.key -out server.p12
$ keytool -importkeystore -v -srckeystore server.p12 -srcstoretype PKCS12 -destkeystore server.keystore -deststoretype PKCS12
```

证书制作完毕之后，需要把CA证书导入系统的证书库才能被浏览器信任，这里以archlinux为例：

```bash
# 把证书复制到系统的证书存储目录
$ sudo cp ca.crt /etc/ca-certificates/trust-source
# 加载证书
$ sudo trust extract-compat
```

上面的操作看上去使用的是trust，实际上操作的是openssl，几乎是所有linux软件都会采用openssl作为SSL实现，openssl以`/etc/ssl`作为证书的存储目录，trust则是封装了openssl的证书导入配置，使得导入证书变得简单，`/etc/ca-certificates/trust-source`和`/usr/share/ca-certificates/trust-source`两个文件夹下所有的证书都会被`ln`连接到`/etc/ssl`。

## 查看证书信息

```bash
# 文件后缀名也可以是crt
$ openssl x509 -in example.pem -noout -text
# 查看主题备用名，Chrome 需要这个拓展字段才能信任证书，其他浏览器不需要这个
$ openssl x509 -in aszswaz-server.crt -noout -ext subjectAltName
```

## 注意事项

### <font color="red">浏览器从服务器下载的证书，不能与系统本地证书库中的某个证书的颁发者和序列号完全一致，否则将导致证书验证失败</font>

错误演示如下：

现在手中有CA证书和CA证书的密钥`ca.key`、`ca.crt`，它们已经被安装在系统证书库，用这个CA证书分别办法两个证书：

```bash
# 声明一个用于生成证书的函数
$ openssl genrsa -des3 -out server01.key 2048
# 生成请求
$ openssl req -new -key server01.key -out server01.csr
# 颁发证书
$ openssl x509 -req -in server01.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server01.crt -days 3650
# 重复上述操作，生成server02.key和server02.crt
```

查看两个证书的颁发者和序列号：

```bash
# 发行者hash
$ openssl x509 -in server01.crt -noout -issuer_hash
d9c3a831
$ openssl x509 -in server02.crt -noout -issuer_hash
d9c3a831
# 打印序列号
$ openssl x509 -in server01.crt -noout -serial
serial=01
$ openssl x509 -in server02.crt -noout -serial
serial=01
```

把其中一个证书放到系统证书库：

```bash
$ sudo cp server01.key /etc/ca-certificates/trust-source && sudo trust extract-compat
```

然后把server02.key和server02.crt放到服务器，会发现无论如何，浏览器都会警告服务器证书不可信，因为浏览器发现在本地的证书库当中，存在一个颁发者与序列号都相同的证书。

解决办法：

一种是在使用CA证书颁发证书的时候，保证`-set_serial`参数不重复，另外一种就是删除证书库中已经存在的证书，archlinux 使用的证书存储路径是 `/etc/ca-certificates` 和 `/usr/share/ca-certificates/trust-source`，删除目标证书文件后执行一下 `sudo trust `。
