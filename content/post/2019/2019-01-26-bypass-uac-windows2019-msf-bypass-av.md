---
categories: 内网渗透
date: "2019-01-26T00:00:00Z"
description: 通过Windows 2019 Bypass UAC缺陷，从而绕过Windows Defender获得SYSTEM权限。
title: Windows 2019 Bypass (UAC、Defender) to Metasploit
url: /archivers/2019-01-26/1
---

## 0x00 前言

昨天下午在小密圈看到一篇文章：https://egre55.github.io/system-properties-uac-bypass/

文中指出 `SystemPropertiesAdvanced.exe` 有DLL劫持漏洞，经过分析，在Windows 10下无法复现

之前也做过关于DLL劫持、Bypass UAC的议题：[DLL Hijacking & COM Hijacking ByPass UAC - 议题解读](https://payloads.online/archivers/2018-12-22/1)

在向下阅读前，请先掌握DLL劫持和Bypass UAC的基本知识。 

微信交流群，加我微信：Guest_Killer_0nlis。

## 0x01 Cooolis

Cooolis是我写的一个支持MSF与Cobaltstrike上线的加载器，能够100%绕过绝大部分杀软，包含国内90%以上、Windows Defender等。

之前发出了演示视频，在这里可以看到：[Cobalt Strike - Metasploit Bypass AV](https://payloads.online/archivers/2019-01-21/1)

然后这个操作系统缺陷由于拥有自动权限提升的权限 `autoElevate`属性，我们可以利用它来执行Cooolis，使得Coolis上线的会话同样拥有管理员权限。

关于Bypass UAC的挖掘方法与原理，我的议题已经转化成了视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/1ErymFEn3rg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 0x02 效果演示

Windows 2019中的`C:\Windows\SysWOW64\SystemPropertiesAdvanced.exe`在运行时，会寻找`srrstr.dll`，这个DLL文件并不存在于：


* C:\Windows\SysWOW64\srrstr.dll
* C:\Windows\System\srrstr.dll
* C:\Windows\srrstr.dll
* C:\Windows\SysWOW64\wbem\srrstr.dll
* C:\Windows\SysWOW64\WindowsPowershell\v1.0\srrstr.dll
* C:\Users\<Username>\APPData\Local\Microsoft\WindowsApps\srrstr.dll

在最后它会寻找`C:\Users\<Username>\APPData\Local\Microsoft\WindowsApps\`这个目录，而这个目录的读写是不需要触发UAC获得管理员权限来操作的。

由此，可以利用该缺陷，将Coolis转换成DLL，上传至`C:\Users\<Username>\APPData\Local\Microsoft\WindowsApps\`，紧接着执行SystemPropertiesAdvanced.exe，它会自动将`srrstr.dll`加载至SystemPropertiesAdvanced.exe进程的内存，同样的，我们也就拥有了管理员权限。

在此之前，我有想过在下列模块里做一些优化：

* exploit/windows/local/bypassuac_fodhelper
* exploit/windows/local/bypassuac_injection
* exploit/windows/local/bypassuac_comhijack

我觉得COM劫持的空间还是很大的，并且也一定程度上能够bypass AV。

Demo：
<iframe width="560" height="315" src="https://www.youtube.com/embed/sJvDxh63Ptg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 0x03 总结

UAC、DLL劫持、COM劫持的问题肯定还会有很多、但是以前的轮子到现在拿起来用基本上都会被行为拦截，这就需要掌握原理去自己探索、创造。

系统镜像：`ed2k://|file|cn_windows_server_2019_x64_dvd_4de40f33.iso|5086887936|7DCDDD6B0C60A0D019B6A93D8F2B6D31|/`




