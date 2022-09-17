# linux 中，一些关于 shell 的操作

```bash
# 修改当前用户的登录 shell
$ usermod -s /bin/zsh $USER && grep $USER /etc/passwd
```
