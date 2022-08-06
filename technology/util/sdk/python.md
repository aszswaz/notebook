# setuptools

setuptools packages python projects. It can be executed in two ways, either as background build system for "build" or through setup.py.

## build

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
version = "v1.0.0"
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

<font color="color">It is not possible to execute makepkg in the venv environment, and the installation path of the file will be affected. The way "setup.py" is packaged is deprecated, and "setup.py" should no longer be used, either with "distutils" or "setuptools".</font>
