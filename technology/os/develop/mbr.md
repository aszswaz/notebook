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
    mov ax, cs
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov fs, ax
    mov sp, 0x7C00

    ; 上卷屏幕，达到清屏的效果
    ; 设置 BIOS 子功能号
    mov ax, 0x600
    ; 设置上卷行的属性
    mov bx, 0x700
    ; 设置文本的长方形显示区域，VGA 文本模式中，一行只能容纳 80 个字符，共 25 行
    ; 设置左上角坐标（0, 0）
    mov cx, 0x0000
    ; 设置右下角坐标（24, 27）
    mov dx, 0x184F
    ; BIOS 中断调用
    int 0x10

    ; 获取光标位置
    ; 设置 BIOS 子功能号
    mov ah, 3
    ; bh 寄存器存储的是待获取光标的页号
    mov bh, 0
    int 0x10

    ; 打印字符串
    mov ax, MESSAGE
    ; es: bp 为字符串串首地址
    mov bp, ax
    mov cx, STRLEN
    ; 子功能号 13 表示显示字符串，01 表示光标跟随移动
    mov ax, 0x1301
    ; 设置要显示的页号和字符属性，bh 为页号，bl 为字符颜色，bl 的取值范围是 0～255
    mov bx, 2
    int 0x10

    ; 程序进入死循环
    jmp $

MESSAGE db "Hello World!"
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

