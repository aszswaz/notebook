# Qt 统计图标组件

## 安装模块

```bash
$ sudo pacman -S qt-charts
```

## cmake

```cmake
cmake_minimum_required(VERSION 3.20)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

add_executable(qtdemo qtdemo.cpp)

find_package(Qt5 COMPONENTS Widgets Charts REQUIRED)
target_link_libraries(qtdemo Qt5::Widgets Qt5::Charts)
```

## 简易的折线统计图

```c++
//
// Created by aszswaz on 2021/10/17.
//
#include <QApplication>
#include <QMainWindow>
#include <QDateTime>
#include <QChartView>
#include <QLineSeries>
// 引用命名空间
QT_CHARTS_USE_NAMESPACE

int main(int argc, char **argv) {
    // 应用程序上下文
    QApplication application(argc, argv);

    // 折线
    auto *series01 = new QLineSeries();
    series01->setName("line01");
    // 设置折线01的点
    series01->append(0, 0);
    series01->append(2, 6);
    series01->append(3, 8);
    series01->append(7, 9);
    series01->append(11, 3);

    // 设置折线02的点
    auto *series02 = new QLineSeries();
    series02->setName(QApplication::tr("line02"));
    series02->append(0, 0);
    series02->append(1, 2);
    series02->append(3, 4);
    series02->append(5, 6);
    series02->append(7, 8);
    series02->append(7, 1);
    series02->append(8, 5);
    // 显示点
    series02->setPointsVisible(true);
    // 显示每个点的数字
    series02->setPointLabelsVisible(true);
    // 数字的文字颜色
    series02->setPointLabelsColor(QColorConstants::Black);
    // 数字的值来源
    series02->setPointLabelsFormat("@yPoint");

    auto *chart = new QChart();
    // 关联series，这一步很重要，必须要将series关联到QChart才能将数据渲染出来：
    chart->addSeries(series01);
    chart->addSeries(series02);
    // 开启OpenGL，QLineSeries支持GPU绘制，Qt其他有的图表类型是不支持的。
    series01->setUseOpenGL(true);
    // 创建默认的坐标系（笛卡尔坐标）
    chart->createDefaultAxes();
    // 设置图表标题
    chart->setTitle(QStringLiteral("Qt line chart example"));

    // 在主窗口中创建一个折线图
    auto *view = new QChartView(chart, nullptr);
    // 开启抗锯齿，让显示效果更好
    view->setRenderHint(QPainter::Antialiasing);
    view->resize(1000, 600);
    // 显示窗口
    view->show();

    return QApplication::exec();
}
```

## 动态统计图

```c++
//
// Created by aszswaz on 2021/10/17.
//
#include <QApplication>
#include <QMainWindow>
#include <QDateTime>
#include <QChartView>
#include <QtCore/QTimer>
#include <QtCharts/QAbstractAxis>
#include <QtCharts/QSplineSeries>
#include <QtCharts/QValueAxis>
#include <QtCore/QRandomGenerator>
#include <QtCore/QDebug>

QT_CHARTS_BEGIN_NAMESPACE
    class QSplineSeries;

    class QValueAxis;
QT_CHARTS_END_NAMESPACE

QT_CHARTS_USE_NAMESPACE

class Chart : public QChart {
public:
    explicit Chart(QGraphicsItem *parent = nullptr, Qt::WindowFlags wFlags = {});

public slots:

    void handleTimeout();

private:
    QTimer m_timer;
    QSplineSeries *m_series;
    QValueAxis *m_axisX;
    QValueAxis *m_axisY;
    qreal m_x;
    qreal m_y;
};

Chart::Chart(QGraphicsItem *parent, Qt::WindowFlags wFlags) :
        QChart(QChart::ChartTypeCartesian, parent, wFlags),
        m_series(nullptr),
        m_axisX(new QValueAxis()),
        m_axisY(new QValueAxis()),
        m_x(5),
        m_y(1) {
    QObject::connect(&m_timer, &QTimer::timeout, this, &Chart::handleTimeout);
    m_timer.setInterval(1000);

    m_series = new QSplineSeries(this);
    QPen green(Qt::red);
    green.setWidth(3);
    m_series->setPen(green);
    m_series->append(m_x, m_y);

    addSeries(m_series);

    addAxis(m_axisX, Qt::AlignBottom);
    addAxis(m_axisY, Qt::AlignLeft);
    m_series->attachAxis(m_axisX);
    m_series->attachAxis(m_axisY);
    m_axisX->setTickCount(5);
    m_axisX->setRange(0, 10);
    m_axisY->setRange(-5, 10);

    m_timer.start();
}

void Chart::handleTimeout() {
    qreal x = plotArea().width() / m_axisX->tickCount();
    qreal y = (m_axisX->max() - m_axisX->min()) / m_axisX->tickCount();
    m_x += y;
    m_y = QRandomGenerator::global()->bounded(5) - 2.5;
    m_series->append(m_x, m_y);
    scroll(x, 0);
    if (m_x == 100)
        m_timer.stop();
}

int main(int argc, char **argv) {
    // 应用程序上下文
    QApplication application(argc, argv);

    QMainWindow window;
    auto *chart = new Chart;
    chart->setTitle("Dynamic spline chart");
    chart->legend()->hide();
    chart->setAnimationOptions(QChart::AllAnimations);
    QChartView chartView(chart);
    chartView.setRenderHint(QPainter::Antialiasing);
    window.setCentralWidget(&chartView);
    window.resize(400, 300);
    window.show();

    return QApplication::exec();
}
```

