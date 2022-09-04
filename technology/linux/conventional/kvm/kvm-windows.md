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
#!/bin/sudo sh

set -o errexit
set -o nounset

cd "$(dirname $0)"

# qemu 启动脚本

BRIDGE="virbr0"
MEMORY_SIZE="4G"
SHARED_DIR="/run/media/aszswaz/kvm-win10"

# Prepare resources for virtual machines.
prepare() {
    # Enable ip forwarding
    [[ $(sysctl -n net.ipv4.ip_forward) != 1 ]] && sysctl -w net.ipv4.ip_forward=1

    # If the bridge does not exist, create the bridge.
    if ! ip link show $BRIDGE >>/dev/null 2>&1; then
        brctl addbr $BRIDGE
        ip addr add '192.168.122.1/24' dev $BRIDGE
        ip link set dev $BRIDGE up
        brctl stp $BRIDGE on
    fi

    # Enable NAT forwarding
    if [[ ! $(firewall-cmd --get-zones) =~ $BRIDGE ]]; then
        firewall-cmd --permanent --new-zone=$BRIDGE >>/dev/null
        firewall-cmd --permanent --zone=$BRIDGE --change-interface=$BRIDGE >>/dev/null
        firewall-cmd --permanent --zone=$BRIDGE --set-target=ACCEPT >>/dev/null
        firewall-cmd --permanent --zone=$BRIDGE --set-description="Network configuration for qemu/kvm virtual machines"

        [[ $(firewall-cmd --query-forward) == "no" ]] && firewall-cmd --permanent --add-forward >>/dev/null
        [[ $(firewall-cmd --query-masquerade) == "no" ]] && firewall-cmd --permanent --add-masquerade >>/dev/null

        local rule='firewall-cmd --query-masquerade'
        if [[ $(firewall-cmd --zone=$BRIDGE --query-rich-rule="$rule") == "no" ]]; then
            firewall-cmd --permanent --zone=$BRIDGE --add-rich-rule="$rule" >> /dev/null
        fi

        firewall-cmd --reload
    fi

    # qmeu limits available bridges via the /etc/qemu/bridge.conf file. Permission needs to be added to this file.
    if [[ ! $(</etc/qemu/bridge.conf) =~ "allow $BRIDGE" ]]; then
        echo "allow $BRIDGE" >>/etc/qemu/bridge.conf
    fi
}

smb_mount() {
    sleep 60
    # Use the id command to get the uid and gid of  the currently logged in user
    mount -t cifs -o "username=Administrator,password=z199809051593,gid=1000,uid=1000" -l '//192.168.122.2/Downloads' --mkdir "$SHARED_DIR"
    echo "successfully mounted samba to $SHARED_DIR"
}

smb_umount() {
    umount "$SHARED_DIR"
    rm -rf "$SHARED_DIR"
}

main() {
    # CPU 数量
    local cpu=$(cat /proc/cpuinfo | grep 'physical id' | sort | uniq | wc -l)
    # CPU 核心数
    local cpu_cores=$(cat /proc/cpuinfo | grep "cores" | uniq | awk '{print $4}')
    # CPU 逻辑核心数
    local cpu_logic_cores=$(cat /proc/cpuinfo | grep "processor" | wc -l)
    # 单核 CPU 线程数，开启了 Intel 超线程技术，该值为 2，反之为 1
    local threads=$(($cpu_logic_cores / $cpu / $cpu_cores))

    local cpu_cores=$(($cpu_cores / 2))
    local cpu_logic_cores=$(($cpu_logic_cores / 2))

    echo "start qemu"
    smb_mount &
    qemu-system-x86_64 \
        -m $MEMORY_SIZE \
        -cpu host \
        -smp "cpus=$cpu_logic_cores,sockets=$cpu,cores=$cpu_cores,threads=$threads,maxcpus=$cpu_logic_cores" \
        -enable-kvm \
        -boot 'menu=on' \
        -rtc 'base=localtime' \
        -netdev "bridge,br=$BRIDGE,id=kvm0" -device 'virtio-net,netdev=kvm0' \
        -vga virtio \
        -device intel-hda -device hda-duplex \
        -usb -device usb-tablet \
        -drive 'file=win10.qcow2,format=qcow2,index=0,media=disk,if=virtio'

    unset cpu cpu_cores cpu_logic_cores threads
    smb_umount
}

prepare
main
```

# Warn

Windows directly uses the hardware clock as the local time, while Linux uses the hardware clock as the UTC time, and the local time is the hardware clock plus the time zone offset. By default, qemu directly uses the hardware clock of the host as the hardware clock of the virtual machine, which will cause the local time of the windows virtual machine to be wrong. To avoid this error, add `-rtc base=localtime` to the startup parameters of qemu-system-x86_64.