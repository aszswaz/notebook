# GTK开发环境配置

## 使用gcc进行编译

```c
#include <gtk/gtk.h>
int main (int argc, char *argv[]) {
    gtk_init (&argc, &argv);
    GtkWidget *hello = gtk_message_dialog_new (NULL, GTK_DIALOG_MODAL, GTK_MESSAGE_INFO, GTK_BUTTONS_OK, "Hello world!");
    gtk_message_dialog_format_secondary_text (GTK_MESSAGE_DIALOG (hello), "我TM帅爆");
    gtk_dialog_run(GTK_DIALOG (hello));
    return 0;
}
```

编译：

```bash
$ gcc main.c -o demo `pkg-config --cflags --libs gtk+-3.0`
```

## 在cmake当中引入GTK

首先配置CMakeLists.txt文件：

```cmake
cmake_minimum_required(VERSION 3.17)
project(demo C)

set(CMAKE_C_STANDARD 99)

# 设置源码文件，和输出的二进制程序名称，这里定义为项目名称
add_executable(${PROJECT_NAME} main.c)

# 查找软件包pkgconfig
find_package(PkgConfig REQUIRED)
# 输出log
message("find gtk3.0")
# 使用pkgconfig查找GTK3的依赖，其中“XXX”表示定义获取的请求名称
pkg_check_modules(XXX REQUIRED gtk+-3.0)
# 引入gtk3.0所有相关的文件夹
message("GTK3_INCLUDE_DIRS: ${XXX_INCLUDE_DIRS}")
include_directories(${XXX_INCLUDE_DIRS})
# 引入其他依赖项的文件夹
message("GKT3_LIBRARIES: ${XXX_LIBRARIES}")
link_directories(${XXX_LIBRARY_DIRS})
# 引入so文件的依赖
message("GTK3_LINK_LIBRARIES: ${XXX_LINK_LIBRARIES}")
# 追加so文件依赖
list(APPEND FC_DEP_LIBS ${XXX_LIBRARIES})
# 链接所有查询到的GTK依赖
target_link_libraries(${PROJECT_NAME} ${FC_DEP_LIBS})
# 打印其他项
message("GTK3_CFLAGS_OTHER: ${XXX_CFLAGS_OTHER}")
```

编辑源代码main.c：

```c
#include <gtk/gtk.h>
int main (int argc, char *argv[]) {
    gtk_init (&argc, &argv);
    GtkWidget *hello = gtk_message_dialog_new (NULL, GTK_DIALOG_MODAL, GTK_MESSAGE_INFO, GTK_BUTTONS_OK, "Hello world!");
    gtk_message_dialog_format_secondary_text (GTK_MESSAGE_DIALOG (hello), "我TM帅爆");
    gtk_dialog_run(GTK_DIALOG (hello));
    return 0;
}
```

