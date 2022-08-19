# Introduction

In qemu/kvm, create a windows virtual machine.

# Preparation

[Install qemu/kvm first](kvm.md). Next we need to prepare a few files:

1. [virtio-win.iso](https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md), a paravirtualized driver developed by Red Hat, which can effectively improve the execution efficiency of virtual hardware.
2. [windows-10.iso](https://www.microsoft.com/zh-cn/software-download/windows10ISO), windows 10 installer.
3. [CMWTAT_Digital_Release_2_5_0_0.exe](https://github.com/aszswaz/CMWTAT_Digital_Edition), windows 10 activation program
4. [winfsp.msi][https://winfsp.dev/rel/], windows file system proxy service for file sharing between virtual machines and hosts.

In linux, there is a tool called `mkisofs`, which can package some ordinary files as iso image files, we use it to package `CMWTAT_Digital_Edition.exe` and `winfsp.msi` into `win10-tools.iso`:

```bash
$ sudo pacman -S cdrtools
$ mkisofs -o win10-tools.iso CMWTAT_Digital_Release_2_5_0_0.exe winfsp-1.11.22176.msi
```

# Install operating system

Now, we have three files: virtio-win.iso, windows-10.iso, win10-tools.iso. We can start making windows virtual machines.

```bash
# Create a disk file
$ qemu-img create win10.qcow2 100G
$ qemu-system-x86_64 \
    -m 4G \
    -object "memory-backend-memfd,id=mem,size=4G,share=on" \
    -numa 'node,memdev=mem' \
    -cpu 'host,hv_relaxed,hv_spinlocks=0x1fff,hv_vapic,hv_time' \
    -smp "cpus=2,sockets=1,cores=1,threads=2,maxcpus=2" \
    -enable-kvm \
    -boot 'menu=on' \
    -rtc 'base=localtime' \
    -nic 'user,model=virtio-net-pci' \
    -vga virtio \
    -device intel-hda -device hda-duplex \
    -usb -device usb-tablet \
    -drive 'file=win10.qcow2,format=qcow2,index=0,media=disk,if=virtio' \
    -drive 'file=windows-10.iso,index=2,media=cdrom' \
    -drive 'file=virtio-win.iso,index=3,media=cdrom' \
    -drive 'file=win10-tools.iso,index=4,media=cdrom'
```

Windows 10 does not come with a virtio driver, the installer will prompt that no disk device was found, click "Search for available disk drivers", and select the corresponding version of the virtio disk driver to install.

After installing the OS, don't forget to install other device drivers for virtio and winfsp, and activate the OS.

To use shared folders, you also need to install the `virtiofs` service in the virtual machine:

```bash
$ sc create VirtioFsSvc binpath="C:\Program Files\Virtio-Win\VioFS\virtiofs.exe" start=auto depend="WinFsp.Launcher/VirtioFsDrv" DisplayName="Virtio FS Service"
$ sc start VirtioFsSvc
```

<font color="orange">VirtioFsSvc often fails to start automatically at boot, so it is recommended to prepare a bat script on the desktop:</font>

```basic
sc start VirtioFsSvc
pause
```

# Start script

The startup configuration of qemu cannot be saved, we can use a script instead:

```shell
#!/bin/zsh

cd "$(dirname $0)"

# Number of CPUs
cpu=$(cat /proc/cpuinfo | grep 'physical id' | sort | uniq | wc -l)
# Number of CPU cores
cpu_cores=$(cat /proc/cpuinfo | grep "cores" | uniq | awk '{print $4}')
# Number of CPU logical cores
cpu_logic_cores=$(cat /proc/cpuinfo | grep "processor" | wc -l)
# The number of single-core CPU threads, Intel Hyper-Threading Technology is turned on, the value is 2, otherwise it is 1
threads=$(( $cpu_logic_cores / $cpu / $cpu_cores ))

cpu_cores=$(( $cpu_cores / 2 ))
cpu_logic_cores=$(( $cpu_logic_cores / 2 ))
memory_size="4G"

# Start virtiofsd, folder sharing for host and virtual machines.
echo "start virtiofsd"
virtio_fs_sock="/var/run/qemu-virtio-fs.sock"
sudo /usr/lib/qemu/virtiofsd --socket-path="$virtio_fs_sock" -o "source=/dev/shm" -o "cache=always" &
sudo chgrp kvm "$virtio_fs_sock" && sudo chmod g+rwx "$virtio_fs_sock"

echo "start qemu"
qemu-system-x86_64 \
    -m $memory_size \
    -object "memory-backend-memfd,id=mem,size=$memory_size,share=on" \
    -numa 'node,memdev=mem' \
    -cpu 'host,hv_relaxed,hv_spinlocks=0x1fff,hv_vapic,hv_time' \
    -smp "cpus=$cpu_logic_cores,sockets=$cpu,cores=$cpu_cores,threads=$threads,maxcpus=$cpu_logic_cores" \
    -enable-kvm \
    -boot 'menu=on' \
    -rtc 'base=localtime' \
    -nic 'user,model=virtio-net-pci' \
    -vga virtio \
    -device intel-hda -device hda-duplex \
    -usb -device usb-tablet \
    -chardev "socket,id=char0,path=$virtio_fs_sock" \
    -device "vhost-user-fs-pci,chardev=char0,tag=shared" \
    -drive 'file=win10.qcow2,format=qcow2,index=0,media=disk,if=virtio'
```

# Warn

Windows directly uses the hardware clock as the local time, while Linux uses the hardware clock as the UTC time, and the local time is the hardware clock plus the time zone offset. By default, qemu directly uses the hardware clock of the host as the hardware clock of the virtual machine, which will cause the local time of the windows virtual machine to be wrong. To avoid this error, add `-rtc base=localtime` to the startup parameters of qemu-system-x86_64.