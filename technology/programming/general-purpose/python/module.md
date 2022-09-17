# python 模块

## 安装/卸载第三方模块

```bash
# 安装模块管理器 pip
$ sudo pacman -S pip
# 安装模块
$ pip install example-module
# 卸载模块
$ pip uninstall example-module
```

pip 会从远程仓库下载模块的压缩包，并安装模块

## 一个项目多个模块之间的依赖

开发项目的时候，经常需要把一个项目模块化，需要使用 pip 来管理模块。

创建模块 module01，创建文件 module01.py：

```python
def main():
    print("module01: Hello module02")

```

创建 setup.py 文件：

```python
from setuptools import setup

with open('requirements.txt') as file:
    setup(
        name='module01',
        version='1.0',
        description='module build demo',
        author='aszswaz',
        py_modules=[
            'module01'
        ],
        # 模块的所有依赖
        install_requires=file.readlines(),
    )

```

<font color="red">注意：requirements.txt 文件是使用 `pip freeze > requirements.txt` 生成的</font>

**不构建，直接安装模块：**

创建模块 module02：

```bash
$ mkdir module02 && cd module02
# 建立虚拟环境
$ virtualenv venv
# 进入虚拟环境
$ source venv/bin/activate
```

安装 module01：

```bash
(venv) $ pip install ../module01
```

创建 module02.py（避免文件名字出现混淆）：

```python
import module01

if __name__ == '__main__':
    module01.main()

```

运行：

```bash
(venv) $ python module02.py
module01: Hello module02
```

卸载模块：

```bash
(venv) $ pip uninstall module01.py
Found existing installation: module01 1.0
Uninstalling module01-1.0:
  Would remove:
    /home/aszswaz/public/demo/module02/venv/lib/python3.9/site-packages/module01-1.0.dist-info/*
    /home/aszswaz/public/demo/module02/venv/lib/python3.9/site-packages/module01.py
Proceed (y/n)? Y
  Successfully uninstalled module01-1.0
```

## setup 参数表

| 参数                 | 说明                                                     |
| :------------------- | :------------------------------------------------------- |
| name                 | 包名称                                                   |
| version              | 包版本                                                   |
| author               | 程序的作者                                               |
| author_email         | 程序的作者的邮箱地址                                     |
| maintainer           | 维护者                                                   |
| maintainer_email     | 维护者的邮箱地址                                         |
| url                  | 程序的官网地址                                           |
| license              | 程序的授权信息                                           |
| description          | 程序的简单描述                                           |
| long_description     | 程序的详细描述                                           |
| platforms            | 程序适用的软件平台列表                                   |
| classifiers          | 程序的所属分类列表                                       |
| keywords             | 程序的关键字列表                                         |
| packages             | 需要处理的包目录(通常为包含 `__init__.py` 的文件夹)      |
| py_modules           | 需要打包的 Python 单文件列表                             |
| download_url         | 程序的下载地址                                           |
| cmdclass             | 添加自定义命令                                           |
| package_data         | 指定包内需要包含的数据文件                               |
| include_package_data | 自动包含包内所有受版本控制(cvs/svn/git)的数据文件        |
| exclude_package_data | 当 include_package_data 为 True 时该选项用于排除部分文件 |
| data_files           | 打包时需要打包的数据文件，如图片，配置文件等             |
| ext_modules          | 指定扩展模块                                             |
| scripts              | 指定可执行脚本,安装时脚本会被安装到系统 PATH 路径下      |
| package_dir          | 指定哪些目录下的文件被映射到哪个源码包                   |
| entry_points         | 动态发现服务和插件，下面详细讲                           |
| python_requires      | 指定运行时需要的Python版本                               |
| requires             | 指定依赖的其他包                                         |
| provides             | 指定可以为哪些模块提供依赖                               |
| install_requires     | 安装时需要安装的依赖包                                   |
| extras_require       | 当前包的高级/额外特性需要依赖的分发包                    |
| tests_require        | 在测试时需要使用的依赖包                                 |
| setup_requires       | 指定运行 setup.py 文件本身所依赖的包                     |
| dependency_links     | 指定依赖包的下载地址                                     |
| zip_safe             | 不压缩包，而是以目录的形式安装                           |