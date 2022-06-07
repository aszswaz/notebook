# [curses（ncurses）](https://zh.wikipedia.org/zh-cn/Ncurses)

## 简介

curses 是一个[程序库](https://zh.wikipedia.org/wiki/库_(计算机))，它提供了[API](https://zh.wikipedia.org/wiki/应用程序接口)，可以允许程序员编写独立于终端的[基于文本的用户界面](https://zh.wikipedia.org/w/index.php?title=基于文本的用户界面&action=edit&redlink=1)。它是一个[虚拟终端](https://zh.wikipedia.org/wiki/虚拟终端)中的“类[GUI](https://zh.wikipedia.org/wiki/图形用户界面)”[应用软件](https://zh.wikipedia.org/wiki/应用软件)工具箱。它还优化了屏幕刷新方法，以减少使用远程[shell](https://zh.wikipedia.org/wiki/Unix_shell)时遇到的[延迟](https://zh.wikipedia.org/wiki/延迟_(工程学))。

## 示例

### 在 TUI 显示“Hello World”

```c
#include <curses.h>
#include <stdlib.h>

int main() {
    // TUI 窗口句柄
    WINDOW *win = NULL;

    // 初始化窗口
    win = initscr();
    // 不把用户输入回显到屏幕
    noecho();

    // 添加文本
    addstr("Hello World\n");
    // 在指定位置添加文本
    mvaddstr(1, 0, "Hello World\n");
    // 在指定的窗口添加文本
    waddstr(win, "Hello World\n");
    // 指定窗口的指定位置添加文本
    mvwaddstr(win, 3, 0, "Hello World\n");

    // 更新窗口
    refresh();
    // 监听键盘输入
    getch();
    // 关闭窗口，回到原本的控制台状态
    endwin();

    return EXIT_SUCCESS;
}
```

编译：

```bash
$ gcc demo.c -o demo -lncurses
$ ./demo
```