## 表格加折线图

customtablemodel.h：

```c++
#ifndef TEST_CUSTOMTABLEMODEL_H
#define TEST_CUSTOMTABLEMODEL_H


#include <QtCore/QAbstractTableModel>
#include <QtCore/QHash>
#include <QtCore/QRect>

class CustomTableModel : public QAbstractTableModel {
Q_OBJECT
public:
    explicit CustomTableModel(QObject *parent = nullptr);

    int rowCount(const QModelIndex &parent) const override;

    int columnCount(const QModelIndex &parent) const override;

    QVariant headerData(int section, Qt::Orientation orientation, int role) const override;

    QVariant data(const QModelIndex &index, int role) const override;

    bool setData(const QModelIndex &index, const QVariant &value, int role) override;

    Qt::ItemFlags flags(const QModelIndex &index) const override;

    void addMapping(const QString& color, QRect area);

private:
    QList<QVector<qreal> *> m_data;
    QHash<QString, QRect> m_mapping;
    int m_columnCount;
    int m_rowCount;
};


#endif //TEST_CUSTOMTABLEMODEL_H
```

customtablemodel.cpp

```c++
#include "customtablemodel.h"

#include <QtCore/QVector>
#include <QtCore/QRandomGenerator>
#include <QtCore/QRect>
#include <QtGui/QColor>

CustomTableModel::CustomTableModel(QObject *parent) :
        QAbstractTableModel(parent) {
    m_columnCount = 4;
    m_rowCount = 15;

    // m_data
    for (int i = 0; i < m_rowCount; i++) {
        auto *dataVec = new QVector<qreal>(m_columnCount);
        for (int k = 0; k < dataVec->size(); k++) {
            if (k % 2 == 0)
                dataVec->replace(k, i * 50 + QRandomGenerator::global()->bounded(20));
            else
                dataVec->replace(k, QRandomGenerator::global()->bounded(100));
        }
        m_data.append(dataVec);
    }
}

int CustomTableModel::rowCount(const QModelIndex &parent) const {
    Q_UNUSED(parent)
    return m_data.count();
}

int CustomTableModel::columnCount(const QModelIndex &parent) const {
    Q_UNUSED(parent)
    return m_columnCount;
}

QVariant CustomTableModel::headerData(int section, Qt::Orientation orientation, int role) const {
    if (role != Qt::DisplayRole)
        return {};

    if (orientation == Qt::Horizontal) {
        if (section % 2 == 0)
            return "x";
        else
            return "y";
    } else {
        return QString("%1").arg(section + 1);
    }
}

QVariant CustomTableModel::data(const QModelIndex &index, int role) const {
    if (role == Qt::DisplayRole || role == Qt::EditRole) {
        return m_data[index.row()]->at(index.column());
    } else if (role == Qt::BackgroundRole) {
        for (const QRect &rect: m_mapping) {
            if (rect.contains(index.column(), index.row()))
                return QColor(m_mapping.key(rect));
        }
        // cell not mapped return white color
        return QColor(Qt::white);
    }
    return {};
}

bool CustomTableModel::setData(const QModelIndex &index, const QVariant &value, int role) {
    if (index.isValid() && role == Qt::EditRole) {
        m_data[index.row()]->replace(index.column(), value.toDouble());
        emit dataChanged(index, index);
        return true;
    }
    return false;
}

Qt::ItemFlags CustomTableModel::flags(const QModelIndex &index) const {
    return QAbstractTableModel::flags(index) | Qt::ItemIsEditable;
}

void CustomTableModel::addMapping(const QString &color, QRect area) {
    m_mapping.insert(color, area);
}
```

