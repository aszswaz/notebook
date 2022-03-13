# 注意事项

## 修改主机的名称

修改主机的名称可以通过以下方式修改: 

```bash
$ sudo vim /etc/hostname
myname.localdomain
```

但是，同时也必须修改hosts文件，不然会导致SpringBoot等检查本机域名超时

```bash
$ sudo vim /etc/hostname
127.0.0.1    myname.localdomain
::1          myname.localdomain
```

