# Latex

## 安装

```bash
$ sudo pacman -S texlive-most texlive-langchinese texstudio
```

**texlive-most** 是 Latex 全部的工具包，**texlive-langchinese** 是 CTeX 宏集，用于给 Latex 提供中文支持，**texstudio** 是一款 Latex 的可视化编辑器

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
