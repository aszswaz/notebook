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
# raspi-gpio 方式
# 读取 GPIO 状态，27 是 GPIO 寄存器的编号，也称为 BCM 编码，和该针脚所处位置无关
$ raspi-gpio get $GPIO
# 设置针脚为输出模式
$ raspi-gpio set $GPIO op
# 设置针脚输出高电平
$ raspi-gpio set $GPIO dh
# 设置针脚输出低电平
$ raspi-gpio set $GPIO dl

# 使用 WiringPI 控制 GPIO
# -g：使用 BCM 编码，默认是 WiringPI 编码
$ gpio -g mode $GPIO out
$ gpio -g read $GPIO
# 输出低电平和高电平
$ gpio -g write $GPIO 0
$ gpio -g write $GPIO 1

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

    

[^1]: USB 串口设备，USB 接口转 TTL 串口的设备

