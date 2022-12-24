# 简介

设置 Manjaro 的系统主题

# 主题

安装 numix cicle 图标

```bash
$ yay -S numix-circle-icon-theme-git
```

安装 Latte dock 软件

```bash
$ sudo pacman -S latte-dock
```

在 latte dock 软件启动后,右键“布局” -> “配置”中选择下载,可以联网下载 macOS 主题,然后选择应用即可.

同理,在系统设置中,可以从互联网上下载自己喜欢的主题,图标,开机登录界面,锁屏等.

# 字体

在不修改字体渲染的情况下,各种软件的中文字体会大小不一,包括在使用 chrome 浏览网站时.所以需要更改默认的字体渲染,在尝试微软雅黑等字体后,个人觉得思源黑体比较适合

## 安装思源黑体

```bash
# 文泉驿黑
$ sudo pacman -S wqy-bitmapfont wqy-microhei wqy-microhei-lite wqy-zenhei
# 思源字体
$ sudo pacman -S noto-fonts-cjk adobe-source-han-sans-cn-fonts adobe-source-han-serif-cn-fonts
```

## 使用 Windows 系统中的字体

复制 Windows 下的字体至 /usr/share/fonts 文件夹下

参考链接:
https://wiki.archlinux.org/index.php/Microsoft_fonts

[中文版](https://wiki.archlinux.org/index.php/Microsoft_fonts_(简体中文)

修改字体渲染文件

1. 在 /etc/fonts 下新建 local.conf 文件

```xml
<?xml version="1.0"?>
<fontconfig>
	<match target="font">
		<edit name="autohint">
			<bool>false</bool>
		</edit>
		<edit name="hinting">
			<bool>false</bool>
		</edit>
		<edit name="hintstyle">
			<const>hintnone</const>
		</edit>
	</match>
	<match target="pattern">
		<test qual="any" name="family">
			<string>sans</string>
		</test>
		<edit name="family" mode="assign" binding="same">
			<string>Yahei Mono</string>
		</edit>
	</match>
	<match target="pattern">
		<test qual="any" name="family">
			<string>serif</string>
		</test>
		<edit name="family" mode="assign" binding="same">
			<string>Source Han Sans CN</string>
		</edit>
	</match>
	<match target="pattern">
		<test qual="any" name="family">
			<string>sans serif</string>
		</test>
		<edit name="family" mode="assign" binding="same">
			<string>Source Han Sans CN</string>
		</edit>
	</match>
	<match target="pattern">
		<test qual="any" name="family">
			<string>sans-serif</string>
		</test>
		<edit name="family" mode="assign" binding="same">
			<string>Source Han Sans CN</string>
		</edit>
	</match>
	<match target="pattern">
		<test qual="any" name="family">
			<string>monospace</string>
		</test>
		<edit name="family" mode="assign" binding="same">
			<string>Source Han Sans CN</string>
		</edit>
	</match>
</fontconfig>
```

