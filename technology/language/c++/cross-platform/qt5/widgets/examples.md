# Qt6 Widgets 示例程序

## 通用 CMakeLists

```cmake
# 指定cmake最低版本
cmake_minimum_required(VERSION 3.16.0)
# 设置项目的版本，告诉cmake像是使用c++编写的
project(qt_demo VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

add_executable(
        ${PROJECT_NAME}
        main.cpp
        AnalogClock.cpp
        AnalogClock.h
)

find_package(Qt6 COMPONENTS Widgets REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE Qt6::Widgets)
```

## 绘制时钟

main.cpp

```c++
#include <QtWidgets>
#include "AnalogClock.h"

int main(int argc, char *argv[]) {
    QApplication application(argc, argv);

    AnalogClock analogClock;
    analogClock.show();

    // exec 函数会开始监听窗口事件，直到程序窗口关闭
    return QApplication::exec();
}
```

AnalogClock.h

```c++
//
// Created by aszswaz on 2021/9/14.
//

#ifndef QT_DEMO_ANALOGCLOCK_H
#define QT_DEMO_ANALOGCLOCK_H

#include <QtWidgets>

class AnalogClock : public QWidget {
    Q_OBJECT

public:
    explicit AnalogClock(QWidget *parent = nullptr);

protected:
    void paintEvent(QPaintEvent *event) override;
};


#endif //QT_DEMO_ANALOGCLOCK_H
```

AnalogClock.cpp

```c++
//
// Created by aszswaz on 2021/9/14.
//

#include "AnalogClock.h"
#include <iostream>


/**
 * 类的构造函数，QWidget(parent) 是调用父类 QWidget 的构造函数
 * @param parent
 */
AnalogClock::AnalogClock(QWidget *parent) : QWidget(parent) {
    // 创建一个定时器，QTimer会定期发送一个 timeout 信号
    auto *timer = new QTimer(this);
    // 设置timeout的信号接收者为 AnalogClock 的 update 函数，应该可以理解为定时进行函数回调
    connect(timer, &QTimer::timeout, this, QOverload<>::of(&AnalogClock::update));
    // 启动定时器，定时间隔为 1 秒
    timer->start(1000);

    this->setWindowTitle(tr("Analog Clock"));
    resize(400, 400);
}

/**
 * 每当内容需要更新的时候，就会调用 paintEvent 函数，需要更新情况有以下几种：
 * 1. 小部件第一次显示
 * 2. 小部件被覆盖，然后再次暴露时
 * 2. 小部件的 update 函数被调用时
 */
void AnalogClock::paintEvent(QPaintEvent *) {
    /*
     * QPoint 用于定义平面中的一个点
     */
    // 定义一个形状为等腰三角形的时针
    static const QPoint hourHand[3] = {
            QPoint(7, 8),
            QPoint(-7, 8),
            QPoint(0, -40)
    };
    // 定义一个形状为等腰三角型的分针
    static const QPoint minuteHand[3] = {
            QPoint(7, 8),
            QPoint(-7, 8),
            QPoint(0, -70)
    };
    // 定义一个形状为等腰三角的秒针
    static const QPoint secondHand[3] = {
            QPoint(7, 8),
            QPoint(-7, 8),
            QPoint(0, -70)
    };

    // 设置时针、分针和秒针的颜色
    QColor hourColor(127, 0, 127);
    QColor minuteColor(0, 127, 127, 191);
    QColor secondColor(255, 0, 0, 115);

    int side = qMin(width(), height());
    // 获取当前时间
    QTime time = QTime::currentTime();

    // 小部件绘制
    QPainter painter(this);
    // 启用抗锯齿
    painter.setRenderHint(QPainter::Antialiasing);
    double width = this->width();
    double height = this->height();
    // 平移坐标系到小部件的中心
    painter.translate(width / 2, height / 2);
    // 缩放坐标系
    painter.scale(side / 200.0, side / 200.0);

    // 将画家的钢笔设置为具有给定的样式，Qt::NoPen：无样式
    painter.setPen(Qt::NoPen);
    // 设置画笔的填充颜色
    painter.setBrush(hourColor);

    // 保存当前画家状态（将状态推入堆栈）。一个 save() 后面必须跟一个对应的restore ()
    painter.save();
    // 绘制时针
    // 顺时针旋转坐标系。给定的角度参数以度为单位。
    painter.rotate(30.0 * ((time.hour() + time.minute() / 60.0)));
    // 使用当前画笔绘制由数组点中的第一个 pointCount 点定义的凸多边形。
    painter.drawConvexPolygon(hourHand, 3);
    // 恢复当前的画家状态（从堆栈中弹出一个保存的状态）。
    painter.restore();

    // 设置画笔颜色
    painter.setPen(hourColor);

    // 绘制12条等分线，作为时针分割线
    for (int i = 0; i < 12; ++i) {
        // 绘制一条从 ( x1 , y1 ) 到 ( x2 , y2 ) 的线。
        painter.drawLine(88, 0, 96, 0);
        // 顺时针旋转坐标系。给定的角度参数以度为单位。
        painter.rotate(30.0);
    }

    painter.setPen(Qt::NoPen);
    painter.setBrush(minuteColor);

    painter.save();
    // 绘制分针
    painter.rotate(6.0 * (time.minute() + time.second() / 60.0));
    painter.drawConvexPolygon(minuteHand, 3);
    painter.restore();

    painter.setPen(minuteColor);

    // 绘制60条秒钟的分割线
    for (int j = 0; j < 60; ++j) {
        if ((j % 5) != 0) {
            painter.drawLine(92, 0, 96, 0);
        }
        painter.rotate(6.0);
    }

    // 绘制秒针
    painter.setPen(Qt::NoPen);
    painter.setBrush(secondColor);
    painter.save();
    painter.rotate(6.0 * time.second());
    painter.drawConvexPolygon(secondHand, 3);
    painter.restore();
    painter.setPen(secondColor);
}
```

<font color="red">注意：QWidget的子类AnalogClock，必须定义在头文件当中，否则，Qt的moc工具无法解析 AnalogClock 类，就会出现编译错误：</font>

```txt
-- Could NOT find Vulkan (missing: Vulkan_INCLUDE_DIR) 
-- Configuring done
-- Generating done
-- Build files have been written to: /home/aszswaz/project/CLionProjects/qt-demo/cmake-build-debug
[ 20%] Automatic MOC and UIC for target qt_demo

AutoMoc error
-------------
"SRC:/AnalogClock.cpp"
contains a "Q_OBJECT" macro, but does not include "AnalogClock.moc"!
Consider to
  - add #include "AnalogClock.moc"
  - enable SKIP_AUTOMOC for this file

make[3]: *** [CMakeFiles/qt_demo_autogen.dir/build.make:71：CMakeFiles/qt_demo_autogen] 错误 1
make[2]: *** [CMakeFiles/Makefile2:110：CMakeFiles/qt_demo_autogen.dir/all] 错误 2
make[1]: *** [CMakeFiles/Makefile2:91：CMakeFiles/qt_demo.dir/rule] 错误 2
make: *** [Makefile:124：qt_demo] 错误 2
```

