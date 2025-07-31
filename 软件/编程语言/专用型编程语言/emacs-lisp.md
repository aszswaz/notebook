# Emacs Lisp

[Lisp](https://zh.wikipedia.org/wiki/LISP) 是具有悠久历史的计算机编程语言家族，有独特的完全圆括号的前缀符号表示法。它起源于 1958 年，是现今第二悠久而仍广泛使用的高级编程语言，只有 [FORTRAN](https://zh.wikipedia.org/wiki/Fortran) 编程语言比它更早一年。Lisp 编程语族已经演变出许多种方言，现代最著名的通用编程方言是 [Scheme](https://zh.wikipedia.org/wiki/Scheme)、[Common Lisp](https://zh.wikipedia.org/wiki/Common_Lisp) 和新近的 [Clojure](https://zh.wikipedia.org/wiki/Clojure)。

[GNU/Emacs](https://www.gnu.org/software/emacs/) 是一个可定制、可拓展、免费/自由的文本编辑器，它的核心是 Emacs Lisp 解释器，Emacs Lisp 是 Lisp 的一种方言，具有支持文本编辑的拓展。Emacs Lisp 借鉴于 Common Lisp，因此大部分的 Common Lisp 的语法可以在 Emacs Lisp 中使用。

# 安装 Emacs

以 archlinux 为例，安装 Emacs，步骤如下：

```bash
$ sudo pacman -S emacs
```

# Hello World

```commonlisp
(format t "Hello World")
```

## 基本结构

