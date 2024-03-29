# 简介

EFI 是 BIOS 的拓展，它和传统 BIOS 的区别如下：

1.传统的 BIOS 仅支持 MBR，EFI 则支持读取 FAT32 文件系统，以 EFI/BOOT/BOOTX64.EFI 文件作为 OS 引导程序。

2.MBR 最好是使用汇编编写，用 C 编写会比较麻烦，而 EFI 天生就支持用 C 编写引导程序。

# 安装 gnu-efi

```shell
$ sudo pacman -S gnu-efi
```

# Hello World

在 Linux 中，使用 gnu-efi 编写 Hello World 程序：

efi-boot.c:

```c
#include <efi.h>
#include <efilib.h>

EFI_STATUS EFIAPI efi_main (EFI_HANDLE ImageHandle, EFI_SYSTEM_TABLE *SystemTable){
  InitializeLib(ImageHandle, SystemTable);
  Print(L"Hello, world!\n");
  while(1) {}
  return EFI_SUCCESS;
}
```

编译：

```shell
$ name=efi-boot
$ gcc \
    -I/usr/include/efi \
    -fpic -ffreestanding -fno-stack-protector -fno-stack-check -fshort-wchar -mno-red-zone -maccumulate-outgoing-args \
    -c "$name.c" -o "$name.o"
$ ld \
    -shared -Bsymbolic \
    -L/usr/lib \
    -T/usr/lib/elf_x86_64_efi.lds \
    /usr/lib/crt0-efi-x86_64.o \
    -lgnuefi -lefi \
    "$name.o" -o "$name.so"
# 将动态库转换为 UEFI 的 PE 程序
# -j：要保留的部分
# --target efi-app-x86_64：生成 PE32+ 格式，架构代码为 0x8664
# --subsystem=10：这是最重要的。它将 PE 标头中的文件类型设置为 UEFI 可执行文件。
$ objcopy \
    -j .text -j .sdata -j .data -j .dynamic -j .dynsym  -j .rel -j .rela -j .rel.* -j .rela.* -j .reloc \
    --target efi-app-x86_64 \
    --subsystem=10 \
    "$name.so" \
    "$name.efi"

# 制作 UEFI 引导扇区
# 格式化 U 盘为 FAT32
$ sudo mkfs.vfat /dev/sdb1
# 挂载 U 盘
$ mkdir efi-boot
$ mount /dev/sdb1 efi-boot
# 复制 EFI 可执行程序
$ cp efi-boot.efi efi-boot/EFI/BOOT/BOOTX64.EFI
```

重启电脑，选择 U 盘启动即可。
