# Cmake

## 引入整个文件夹

```cmake
include_directories(/thirdparty/comm/include)
```

## 编译动态链接库

```cmake
# 设置so文件输出文件夹
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/cmake-build-debug/so)
# 添加编译文件
# zhong_jni_JniDemo 是文件名称,最终生成的文件名称是 libzhong_jni_JniDemo.so
# SHARED 库被动态链接并在运行时加载
add_library(zhong_jni_JniDemo SHARED zhong_jni_JniDemo.h zhong_jni_JniDemo.c)
```

| 库类型 | 作用                                                         |
| ------ | ------------------------------------------------------------ |
| STATIC | 库是目标文件的存档，供链接其他目标时使用。                   |
| SHARED | 库被动态链接并在运行时加载。                                 |
| MODULE | 库是未链接到其他目标的插件，但可以使用类似dlopen的功能在运行时动态加载。 |

## 文件编码

```cmake
# 开启UNICODE支持，可以在代码中给字符串添加L，表示使用UNICODE编码
add_definitions(-DUNICODE -D_UNICODE)
```

## 打印信息

```cmake
MESSAGE(STATUS "JDK: $ENV{JAVA_HOME}")
```

<span style='color: red'>注意MASSAGE和STATUS一定要大写</span>，STATUS表示这是一条普通的信息，另外还有ERROR表示错误信息，<span style="color: green">$ENV{}：这个表示引用环境变量，本例子使用了JAVA_HOME变量</span>

## 添加模块

以ALSA为例

查找模块

```bash
$ cmake --help-module-list | grep 'ALSA'
FindALSA
$ cmake --help-module FindALSA
FindALSA
--------

Find Advanced Linux Sound Architecture (ALSA)

Find the alsa libraries (``asound``)

IMPORTED Targets
^^^^^^^^^^^^^^^^

This module defines ``IMPORTED`` target ``ALSA::ALSA``, if
ALSA has been found.

Result Variables
^^^^^^^^^^^^^^^^

This module defines the following variables:

``ALSA_FOUND``
  True if ALSA_INCLUDE_DIR & ALSA_LIBRARY are found

``ALSA_LIBRARIES``
  List of libraries when using ALSA.

``ALSA_INCLUDE_DIRS``
  Where to find the ALSA headers.

Cache variables
^^^^^^^^^^^^^^^

The following cache variables may also be set:

``ALSA_INCLUDE_DIR``
  the ALSA include directory

``ALSA_LIBRARY``
  the absolute path of the asound library
```

在CMakeLists.txt文件中，添加模块


```cmake
cmake_minimum_required(VERSION 3.19)
project(demo C)

set(CMAKE_C_STANDARD 99)

add_executable(${PROJECT_NAME} main.c)

# 请求寻找ALSA库
find_package(ALSA REQUIRED)
# 寻找成功 ALSA_FOUND 为 true 否则为 false
if(ALSA_FOUND)
	# 寻找成功，连接ALSA的库文件夹
    include_directories(${ALSA_INCLUDE_DIRS})
    # 连接文件
    target_link_libraries(${PROJECT_NAME} ${ALSA_LIBRARIES})
endif(ALSA_FOUND)
```

也可以通过PkgConfig引入，以GTK4为例：

```cmake
set(APP_NAME demo)

if (${CMAKE_SYSTEM_NAME} MATCHES "Linux")
    # 请求调用pkgconfig
    find_package(PkgConfig REQUIRED)
    # 使用pkgconfig搜索gtk4依赖
    pkg_check_modules(GTK REQUIRED gtk4)
    # 引入头文件
    include_directories(${GTK_INCLUDE_DIRS})
    # 链接依赖
    target_link_libraries(${APP_NAME} ${GTK_LIBRARIES})
endif (${CMAKE_SYSTEM_NAME} MATCHES "Linux")
```

## 设置代码中的字符串所使用的编码

在windows中，如果源代码文件是UTF-8编码的，使用 printf 等函数输出中文，会出现乱码，需要配置cmake把源码中的中文转换为GBK。

```cmake
# C++ 项目
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -fexec-charset=GBK")
# C 项目
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -fexec-charset=GBK")
```

## cmake 编译项目

```bash
# 先生成 Make 文件
$ mkdir builder && cd builder && cmake ../
# 构建项目
$ make
```

## 传递宏参数

```cmake
cmake_minimum_required(VERSION 3.21)
project(cdemo)

set(CMAKE_CXX_STANDARD 14)

add_executable(${PROJECT_NAME} main.cpp)

# 编译时没有声明编译环境，给定默认值
if (NOT DEFINED PROFILE)
	set(PROFILE dev)
endif()
message(STATUS profile: ${PROFILE})
add_definitions(-DPROFILE=${PROFILE})
```

main.cpp

```c++
#include <iostream>

#define dev 0
#define pro 1

int main() {
    // 宏命令不能比较字符串，只能通过宏命令和宏命令的比较来代替字符串的比较
#if PROFILE == dev
    std::cout << "profile == dev" << std::endl;
#elif PROFILE == pro
    std::cout << "profile == pro" << std::endl;
#endif
    return 0;
}
```

编译并运行：

```bash
$ mkdir builder && cd builder
# 等效于 g++ -DPROFILE=pro main.cpp -o main
$ cmake ../ -DPROFILE=pro
$ make
$ ./cdemo
profile == pro
```

