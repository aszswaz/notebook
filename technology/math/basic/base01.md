# 数学术语

## 倒数

是指数学上设一个x与其相乘的积为1的数，记为1/x，过程为“乘法逆”，<font color="green">除了0以外的数都存在倒数，分子和分母相倒并且两个乘积是1 的数互为倒数，0没有倒数。</font>

例1：

$2 \times 0.5 = 1$

2 和 0.5 是互为倒数

例2：

$\frac{x}{y} \times \frac{y}{x} = 1$​

$\frac{x}{y}$ 和 $\frac{y}{x}$ 是互为倒数

## [逻辑异或（XOR）](https://zh.wikipedia.org/wiki/%E9%80%BB%E8%BE%91%E5%BC%82%E6%88%96)

在数字逻辑中，[逻辑算符](https://zh.wikipedia.org/wiki/逻辑运算符)[**异或门**（**exclusive or**）](https://zh.wikipedia.org/wiki/%E5%BC%82%E6%88%96%E9%97%A8)是对两个[运算元](https://zh.wikipedia.org/wiki/運算元)的一种[逻辑分析](https://zh.wikipedia.org/wiki/逻辑或)类型。与一般的[逻辑或](https://zh.wikipedia.org/wiki/逻辑或)不同，==当两两数值相同为否，而数值不同时为真。==

对于命题$p,q$，$p$异或$q$通常记作$p XOR q$或$p \oplus q$。在变成语言中写作`p^q`。

### 真值表

异或运算$p \oplus q$的真值表如下：

| $p$   | $q$   | $p \oplus q $ |
| ----- | ----- | ------------- |
| True  | True  | False         |
| True  | False | True          |
| False | True  | True          |
| False | False | False         |

### 其他表示

在数学和工程学中，常常用其他的逻辑运算符来表示异或算符。异或算符可以使用逻辑算符[逻辑与](https://zh.wikipedia.org/wiki/逻辑与)$\land$，[逻辑或](https://zh.wikipedia.org/wiki/逻辑或)$\lor$和[逻辑非](https://zh.wikipedia.org/wiki/逻辑非)$\lnot$表示为：

$\begin{aligned}p\oplus q&=(p\land \lnot q)\lor (\lnot p\land q)=p{\overline {q}}+{\overline {p}}q\\&=(p\lor q)\land (\lnot p\lor \lnot q)=(p+q)({\overline {p}}+{\overline {q}})\\&=(p\lor q)\land \lnot (p\land q)=(p+q)({\overline {pq}})\end{aligned}$

异或也可以被表示为：

$p\oplus q=\lnot ((p\land q)\lor (\lnot p\land \lnot q))$

异或还可以看作是[逻辑等价](https://zh.wikipedia.org/wiki/逻辑等价)关系的非运算。

### 性质

交换律：$p\oplus q=q\oplus p$

结合律：${\displaystyle p\oplus (q\oplus r)=(p\oplus q)\oplus r}$

恒等律：${\displaystyle p\oplus 0=p}$

归零律：${\displaystyle p\oplus p=0}$

自反：${\displaystyle p\oplus q\oplus q=p\oplus 0=p}$

### 使用异或运算交换两个int类型变量的值

```java
public static void demo(int a, int b) {
    a = a ^ b;
    b = a ^ b;
    a = a ^ b;
}
```

<font color="red">虽然可以使用逻辑异或交换变量的值，但是相比于通过中间量来交换变量的做法相比，性能反而比较差。</font>

## 实数

实数是[有理数](#有理数)和[无理数](#无理数)的总称。实数是真是存在的数字，与之相对的是虚数。实数集的代表符号是 R。

### 有理数

整数和分数统称为有理数。比如 0、1、2、$\frac{1}{2}$。有理数的小数部分为有限小数。有理数集的代表符合是 Q。

### 无理数

无理数是指除了[有理数](#有理数)之外的[实数](#实数)，比如$\sqrt{2} 、 \sqrt{3}$。无理数的小数部分为无限小数。

## 虚数

在自然界中不存在的数组，比如 $i^2=-1$，任何数字的平方都不可能为负数，所以 i 是虚数，虚数不能比较大小。

## 复数

复数是实数和虚数的组合，比如 a + bi，$i^2 = -1$，a 和 b 为实数，a + bi 就是一个复数，a 是该数的**实部**，bi 是该数的**虚部**。

## 通约性

两个不等于零的实数 a 与 b 的除商 $\frac{a}{b}$ 是一个有理数，比如 a = 1，b = 2 $a : b = 1 : 2 = 0.5$。

或者说 a 与 b 的比例想等于两个非零数 p 与 q 的比例：$a : b = p : q$，则称它们是互相可通约的，而这个特性被称为通约性。这意味着，存在一个非零的实数公测数（common measue）m（$m \in R$），使得 $a = mp，b = mq$。

## 对数

对数是**幂运算**的**逆运算**，举个例子，$16=4^2$，那么，4 就是 2 的底数，2 就是 16 的对数。

## 向量

向量是指具有大小和方向的变量。

## 常数

常数是指规定的数量与数字，如圆的周长 $\pi$ 、铁的膨胀系数为 0.000012 等。常数是具有一定含义的名称、用于代替数字或字符串，其值从不改变。

## 向量空间

向量空间是指一组向量及相关的运算即向量加法，标量乘法，以及对运算的一些限制如封闭性、结合率。

## 自变量和因变量

**自变量**、**因变量**和**控制变量**主要用于指实验时各种会影响实验结果的因素，在实验中由于各项因素的不确定性与不可预测性，因此需先设定什么为人为可控制的控制变量，什么为实验主要目标之自变量。其目的是为了厘清哪些因素能使实验产生不同的结果而形成的概念。

## 常用公式化简

平方计算公式化简：
$$
\begin{aligned}
(a - b)^2 & = (a - b)(a - b) \\
          & = a(a - b) + (a - b)(-b) \\
          & = a^2 - ab - (a - b)b \\
          & = a^2 -ab - (ab - b^2) \\
          & = a^2 - ab - ab + b^2 \\
          & = a^2 + b^2 - 2ab
\end{aligned}
$$
举一反三：$(a + b)^2 = a^2 + b^2 + 2ab$

