# 简介

powershell 基本语法

# 函数

无参函数：

```powershell
function Demo {
	echo "Hello World"
}
```

有参函数：

```powershell
function Demo {
	param (
		$Str1,
		$Str2
	)

	Write-Output $Str1
	Write-Output $Str2
}
```

# 模块

powershell 的全局模块保存在 `$env:PSModulePath` 目录下，模块文件的后缀名为 `.psm1`，每个模块都必须有一个文件夹，哪怕这个模块只有一个文件。模块的语法：

```powershell
function Demo {
    ...
}

# 导出模块的函数
Export-ModuleMember -Function Demo
```

```powershell
# 导入模块
$ Import-Module Demo
```

