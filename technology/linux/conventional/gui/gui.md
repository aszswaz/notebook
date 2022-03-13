## 临时关闭/开启GUI界面

```bash
# 切换为字符界面
$ sudo systemctl isolate multi-user.target
# 切换为gui界面
$ sudo systemctl isolate graphical.target
```

