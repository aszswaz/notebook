# PTY

## 简介

PTY 是伪终端的意思，是一对提供双向数据交换的虚拟字符设备。

## 通过 PTY 执行子程序

父进程代码，main.c:

```c
#include <pty.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
    pid_t child_pid, current_pid;
    char name[BUFSIZ], buffer[BUFSIZ];
    int master;

    current_pid = getpid();
    fprintf(stdout, "pid: %u\n", current_pid);

    // 创建一个 pty 设备，并且以该 pty 作为子进程的 tty，子进程所有输出到 stdout、stderr、stdin 都会连接到该 pty 设备
    child_pid = forkpty(&master, &name[0], NULL, NULL);
    if (child_pid == -1) {
        perror("forkpty faild.");
        return EXIT_FAILURE;
    } else if (child_pid == 0) {
        // 通过 fork 出来的子进程，执行外部指令
        execl("./child", "./child");
    } else {
        // 读取子进程的输出
        read(master, &buffer[0], BUFSIZ);
        fprintf(stdout, "%u: child message:\n%s", current_pid, buffer);
    }

    return EXIT_FAILURE;
}

```

子进程代码，child.c：

```c
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

int main() {
    fprintf(stdout, "%s\n", isatty(fileno(stdout)) ? "true": "false");
    return EXIT_SUCCESS;
}
```

