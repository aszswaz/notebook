#!./venv/bin/python
import numpy as np
import matplotlib.pyplot as plot

"""
通过方差代价函数，一次性获得预测函数的最小误差
生成 100 个豆豆的总体误差函数的抛物线，并且通过抛物线的顶点坐标公式，获得最小误差
"""

def get_beans(counts):
    """
    按照 1.2 的斜率，生成有毒的痘痘在坐标系的坐标
    """
    xs = np.random.rand(counts)
    xs = np.sort(xs)
    ys = [1.2 * x + np.random.rand() / 10 for x in xs]
    return xs, ys


xs, ys = get_beans(100)

# 生成函数坐标
ws = np.arange(0, 3, 0.1)
es = []
for w in ws:
    y_pre = xs * w
    es.append(np.sum((ys - y_pre) ** 2) / 100)

# 根据公式 x = -b/2a 求抛物线的对称轴
w_min = np.sum(xs * ys) / np.sum(xs * xs)
print("w_min:", w_min)

# 在坐标系绘制函数抛物线
plot.title("Demo")
plot.xlabel("w")
plot.ylabel("e")
plot.plot(ws, es)
plot.show()

plot.xlabel("Bean Size")
plot.ylabel("Toxicity")
plot.scatter(xs, ys)
plot.plot(xs, xs * w_min)
plot.show()
