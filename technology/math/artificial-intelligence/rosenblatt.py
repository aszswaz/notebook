#!./venv/bin/python

import numpy as np
from matplotlib import pyplot as plt

"""
Rosenblatt 感知器，实验的步骤如下：
准备：设定斜率为 1.2，随机生成一组豆豆的坐标。
实验目标：在不知道斜率的情况下，让机器自行运算出豆豆在坐标系的排列斜率

author: aszswaz
wikipedia: https://zh.wikipedia.org/wiki/%E6%84%9F%E7%9F%A5%E5%99%A8
"""


def get_beans(counts):
    """
    按照 1.2 的斜率，生成有毒的痘痘在坐标系的坐标
    """
    xs = np.random.rand(counts)
    xs = np.sort(xs)
    ys = [1.2 * x + np.random.rand() / 10 for x in xs]
    return xs, ys


# 有毒的痘痘
xs, ys = get_beans(100)

# 设置坐标轴窗口
plt.title("Size-Toxicity Function", fontsize=12)
plt.xlabel("Bean SIze")
plt.ylabel("Toxicity")

# 绘制痘痘
plt.scatter(xs, ys)
# 坐标系中直线的斜率
w = 0.5
# 学习率
alpha = 0.05

y_pre = None
for m in range(100):
    for i in range(100):
        x = xs[i]
        y = ys[i]
        # 根据当前的斜率，计算直线的下一个 y 坐标
        y_pre = w * x
        # 计算下一个 y 坐标与豆豆的实际 y 坐标差
        e = y - y_pre
        # 如果斜率过大，那么 e 就是负数，也就是减小误差，如果斜率过小，那么 e 就是正数，也就是增加斜率。学习率 alpha 是为了限制斜率 w 每次增加或减少的数值不要过大，乘以 x 是因为负坐标轴与正坐标轴的斜率调整是正好相反的
        w = w + alpha * e * x

y_pre = w * xs

plt.plot(xs, y_pre)
plt.show()
