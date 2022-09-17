# GTK4

## Hello World

创建main.c文件：

```c
#include <gtk/gtk.h>

static void activate(GtkApplication *app, gpointer user_data) {
    GtkWidget *window;

    // 获得窗口对象
    window = gtk_application_window_new(app);
    // 设置窗口标题
    gtk_window_set_title(GTK_WINDOW (window), "Window");
    // 设置窗口大小
    gtk_window_set_default_size(GTK_WINDOW (window), 200, 200);
    // 显示窗口
    gtk_widget_show(window);
}

int main(int argc, char **argv) {
    GtkApplication *app;
    int status;

    app = gtk_application_new("org.gtk.example", G_APPLICATION_FLAGS_NONE);
    // 关联程序启动事件
    g_signal_connect (app, "activate", G_CALLBACK(activate), NULL);
    // 运行窗口
    status = g_application_run(G_APPLICATION (app), argc, argv);
    // 回收内存
    g_object_unref(app);

    return status;
}
```

<font color="red">activate是启动信号</font>

## 启动信号

-   `startup`: 首次启动时设置应用程序
-   `shutdown`: 执行关机任务
-   `activate`：显示应用程序的默认第一个窗口（如新文档）。这对应于桌面环境正在启动的应用程序。
-   `open`：打开文件并在新窗口中显示它们。这对应于有人试图从文件浏览器或类似的地方使用应用程序打开一个（或多个）文档。