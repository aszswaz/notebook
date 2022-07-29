# Introduction

In qemu/kvm, create a windows virtual machine.

# Preparation

[Install qemu/kvm first](kvm.md). Next, we need to prepare [virtio-win.iso](https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md) and [windows-10.iso](https://www.microsoft.com/zh-cn/software-download/windows10ISO).

# Start

Now, we have three files: virtio-win.iso, windows-10.iso, winfsp.iso. We can start making windows virtual machines.

```bash
# Create a disk file
$ qemu-img create win10.qcow2 100G
# Start the virtual machine and install the windows operating system
$ alias qemu_start="qemu-system-x86_64 \
-m 4G \
-cpu host -smp 2 \
-enable-kvm \
-rtc base=localtime"
$ qemu_start -cdrom windows-10.iso win10.qcow2
# After the windows operating system is installed, install virtio-win and winfsp respecovely.
$ qemu_start -cdrom virtio-win.iso win10.qcow2
```

# Warn

Windows directly uses the hardware clock as the local time, while Linux uses the hardware clock as the UTC time, and the local time is the hardware clock plus the time zone offset. By default, qemu directly uses the hardware clock of the host as the hardware clock of the virtual machine, which will cause the local time of the windows virtual machine to be wrong. To avoid this error, add `-rtc base=localtime` to the startup parameters of qemu-system-x86_64.