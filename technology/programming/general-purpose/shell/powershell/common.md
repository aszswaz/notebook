# 简介

powershell 常用的指令与函数

## 服务管理

```powershell
# 创建服务
$ New-Service –Name ${name} –DisplayName ${name} –BinaryPathName “D:\demo.exe” –StartupType Automatic
# 获取服务信息
$ Get-Service -Name ${name}
# 或者
$ Get-Service -DisplayName ${name}
# 启动服务
$ Start-Service -Name ${name}
# 停止服务
$ Stop-Service -Name ${name}
# 删除服务，Remove-Service 命令仅用于 powershell 6 以及更高版本，建议还是使用 sc.exe delete，powershell 有一个 sc 的指令别名，为了避免混淆，一定要输入 sc.exe
# Remove-Service -Name ${name}
$ sc.exe delete ${name}
```

# 环境变量

```powershell
# 打印所有环境变量
$ Get-ChildItem env:
$ ls env:
# 打印指定的环境变量
$ $env:Path
# 使用 System.Environment 类提供的方法读取环境变量
$ [Environment]::GetEnvironmentVariable('Demo')

# 更新环境变量，只对当前 shell 有效
$ $env:Demo = "Hello World"
$ $env:Demo += "Hello World"
# 使用 System.Environment 类提供的方法修改环境变量
$ [Environment]::SetEnvironmentVariable('Demo','Hello World')

# 删除环境变量。环境变量不能是 $null 或者空字符串
$ $env:Demo = ""
$ $env:Demo = $null
$ [Environment]::SetEnvironmentVariable('Demo', $null)

# 更新或删除环境变量，并且永久有效
# 第三个参数有两个值：User 和 Machine
# User: 修改用户环境变量
# Machine: 修改系统环境变量，需要 root 权限
$ [Environment]::SetEnvironmentVariable('Demo', 'Hello World', 'User')
$ [Environment]::SetEnvironmentVariable('Demo', $null, 'User')
```

# 配置 powershell

这些配置是直接修改注册表的，因此永久有效，但是修改注册表需要 root 权限。

```powershell
# 设置外部脚本的执行策略
# RemoteSigned：远程下载的脚本需要数字签名才可以执行，本地的脚本可以直接执行，默认是禁止执行外部脚本。
# AllSigned：本地和远程的脚本都需要数字签名才可以执行
$ Set-ExecutionPolicy RemoteSigned
```

## 其他

```powershell
# 查看指令帮助信息，如 Get-Help  New-Service，第一次使用会从服务器下载帮助文档
$ Get-Help ${command}
# 获取指令的程序路径信息
$ Get-Command ${command}
# 导入模块，在删除模块之前，同一个模块只能被导入一次
$ Import-Module .\demo.ps1
# 删除模块
$ Remove-Module demo
# 删除函数
$ Remove-Item -Path FUnction:\Demo
```



