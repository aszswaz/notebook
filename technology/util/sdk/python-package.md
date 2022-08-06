# Python package

There are three ways to package python: "setuptools + build", "setuptools" and "distutils".

## setuptools + build

To execute "setuptools" through "build", you need to write `pyproject.toml` in the root directory of project:

```toml
# Set the background build system to "setuptools"
[build-system]
requires = ["setuptools"]
build-backend = "setuptools.build_meta"

# Set file scanning parameters for "setuptools"
[tool.setuptools.packages.find]
# Set the directory to scan. 
where = ["src"]
# include = []
# exlude = []
# Whether to add only python packages, a directory with an "__init__.py" file and all files in that directory.
namespaces = false

# Set project information.
[project]
name = "package_demo"
version = "1.0.0"
dependencies = [
    "requests"
]

# A command line script to add packages.
[project.scripts]
# Create a command line script named "demo" with the entry function of the package set to "package_demo.main:main".
# The format of the entry function is "package.module:function"
demo = "package_demo.main:main"
```

build and install:

```bash
$ python -m venv venv
$ source ./venv/bin/activate
$ pip install setuptools build
$ mkdir -p ./src/package_demo && touch ./src/package_demo/__init__.py
$ echo "def main():\n    print('Hello World')" >> ./src/package_demo/main.py
$ python -m build
$ pip install ./dist/package_demo-1.0.0-py3-none-any.whl
$ demo
Hello World
```

If you need to package as a linux package, you can use installer to disassemble the whl package, taking archlinux as an example, write PKGBUILD:

```pkgbuild
pkgname=python-demo
pkgver=v1.0.0
pkgrel=1
pkgdesc="python package demo."
arch=(any)
license=('GPL')
makedepends=(python-build python-installer python-wheel)
depends=(python python-requests)
build() {
    [[ $VIRTUAL_ENV != "" ]] && echo -e "\033[91mPlease do not package in the \"venv\" environment.\033[0m" && exit 1
    # Change to the project root directory.
    cd ../
    python -m build --wheel --no-isolation
}
package() {
    cd ../
    python -m installer --destdir="$pkgdir" dist/*.whl
}
```

Then execute makepkg:

```bash
$ makepkg -s -i
$ demo
Hello World
```

<font color="color">It is not possible to execute makepkg in the venv environment.</font>

## setuptools

setuptools can also be configured using `setup.py`:

```python
from setuptools import find_namespace_packages, setup

setup(
    name="package_demo",
    version="1.0.0",
    install_requires=[
        "requests"
    ],
    packages=find_namespace_packages(),
    entry_points={
        "console_scripts": [
            "demo = package_demo.main:main"
        ]
    }
)
```

After preparing some code, perform packaging:

```bash
$ mkdir package_demo && touch ./package_demo/__init__.py
$ echo "def main():\n    print('Hello World')" > ./package_demo/main.py
# build
$ mkdir pkg
$ pip install --root="$PWD/pkg" .
$ tree pkg
pkg
└── usr
    ├── bin
    │   └── demo
    └── lib
        └── python3.10
            └── site-packages
                ├── package_demo
                │   ├── __init__.py
                │   ├── main.py
                │   └── __pycache__
                │       ├── __init__.cpython-310.pyc
                │       └── main.cpython-310.pyc
                └── package_demo-1.0.0.dist-info
                    ├── direct_url.json
                    ├── entry_points.txt
                    ├── INSTALLER
                    ├── METADATA
                    ├── RECORD
                    ├── REQUESTED
                    ├── top_level.txt
                    └── WHEEL

8 directories, 13 files
```

## distutils

setuptools is essentially an enhanced version of distutils. Python officially plans to remove distutils in python 3.12, so distutils is not recommended.
