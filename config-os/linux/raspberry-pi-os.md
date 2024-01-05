# [Raspberry Pi OS](https://www.raspberrypi.com/software/)

Raspberry Pi 基金会为 [Raspberry Pi](https://www.raspberrypi.com/) 打造的操作系统

# 关闭 wifi

编辑 `/boot/config.txt`，添加下面的内核启动参数：

```txt
dtoverlay=disable-wifi
```

内核将不会加载 wifi 设备和驱动。==在这之前需要确保有另外可用的登录树莓派的方式，比如以太网或串口登录。==

# 通过串口登录 SHELL

```bash
# 启动一个 TUI 配置树莓派：Interfacing Options -> Serial -> Yes
$ sudo raspi-config
```

硬件方面需要准备一个 [CH340](https://detail.tmall.com/item.htm?_u=52pfas9b55ce&id=631915097812&spm=a1z09.2.0.0.1b692e8dEWFofC) 模块和三根杜邦线，用来进行 USB 数据表和 TTL 数据包的转换，将 GPIO14 接到该模块的 RXD，GPIO15 接到 TXD，GND 接到模块的 GND，GPIO 接口的位置可以通过 `pinout` 命令查找。