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

![2019-04-13-00-08-08](https://images.payloads.online/615cc06c-4f5f-11ec-9a77-00d861bf4abb.png)

设置一个DNS指向本机，因为它后面是一个域控的角色。

## 0x02 安装活动目录角色

![2019-04-13-00-08-34](https://images.payloads.online/61a34de8-4f5f-11ec-a907-00d861bf4abb.png)

点击“添加角色”：

![2019-04-13-00-08-45](https://images.payloads.online/61ddd828-4f5f-11ec-bf8c-00d861bf4abb.png)

必须具备两点：

- Administrator强密码
- **配置静态IP**

单击下一步：

![2019-04-13-00-09-17](https://images.payloads.online/622438f4-4f5f-11ec-85d8-00d861bf4abb.png)


勾选“Active Directory 域服务”，然后下一步：

![2019-04-13-00-09-37](https://images.payloads.online/6262626e-4f5f-11ec-882a-00d861bf4abb.png)

**这里表明，后续会有安装DNS服务的过程，所以网上要先安装DNS的文章会导致域搭建失败，因为安装向导会创建一些DNS记录，以及查找域。**

单击“下一步”：

![2019-04-13-00-09-59](https://images.payloads.online/62a4d0f4-4f5f-11ec-a5c5-00d861bf4abb.png)

点击“安装”。

![2019-04-13-00-10-08](https://images.payloads.online/62ddc2f6-4f5f-11ec-9b7f-00d861bf4abb.png)

一分钟不到就可以安装完毕，但是域的搭建还没有完成。

## 0x03 安装向导

打开“服务器管理器”，找到Active Directory安装向导：

![2019-04-13-00-10-32](https://images.payloads.online/633ce394-4f5f-11ec-ac18-00d861bf4abb.png)


点击“dcpromo.exe”，就可以进入向导：

![2019-04-13-00-10-42](https://images.payloads.online/637b65d8-4f5f-11ec-b082-00d861bf4abb.png)

好奇的可以看看**高级模式**，为了快速搭建，就直接下一步：

![2019-04-13-00-10-57](https://images.payloads.online/63ccbc30-4f5f-11ec-a9c2-00d861bf4abb.png)

这里说一下，**“Windows NT 4.0兼容的加密算法”**，指的是低版本的SMBv1客户端，在进行NTLM网络认证的过程中采用的算法较为简单，能够轻易破解；其次，未升级到SMB v2的服务器可能会受到Pass The Hash的技术手段利用、MS17-010等漏洞的危害，为了后续的学习，我们直接选择下一步，暂时不去做加固。

![2019-04-13-00-11-20](https://images.payloads.online/64163dba-4f5f-11ec-9091-00d861bf4abb.png)

目前我们只有一个域，所以直接选择第二项：“在新林中新建域”，在有域的情况下，可以将域纳入“林”中。多个域称之为“林”。

![2019-04-13-00-11-29](https://images.payloads.online/6452e4e0-4f5f-11ec-a417-00d861bf4abb.png)

设置“域名”：

![2019-04-13-00-11-39](https://images.payloads.online/64b93e5c-4f5f-11ec-8938-00d861bf4abb.png)

这里必须符合DNS对域名的名称标准规范，如我就将域名定为：payloads.online：

![2019-04-13-00-11-49](https://images.payloads.online/64fa5c0c-4f5f-11ec-8582-00d861bf4abb.png)

点击下一步会有一个检查，等待即可，这是为了防止域冲突：

![2019-04-13-00-11-58](https://images.payloads.online/6531e56e-4f5f-11ec-ab47-00d861bf4abb.png)

选择林功能级别：

![2019-04-13-00-12-09](https://images.payloads.online/656de2c6-4f5f-11ec-84d0-00d861bf4abb.png)

为了保持向下兼容，我们选择Windows 2003的林功能级别，如果选择2008的，未来加入的域控制器必须是Windows 2008。

![2019-04-13-00-12-18](https://images.payloads.online/65b51862-4f5f-11ec-8394-00d861bf4abb.png)

单击“下一步”，选择域功能级别，上面已经解释了，是为了兼容性，我们也选择2003：

![2019-04-13-00-12-29](https://images.payloads.online/65fce2fa-4f5f-11ec-b4fd-00d861bf4abb.png)

单击下一步，此时进入DNS服务器的安装过程：

![2019-04-13-00-12-42](https://images.payloads.online/663825fe-4f5f-11ec-850c-00d861bf4abb.png)

这里是由于在“payloads.online”中没有委派关系，所以我们自建：

![2019-04-13-00-12-51](https://images.payloads.online/66995298-4f5f-11ec-8566-00d861bf4abb.png)

单击“是”，进入选择数据库、日志、SYSOL的存放路径，这三个东西在后续的红队目录里都会介绍攻击手段以及防御方法：

![2019-04-13-00-13-01](https://images.payloads.online/66dea744-4f5f-11ec-ade2-00d861bf4abb.png)

默认选择“下一步”，设置DC管理员(Administrator)密码：

![2019-04-13-00-13-13](https://images.payloads.online/6724caa8-4f5f-11ec-b795-00d861bf4abb.png)

单击“下一步”，可以看到刚才的设置:

![2019-04-13-00-13-24](https://images.payloads.online/676d6bd2-4f5f-11ec-9971-00d861bf4abb.png)

这里你也可以导出设置，用于下次安装的时候自动配置。单击“下一步”就可以安装了。

![2019-04-13-00-13-34](https://images.payloads.online/67ae3f04-4f5f-11ec-9199-00d861bf4abb.png)

勾选“重新启动”，去喝杯茶，回来它就安装完毕了！

安装完毕后，会默认使用域内账户Administrator登录：
![2019-04-13-00-13-47](https://images.payloads.online/67ee1e08-4f5f-11ec-b611-00d861bf4abb.png)

登录进入后，会弹出“初始化配置任务”窗口，这里有关于本机的信息：

![2019-04-13-00-13-57](https://images.payloads.online/68308f68-4f5f-11ec-bc5f-00d861bf4abb.png)

出现域，就代表搭建完成了，域控的IP是：192.168.117.169，域名称是：payloads.online。

## 0x04 加入域

打开一个Windows，这里我用我的Windows 10来举例：

![2019-04-13-00-14-19](https://images.payloads.online/686c9a3a-4f5f-11ec-9035-00d861bf4abb.png)

首先要确保能与域控进行通信，然后将当前主机的DNS服务器设置为DC的IP：

![2019-04-13-00-14-27](https://images.payloads.online/68ae5470-4f5f-11ec-aff1-00d861bf4abb.png)

![2019-04-13-00-14-33](https://images.payloads.online/68ef6456-4f5f-11ec-af10-00d861bf4abb.png)

紧接着找到系统属性：

![2019-04-13-00-14-41](https://images.payloads.online/6932ad74-4f5f-11ec-b181-00d861bf4abb.png)

单击“网络”：

![2019-04-13-00-14-52](https://images.payloads.online/6971be38-4f5f-11ec-aff2-00d861bf4abb.png)

默认“下一步”：

![2019-04-13-00-15-03](https://images.payloads.online/69b1fd54-4f5f-11ec-a0a2-00d861bf4abb.png)

既然加域嘛，肯定选择带有域的，单击“下一步”：

![2019-04-13-00-15-34](https://images.payloads.online/69e8094e-4f5f-11ec-9e97-00d861bf4abb.png)

这个时候你需要在**域控**上创建一个用户：

![2019-04-13-00-15-49](https://images.payloads.online/6a1f28f2-4f5f-11ec-8d6a-00d861bf4abb.png)

主要填写“登录名”就可以了


![2019-04-13-00-16-05](https://images.payloads.online/6a5b0ef8-4f5f-11ec-bf98-00d861bf4abb.png)

单击“下一步”，设置密码：

![2019-04-13-00-16-14](https://images.payloads.online/6aa8f776-4f5f-11ec-9eaa-00d861bf4abb.png)

下一步，创建完成。

此时回到Windows 10，填写好这个创建好的用户：

![2019-04-13-00-16-28](https://images.payloads.online/6ae609fe-4f5f-11ec-a1ac-00d861bf4abb.png)

![2019-04-13-00-16-33](https://images.payloads.online/6b1df440-4f5f-11ec-9c3f-00d861bf4abb.png)

单击“下一步”：

![2019-04-13-00-16-45](https://images.payloads.online/6b5b1df2-4f5f-11ec-95b7-00d861bf4abb.png)

这里授予权限时，设置为“Users”，不然很多东西操作不了。

![2019-04-13-00-16-55](https://images.payloads.online/6b989c2c-4f5f-11ec-b554-00d861bf4abb.png)

单击“完成”，重启计算机。

![2019-04-13-00-17-05](https://images.payloads.online/6bd31172-4f5f-11ec-8da2-00d861bf4abb.png)

![2019-04-13-00-17-10](https://images.payloads.online/6c209d3e-4f5f-11ec-a218-00d861bf4abb.png)

此时，客户机既能上网，也能处于域环境下。