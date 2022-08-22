# Introduction

SSL 证书的制作与免费证书的获取

# 证书的制作

首先制作一个CA机构的证书：

```bash
# 生成CA认证机构的证书密钥key
# 生成 RSA 密钥
# $ openssl genrsa -out ca.key 2048
# 生成 ECC 密钥，ECC 加密算法的性能表现要比 RSA 好
$ openssl ecparam -genkey -name prime256v1 -out ca.key
# 生成一个有效期为10年的证书
$ openssl req -new -x509 -key ca.key -out ca.crt -days 3650 -subj "/CN=www.aszswaz.cn" -addext "subjectAltName = DNS:www.aszswaz.cn"
```

用CA证书制作网站证书

```bash
# 生成私钥
$ openssl ecparam -genkey -name prime256v1 -out server.key
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
# 把 CA 证书安装到系统的证书存储目录
$ sudo trust anchor --store ca.crt
```

# 查看证书信息

```bash
# 文件后缀名也可以是crt
$ openssl x509 -in example.pem -noout -text
# 查看主题备用名，Chrome 需要这个拓展字段才能信任证书，其他浏览器不需要这个
$ openssl x509 -in aszswaz-server.crt -noout -ext subjectAltName
```

# 注意事项

<font color="red">浏览器从服务器下载的证书，不能与系统本地证书库中的某个证书的颁发者和序列号完全一致，否则将导致证书验证失败</font>

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

一种是在使用CA证书颁发证书的时候，保证 `-set_serial` 参数不重复，另外一种就是删除证书库中已经存在的证书，archlinux 使用的证书存储路径是 `/etc/ca-certificates` 和 `/usr/share/ca-certificates/trust-source`，删除目标证书文件后执行一下 `sudo trust `。

# 获取 CA 机构颁发的免费证书

可以通过 certbot 获取 [Let's encrypt](https://letsencrypt.org/)， 由于主要使用 centos 作为服务器的操作系统，所以这里以 centos 7 为例。

yum 仓库中的 certbot 版本很旧，官方推荐通过 [snap](https://snapcraft.io/) 进行安装，所以需要先安装 snap。

```bash
# install epel
# centos 8
$ sudo dnf install epel-release && sudo dnf upgrade
# centos 7
$ sudo yum install epel-release
$ sudo yum install snapd -y && \
$ sudo systemctl enable --now snapd.socket
$ sudo ln -s /var/lib/snapd/snap /snap
```

安装 certbot。

```bash
$ sudo snap install --classic certbot
$ sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

“Let's encrypt” 在颁发证书时，会通过 HTTP 请求有指定内容的文件验证域名的所有权，URL 的基础路径是 /.well-known/acme-challenge，因此我们需要配置 nginx 处理这种静态文件请求。端口是 80 或 443 都行，“Let's encrypt” 优先访问 80 端口。

```bash
$ sudo nvim /etc/nginx/conf.d/demo.conf
server {
    listen 80;
    server_name example.com www.example.com;
    location /.well-known/acme-challenge/ {
        root /var/lib/certbot/;
    }
}
```

验证 nginx 的配置是否正确

```bash
$ sudo zsh -c "mkdir --parents /var/lib/certbot/.well-known/acme-challenge && echo 'Hello World' >> /var/lib/certbot/.well-known/acme-challenge/demo.txt"
$ curl http://www.example.com/.well-known/acme-challenge/demo.txt
$ sudo rm -rf /var/lib/certbot/.well-known
```

请求 Let's encrypt 颁发证书，如果成功，证书保存在 /etc/letsencrypt/live 文件夹下

```bash
$ sudo certbort certonly --webroot -w /var/lib/certbot -d example.com -d www.example.com
```

“ Let's encrypt” 证书的有效期是 90 天，因此需要使用 cron 定期更新证书

```bash
# 每个月更新一次证书
$ sudo crontab -u root -e
0 0 1 * *        certbot renew --post-hook "nginx -s reload"
```

