#!/bin/zsh

# 生成指定 tex 文件的 pdf 文件，并用 PDF 阅读器打开 PDF 文件
# author: aszswaz
# date: 2022-03-19

ARGS=($@)
TEX_FILE=$1

{
    xelatex -output-directory "$(dirname $TEX_FILE)" $TEX_FILE &&
        echo -e "\033[32mPDF file grenerated successfully.\033[0m"
} || {
    echo -e "\033[31mPDF file generation failed.\033[0m" >&2
    exit 1
}

# 删除编译过程中生成的其他文件
find ! -ipath "*/venv/*" \
    -name "*.out" -or -name "*.log" -or -name "*.aux" \
    -or -name "*.nav" -or -name "*.snm" -or -name "*.toc" -or -name "*.vrb" | xargs rm -rf

# 打开文件
command -v okular && okular "${TEX_FILE%.*}.pdf"
