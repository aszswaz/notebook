# QPainter

QPainter 用于在其他的 Wdiget 中画画，具体示例如下：

## 构建主窗口

编写 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20)
project(demo CXX)

set(APP_NAME demo)

set(CMAKE_CXX_STANDARD 14)

add_executable(
        ${APP_NAME}
        demo.cpp
)

# qt
find_package(Qt5 COMPONENTS Widgets REQUIRED)
target_link_libraries(${APP_NAME} Qt5::Widgets)

target_link_libraries(${APP_NAME} pthread)
```

创建文件demo.cpp，并写入以下代码

```c++
#include <QApplication>
#include <QWidget>

class DemoWindow : public QWidget {
public:
    explicit DemoWindow();
};

DemoWindow::DemoWindow() : QWidget(nullptr) {
    this->resize(500, 500);
}

int main(int argc, char **argv) {
    QApplication application(argc, argv);

    DemoWindow demoWindow;
    demoWindow.show();

    return QApplication::exec();
}
```

## 在窗口中绘制一条直线，要求水平居中

修改 DemoWindow 类，重写 void paintEvent(QPaintEvent *event)：

```c++
#include <QApplication>
#include <QWidget>
#include <QPainter>
#include <QLineF>

class DemoWindow : public QWidget {
public:
    explicit DemoWindow();

    void paintEvent(QPaintEvent *event) override;
};

DemoWindow::DemoWindow() : QWidget(nullptr) {
    this->resize(500, 500);
}

void DemoWindow::paintEvent(QPaintEvent *event) {
    QPainter painter(this);
    int y = this->height() / 2;
    QLineF lineF(0, y, this->width(), y);
    painter.drawLine(lineF);
}
```

## 在窗口中绘制一条直线，该直线以每秒10像素的速度上下来回移动

<font color="red">除了四个用于处理图像数据的类，[QImage](https://doc.qt.io/qt-6/qimage.html)、 QPixmap 、[QBitmap](https://doc.qt.io/qt-6/qbitmap.html)和[QPicture](https://doc.qt.io/qt-6/qpicture.html)，其余的 QWidget 都不会记录上一次保存的窗口样式，可以通过这个特性，实现一个简单的动画</font>

代码如下：

```c++
#include <QApplication>
#include <QWidget>
#include <QPainter>
#include <QPointF>
#include <QLineF>
#include <pthread.h>
#include <unistd.h>

class DemoWindow : public QWidget {
private:
    /**
     * 直线的起始端点
     */
    QPointF startPoint;
    /**
     * 线段的终止端点
     */
    QPointF endPoint;
    /**
     * 移动速度
     */
    int speed;
public:
    explicit DemoWindow();

    void paintEvent(QPaintEvent *event) override;
};

DemoWindow::DemoWindow() : QWidget(nullptr) {
    this->resize(500, 500);
    this->startPoint = QPointF(0, 0);
    this->endPoint = QPointF(500, 0);
    this->speed = 10;
}

void DemoWindow::paintEvent(QPaintEvent *event) {
    QPainter painter(this);
    QLineF lineF(this->startPoint, this->endPoint);
    painter.drawLine(lineF);
    // 计算下一次的直线两个端点的位置
    double nextY = this->startPoint.y() + this->speed;
    if (nextY > this->height() || nextY < 0) {
        // 反转运动方向
        this->speed = -this->speed;
        nextY = this->startPoint.y() + this->speed;
    }
    this->startPoint.setY(nextY);
    this->endPoint.setY(nextY);
}

[[noreturn]] void *timer_run(void *p) {

    auto *demoWindow = (DemoWindow *) p;

    // 通过 sleep 实现定时
    while (true) {
        sleep(1);
        // 重新绘制窗口
        demoWindow->update();
    }
}

