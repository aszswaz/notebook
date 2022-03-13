# archlinux安装zsh

### 安装zsh

```zsh
sudo pacman -Sy zsh
```

然后执行一下代码，并重启一下电脑。

```zsh
chsh -s $(which zsh)
reboot
```

### 安装oh-my-zsh

```zsh
cd ~
git clone https://github.com/ohmyzsh/ohmyzsh.git ~/.oh-my-zsh
# 然后把oh-my-zsh的配置文件拷贝一下
cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
source ~/.zshrc
```

### 使用主题

```zsh
vim ~/.zshrc
#找到这行,把agnoster改成你喜欢的主题名称就好
ZSH_THEME="agnoster"
#保存退出，刷新一下
source ~/.zshrc
```

安装其他主题。这里以Powerlevel10k为例。

github地址： 开源地址

从github进行克隆：

```zsh
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k
```

如果下载速度较慢，可以从码云的镜像仓库进行下载：

```zsh
git clone --depth=1 https://gitee.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k
```

然后修改zshrc文件：

vim ~/.zshrc
#找到这行,把agnoster改成powerlevel10k/powerlevel10k
ZSH_THEME="powerlevel10k/powerlevel10k"
#保存退出，刷新一下
source ~/.zshrc
接下来应该是配置过程，按数字键进行选择就可以了。

## 插件

以语法高亮 zsh-syntax-highlighting 和命令补全插件 zsh-autosuggestions 为例：

1. 下载插件

    ```zsh
    cd ~/.oh-my-zsh/custom/plugins/
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
    git clone https://github.com/zsh-users/zsh-autosuggestions
    ```

2. 修改配置文件

    ```zsh
    #找到plugins
    vim ~/.zshrc
    plugins=(
        git
        zsh-autosuggestions
        zsh-syntax-highlighting
    )
    ```

## 字体

如果出现一些奇怪的显示问题，可能是系统中缺少字体。可以通过以下方式安装字体。

```zsh
pacman -S powerline
pacman -S powerline-fonts
pacman -S powerline-vim
```