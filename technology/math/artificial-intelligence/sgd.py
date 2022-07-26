#!/bin/env python
"""
利用随机梯度下降求全局最优解
"""

from time import sleep
import numpy as np
from matplotlib import pyplot as plt


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

w = 0.2
alpha = 0.05
k = 0

# 利用随机梯度下降，寻找全局最优解
for _ in range(100):
    for i in range(50):
        x = xs[i]
        y = ys[i]
        # a = x^2
        # b = -2 * x * y
        # c = y ^ 2
        # 斜率 k = 2aw + b
        k = 2 * (x ** 2) * w + (-2 * x * y)
        w = w - alpha * k
        plt.clf()
        plt.scatter(xs, ys)
        y_pre = w * xs
        plt.xlim(0, 1.5)
        plt.ylim(0, 1.5)
        plt.plot(xs, y_pre)
        plt.pause(0.01)
        print("w: ", w, "; k:", k)

print("finished")
# 显示最后的结果
plt.show()