int main(int argc, char **argv) {
    QApplication application(argc, argv);

    DemoWindow demoWindow;
    demoWindow.show();

    // 创建线程，用于定时更新窗口，把窗口的句柄传给入口函数
    pthread_t pid;
    int error = pthread_create(&pid, nullptr, timer_run, &demoWindow);
    if (error) {
        fprintf(stderr, "Thread creation failed.");
        exit(1);
    }

    return QApplication::exec();
}
```

## 以动画的方式，一点一点的画出一个正方形

<font color="red">由于 QWidget 每次 update 都不会保存上一次窗口图形的特性，需要使用 QPixmap 作为动画的画布，存储绘画的图像数据，然后把 QPixmap 中的图像数据绘制到 QWidget</font>

代码如下：

```c++
#include <QApplication>
#include <QWidget>
#include <QPainter>
#include <QPointF>
#include <QTimer>

class DemoWindow : public QWidget {
private:
    /**
     * 边长
     */
    int sideLength;
    /**
     * 总长
     */
    int totalLength;
    /**
     * 当前长度
     */
    int currentLength{0};
    /**
     * x轴和y轴圈出一个正方形
     */
    int startX;
    int startY;
    int endX;
    int endY;
    /**
     * 当前画笔所在点
     */
    QPointF brushPoint;
    /**
     * 画布
     */
    QPixmap pixmap;
    /**
     * 定时器
     */
    QTimer *qTimer;
public:
    explicit DemoWindow();

    void paintEvent(QPaintEvent *event) override;
};

DemoWindow::DemoWindow() : QWidget(nullptr) {
    this->qTimer = new QTimer(this);
    // 关联定时器的超时信号给 update 函数
    connect(this->qTimer, &QTimer::timeout, this, QOverload<>::of(&DemoWindow::update));
    this->qTimer->start(10);

    this->resize(500, 500);
    this->sideLength = this->width() / 2;
    this->totalLength = this->sideLength * 4;

    int half = this->sideLength / 2;
    this->startX = (int) (this->width() / 2 - half);
    this->startY = this->startX;
    this->endX = (int) (this->height() / 2 + half);
    this->endY = this->endX;
    brushPoint = QPointF(this->startX, this->startY);

    fprintf(
            stdout, "start x: %d; start y: %d; end x: %d; end y: %d\n",
            this->startX, this->startY, this->endX, this->endY
    );
    this->pixmap = QPixmap(this->width(), this->height());
    // 设置画布背景色
    this->pixmap.fill(QColorConstants::White);
}

void DemoWindow::paintEvent(QPaintEvent *event) {
    QPainter pixmapPainter(&this->pixmap);
    pixmapPainter.setPen(QColorConstants::Black);
    // 描点
    pixmapPainter.drawPoint(this->brushPoint);
    this->currentLength++;

    int x = (int) this->brushPoint.x(), y = (int) this->brushPoint.y();
    if (x < this->endX && y == this->startY) {
        // x没有到最右边的端点，继续向右
        this->brushPoint.setX(x + 1);
    } else if (x == this->endX && y < this->endY) {
        // x到达最有边的端点，y开始向下
        this->brushPoint.setY(y + 1);
    } else if (x > this->startX && y == this->endY) {
        // y到达最下边的端点，x开始向左
        this->brushPoint.setX(x - 1);
    } else if (x == this->startX && y > this->startY) {
        // x回到最左边的端点，y开始向上
        this->brushPoint.setY(y - 1);
    }

    // 画到窗口
    QPainter windowPainter(this);
    windowPainter.drawPixmap(0, 0, this->pixmap);

    // 绘画完毕，停止定时器
    if (this->currentLength == this->totalLength) {
        // 解除定时器的超时信号关联
        disconnect(this->qTimer, &QTimer::timeout, this, QOverload<>::of(&DemoWindow::update));
    }
}

int main(int argc, char **argv) {
    QApplication application(argc, argv);

    DemoWindow demoWindow;
    demoWindow.show();

    return QApplication::exec();
}
```

