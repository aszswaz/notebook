#!/bin/zsh

# 文件夹的管理脚本，功能如下：
# 1. 生成 Python 的 venv 环境，安装必要的 Python 库
# 2. 将 tex 文件，编译为 PDF 文件，并且删除编译时产生的其他文件

cd $(dirname $0)

# 创建 Python 环境
[ ! -d "./venv" ] && python -m venv venv
source ./venv/bin/activate
# 读取 requirements.txt 文件，安装 Python 依赖
[ -e "./requirements.txt" ] && pip install -r "requirements.txt"
# 生成或更新 requirements.txt 文件
pip freeze > "requirements.txt"

for item in $(find -name "*.tex"); do
    xelatex -output-directory "$(dirname $1)" "$1"
done
find ! -path "*/venv/*" -name "*.log" -or -name "*.aux" -or -name "*.out" | xargs rm -rf
