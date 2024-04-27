# 简介

[树莓派](https://zh.wikipedia.org/zh-cn/%E6%A0%91%E8%8E%93%E6%B4%BE)，英国树莓派基金会开发的微型单板计算机，目的是以低价硬件及自由软件促进学校的基本计算机科学教育。

树莓派系列计算机每一代均使用[博通](https://zh.wikipedia.org/wiki/博通)（Broadcom）出产的 [ARM 架构](https://zh.wikipedia.org/wiki/ARM架構)处理器，如今生产的机型（树莓派 4B）[内存](https://zh.wikipedia.org/wiki/内存)在 2GB 和 8GB 之间，以 [TF 卡](https://zh.wikipedia.org/wiki/TF卡)作为系统存储媒体（初代使用 [SD](https://zh.wikipedia.org/wiki/SD卡) 卡），配备 [USB](https://zh.wikipedia.org/wiki/USB) 接口和 [HDMI](https://zh.wikipedia.org/wiki/HDMI) 的视频输出（支持声音输出），内置 [Ethernet](https://zh.wikipedia.org/wiki/Ethernet)/[WLAN](https://zh.wikipedia.org/wiki/WLAN)/[Bluetooth](https://zh.wikipedia.org/wiki/Bluetooth) 网络链接的方式（依据型号决定），并且可使用多种操作系统。产品线型号分为 A型、B型、Zero型和 ComputeModule 计算卡。

[Raspberry Pi OS](https://zh.wikipedia.org/wiki/Raspberry_Pi_OS) 是官方推出的操作系统，适用于所有型号的树莓派，树莓派基金会网站也提供了 [Ubuntu MATE](https://zh.wikipedia.org/wiki/Ubuntu_MATE)、Ubuntu Core、Ubuntu Server、OSMC 等第三方系统供大众下载

# GPIO

[GPIO](https://zh.wikipedia.org/wiki/GPIO)（General-purpose input/output），通用型输入输出接口，其接脚可以由开发者编写的程序进行控制，它可以用于数据的传输。

## WiringPI

[WiringPI](https://github.com/WiringPi/WiringPi)，Gordon 开发的用于管理 GPIO 的 C 库，由于一些原因 Gordon 本人不再提供 WiringPI 的源代码，现在的 WiringPI 主要由社区提供支持。

WiringPI 的安装方式如下：

```bash
$ git clone https://github.com/WiringPi/WiringPi.git
$ cd WiringPi && ./build
```

## 编码方式

GPIO 的编码有三种：硬编码、BCM 编码、WiringPI 编码。

硬编码：针脚在板件上所处的位置，遵循从左到右，从下往上的排列规则

BCM：GPIO 寄存器的编号，它和硬编码的对应关系可以通过 pinout 命令或 WiringPI 的 gpio readall 命令查看

WiringPI 编码：WiringPI 这个库对于 GPIO 针脚的编码

## 在 CLI 中控制 GPIO

```bash
# 要操作的 GPIO 寄存器
$ GPIO=27
# 输出所有的 GPIO 针脚
$ pinout
# raspi-gpio 方式，适用于 raspberry pi 4b 和更早的版本
# 读取 GPIO 状态，27 是 GPIO 寄存器的编号，也称为 BCM 编码，和该针脚所处位置无关
$ raspi-gpio get $GPIO
# 设置针脚为输出模式
$ raspi-gpio set $GPIO op
# 设置针脚输出高电平
$ raspi-gpio set $GPIO dh
# 设置针脚输出低电平
$ raspi-gpio set $GPIO dl

# 使用 WiringPI 控制 GPIO，适用于 raspberry pi 4b 和更早的版本
# -g：使用 BCM 编码，默认是 WiringPI 编码
$ gpio -g mode $GPIO out
$ gpio -g read $GPIO
# 输出低电平和高电平
$ gpio -g write $GPIO 0
$ gpio -g write $GPIO 1

# pinctrl 适用于 raspberry pi 4b 和 raspberry pi 5 之后的版本
$ pinctrl set $GPIO op dh
$ pinctrl set $GPIO op dl

# libgpiod 适用于 Linux 4.8 以上的系统
# gpioset <chip> <line=value>
# chip 可以看作是 gpio 分组，常用的 GPIO 端口都在 chip 4 当中
$ gpioset 4 $GPIO=0
$ gpioset 4 $GPIO=1

# 通过文件系统控制 GPIO
$ cd /sys/class/gpio
# 将指定的 GPIO 接口从内核空间暴露到内核空间
$ echo $GPIO >> export
# 出现 gpio$GPIO 文件夹，进入该文件夹
$ cd "gpio$GPIO"
# 设置针脚为输出模式
$ echo "out" >> direction
# 输出高电平和低电平
$ echo 1 >> value
$ echo 0 >> value
```

## 通过程序控制 GPIO

### RPi.GPIO

```python
#!/bin/python3
import RPi.GPIO as GPIO
import time

red=27
green=15
yellow=4

wait_time=1

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(red, GPIO.OUT)
GPIO.setup(green, GPIO.OUT)
GPIO.setup(yellow, GPIO.OUT)

GPIO.output(red, GPIO.LOW)
GPIO.output(green, GPIO.LOW)
GPIO.output(yellow, GPIO.LOW)

while True:
    GPIO.output(red, GPIO.HIGH)
    GPIO.output(yellow, GPIO.LOW)
    time.sleep(wait_time)

    GPIO.output(green, GPIO.HIGH)
    GPIO.output(red, GPIO.LOW)
    time.sleep(wait_time)

    GPIO.output(yellow, GPIO.HIGH)
    GPIO.output(green, GPIO.LOW)
    time.sleep(wait_time)
```

### WiringPi


```c
#include <wiringPi.h>

// 编译指令：gcc demo.c -o demo -lwiringPi

// GPIO 针脚的 wiringPi 编码
#define RED    2
#define GREEN  16
#define YELLOW 7

#define WAIT_TIME 200

int main() {
    if (wiringPiSetup() < 0) return 1;

    pinMode(RED, OUTPUT);
    pinMode(GREEN, OUTPUT);
    pinMode(YELLOW, OUTPUT);

    digitalWrite(YELLOW, 0);
    digitalWrite(GREEN, 0);
    digitalWrite(YELLOW, 0);

    while(1) {
        digitalWrite(YELLOW, 1);
        digitalWrite(RED, 0);
        delay(WAIT_TIME);

        digitalWrite(YELLOW, 0);
        digitalWrite(GREEN, 1);
        delay(WAIT_TIME);

        digitalWrite(GREEN, 0);
        digitalWrite(RED, 1);
        delay(WAIT_TIME);
    }
    return 0;
}
```

### python3-libgpiod

Raspberry Pi 5 不再支持 RPi.GPIO 和 WiringPi，只有 python3-libgpiod 依然可用，它是 [libgpio](https://git.kernel.org/pub/scm/libs/libgpiod/libgpiod.git/about/) 的 python 绑定。

```bash
$ sudo apt install python3-libgpiod
```

示例代码如下：

```python
import time

import gpiod


"""
定时启停风扇
"""


LINE = 45

# 获得 GPIO 切片，可以理解为 Raspberry Pi 5 将 GPIO 进行了分组，比较常用的 GPIO 端口都在 chip 4 当中。
chip = gpiod.Chip("4")
power = chip.get_line(LINE)
power.request(consumer = "motor_movement", type = gpiod.LINE_REQ_DIR_OUT)

def run():
    delay = 5
    try:
        while True:
            power.set_value(1)
            time.sleep(delay)
            power.set_value(0)
            time.sleep(delay)
    finally:
        cleanup()

def cleanup():
    power.release()

if __name__ == "__main__":
    run()
```

## 串口通信

树莓派的操作系统提供两个串口设备（UART）用于在 GPIO 针脚上进行串口通信，一种是 mini UART，另一种是 PL011，在[一些树莓派](https://www.raspberrypi.com/documentation/computers/configuration.html#primary-and-secondary-uart)中，PL011 映射给了蓝牙设备，mini UART 则用于 CLI 交互，并且以 mini UART 作为主 UART。mini UART 的可用功能少于 PL011，因此需要把 PL011 映射到第 8 和第 10（TXD 和 RXD）引脚，并且作为主串口使用，操作步骤如下：

1. 执行指令 `sudo raspi-config`
2. 进入 `Interface Options`
3. 进入 `Serial Port`
4. `Would you like a login shell to be accessible over serial?` 选择 `No`
5. `Would you like the serial port hardware to be enable?` 选择 `Yes`
6. 重启树莓派

调试串口通信步骤如下：

1. 电脑端安装[串口调试助手](https://apps.microsoft.com/store/detail/%E4%B8%B2%E5%8F%A3%E8%B0%83%E8%AF%95%E5%8A%A9%E6%89%8B/9NBLGGH43HDM?hl=zh-cn&gl=cn)

2. 将树莓派的引脚 8（TXD）连接到 USB 串口设备[^1]的 RXD 引脚，将引脚 10（RXD）连接到 USB 串口的 TXD，将引脚 6（GND）连接到 USB 串口的 GND

3. 执行如下代码：
    ```python
    #!/bin/python3
    
    import serial
    
    ser = serial.Serial('/dev/serial0', 9600)
    if not ser.isOpen:
        ser.open()
    
    ser.write(b"Hello World")
    ser.close()
    ```


## 设置端口电阻

在初始化 GPIO 端口为 input 模式时，最好设置端口是否连接到 10kr 的内部电阻，否则端口悬空时，由于外部电流的干扰，无法保证读取到的值。

上拉电阻：端口连接到接电压的内部电阻，端口悬空或外部输入低电平时，寄存器中的值为 1，外部输入高电平时寄存器中的值为 0

下拉电阻：端口连接到接地的内部电阻，端口悬空或外部输入低电平时，寄存器中的值为 0

[^1]: USB 串口设备，USB 接口转 TTL 串口的设备

# 特殊的 GPIO 端口

通过 `gpioinfo` 指令可以查看树莓派上所有的 GPIO 端口包括但不限于 40pin 的 GPIO，比如 raspberry pi 5 新增了风扇控制端口，其 GPIO 信息如下：

```bash
# 或 pinctrl FAN_PWM
$ gpioinfo | grep FAN_PWM
        line  45:    "FAN_PWM"       unused  output  active-high
```

可以看到风扇的 PWM GPIO 端口为 45，要控制风扇只需如下操作：

```bash
# 开启风扇，或 pinctrl FAN_PWM dl
$ pinctrl set 45 op dl
# 关闭风扇，或 pinctrl FAN_PWM dh
$ pinctrl set 45 op dh
```

# ACT 指示灯

raspberry pi 4 mode b 自带一个 ACT 指示灯，默认情况下用于指示 SD 的读写情况和 CPU 的忙碌状态。这个指示灯的控制方式如下：

```bash
$ sudo -i
$ cd '/sys/class/leds/ACT'
# 设置 ACT LED 的控制模式为手动模式
$ echo 'none' >> trigger
# 打开或关闭 ACT LED
$ echo '1' >> brightness
# 定时闪烁
$ echo 'timer' >> trigger
# 设置闪烁频率，单位：ms
$ echo '500' >> delay_on
$ echo '500' >> delay_off
# 模仿心跳闪烁
$ echo 'heartbeat' >> trigger
# 常亮
$ echo 'default-on' >> trigger
```

# Type-c 接口

raspberry pi 4B 的 Type-c 具有 OTG 功能，支持 USB 2.0。

但是 OS 默认禁用该功能，需要手动开启，方法如下：

```bash
$ sudo vim /boot/config.txt
...
# 以主机模式开启 Type-c OTG 功能
dtoverlay=dwc2,dr_mode=host

[all]
...

$ sudo reboot
```

## 将树莓派作为以太网卡

```bash
$ sudo vim /boot/config.txt
...
dtoverlay=dwc2,dr_mode=peripheral
...

# 加载 OTG 以太网卡驱动
$ sudo vim /boot/cmdline.txt
console=serial0,115200 ... rootwait modules-load=dwc2,g_ether ...

# 让操作系统和 NetworkManager 管理 gadget 设备
$ sudo cp /usr/lib/udev/rules.d/85-nm-unmanaged.rules /etc/udev/rules.d/85-nm-unmanaged.rules
$ sudo vim /etc/udev/rules.d/85-nm-unmanaged.rules
...
ENV{DEVTYPE}=="gadget", ENV{NM_UNMANAGED}="0"
...

$ sudo reboot

# 配置 NetworkManager
$ sudo nmcli con add type ethernet ifname usb0 con-name usb0 connection.autoconnect yes \
    ipv4.method manual \
    ipv4.addr '192.168.11.2' \
    ipv4.gateway '192.168.11.1' \
    ipv4.dns '114.114.114.114,8.8.8.8'
$ sudo nmcli con up eth0
```

将数据线的一端插入树莓派的 type-c 接口，另一端插入电脑 USB 接口，如果是电脑是 windows 系统，电脑会将它识别为 <font color="red">USB 串行设备</font>，此时需要安装 [RNDIS 驱动](https://wiki.sipeed.com/hardware/en/maixsense/maixsense-a075v/install_drivers.html)，驱动安装成功后，OS 将它识别为 <font color="green">USB Ethernet/RNDIS Gadget</font> 设备，至此大功告成。

# LCD 彩色显示屏

LCD（液晶显示屏），可以通过 SPI 来传输图像数据，本文所采用的显示屏参数如下：

```txt
尺寸：2 英寸
分辨率：240 * 320
显示颜色：262K 彩色
通信接口：SPI
驱动芯片：ST7789VW
```

购买地址：https://item.taobao.com/item.htm?_u=r2pfas9be10a&id=607500389198&spm=a1z09.2.0.0.91322e8d3T8lvM&skuId=5222086214082

附带教程：https://www.waveshare.net/wiki/2inch_LCD_Module

