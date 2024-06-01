# 简介

[D-Bus](https://zh.wikipedia.org/wiki/D-Bus)（Desktop Bus）是一个进程间通信及远程过程调用机制，可以让多个不同的计算机程序（即进程）在同一台电脑上同时进行通信。D-Bus 作为 freedesktop.org 项目的一部分，其设计目的是使 Linux 桌面环境（如 GNOME 与 KDE 等）提供的服务标准化。

freedesktop.org 项目同时也开发了一个称为 libdbus 的自由及开放源代码软件函式库，作为规范的参考实现。这个函式库常与 D-Bus 本身混淆。也存在着其他的 D-Bus 实现，像是 GDBus (GNOME)，QtDBus (Qt/KDE)，dbus-java 以及 sd-bus（systemd 的一部分）。

D-Bus 可用于同一个桌面会话中不同桌面应用软件间的通信，能集成桌面会话，也解决了进程的生命周期的问题。它也允许桌面会话与操作系统间的通信，这通常包括了**内核**与**任何的系统守护进程**或**一般进程间**的通信。

D-Bus 服务同时包含了系统守护进程（给像是“新增硬件设备”或是“打印机队列变更”等事件使用）以及一个给每个用户的登录会话（给这个用户启动的进程间的一般通信使用）使用的独有守护进程。

# dbus 调试工具

**dbus-monitor** 可以获取所有 dbus 消息，在使用前需要先配置 `/etc/dbus-1/system-local.conf`：

```xml
<!DOCTYPE busconfig PUBLIC
"-//freedesktop//DTD D-Bus Bus Configuration 1.0//EN"
"http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">
<busconfig>
    <policy user="root">
        <!--导出所有消息-->
        <allow eavesdrop="true"/>
        <allow eavesdrop="true" send_destination="*"/>
    </policy>
</busconfig>
```

```bash
$ sudo dbus-monitor --system
# 或
$ sudo dbus-monitor --session
```

**d-feet** 是一款基于 GUI 的 dbus 调试工具，它可以很方便的查看已注册的 dbus 接口，可以调用接口的 method。在调试接口前，由于 systemd 对 dbus 的安全策略会阻止普通用户访问注册到 System Bus 的接口，因此需要实现配置接口的权限以允许普通用户访问，比如要调试的接口是 `com.example.calculator`，那么久配置 `/etc/dbus-1/system.d/com.example.calculator.conf` 文件：

```config
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE busconfig PUBLIC
    "-//freedesktop//DTD D-BUS Bus Configuration 1.0//EN"
    "http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">
<busconfig>
    <!--配置普通用户的访问权限-->
    <policy user="aszswaz">
        <allow eavesdrop="true"/>
        <allow eavesdrop="true" send_destination="*"/>
        <allow own="com.example.calculator_interface"/>
        <allow eavesdrop="true" send_interface="com.example.calculator_interface" send_member="Add"/>
     </policy>
</busconfig>
```

配置完成之后需要重启 dbus：`sudo systemctl restart dbus`

**dbus-send** 是基于 CLI 的 dbus message 发送工具：

```bash
$ dbus-send --system --type=signal / com.studyguide.greeting_signal string:"hello universe!"
```

# 代码示例

## 获取主机名称

```python
#!/usr/bin/python3

import dbus


def main():
    # 连接到 dbus 的 system bus
    bus = dbus.SystemBus()
    # 获取 /org/freedesktop/hostname1 代理的对象 org.freedesktop.hostname1，这个对象是 systemd-hostname 服务注册到 dbus 的
    obj_name = "org.freedesktop.hostname1"
    obj = bus.get_object(obj_name, '/org/freedesktop/hostname1')
    # 获取 Properties 接口
    interface = dbus.Interface(obj, 'org.freedesktop.DBus.Properties')
    print(interface.GetAll(obj_name))
    # 获取 hostname
    hostname = interface.Get(obj_name, 'Hostname')
    print("=========================================")
    print(hostname)
    pass


if __name__ == "__main__":
    main()
```

## 注册并接收 dbus 信号

```python
#!/usr/bin/python3

import dbus
import dbus.mainloop.glib
from gi.repository import GLib

mainloop = None


def greeting_signal_received(greeting):
    print(greeting)


def main():
    # python3-dbus 使用 GLib 的 MainLoop API
    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
    bus = dbus.SystemBus()
    """
    由接口 com.example.greeting 发出 GreetingSignal 的信号，通过回调传递到函数 greeting_signal_received，
    我们知道该信号包含一个字符串函数，因为这是规范的一部分，因此我们的回调函数适应了这一点。
    使用 dbus-send 发送信号和参数：
    dbus-send --system --type=signal / com.example.greeting.GreetingSignal string:"hello"
    """
    bus.add_signal_receiver(
        greeting_signal_received,
        dbus_interface="com.example.greeting",
        signal_name="GreetingSignal"
    )
    # 创建事件循环
    mainloop = GLib.MainLoop()
    # 阻塞线程循环监听 dbus 事件
    mainloop.run()


if __name__ == "__main__":
    main()
```

## 创建 dbus service

```python
#!/usr/bin/python3

import dbus
import dbus.mainloop.glib
from gi.repository import GLib

mainloop = None


def greeting_signal_received(greeting):
    print(greeting)


def main():
    # python3-dbus 使用 GLib 的 MainLoop API
    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
    bus = dbus.SystemBus()
    """
    由接口 com.example.greeting 发出 GreetingSignal 的信号，通过回调传递到函数 greeting_signal_received，
    我们知道该信号包含一个字符串函数，因为这是规范的一部分，因此我们的回调函数适应了这一点。
    使用 dbus-send 发送信号和参数：
    dbus-send --system --type=signal / com.example.greeting.GreetingSignal string:"hello"
    """
    bus.add_signal_receiver(
        greeting_signal_received,
        dbus_interface="com.example.greeting",
        signal_name="GreetingSignal"
    )
    # 创建事件循环
    mainloop = GLib.MainLoop()
    # 阻塞线程循环监听 dbus 事件
    mainloop.run()


if __name__ == "__main__":
    main()
```

## 向注册到 dbus 的守护进程发送信号

```python
#!/usr/bin/python3
import dbus
import dbus.service
import dbus.mainloop.glib
from gi.repository import GLib
import time

mainloop = None


class Counter(dbus.service.Object):
    def __init__(self, bus):
        self.path = '/com/example/counter'
        self.c = 0
        dbus.service.Object.__init__(self, bus, self.path)

    @dbus.service.signal('com.example.Counter')
    def counterSignal(self, counter):
        """
        dbus.service.signal 注解将 python 函数与 dbus signal 绑定，程序所有对该函数的调用都会被转换为 dbus signal 并发送出去。
        """
        pass

    def emitCounterSignal(self):
        self.counterSignal(self.c)

    def increment(self):
        self.c = self.c + 1
        print(self.c)


dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
bus = dbus.SystemBus()
counter = Counter(bus)
while True:
    counter.increment()
    counter.emitCounterSignal()
    time.sleep(1)
```

