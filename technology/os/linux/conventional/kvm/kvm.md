# Introduction

>  [KVM](https://www.linux-kvm.org/page/Main_Page) (for Kernel-based Virtual Machine) is a full virtualization solution for Linux on x86 hardware containing virtualization extensions (Intel VT or AMD-V).
>
> KVM is open source software. The kernel component of KVM is included in mainline Linux, as of 2.6.20. The userspace component of KVM is included in mainline QEMU, as of 1.3.

# Install QEMU/KVM (take ArchLinux as an example)

Archlinux qemu wiki: [https://wiki.archlinux.org/title/QEMU](https://wiki.archlinux.org/title/QEMU)

Check if the CPU has virtualization extensions turned on.

```bash
$ LC_ALL=C lscpu | grep Virtualization

```

If it is an x86 cpu, the output is like this:

```text
Virtualization:                  VT-x
```

If it is an AMD64 CPU, the output is as follows:

```text
Virtualization:                  AMD-V
```

qemu-full and qemu-base packages, choose on to install. The difference is: qemu-full has GUI, qemu-base has no GUI. qemu-base is for servers, it starts the VNC service for virtual machines.

Take qemu-full as an exmaple:

```bash
$ sudo pacman -S qemu-full
```

# Create a virtual machine

First you need to create an image file:

```bash
$ qemu-img create -f raw demo.img 50G
```

`-f raw` specifies the format of the image file. There are two file formats: `raw` and `qcow2`. "raw" has the best performance, but does not support snapshots, and "qcow2" has less performance, but supports snapshots. 

Assuming that the input file of the guest system has been prepared: `demo.iso`, you can start the virtual machine:

```bash
$ qemu-system-x86_64 -m 2G -enable-kvm -cdrom ./demo.iso -drive 'file=demo.img,format=raw,index=0,media=disk,if=virtio'
```

# Qemu device configuration

The device configuration of qemu is usually divided into two parts: frontend and backend. Frontend refers to the driver in the Guest OS, or the device emulated by qemu. The backend refers to how qemu processes data from the Guest OS in the Host OS.

For example, to connect the virtual machine to the host bridge:

```bash
$ qemu-system-x86_64 -netdev "bridge,br=$BRIDGE,id=kvm0" -device 'virtio-net,netdev=kvm0' ...
```

`-netdev` is to create a network backend, `-device` is to create a frontend, and the frontend specifies the backend through `netdev`.

# Network

By default, qemu creates a separate internal network for the virtual machine through software simulation. The advantage of this method is that the virtual machine can connect to the network without configuration. The disadvantage is that the virtual machine can connect to the host, but the host cannot. Connect the virtual machine. If you want the host to be able to connect to the virtual machine without affecting the virtual machine's connection to the Internet, you need to pass the bridge and NAT forwarding of the host operating system to achieve this.

A completed host NAT network configuration is as follows:

```bash
#!/bin/bash

set -o errexit

cd "$(dirname $0)"

BRIDGE="virbr0"
FIREWALL_ZONE="libvirt"
NETWORK_SEGMENT="192.168.122"
MASK=24

# Prepare resources for virtual machines.
# Enable ip forwarding
[[ $(sysctl -n net.ipv4.ip_forward) != 1 ]] && sysctl -w net.ipv4.ip_forward=1

# If the bridge does not exist, create the bridge.
if ! ip link show $BRIDGE >>/dev/null 2>&1; then
    brctl addbr $BRIDGE
    ip addr add "$NETWORK_SEGMENT.1/$MASK" dev $BRIDGE
    ip link set dev $BRIDGE up
    brctl stp $BRIDGE on
fi

# Enable NAT forwarding
if [[ ! $(sudo firewall-cmd --get-zones) =~ $FIREWALL_ZONE ]]; then
    firewall-cmd --permanent --new-zone=$FIREWALL_ZONE >>/dev/null
    firewall-cmd --permanent --zone=$FIREWALL_ZONE --change-interface=$BRIDGE >>/dev/null
    firewall-cmd --permanent --zone=$FIREWALL_ZONE --set-target=ACCEPT >>/dev/null
    firewall-cmd --permanent --zone=$FIREWALL_ZONE --set-description="Network configuration for qemu/kvm virtual machines"

    [[ $(firewall-cmd --query-forward) == "no" ]] && firewall-cmd --permanent --add-forward >>/dev/null
    [[ $(firewall-cmd --query-masquerade) == "no" ]] && firewall-cmd --permanent --add-masquerade >>/dev/null

    local rule="rule family=ipv4 source address=$NETWORK_SEGMENT.0/$MASK masquerade"
    if [[ $(firewall-cmd --zone=$FIREWALL_ZONE --query-rich-rule="$rule") == "no" ]]; then
        firewall-cmd --permanent --zone=$FIREWALL_ZONE --add-rich-rule="$rule" >>/dev/null
    fi

    firewall-cmd --reload
fi

# qmeu limits available bridges via the /etc/qemu/bridge.conf file. Permission needs to be added to this file.
if [[ ! $(</etc/qemu/bridge.conf) =~ "allow $BRIDGE" ]]; then
    echo "allow $BRIDGE" >>/etc/qemu/bridge.conf
fi
```

Start the virtual machine and connect the virtual NIC to the bridge:

```bash
$ qemu-system-x86_64 \
    -netdev "bridge,br=$BRIDGE,id=kvm0" -device 'virtio-net,netdev=kvm0' \
    -drive 'file=demo.img,format=raw,index=0,media=disk,if=virtio'
```

You only need to configure a static IP in the virtual machine to access the network.

# Audio

qemu has the following built-in audio processing methods:

| name      | describe                                                     |
| --------- | ------------------------------------------------------------ |
| none      | Creates a dummy backend that discards all outputs. This backend has no backend specific properties. |
| alsa      | Creates backend using the ALSA. This backend is only available on Linux. |
| coreaudio | Creates a backend using Apple's Core Audio. This backend is only available on Mac OS and only supports playback. |
| dsound    | Creates a backend using Microsoft's DirectSound. This backend is only available on Windows and only supports playback. |
| oss       | Creates a backend using OSS. This backend is available on most Unix-like systems. |
| pa        | Creates a backend using PulseAudio. This backend is available on most systems. |
| sdl       | Creates a backend using SDL. This backend is available on most systems, but you should use your platform's native backend if possible. |
| spice     | Creates  a backend that sends audio through SPICE. This backend requires -spice and automatically selected in that case, so usually you can ignore this option. This backend has no backend specific properties. |
| wav       | Creates a backend that writes audio to a WAV file.           |

Let qemu directly use `alsa` api to process audio input and output, the effect is very poor, the audio delay is very serious, unstable, and there is often no sound. The effect of `sdl` is relatively good, and it is barely usable, but the coordination with the alsa of the host is not perfect, and the sound will change somewhat. `spice` is one of qemu's server modes, for audio, qemu will not process the audio, but send it directly to the client.

The performance of `pa` is very good. Here we mainly explain the configuration of `pa`.

First, `pulseaudio` and `pulseaudio-alsa` need to be installed:

```bash
$ sudo pacman pulseaudio pulseaudio-alsa
```

Run pulseaudio:

```bash
$ systemctl --user start pulseaudio
```

Some distributions will automatically start "pulseaudio" on boot, which does not require the step.

Then you need to configure `audiodev` on the back end of qemu, `ich9-intel-hda` and `hda-micro` on the front end:

```bash
# Do not run as "root" user
$ qemu-system-x86_64 -audiodev 'pa,id=sound0' -device 'ich9-intel-hda' -device 'hda-micro,audiodev=sound0' ...
```

Use `qemu-system-x86_64 -device help | grep hda` to see other front-end devices supported by qemu.

# Video

First, get the bus and address where the camera is located:

```bash
$ lsusb | grep WebCam
Bus 001 Device 003: ID 0bda:58d2 Realtek Semiconductor Corp. USB2.0 HD UVC WebCam
```

<font style="background-color: yellow">The address of the camera is not fixed, is may be "003" or "004"</font>

After that, start qemu:

```bash
$ qemu-system-x86_64 -device 'usb-ehci' -device 'usb-host,hostbus=001,hostaddr=003' ...
```

You may get an error message like this:

```text
qemu-system-x86_64: -device usb-host,hostbus=001,hostaddr=003: failed to open host usb device 1:3
```

This is because the currently logged in user does not have writable permissions on "/dev/bus/001/003". The solution is to add the current user to the "root" user group:

```bash
$ sudo usermod -aG root $USER
# Or log out the user and log back in.
$ reboot
```



