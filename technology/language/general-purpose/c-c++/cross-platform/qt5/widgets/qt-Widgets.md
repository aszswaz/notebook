# [Qt 6 Widgets](https://doc.qt.io/qt-6/qtwidgets-index.html)

Qt 是一款GUI图形框架，Widgets是Qt的窗口小部件模块

## 配置cmake

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

add_executable(${PROJECT_NAME} main.cpp)

find_package(Qt5 COMPONENTS Widgets REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE Qt5::Widgets)
```

## 创建窗口

```c++
#include <QtWidgets>

int main(int argc, char *argv[]) {
    QApplication application(argc, argv);

    // 没有父窗口的QWidget，是一个独立的窗口
    QWidget window;
    window.resize(500, 500);
    window.show();
    window.setWindowTitle(QApplication::translate("Hello World", "Hello World"));
    
    /*
    // 也可以使用 QMainWindow 创建一个窗口，QMainWindow 作为主窗口，API 比QWidget这种单纯的窗口要多一点
    QMainWindow mainWindow;
    mainWindow.resize(500, 500);
    mainWindow.show();
    mainWindow.setWindowTitle(QApplication::translate("Hello World", "Hello World"));
    */

    return QApplication::exec();
}
```

## 在窗口部件中创建子部件

```c++
#include <QtWidgets>

int main(int argc, char *argv[]) {
    QApplication application(argc, argv);

    QWidget window;
    // 设置窗口大小
    window.resize(320, 240);
    window.setWindowTitle(QApplication::translate("childwidget", "Child widget"));
    window.show();

    auto *button = new QPushButton(QApplication::translate("childwidget", "Press me"), &window);
    // 移动到指定位置
    button->move(100, 100);
    button->show();

    // exec 函数会开始监听窗口事件，直到程序窗口关闭
    return QApplication::exec();
}
```

## 盒子布局

在窗口中创建一个标签，和一个对话框

```c++
#include <QtWidgets>

int main(int argc, char *argv[]) {
    QApplication application(argc, argv);

    // auto 是根据左值，判断右边的类型。这里还是使用 new 来创建对象的指针比较好，因为QT在窗口关闭时有回收内存的操作
    auto *label = new QLabel(QApplication::translate("windowlayout", "Name:"));
    auto *lineEdit = new QLineEdit();

    // 盒子布局
    auto layout = new QHBoxLayout();
    // 添加部件
    layout->addWidget(label);
    layout->addWidget(lineEdit);

    QWidget window;
    window.setLayout(layout);
    window.setWindowTitle(QApplication::translate("Hello World", "Hello World"));
    window.show();

    // exec 函数会开始监听窗口事件，直到程序窗口关闭
    return QApplication::exec();
}
```

## 嵌套布局

利用水平盒子布局和垂直盒子布局，制作一个简易表格。

```c++
#include <QtWidgets>

int main(int argc, char *argv[]) {
    QApplication application(argc, argv);

    QWidget window;

    auto *queryLabel = new QLabel(
            QApplication::translate("nestedlayouts", "Query:"));
    auto *queryEdit = new QLineEdit();
    // 表格视图
    auto *resultView = new QTableView();

    // 水平盒子布局，水平排列小部件
    auto *queryLayout = new QHBoxLayout();
    queryLayout->addWidget(queryLabel);
    queryLayout->addWidget(queryEdit);

    // 垂直盒子布局，垂直排列小部件
    auto *mainLayout = new QVBoxLayout();
    // 嵌套布局
    mainLayout->addLayout(queryLayout);
    mainLayout->addWidget(resultView);
    window.setLayout(mainLayout);

    // Set up the model and configure the view...
    window.setWindowTitle(QApplication::translate("nestedlayouts", "Nested layouts"));
    window.show();

    // 这是一个用于存储自定义数据的通用模型
    QStandardItemModel model;
    // 设置水平标题
    QStringList labels = {
            QApplication::translate("nestedlayouts", "Name"),
            QApplication::translate("nestedlayouts", "Office")
    };

    model.setHorizontalHeaderLabels(labels);

    // 表格数据
    const QStringList rows[] = {
            QStringList{QStringLiteral("Verne Nilsen"), QStringLiteral("123")},
            QStringList{QStringLiteral("Carlos Tang"), QStringLiteral("77")},
            QStringList{QStringLiteral("Bronwyn Hawcroft"), QStringLiteral("119")},
            QStringList{QStringLiteral("Alessandro Hanssen"), QStringLiteral("32")},
            QStringList{QStringLiteral("Andrew John Bakken"), QStringLiteral("54")},
            QStringList{QStringLiteral("Vanessa Weatherley"), QStringLiteral("85")},
            QStringList{QStringLiteral("Rebecca Dickens"), QStringLiteral("17")},
            QStringList{QStringLiteral("David Bradley"), QStringLiteral("42")},
            QStringList{QStringLiteral("Knut Walters"), QStringLiteral("25")},
            QStringList{QStringLiteral("Andrea Jones"), QStringLiteral("34")}
    };

    // 一行单元格列表
    QList<QStandardItem *> items;
    for (const QStringList &row : rows) {
        items.clear();
        for (const QString &text : row) {
            items.append(new QStandardItem(text));
        }
        // 添加一行数据
        model.appendRow(items);
    }

    // 设置表格视图的内容
    resultView->setModel(&model);
    // 隐藏左边的行号
    resultView->verticalHeader()->hide();
    // 拉伸最后一列的单元格
    resultView->horizontalHeader()->setStretchLastSection(true);

    // exec 函数会开始监听窗口事件，直到程序窗口关闭
    return QApplication::exec();
}
```

