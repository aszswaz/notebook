# Introduction

Software installation documentation for wine 7.

Install wine 7.

```bash
$ sudo pacman wine winetricks
```

# WeChat

Run winecfg to configure wine。

```bash
$ winecfg
```

A GUI window will appear. Because pure wine 7 does not support system tray function, we need to enable virtual desktop of wine . To do this : switch to the Graphics tab, enable "Emulate a virtual desktop", and set the "Desktop size" to 1600 X 1000.

Running WeChat requires the registry function of the windows operating system, therefore, we need to install riched.dll. Switch to the "Liraries" tab to install the required dependencies. The higher the version the better.

Finally, go to the [WeChat offcial website](https://pc.weixin.qq.com/) to download the installation package, and then use wine to execute the installation package.

```bash
$ wine WeChat.exe
```

