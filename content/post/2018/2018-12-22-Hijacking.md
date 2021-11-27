---
categories: 内网渗透
date: "2018-12-22T00:00:00Z"
description: 将之前都学习到的知识进行汇总，顺便把分享转化成文章
title: DLL Hijacking & COM Hijacking ByPass UAC - 议题解读
url: /archivers/2018-12-22/1
---


> 在线地址：[https://www.bilibili.com/video/av51718274/](https://www.bilibili.com/video/av51718274/)


<iframe src="//player.bilibili.com/player.html?aid=51718274&page=1&cid" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="95%" height="450"> </iframe>




## 0x00 前言

![][0X00]

本文章只是方便阅读PPT，对于深入的去理解没有太大帮助，只是做个知识索引。

目录如下：

* 何为劫持
* DLL是什么
* DLL加载的过程
* DLL劫持的原理
* 实现一个DLL劫持 - DLL Main
* 什么是COM
* 应用程序与COM注册表的关系
* COM组件加载的过程
* COM组件劫持的原理
* 实现一个COM组件劫持
* UAC简介
* ByPASS UAC的几种方式
* ByPASS UAC原理
* ByPASS UAC演示
* 挖掘ByPASS UAC的方法

**PPT共享在文末的小密圈中了**

## 0x01 何为劫持

即：“在正常事物发生之前进行一个旁路操作”

## 0x02 DLL是什么

DLL(Dynamic Link Library)文件为动态链接库文件，又称“应用程序拓展”，是软件文件类型。 在Windows中，许多应用程序并不是一个完整的可执行文件，它们被分割成一些相对独立的动态链接库，即DLL文件，放置于系统中。

![][0X01]

在Windows平台下，我们使用的应用程序中的功能其实大多都很相似，窗口调用窗口的模块，分配内存调用内存管理的模块，文件操作调用IO模块，这些模块在Windows里的具体表现就是DLL文件。

## 0X03 DLL的加载过程

* 1.程序所在目录
* 2.程序加载目录（SetCurrentDirectory）
* 3.系统目录即 SYSTEM32 目录
* 4.16位系统目录即 SYSTEM 目录
* 5.Windows目录
* 6.PATH环境变量中列出的目录

PS：Windows操作系统通过“DLL路径搜索目录顺序”和“Know DLLs注册表项”的机制来确定应用程序所要调用的DLL的路径，之后，应用程序就将DLL载入了自己的内存空间，执行相应的函数功能。

注册表路径：HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\KnownDLLs

![][0x02]

### DLL的加载过程 – Know DLLs注册表项

Know DLLs注册表项里的DLL列表在应用程序运行后就已经加入到了内核空间中，多个进程公用这些模块，必须具有非常高的权限才能修改。

![][0x03]

### DLL的加载过程 – Process Monitor

Process Monitor是Windows的高级监视工具，可显示实时文件系统，注册表和进程/线程活动。 

它结合了两个传统Sysinternals实用程序Filemon和Regmon的功能，并添加了大量增强功能，包括丰富和非破坏性过滤，全面的事件属性，如会话ID和用户名，可靠的流程信息，带有集成符号支持的完整线程堆栈 对于每个操作，同时记录到文件等等。 其独特的强大功能将使Process Monitor成为系统故障排除和恶意软件搜索工具包的核心实用程序。


下载地址： https://docs.microsoft.com/zh-cn/sysinternals/downloads/process-utilities

### DLL的加载过程 – Process Monitor Filter

Process Monitor Filter是用于过滤应用程序输出的一部分功能，可以使得进程事件结果成为你想要的内容。

常用过滤条件：Process Name，Path，Result


![][0x04]

## 0x04 DLL劫持的原理

DLL寻找过程：

* 1.程序所在目录
* 2.系统目录即 SYSTEM32 目录
* 3.16位系统目录即 SYSTEM 目录
* 4.Windows目录
* 5.加载 DLL 时所在的当前目录
* 6.PATH环境变量中列出的目录

**如果在应用程序寻找成功之前，将我们自己创造的DLL文件放入寻找目录中，那么应用程序就会加载我们自己的DLL？**

## 0x05 实现一个DLL劫持 – DLL Main

```c
BOOL WINAPI DllMain( 
// 指向自身的句柄
 _In_ HINSTANCE hinstDLL, 
// 调用原因
 _In_ DWORD     fdwReason,
// 加载方式（隐式、显式）
  _In_ LPVOID    lpvReserved
);
```

|载入状态 | 值 | 说明 |
| ---- | ---- | --- |
| DLL_PROCESS_ATTACH | 1 | 被进程装载时 |
| DLL_PROCESS_DETACH | 0 | 被进程卸载时 |
| DLL_THREAD_ATTACH | 2 | 被线程装载时 |
| DLL_THREAD_DETACH | 3 | 被线程卸载时 |


### 实现一个DLL劫持 – DLL Main

```c
BOOL APIENTRY DllMain(HANDLE hModule, DWORD ul_reason_for_call, LPVOID lpReserved){
    printf("hModule.%p lpReserved.%p \n", hModule, lpReserved);   switch (ul_reason_for_call)
    {
        case DLL_PROCESS_ATTACH:
        printf("Process attach. \n");
        break;
        case DLL_PROCESS_DETACH:
        printf("Process detach. \n");
        break;
        case DLL_THREAD_ATTACH:
        printf("Thread attach. \n");
        break;
        case DLL_THREAD_DETACH:
        printf("Thread detach. \n");
        break;
    }
return (TRUE);
}
```


Q：如果应用程序调用的DLL没有DLLMain函数呢？

A：这需要实现指定导出函数，然后等待导出函数执行完毕再Load真实DLL。


### 案例

参考：

* http://payloads.online/archivers/2018-06-09/1
* http://payloads.online/archivers/2018-08-15/1
* https://docs.microsoft.com/en-us/windows/desktop/dlls/dllmain
* https://baike.baidu.com/item/dll%E5%8A%AB%E6%8C%81/223198

### 自动化测试

Rattler：https://github.com/sensepost/rattler

![][0x05]

Robber：https://github.com/MojtabaTajik/Robber

![][0x06]

## 0x06 什么是COM

COM是Component Object Model （组件对象模型）的缩写。
COM是微软公司为了计算机工业的软件生产更加符合人类的行为方式开发的一种新的软件开发技术。在COM构架下，人们可以开发出各种各样的功能专一的组件，然后将它们按照需要组合起来，构成复杂的应用系统。

## 0x07 应用程序与COM注册表的关系

首先需要介绍一下注册表，注册表可以理解为一个树状结构的数据库，它具有一些特殊的[数据类型](https://docs.microsoft.com/en-us/windows/desktop/sysinfo/registry-value-types)用来存储一些数据满足应用程序的需要。

https://docs.microsoft.com/en-us/windows/desktop/sysinfo/about-the-registry

| 名称 | 作用 |
| --- | --- |
| HKEY_CLASSES_ROOT | 用于存储一些文档类型、类、类的关联属性。 |
|HKEY_CURRENT_CONFIG | 用户存储有关本地计算机系统的当前硬件配置文件信息。|
|HKEY_CURRENT_USER |  用于存储当前用户配置项。 |
|HKEY_CURRENT_USER_LOCAL_SETTINGS | 用于存储当前用户对计算机的配置项。|
| HKEY_LOCAL_MACHINE| 用于存储当前用户物理状态。 |
| HKEY_USERS | 用于存储新用户的默认配置项。 |

[HKEY_CLASSES_ROOT](https://docs.microsoft.com/en-us/windows/desktop/sysinfo/hkey-classes-root-key) = HKEY_LOCAL_MACHINE + HKEY_CURRENT_USER


### 应用程序与COM注册表的关系 - CLSID

首先需要介绍一下CLSID(Class Identifier)，中文翻译为：“全局唯一标识符”。


CLSID是指Windows系统对于不同的应用程序，文件类型，OLE对象，特殊文件夹以及各种系统组件分配的一个唯一表示它的ID代码，用于对其身份的标识和与其他对象进行区分。

![][0x07]

### 应用程序与COM注册表的关系 - 使用COM组件

按下Ctrl+R打开运行窗口，键入 
::{20D04FE0-3AEA-1069-A2D8-08002B30309D} 即可打开“我的电脑”

::{645FF040-5081-101B-9F08-00AA002F954E} 回收站

```c

CLSID结构体：
typedef struct _GUID {
    DWORD Data1; // 随机数
    WORD Data2; // 和时间相关
    WORD Data3; // 和时间相关
    BYTE Data4[8]; // 和网卡MAC相关
    } GUID;
    typedef GUID CLSID;  // 组件ID
    typedef GUID IID;    // 接口ID
```

### 应用程序与COM注册表的关系 – CLSID Key

|Key Name | 说明 |
| -- | -- |
| InprocHandler32 | 指定应用程序使用的自定义处理程序 |
| InprocServer32 | 注册32位进程所需要的模块、线程属性配置 |

```
HKEY_LOCAL_MACHINE\SOFTWARE\Classes\CLSID   
 	{CLSID}       
	InprocServer32          (Default) = path          
	ThreadingModel 	    = value
```

常见CLSID Key：

More： https://docs.microsoft.com/zh-cn/windows/desktop/com/clsid-key-hklm

## 0x08 COM组件的加载过程

* 1.HKCU\Software\Classes\CLSID
* 2.HKCR\CLSID
* 3.HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\ShellCompatibility\Objects\

![][0x08]

## 0x09 COM组件的劫持原理

当进程寻找COM组件时，首先会寻找：

```
HKCU\Software\Classes\CLSID
```

我们直接在CLSID下新建一个对象ID，就能够劫持某个进程或多个进程。

与DLL劫持原理相近，但是COM组件的劫持可以拓展很多东西，劫持的目标不一定是一个进程，劫持所需的文件不一定是一个DLL，它可以是一个.com文件、二进制PE文件、DLL文件，劫持的目标也可以是一个Windows API。


## 0x10 实现一个COM组件劫持

MSF:/opt/metasploit-framework/embedded/framework/modules/exploits/windows/local/bypassuac_comhijack.rb

<video src="../../../static/images/3fc3f9a2-4f5f-11ec-aaeb-00d861bf4abb.mp4" controls="controls" width="500px">
哎呀~ 换个浏览器试试吧！
</video>

### 实现一个COM组件劫持 – 分析

![][0x09]

bypassuac_comhijack模块有两个方法：

* Event Viewer
* Computer Managment

![][0x10]

经过分析，该模块是通过更改注册表，然后创建进程实现的bypassUAC。


## 0x11 UAC简介

用户帐户控制（User Account Control，简写作UAC)是微软公司在其Windows Vista及更高版本操作系统中采用的一种控制机制。其原理是通知用户是否对应用程序使用硬盘驱动器和系统文件授权，以达到帮助阻止恶意程序（有时也称为“恶意软件”）损坏系统的效果。

![][0x11]


UAC需要授权的动作包括：

* 1.配置Windows Update
* 2.增加或删除用户账户
* 3.改变用户的账户类型
* 4.改变UAC设置
* 6.安装ActiveX
* 6.安装或移除程序
* 7.安装设备驱动程序
* 8.设置家长控制
* 9.将文件移动或复制到Program Files或Windows目录
* 10.查看其他用户文件夹

## 0x12 ByPass UAC的几种方式

* 1.白名单提权机制 - autoElevate
* 2.DLL 劫持
* 3.Windows 自身漏洞提权
* 4.远程注入
* 5.COM 接口技术

## 0x13 ByPass UAC的原理 - 自动提升（autoElevate）

具有autoElevate属性True的应用程序会在启动时自动提升权限，而这些应用程序往往都具备微软的签名，微软认为它是可信的。故此，在该程序启动时，将会以管理员身份启动，假设我们通过COM技术或者DLL劫持该应用程序，也能够获得管理员权限，但是，上述两种技术比较苛刻：

* 1、可能需要高权限才能够完成
* 2、分析成本较高


## 0x14 Bypass UAC演示 - fodhelper.exe

Path：C:\Windows\system32\fodhelper.exe

REG：HKEY_CURRENT_USER\Software\Classes\ms-settings\shell\open\command

![][0x12]

```
reg add HKEY_CURRENT_USER\Software\Classes\ms-settings\shell\open\command /d C:\Windows\System32\cmd.exe /f
reg add HKEY_CURRENT_USER\Software\Classes\ms-settings\shell\open\command /v DelegateExecute /t REG_DWORD /d 00000000 /f
```

<video src="../../../static/images/4349f414-4f5f-11ec-8821-00d861bf4abb.mp4" controls="controls" width="500px">
哎呀~ 换个浏览器试试吧！
</video>

### ByPass UAC演示 - fodhelper.exe（自动化分析）

* fodhelper.exe
* eventvwr.exe

配置项：

![][0x14]

调用进程：


![][0x15]

利用过程：

![][0x16]

## 0x15 挖掘ByPass UAC的方法

### 寻找自动提升权限的应用程序 – Sigcheck.exe


Strings与Sigcheck，这两款工具目前均由微软官方提供，主要用于查看文件相关信息。

下载地址：https://docs.microsoft.com/zh-cn/sysinternals/downloads/

* [1]：strings.exe -s *.exe \| findstr /i autoelevate
* [2]：sigcheck.exe -m C:\Windows\System32\cmd.exe

### 寻找自动提升权限的应用程序 Strings.exe

最好将string.exe放入C:\Windows\System32

![][0x17]

### 寻找自动提升权限的应用程序 Sigcheck.exe

使用Python脚本调用：

https://gist.githubusercontent.com/riyazwalikar/cd31948f247b96d472b97be2a36030b4/raw/a7379c4f5c015e46d65703ee73e674b1c4315810/findelevate.py

![][0x18]

## 0x16 参考

* https://www.gdatasoftware.com/blog/2014/10/23941-com-object-hijacking-the-discreet-way-of-persistence
* https://docs.microsoft.com/zh-cn/windows/desktop/com/clsid-key-hklm
* https://offsec.provadys.com/UAC-bypass-dotnet.html?utm_source=tuicool&utm_medium=referral
* https://github.com/FuzzySecurity/PowerShell-Suite/tree/master/Bypass-UAC
* https://3gstudent.github.io/3gstudent.github.io/Use-CLR-to-bypass-UAC/
* https://enigma0x3.net/2016/05/25/userland-persistence-with-scheduled-tasks-and-com-handler-hijacking/
* https://www.cyberbit.com/blog/endpoint-security/com-hijacking-windows-overlooked-security-vulnerability/
* https://technet.microsoft.com/zh-cn/library/2009.07.uac.aspx
* https://gist.githubusercontent.com/riyazwalikar/cd31948f247b96d472b97be2a36030b4/raw/a7379c4f5c015e46d65703ee73e674b1c4315810/findelevate.py
* https://github.com/rootm0s/WinPwnage/blob/master/functions/uac_fodhelper.py
* https://github.com/hfiref0x/UACME/tree/master/Source
* https://github.com/juliourena/plaintext/blob/master/CSharp%20Tools/UAC%20Bypass/uac_bypass_fodhelper.cs
* https://docs.microsoft.com/zh-cn/sysinternals/downloads/strings
* https://docs.microsoft.com/zh-cn/sysinternals/downloads/sigcheck

![][0x19]

![][0x20]

## 0x17 关于“我的安全成长口袋”

本圈主要用来记录自己技术生涯中短小的收获和知识的备忘，还有就是一些做安全服务工作中的感受。

方向可能会在不断改变：渗透测试、CTF、高效生活、应急响应、安全建设、读后感、代码审计、漏洞复现、运维杂项等等… 我暂时关闭了发帖权限、分享权限； 因为我有一个小的朋友圈，经常讨论一些技术，会在这里用评论交流。

关闭发帖权限是因为不指望加入的朋友分享，我发表的都是我的收获，不想因为别人影响自己的东西，妨碍搜索和温习。

扫码可免费加入：

![](../../../static/images/44952636-4f5f-11ec-8c41-00d861bf4abb.png)


[0x00]:../../../static/images/44d01a48-4f5f-11ec-8721-00d861bf4abb.png
[0x01]:../../../static/images/4516d88e-4f5f-11ec-971e-00d861bf4abb.png
[0x02]:../../../static/images/456a6e72-4f5f-11ec-b36a-00d861bf4abb.png
[0x03]:../../../static/images/45b927d8-4f5f-11ec-9b6b-00d861bf4abb.png
[0x04]:../../../static/images/46146f58-4f5f-11ec-89a8-00d861bf4abb.png
[0x05]:../../../static/images/4660fe7c-4f5f-11ec-8fcf-00d861bf4abb.png
[0x06]:../../../static/images/46b0698a-4f5f-11ec-a6f3-00d861bf4abb.png
[0x07]:../../../static/images/46eebd16-4f5f-11ec-ab2c-00d861bf4abb.png
[0x08]:../../../static/images/473132a4-4f5f-11ec-ad42-00d861bf4abb.png
[0x09]:../../../static/images/4776c77e-4f5f-11ec-8dcc-00d861bf4abb.png
[0x10]:../../../static/images/47b474ca-4f5f-11ec-bf64-00d861bf4abb.png
[0x11]:../../../static/images/480733ae-4f5f-11ec-825d-00d861bf4abb.png
[0x12]:../../../static/images/483fee7e-4f5f-11ec-b5bb-00d861bf4abb.png
[0x13]:../../../static/images/4881b11a-4f5f-11ec-96f0-00d861bf4abb.png
[0x14]:../../../static/images/48c3f25a-4f5f-11ec-bcfc-00d861bf4abb.png
[0x15]:../../../static/images/49031fb6-4f5f-11ec-afdd-00d861bf4abb.png
[0x16]:../../../static/images/496370dc-4f5f-11ec-8fdc-00d861bf4abb.png
[0x17]:../../../static/images/49ab6e96-4f5f-11ec-9486-00d861bf4abb.png
[0x18]:../../../static/images/4a14bf54-4f5f-11ec-99d6-00d861bf4abb.png
[0x19]:../../../static/images/4a57b462-4f5f-11ec-9003-00d861bf4abb.png
[0x20]:../../../static/images/4aad6628-4f5f-11ec-bafe-00d861bf4abb.png

