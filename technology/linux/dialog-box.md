# 通过命令行显示对话框

## 中间对话框

```bash
# 这是一个GTK的跨平台消息对话框
$ zenity --error --title="Hello World" --text="Hello Wrold" --no-wrap
```

## 小型消息弹窗

```bash
# 这个弹窗的位置不一定，多见于右下角
$ notify-send "Hello World" "Hello World"
```
