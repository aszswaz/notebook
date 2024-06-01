# 曾经遇到过的异常

## java.lang.UnsatisfiedLinkError: /home/aszswaz/Downloads/jdk1.8.0_291/jre/lib/i386/libawt_xawt.so: libXrender.so.1: 无法打开共享对象文件: 没有那个文件或目录

这个异常是 linux 系统下发现的，windows 可能也会有对应的异常，异常的详细堆栈

```txt
Exception in thread "main" com.alibaba.excel.exception.ExcelGenerateException: java.lang.UnsatisfiedLinkError: /home/aszswaz/Downloads/jdk1.8.0_291/jre/lib/i386/libawt_xawt.so: libXrender.so.1: 无法打开共享对象文件: 没有那个文件或目录
	at com.alibaba.excel.write.ExcelBuilderImpl.addContent(ExcelBuilderImpl.java:64)
	at com.alibaba.excel.ExcelWriter.write(ExcelWriter.java:161)
	at com.alibaba.excel.ExcelWriter.write(ExcelWriter.java:146)
	at com.alibaba.excel.write.builder.ExcelWriterSheetBuilder.doWrite(ExcelWriterSheetBuilder.java:61)
	at com.zhiweidata.barrage.HuyaBarrageExport.export(HuyaBarrageExport.java:55)
	at com.zhiweidata.barrage.BarrageExport.main(BarrageExport.java:14)
Caused by: java.lang.UnsatisfiedLinkError: /home/aszswaz/Downloads/jdk1.8.0_291/jre/lib/i386/libawt_xawt.so: libXrender.so.1: 无法打开共享对象文件: 没有那个文件或目录
	at java.lang.ClassLoader$NativeLibrary.load(Native Method)
	at java.lang.ClassLoader.loadLibrary0(ClassLoader.java:1934)
	at java.lang.ClassLoader.loadLibrary(ClassLoader.java:1817)
	at java.lang.Runtime.load0(Runtime.java:810)
	at java.lang.System.load(System.java:1086)
	at java.lang.ClassLoader$NativeLibrary.load(Native Method)
	at java.lang.ClassLoader.loadLibrary0(ClassLoader.java:1934)
	at java.lang.ClassLoader.loadLibrary(ClassLoader.java:1838)
	at java.lang.Runtime.loadLibrary0(Runtime.java:871)
	at java.lang.System.loadLibrary(System.java:1122)
	at java.awt.Toolkit$3.run(Toolkit.java:1636)
	at java.awt.Toolkit$3.run(Toolkit.java:1634)
	at java.security.AccessController.doPrivileged(Native Method)
	at java.awt.Toolkit.loadLibraries(Toolkit.java:1633)
	at java.awt.Toolkit.<clinit>(Toolkit.java:1670)
	at java.awt.Font.<clinit>(Font.java:246)
	at java.awt.font.TextLayout.singleFont(TextLayout.java:469)
	at java.awt.font.TextLayout.<init>(TextLayout.java:531)
	at org.apache.poi.ss.util.SheetUtil.getDefaultCharWidth(SheetUtil.java:275)
	at org.apache.poi.xssf.streaming.AutoSizeColumnTracker.<init>(AutoSizeColumnTracker.java:117)
	at org.apache.poi.xssf.streaming.SXSSFSheet.<init>(SXSSFSheet.java:82)
	at org.apache.poi.xssf.streaming.SXSSFWorkbook.createAndRegisterSXSSFSheet(SXSSFWorkbook.java:658)
	at org.apache.poi.xssf.streaming.SXSSFWorkbook.createSheet(SXSSFWorkbook.java:679)
	at org.apache.poi.xssf.streaming.SXSSFWorkbook.createSheet(SXSSFWorkbook.java:90)
	at com.alibaba.excel.util.WorkBookUtil.createSheet(WorkBookUtil.java:66)
	at com.alibaba.excel.context.WriteContextImpl.createSheet(WriteContextImpl.java:196)
	at com.alibaba.excel.context.WriteContextImpl.initSheet(WriteContextImpl.java:173)
	at com.alibaba.excel.context.WriteContextImpl.currentSheet(WriteContextImpl.java:123)
	at com.alibaba.excel.write.ExcelBuilderImpl.addContent(ExcelBuilderImpl.java:53)
	... 5 more
```

在网上找原因，有说是系统中缺少 X11 可视化框架的库 libXrender，需要安装 libXrender。

不过我发现在我的系统中这个库是存在的，并且重新安装也无效。

导致这个异常的实际原因是使用的 JDK 与电脑系统不对应导致的。由于我的粗心，jdk 下载了 x86 也就是i586版本，而我的电脑是 x64 的...

我用这x86版本还使用了挺长时间的，因为开发服务器项目的时候功能一切正常，使用 easyexcel 才出现的问题...

