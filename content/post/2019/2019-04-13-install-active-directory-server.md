---
date: "2019-04-13T00:00:00Z"
description: 网上的文章都太复杂了，我就写一个简单、详细的，刚好虚拟机都删了。
title: 最快的方式搭建域环境
url: /archivers/2019-04-13/1
---

## 0x00 自动化搭建

准备环境：

 - Windows 2008 R2 X64
 - Windows 2016
 - Windows 10

注意：安装活动目录服务之前，要确保当前机器已经设置静态IP，并且将DNS首选服务器设置为`127.0.0.1`。

首先我先介绍自动化的方式搭建，后面再介绍手动方式。

在微软官方的手册中，有提到如何使用Powershell去安装活动目录服务：[Install Active Directory Domain Services (Level 100)](https://github.com/MicrosoftDocs/windowsserverdocs/blob/master/WindowsServerDocs/identity/ad-ds/deploy/Install-Active-Directory-Domain-Services--Level-100-.md)

第一步：安装活动目录服务

```powershell
$ Install-Windowsfeature AD-Domain-Services
```

第二步：导入[Addsdeployment](https://docs.microsoft.com/en-us/powershell/module/addsdeployment/?redirectedfrom=MSDN&view=windowsserver2019-ps)模块

```powershell
Import-Module Addsdeployment
```

第三步：调用[Install-ADDSForest](https://github.com/MicrosoftDocs/windowsserverdocs/blob/master/WindowsServerDocs/identity/ad-ds/deploy/Install-Active-Directory-Domain-Services--Level-100-.md)设置域的信息执行安装

```powershell
Install-ADDSForest -CreateDnsDelegation:$false -DomainMode "7" -DomainName "PAYLOADS.ONLINE" -DomainNetbiosName "PAYLOADS" -ForestMode "7" -InstallDns:$true -NoRebootOnCompletion:$false -Force:$true
```

Install-ADDSForest 的参数解释：

* CreateDnsDelegation 是否创建引用与域控制器一起安装的新DNS服务器的DNS委派。 仅对 Active Directory“集成 DNS 有效。默认值是根据环境自动计算的。
* DomainMode 指定创建新林时第一个域的域功能级别。
    - Windows Server 2003: 2 or Win2003
    - Windows Server 2008: 3 or Win2008
    - Windows Server 2008 R2: 4 or Win2008R2
    - Windows Server 2012: 5 or Win2012
    - Windows Server 2012 R2: 6 or Win2012R2
    - Windows Server 2016: 7 or WinThreshold
* DomainName 域名
* DomainNetbiosName 域的Netbios名称
* ForestMode 与 DomainMode 等同，该选项主要用于尽可能的自动化
* InstallDns 是否安装DNS服务
* NoRebootOnCompletion 不重启完成安装


总结：

```powershell
Install-Windowsfeature AD-Domain-Services
Import-Module Addsdeployment
Install-ADDSForest -CreateDnsDelegation:$false -DomainMode "7" -DomainName "PAYLOADS.ONLINE" -DomainNetbiosName "PAYLOADS" -ForestMode "7" -InstallDns:$true -NoRebootOnCompletion:$false -Force:$true
```

## 0x01 配置静态IP

![2019-04-13-00-08-08](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/26e63f2b671f2fbd7f51aa72d7a6dfbd.png)

设置一个DNS指向本机，因为它后面是一个域控的角色。

## 0x02 安装活动目录角色

![2019-04-13-00-08-34](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/365333da23ee51b37728451518d75b89.png)

点击“添加角色”：

![2019-04-13-00-08-45](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/ccf84c374fc5dc2a445ebb1758b5de2f.png)

必须具备两点：

- Administrator强密码
- **配置静态IP**

单击下一步：

![2019-04-13-00-09-17](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/5b6b4671a06117a11b4ff528c7ac8368.png)


勾选“Active Directory 域服务”，然后下一步：

![2019-04-13-00-09-37](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/f319b018f4d823bed5e8b82f9b0ed966.png)

**这里表明，后续会有安装DNS服务的过程，所以网上要先安装DNS的文章会导致域搭建失败，因为安装向导会创建一些DNS记录，以及查找域。**

单击“下一步”：

![2019-04-13-00-09-59](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/3b05de49e016e706a19d812fad64246e.png)

点击“安装”。

![2019-04-13-00-10-08](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/c5e48bb092c098aa692e59bffbf9b378.png)

一分钟不到就可以安装完毕，但是域的搭建还没有完成。

## 0x03 安装向导

打开“服务器管理器”，找到Active Directory安装向导：

![2019-04-13-00-10-32](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/3e37818955594ecd70ce60a1fae7f0cd.png)


点击“dcpromo.exe”，就可以进入向导：

![2019-04-13-00-10-42](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/af4a75fa453e9f91521dff65438167fa.png)

好奇的可以看看**高级模式**，为了快速搭建，就直接下一步：

![2019-04-13-00-10-57](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/20a258eaf2dbc58b7bc501cc4d6041b4.png)

这里说一下，**“Windows NT 4.0兼容的加密算法”**，指的是低版本的SMBv1客户端，在进行NTLM网络认证的过程中采用的算法较为简单，能够轻易破解；其次，未升级到SMB v2的服务器可能会受到Pass The Hash的技术手段利用、MS17-010等漏洞的危害，为了后续的学习，我们直接选择下一步，暂时不去做加固。

![2019-04-13-00-11-20](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/641152179f5aeb6c09f77c668ed9716f.png)

目前我们只有一个域，所以直接选择第二项：“在新林中新建域”，在有域的情况下，可以将域纳入“林”中。多个域称之为“林”。

![2019-04-13-00-11-29](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/8e1c8d90edec62c84cecb86e2a274205.png)

设置“域名”：

![2019-04-13-00-11-39](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/71bd1df09e082954bec46f1bb46e10bf.png)

这里必须符合DNS对域名的名称标准规范，如我就将域名定为：payloads.online：

![2019-04-13-00-11-49](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/f363012f2f7cff8ab645a9d70ad9384c.png)

点击下一步会有一个检查，等待即可，这是为了防止域冲突：

![2019-04-13-00-11-58](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/a1c81b795243426315150fc332f0c17b.png)

选择林功能级别：

![2019-04-13-00-12-09](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/3f0027905efb8e619b8a67434698497a.png)

为了保持向下兼容，我们选择Windows 2003的林功能级别，如果选择2008的，未来加入的域控制器必须是Windows 2008。

![2019-04-13-00-12-18](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2e19045c55d04340f94474307c8a73ba.png)

单击“下一步”，选择域功能级别，上面已经解释了，是为了兼容性，我们也选择2003：

![2019-04-13-00-12-29](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/f3a65c2b2303d46dcfe69fb6331606a9.png)

单击下一步，此时进入DNS服务器的安装过程：

![2019-04-13-00-12-42](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/c7a68d183627bbe7f0ff57c1111c6159.png)

这里是由于在“payloads.online”中没有委派关系，所以我们自建：

![2019-04-13-00-12-51](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/e64d3210d9f9e27eb62fcaae0ef3f85a.png)

单击“是”，进入选择数据库、日志、SYSOL的存放路径，这三个东西在后续的红队目录里都会介绍攻击手段以及防御方法：

![2019-04-13-00-13-01](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/a263b2fc68c23d8ab71dbe07e4c99d37.png)

默认选择“下一步”，设置DC管理员(Administrator)密码：

![2019-04-13-00-13-13](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/440016343d5edb21dd1669ce23479579.png)

单击“下一步”，可以看到刚才的设置:

![2019-04-13-00-13-24](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/b1511b6b6853d1edb3835a07ef34e7f7.png)

这里你也可以导出设置，用于下次安装的时候自动配置。单击“下一步”就可以安装了。

![2019-04-13-00-13-34](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/09e43f34b991f0b69a98db51c3cd5868.png)

勾选“重新启动”，去喝杯茶，回来它就安装完毕了！

安装完毕后，会默认使用域内账户Administrator登录：
![2019-04-13-00-13-47](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/1c88530488a4be1d40c5aaabaa8b3639.png)

登录进入后，会弹出“初始化配置任务”窗口，这里有关于本机的信息：

![2019-04-13-00-13-57](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/9a36433780d55e0b5b63b2221307c546.png)

出现域，就代表搭建完成了，域控的IP是：192.168.117.169，域名称是：payloads.online。

## 0x04 加入域

打开一个Windows，这里我用我的Windows 10来举例：

![2019-04-13-00-14-19](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/17a4b3d3e990a8f42d8198842a897106.png)

首先要确保能与域控进行通信，然后将当前主机的DNS服务器设置为DC的IP：

![2019-04-13-00-14-27](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/4dd178f5c9b85b6c9c5735e50c26aedd.png)

![2019-04-13-00-14-33](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/017e5ba2b3e1bbeb81755e26efe63398.png)

紧接着找到系统属性：

![2019-04-13-00-14-41](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/cd7755277ce2a65c0feee6bd18def753.png)

单击“网络”：

![2019-04-13-00-14-52](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/0665f6a7bd37146669424bb9caacd85a.png)

默认“下一步”：

![2019-04-13-00-15-03](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/d193fbdaec48f4d2a25ce157ea0de5c2.png)

既然加域嘛，肯定选择带有域的，单击“下一步”：

![2019-04-13-00-15-34](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/a588ba53566bf0a451ee15859acc2b19.png)

这个时候你需要在**域控**上创建一个用户：

![2019-04-13-00-15-49](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/51ed3396984a8ad07629660ae53e371a.png)

主要填写“登录名”就可以了


![2019-04-13-00-16-05](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/c6c1e1af3b34a75a93909bbb440e819a.png)

单击“下一步”，设置密码：

![2019-04-13-00-16-14](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/1f2973cd90e7d210f901df17d874310d.png)

下一步，创建完成。

此时回到Windows 10，填写好这个创建好的用户：

![2019-04-13-00-16-28](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/af25f624abf1628068dab8769121f566.png)

![2019-04-13-00-16-33](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/53779fc5b9daee93e463eefff30b26b7.png)

单击“下一步”：

![2019-04-13-00-16-45](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2eaae9ed18bfd9d07e7c8911d5a4ed88.png)

这里授予权限时，设置为“Users”，不然很多东西操作不了。

![2019-04-13-00-16-55](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/1b11e7508570d66900581338b824b84f.png)

单击“完成”，重启计算机。

![2019-04-13-00-17-05](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/27382fbf3f5b075d1eda181e4a047fc0.png)

![2019-04-13-00-17-10](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/56f5b5e84aa16c79fc701bd4ef93ff00.png)

此时，客户机既能上网，也能处于域环境下。