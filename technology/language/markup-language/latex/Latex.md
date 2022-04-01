# Latex

## 安装

```bash
$ sudo pacman -S texlive-most texlive-langchinese texstudio
```

**texlive-most** 是 Latex 全部的工具包，**texlive-langchinese** 是 [CTeX](http://mirrors.ibiblio.org/CTAN/language/chinese/ctex/ctex.pdf) 宏集，用于给 Latex 提供中文支持，**texstudio** 是一款 Latex 的可视化编辑器

中文文档编写示例：

```latex
% CTeX 提供的文档基类：ctexart, ctexrep, ctexbook 和 ctexbeamer 来进行中文文档的编写，分别对应 LaTeX 的标准文档类 article, report, book 和 beamer
\documentclass{ctexart}
\begin{document}
中文文档类测试。
\end{document}
```

文件保存为 demo.tex 生成 demo.pdf：

```bash
$ xelatex demo.tex
```

<font color="red">注意：Latex 主要使用的指令集有 tex、latex、pdflatex、xelatex、xetex，只有 xelatex 和 xetex 支持 Unicode 字符，latex 是 tex 语言的拓展，不能直接使用 xetex 编译上述代码，因为 tex 中没有 \documentclass 和 \end</font>

## 文档类

latex 需要通过 `\documentclass` 指定需要使用的文档类，latex 标准文档类如下：

| 文档类   | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| article  | 基本文档，主要用于排版论文和报告，ctexart 支持中文，功能上与前者类似 |
| report   | 格式有文章结构，主要用来排版综述类、长篇论文、报告等，对应的中文文档类：ctexrep |
| book     | 主要用来排版出版的书籍，有明显的章节结构，对应的中文文档类：ctexbook |
| proc     | 学术论文模板                                                 |
| slides   | 幻灯片格式的文档类                                           |
| moderncv | 主要用于个人简历                                             |
| beamer   | 用于制作幻灯片                                               |