tablewidget.h

```c++
#ifndef TEST_TABLEWIDGET_H
#define TEST_TABLEWIDGET_H

#include <QtWidgets/QWidget>

class TableWidget : public QWidget {
Q_OBJECT

public:
    explicit TableWidget(QWidget *parent = nullptr);
};

#endif //TEST_TABLEWIDGET_H
```

tablewidget.cpp

```c++
#include "tablewidget.h"
#include "customtablemodel.h"
#include <QtWidgets/QGridLayout>
#include <QtWidgets/QTableView>
#include <QtCharts/QChart>
#include <QtCharts/QChartView>
#include <QtCharts/QLineSeries>
#include <QtCharts/QVXYModelMapper>
#include <QtWidgets/QHeaderView>

QT_CHARTS_USE_NAMESPACE

TableWidget::TableWidget(QWidget *parent)
        : QWidget(parent) {
    // create simple model for storing data
    // user's table data model
    auto *model = new CustomTableModel;

    // create table view and add model to it
    auto *tableView = new QTableView;
    tableView->setModel(model);
    tableView->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
    tableView->verticalHeader()->setSectionResizeMode(QHeaderView::Stretch);

    auto *chart = new QChart;
    chart->setAnimationOptions(QChart::AllAnimations);

    // series 1
    auto *series = new QLineSeries;
    series->setName("Line 1");
    auto *mapper = new QVXYModelMapper(this);
    mapper->setXColumn(0);
    mapper->setYColumn(1);
    mapper->setSeries(series);
    mapper->setModel(model);
    chart->addSeries(series);

    // for storing color hex from the series
    QString seriesColorHex = "#000000";

    // get the color of the series and use it for showing the mapped area
    seriesColorHex = "#" + QString::number(series->pen().color().rgb(), 16).right(6).toUpper();
    model->addMapping(seriesColorHex, QRect(0, 0, 2, model->rowCount(QModelIndex())));


    // series 2
    series = new QLineSeries;
    series->setName("Line 2");

    mapper = new QVXYModelMapper(this);
    mapper->setXColumn(2);
    mapper->setYColumn(3);
    mapper->setSeries(series);
    mapper->setModel(model);
    chart->addSeries(series);

    // get the color of the series and use it for showing the mapped area
    seriesColorHex = "#" + QString::number(series->pen().color().rgb(), 16).right(6).toUpper();
    model->addMapping(seriesColorHex, QRect(2, 0, 2, model->rowCount(QModelIndex())));

    chart->createDefaultAxes();
    auto *chartView = new QChartView(chart);
    chartView->setRenderHint(QPainter::Antialiasing);
    chartView->setMinimumSize(640, 480);

    // create main layout
    auto *mainLayout = new QGridLayout;
    mainLayout->addWidget(tableView, 1, 0);
    mainLayout->addWidget(chartView, 1, 1);
    mainLayout->setColumnStretch(1, 1);
    mainLayout->setColumnStretch(0, 0);
    setLayout(mainLayout);
}
```

main.cpp

```c++
#include <QtWidgets/QApplication>
#include "tablewidget.h"

int main(int argc, char *argv[]) {
    QApplication a(argc, argv);
    TableWidget w;
    w.show();
    return QApplication::exec();
}
```

