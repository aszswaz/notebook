#!/bin/zsh

# 生成指定 tex 文件的 pdf 文件，并用 PDF 阅读器打开 PDF 文件
# author: aszswaz
# date: 2022-03-19

cd $(dirname $0)
ARGS=($@)
TEX_FILE=$1

# 带有目录的文档需要进行两次编译，大多数文档都是有目录的，所以全部文档都编译两次
{
    xelatex -output-directory "$(dirname $TEX_FILE)" $TEX_FILE &&
        xelatex -output-directory "$(dirname $TEX_FILE)" $TEX_FILE &&
        echo -e "\033[32mPDF file grenerated successfully.\033[0m"
} || {
    echo -e "\033[31mPDF file generation failed.\033[0m" >&2
}

# 删除编译过程中生成的其他文件
find ! -ipath "*/venv/*" \
    -name "*.out" -or -name "*.log" -or -name "*.aux" \
    -or -name "*.nav" -or -name "*.snm" -or -name "*.toc" -or -name "*.vrb" \
    -or -name "*.tln"| xargs rm -rf

# 在没有已经存在的 okular 的情况下，才创建一个 okular 实例，因为 okular 会在 pdf 更新时自动加载，但是浏览位置不会改变，这样可以省去每次更新 pdf 文件后，都要手动调整到原来的浏览位置
if [[ ! $(ps aux) =~ 'okular' ]]; then
    echo "\033[32mStarting okular.\033[0m"
    nohup okular "${TEX_FILE%.*}.pdf" >>/dev/null 2>&1 &
fi
