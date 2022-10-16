# [MBR 主引导记录](https://zh.wikipedia.org/zh-cn/%E4%B8%BB%E5%BC%95%E5%AF%BC%E8%AE%B0%E5%BD%95)

> **主引导记录**（Master Boot Record，缩写：MBR），又叫做**主引导扇区**，是[计算机](https://zh.wikipedia.org/wiki/计算机)开机后访问[硬盘](https://zh.wikipedia.org/wiki/硬盘)时所必须要读取的首个[扇区](https://zh.wikipedia.org/wiki/磁盘扇区)，它在硬盘上的三维地址为（柱面，磁头，扇区）＝（0，0，1）。在深入讨论主引导扇区内部结构的时候，有时也将其开头的446字节内容特指为“主引导记录”（MBR），其后是4个16字节的“磁盘分区表”（DPT），以及2字节的结束标志（55AA）。因此，在使用“主引导记录”（MBR）这个术语的时候，需要根据具体情况判断其到底是指整个主引导扇区，还是主引导扇区的前446字节。

# Hello World

MBR 是我们可以掌控的第一个程序，在这里我们通过它在屏幕上打印一个“Hello World”：

mbr.asm：

```assembly
; MBR 主引导记录
; MBR 只能使用 16 位的寄存器，这是 BIOS 的规范所要求的，因此，程序中使用的寄存器大多数是 16 位的
; ah、al等以“*h”、“*l”为名的寄存器是 8 位的寄存器，以寄存器 ax、ah、al 为例，ah 是 ax 的高 8 位，al 是 ax 的低 8 位，bh、bl 等寄存器以此类推
; vstart 是 mbr 程序的入口地址
section MBR vstart=0x7C00
    jmp start
    ; 在物理机中运行 MBR 时，BIOS 可能会使用 BPB 数据覆盖 MBR 头部的一些内存，为了避免由此造成的指令和数据错误，需要将指令和数据后移一些字节
    times 32 db 0x00

start:
    mov sp, $$

    ; 初始化寄存器
    mov ax, 0
    ; ds、es、fs、gs 这类段寄存器不能通过立即数初始化，需要通过别的寄存器进行中转
    mov ss, ax
    mov ds, ax
    mov es, ax
    mov fs, ax
    ; 将显存的地址设置给 es 段寄存器
    mov ax, 0xB800
    mov es, ax

    ; 清理屏幕
    ; 设置目标地址，段寄存器是 ES
    mov di, 0
    ; 使用 cx 作为循环计数器
    mov cx, VIDEO_TEXT_PAGE_SIZE
    while01:
        mov byte [es: di], 0
        add di, 1
        ; 每次执行 loop，cx 寄存器就会减 1，这里用于循环，当 cx 为 0 时，循环结束
        loop while01

    ; 将 ASCII 字符发送到显存
    ; 设置源地址，和目标地址
    mov si, MESSAGE
    mov di, 0
    ; 设置文字属性，0 表示无背景色，7 表示前景色为白色
    mov ah, 0x07
    mov cx, STRLEN
    while02:
        mov al, [si]
        mov [es: di], ax
        add si, 1
        add di, 2
        loop while02

    jmp $

VIDEO_TEXT_PAGE_SIZE equ 80 * 25 * 2
MESSAGE db "Hello World"
STRLEN equ $ - MESSAGE
; 对剩余空间进行填充，让整个程序的总计大小为 512 B
times 510-($-$$) db 0
db 0x55, 0xAA
```

制作一个只包行 MBR 的镜像文件：

```bash
$ dd if=/dev/zero of=os.img bs=1MB count=1
$ nasm mbr.asm -o mbr
$ dd if=mbr of=os.img bs=512 count=1 conv=notrunc
```

使用 qemu 启动镜像：

```bash
$ qemu-system-i386 -drive 'file=os.img,format=raw'
```

现在的 BIOS，大多数默认只支持 UEFI，禁用了 MBR。如果想使用 MBR，需要在 BIOS 的 Boot 设置中，启用 CSM 支持。
