# 简介

汇编语言笔记。<font color="red">在本文中，如果没有特殊说明，代码的都是基于x86指令集编写的</font>

# x86和AMD64的寄存器

| 32位 | 64位 | 描述                                         |
| ---- | ---- | -------------------------------------------- |
| eax  | rax  | 通用寄存器                                   |
| ebx  | rbx  | 通用寄存器                                   |
| ecx  | rcx  | 通用寄存器                                   |
| edx  | rdx  | 通用寄存器                                   |
| esi  | rsi  | 注册源索引（数据副本的源）                   |
| edi  | rdi  | 注册目标索引（数据副本的目标）               |
| ebp  | rbp  | 寄存器基指针（堆栈开始）                     |
| esp  | rsp  | 寄存器堆栈指针（堆栈中的当前位置，向下增长） |
| r8d  | r8   | 通用寄存器                                   |
| r10d | r9   | 通用寄存器                                   |
| r11d | r10  | 通用寄存器                                   |
| r12d | r12  | 通用寄存器                                   |
| r13d | r13  | 通用寄存器                                   |
| r14d | r14  | 通用寄存器                                   |
| r15d | r15  | 通用寄存器                                   |

# Hello World

用汇编实现“Hello World”打印。

汇编器：[NASM](https://www.nasm.us/)

操作系统：Linux

CPU 架构：x86_64（64位）

本程序架构：x86（32位）

hello-world.asm:

```assembly
; 定义数据段，这是一个伪操作，用于告诉汇编器定义一块内存空间
section .data

; 定义数据段中的变量，这也是一个伪操作，所有对该变量的引用，都会被汇编器编译为内存地址
; DB 是伪指令，用于告诉汇编器，当前伪操作的每个操作数占用一个字节
; 0AH 用于写入一个换行符
STR_HELLO: DB "Hello World!", 0AH

; 计算字符串的长度
; equ 伪指令，表示操作数是一个表达式
; $ 应该是当前变量的地址
; 由于数据段的内存是连续的，当前变量地址 - 上一个变量地址 = 上一个变量的长度
STRLEN: equ $ - STR_HELLO

; 定义代码段，用于保存下面所有的汇编指令
section .text

; 定义程序入口，必须是“_start”
global _start
_start:
    ; 将变量 STRLEN 和 STR_HELLO 的地址分别放入寄存器 edx 和 ecx
    mov edx, STRLEN
    mov ecx, STR_HELLO

    ; 设置即将调用的 Linux 系统子功能号，4 表示 sys_write
    mov eax, 4
    ; 调用 Linux 的中断程序，开始执行指定的 Linux 子功能，当前进程暂停执行，由用户态转为内核态
    int 0x80

    ; 设置 Linux 系统子功能，1 表示 sys_exit
    mov eax, 1
    ; 设置进程的退出码
    mov ebx, 0
    ; 调用 Linux 的中断程序
    int 0x80

```

编译，以及生成可执行程序：

编译32位的程序：

```bash
# 使用 nasm 汇编器编译汇编
$ nasm -f elf hello-world.asm -o hello-world.o
# 使用链接器生成可执行程序
$ ld -m elf_i386 hello-world.o -o hello-world
```

编译64位的程序：

```bash
$ nasm -f elf64 hello-world.asm -o hello-world.o
$ ld hello-world.o -o hello-world
```

nasm 还支持第二种方式打印 hello world：

hello-world02.asm:

```assembly
global _start

section .data
message: db "Hello World", 10

section .text
_start:
    ; syscall for write
    mov rax, 1
    ; file handle 1 is stdout
    mov rdi, 1
    ; address of string to output
    mov rsi, message
    ; number of bytes
    mov rdx, 13
    ; invoke operating system to do the write
    syscall

    ; system call for exit
    mov rax, 60
    ; exit code 0
    mov rdi, 0
    ; invoke operating system to exit
    syscall
```

`syscall`只能作用于64位程序，暂时不知道原因，只能以64位模式编译程序：

```bash
$ nasm -f elf64 hello-world02.asm -o hello-world02.o
$ ld hello-world02.o -o hello-world02
```

# 外部函数调用

main.asm:

```assembly
section .bss
resb 64

; 自定义数据段，未使用“传统”的数据段 .data
section maindata
; 在数据段中存放一个字符串，OA 是一个换行符
strHello: db "Hello World!", 0AH
STRLEN equ $ - strHello

; 自定义代码段，未使用“传统”的代码段 .txt
section maintext
; 声明此函数在别的文件中
extern print

; 声明程序入口，只能是 _start
global _start

_start:
    ; 传入参数，字符串的长度
    push STRLEN
    ; 传入参数，待打印的字符串
    push strHello
    ; 调用外部函数
    call print
    ; 函数调用完毕，继续执行
    ; 设置程序返回值（exit code）
    mov ebx, 0
    ; 设置系统子功能调用号，1: sys_exit
    mov eax, 1
    ; 触发中断，执行系统调用
    int 0x80
```

print.asm:

```assembly
section .text
mov eax, 0x10
jmp $

; 自定义数据段
section printdata
num DB 3

; 自定义代码段
section printtext

; 导出 print，供其他模块使用
global print

print:
    ; 字符串长度
    mov edx,[esp+8]
    ; 设置要输出的字符串
    mov ecx,[esp+4]

    mov ebx, 1
    ; 设置系统子功能号，4:sys_write
    mov eax, 4
    ; 开始系统调用
    int 0x80
    ret
```

编译汇编，并生成可执行程序：

```bash
$ nasm -f elf64 main.asm -o main.o && nasm -f elf print.asm -o print.o
$ ld main.o print.o -o main
```

# 内存的读写

```assembly
; 未初始化的内存必须放在节 .bss 当中
section .bss
; 定义一块未初始化的内存
CACHE resb 10

section .text

; 打印内存中的内容
print:
    mov edx, [esp + 8]
    mov ecx, [esp + 4]
    mov eax, 4
    int 0x80
    ret

global _start
_start:
    ; 向指定的内存地址写入一些数据，[...] 表示操作数是一个内存地址
    ; byte 表示写入内存的数据大小是一个字节
    mov byte [CACHE], 97
    mov byte [CACHE + 1], 'a'
    mov byte [CACHE + 2], 10
    push 10
    push CACHE
    call print

    ; 通过减法，将一个字母转为大写字母
    mov eax, [CACHE]
    sub eax, 32
    mov [CACHE], eax
    push 10
    push CACHE
    call print

    ; 退出程序
    mov eax, 1
    mov ebx, 0
    int 0x80
```

