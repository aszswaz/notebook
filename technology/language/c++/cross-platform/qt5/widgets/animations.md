# 用Qt实现窗口动画

## 列表展开：元素向下滑动的动画

```c++
//
// Created by aszswaz on 2021/9/29.
//

#include <QWidget>
#include <QApplication>
#include <iostream>
#include <QTimer>
#include <QVBoxLayout>
#include <QLabel>

class DemoWindow : public QWidget {
private:
    /**
     * 窗口展开动画在执行的时候，列表以及列表中每个部件的移动速度
     */
    int speed = 1;
    /**
     * 窗口的宽和最大高度
     */
    int width = 150;
    /**
     * 由于导航栏的出现，会导致动画执行过程中，height() 骤增20像素，所以不能使用该函数作为展开动画的依据
     */
    int current_height = 0;
    int maxHeight = 500;
    QTimer *timer;
    QLabel *labels[10]{};

public:
    explicit DemoWindow(QWidget *widget);

    /**
     * 窗口根据速度和时间慢慢展开
     */
    void unfold();
};

DemoWindow::DemoWindow(QWidget *widget) : QWidget(widget) {
    this->resize(this->width, this->current_height);
    this->setFixedHeight(this->current_height);

    QPalette palette(QColorConstants::Gray);

    int labelHeight = 40;
    // 列表中每个标签出现的位置，该位置都在窗口上方按顺序排列队伍，等待定时器刷新时依次入场
    int startY = 0 - 10 * labelHeight;

    for (auto &i : this->labels) {
        auto *label = new QLabel(QApplication::tr("demo01"), this);
        label->setPalette(palette);
        label->setAutoFillBackground(true);
        label->setGeometry(0, startY, 150, labelHeight);
        i = label;
        startY += labelHeight;
    }

    // Qt框架的定时器，定时器重新绘制窗口
    this->timer = new QTimer(this);
    connect(timer, &QTimer::timeout, this, QOverload<>::of(&DemoWindow::unfold));
    // 每秒60帧，是人眼每秒能够识别的最大帧率，差不多是16.66毫秒一帧，所以定时器16毫秒刷新一次就行
    timer->start(16);
}

void DemoWindow::unfold() {
    // 由于窗口张开到一定程序，就会出现下边框，height()函数返回值会骤增20像素，打破窗口和标签的匀速运动的状态，所以需要另外的属性记录当前已经展开的高度。如果QWidget不是作为单独的窗口的话，应该没有这个问题（还没尝试过）
    if (this->current_height == this->maxHeight) {
        disconnect(this->timer, &QTimer::timeout, this, QOverload<>::of(&DemoWindow::unfold));
        return;
    }

    int nexHeight = this->current_height + this->speed;
    this->current_height = nexHeight;

    // 所有的标签沿着Y轴运动
    for (const auto &item : this->labels) {
        item->setGeometry(0, item->y() + this->speed, 150, item->height());
    }
    // 更新窗口的高度，这里有一个问题，就是由于使用 current_height 记录当前展开的高度，而不使用 height() 函数来作为Y轴的计算基准，所以在动画开始的时候，窗口的伸展会看上去暂停一段时间，但是标签正常移动的情况，比个人感觉这样反而效果更好
    this->setFixedHeight(this->current_height);
}

int main(int argc, char **argv) {
    QApplication application(argc, argv);

    DemoWindow window(nullptr);
    window.show();

    return QApplication::exec();
}
```

