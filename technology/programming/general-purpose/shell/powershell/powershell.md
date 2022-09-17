# Powershell

感觉 Powershell 的语法太过繁杂，即想支持 Unix shell 的语法，又想兼容 cmd 的命令，还添加了一些专有特性。因此这里簿不记录 Powershell 的整个语言体系，仅记录我曾经使用过的语法和指令。

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

## 其他

```powershell
# 查看指令帮助信息，如 Get-Help  New-Service，第一次使用会从服务器下载帮助文档
$ Get-Help ${command}
# 获取指令的程序路径信息
$ Get-Command ${command}
```



