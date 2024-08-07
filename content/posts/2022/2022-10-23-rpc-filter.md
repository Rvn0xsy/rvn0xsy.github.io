---
title: "使用RPC Filter技术防御内网RPC横向攻击"
date: 2022-10-23
description: 本文介绍了RPC Filter技术的概念与使用，并演示了如何通过RPC Filter阻断基于计划任务的横向攻击，并给出了大量RPC Filter的参考，能够有效的应对impacket所提供的内网横向技术的攻击.....
url: /archivers/2022-10-23/1
---

## 前言

[Impacket](https://github.com/SecureAuthCorp/impacket)工具包中所包含的内网横向技术大多都是依赖于RPC协议的，但对于RPC协议的攻击防御除了网络流量侧的检测识别以外，还可以通过Windows 内置的[WFP](https://learn.microsoft.com/en-au/windows/win32/fwp/what-s-new-in-windows-filtering-platform)(Windows Filtering Platform)技术。

这里提一下，流量测如何分析并防御impacket内网横向：[https://riccardoancarani.github.io/2020-05-10-hunting-for-impacket/](https://riccardoancarani.github.io/2020-05-10-hunting-for-impacket/#wmiexecpy)

关于RPC的攻击技术及漏洞整理了以下部分，使用RPC Filter可以达到阻断漏洞被利用和攻击的效果：

- impacket-atexec 通过SMB协议认证，利用[MS-TSCH](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-tsch/d1058a28-7e02-4948-8b8d-4a347fa64931) RPC协议服务注册任务计划进行横向移动。
- impacket-psexec 通过SMB协议认证，利用[MS-SCMR](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-scmr/705b624a-13de-43cc-b8a2-99573da3635f) RPC协议注册系统服务进行横向移动。
- impacket-dcomexec 通过SMB认证，利用[MS-DCOM](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-dcom/4a893f3d-bd29-48cd-9f43-d9777a4415b0) RPC协议调用COM组件执行横向移动。
- impacket-wmiexec 通过SMB认证，利用[MS-DCOM](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-dcom/4a893f3d-bd29-48cd-9f43-d9777a4415b0) RPC协议调用COM组件执行横向移动。
- 大名鼎鼎的[PetitPotam](https://github.com/topotam/PetitPotam) [CVE-2021-36942](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-36942) 利用[MS-EFSRPC](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-efsr/08796ba8-01c8-4872-9221-1000ec2eff31)协议让服务器访问攻击者构造的地址进行NTLM重定向攻击。
- PrintNightmare Windows Print Spooler权限提升漏洞（CVE-2021-1675），利用MS-RPRN进行提权，其原理也是通过调用RPC接口，让服务器访问特定的路径。
- 除了这类漏洞的利用，还有大部分的土豆提全系列都有使用到RPC接口，让系统SYSTEM特权进程访问攻击者构造的管道，然后进行令牌模拟，达到窃取Token然后提权的目的。

## 什么是WFP？

> Windows Filtering Platform (WFP) is a network traffic processing platform designed to replace the Windows XP and Windows Server 2003 network traffic filtering interfaces. WFP consists of a set of hooks into the network stack and a filtering engine that coordinates network stack interactions.
> 

顾名思义，他是一个网络流量处理平台，用于替代Windows Server 2003、Windows XP平台下的网络流量过滤接口。WFP 由一组进入网络堆栈的钩子和一个协调网络堆栈交互的过滤引擎组成。

随便查看WFP的[API](https://learn.microsoft.com/en-us/windows/win32/api/fwpmu/nf-fwpmu-fwpmfilteradd0)，可以大致确定这个技术的支持版本，大部分API还是兼容性较强的，也就是说这个技术在Windows很早就有了：

![](https://images.payloads.online/2022-10-23-22-51-22.png)

### RPC Filer

而RPC Filter他是一种基于RPC协议的一种过滤技术，可以通过多个维度进行过滤，本文仅仅展开基于UUID来过滤对应的RPC协议。RPC Filter属于在WFP技术中的一部分。通过设置FWPM_FILTER0和FWPM_FILTER_CONDITION0结构可以配置Filter规则，然后调用相对应的API就能够完成Filter的注册。

### 使用Netsh命令添加RPC Filer规则阻断Impacket atexec

除了API接口以外，我们还可以通过系统自带的netsh命令来直接设置Filter规则，例如这里我直接设置一个不允许[MS-TSCH](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-tsch/d1058a28-7e02-4948-8b8d-4a347fa64931) 远程调用的例子：

环境：

- 被攻击者 Windows Server 2008 IP: 192.168.31.134
- 攻击者 Linux

首先使用atexec.py正常攻击一次：

![](https://images.payloads.online/2022-10-23-22-51-41.png)

这里可以看到可以攻击成功，RPC SchRpcRegisterTask 成功，这个API其实就是之前实现的[远程创建任务计划工具](https://github.com/Rvn0xsy/SchtaskCreator)，原理没有任何区别。

在Windows Server 2008上开始操作netsh，添加Filter：

![](https://images.payloads.online/2022-10-23-22-51-55.png)

```
rpc
filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=86D35949-83C9-4044-B424-DB363231FD0C
add filter
```

86D35949-83C9-4044-B424-DB363231FD0C 这个UUID代表了ITaskSchedulerService，在数据包中我们可以看到：

![](https://images.payloads.online/2022-10-23-22-52-16.png)

添加完Filter以后，我们这个时候再进行一次横向测试：

![](https://images.payloads.online/2022-10-23-22-52-29.png)

可以看到，已经无法注册任务计划了，atexec执行失败，而且RPC Filter其实和防火墙没有直接的关系，在测试期间Windows Server 2008的防火墙是关闭的状态。

![](https://images.payloads.online/2022-10-23-22-52-43.png)

除了计划任务以外还有很多，这里罗列一下：

- `1FF70682-0A51-30E8-076D-740BE8CEE98B`  [Schedueled Task (MS-TSCH)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tsch/d1058a28-7e02-4948-8b8d-4a347fa64931) ATSvc
- `378E52B0-C0A9-11CF-822D-00AA0051E40F`  [Schedueled Task (MS-TSCH)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tsch/d1058a28-7e02-4948-8b8d-4a347fa64931) SASec
- `86D35949-83C9-4044-B424-DB363231FD0C` [Schedueled Task (MS-TSCH)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tsch/d1058a28-7e02-4948-8b8d-4a347fa64931) ITaskSchedulerService
- `4FC742E0-4A10-11CF-8273-00AA004AE673`  [Distributed File System (DFS): Namespace Management Protocol](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-dfsnm/a7ecdbe0-c138-471d-85b6-a474825da9eb) MS-DFSNM
- `e3514235-4b06-11d1-ab04-00c04fc2dcd2` [Directory Replication Service (MS-DRSR)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-drsr/06205d97-30da-4fdc-a276-3fd831b272e0)
- `a8e0653c-2744-4389-a61d-7373df8b2292`  [File Server Remote VSS Protocol - MS-FSRVP](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-fsrvp/67f0fdd9-d8bc-445d-95de-2cb6d5c4d149)
- `c681d488-d850-11d0-8c52-00c04fd90f7e`   [Encrypting File System Remote (EFSRPC) Protocol - (MS-EFSR)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-efsr/08796ba8-01c8-4872-9221-1000ec2eff31) (unauthenticated implementation)
- `df1941c5-fe89-4e79-bf10-463657acf44d`   [Encrypting File System Remote (EFSRPC) Protocol - (MS-EFSR)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-efsr/08796ba8-01c8-4872-9221-1000ec2eff31)
- `12345778-1234-ABCD-EF00-0123456789AB`  [Local Security Authority (Domain Policy) Remote Protocol (MS-LSAD)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-lsad/1b5471ef-4c33-4a91-b079-dfcbb82f05cc) /  [Local Security Authority (Translation Methods) Remote Protocol (MS-LSAT)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-lsat/1ba21e6f-d8a9-462c-9153-4375f2020894)
- `12345678-1234-ABCD-EF00-01234567CFFB`  [Netlogon Remote Protocol - (NRPC)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-nrpc/ff8f970f-3e37-40f7-bd4b-af7336e4792f)
- `12345678-1234-ABCD-EF00-0123456789AB`  [Print System Remote Protocol (MS-RPRN)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-rprn/d42db7d5-f141-4466-8f47-0a4be14e2fc1)
- `76F03F96-CDFD-44FC-A22C-64950A001209`  [Print System Asynchronous Remote Protocol (MS-PAR)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-par/695e3f9a-f83f-479a-82d9-ba260497c2d0)
- `338CD001-2244-31F1-AAAA-900038001003`  [Remote Registry (MS-RRP)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-rrp/0fa3191d-bb79-490a-81bd-54c2601b7a78)
- `12345778-1234-ABCD-EF00-0123456789AC` [Security Account Manager (SAM) Remote Protocol (MS-SAMR)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-samr/4df07fab-1bbc-452f-8e92-7853a3c7e380)
- `367ABB81-9844-35F1-AD32-98F038001003`  [Service Control Manager Remote Protocol (MS-SCMR)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-scmr/705b624a-13de-43cc-b8a2-99573da3635f)
- `4b324fc8-1670-01d3-1278-5a47bf6ee188` [Server Service Remote Protocol (MS-SRVS)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-srvs/accf23b0-0f57-441c-9185-43041f1b0ee9)
- `6BFFD098-A112-3610-9833-46C3F87E345A`****  [Workstation Service Remote Protocol (MS-WKST)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-wkst/5bb08058-bc36-4d3c-abeb-b132228281b7)
- …..

## 拦截DCOM IOXIDResolver接口网卡探测

之前有写过一篇 [《通过OXID解析器获取Windows远程主机上网卡地址》](https://payloads.online/archivers/2020-07-16/1/) ，后来国内红队大部分扫描器就都开始集成这个功能，可以在未授权的情况下访问Windows操作系统的135端口获取网卡上的IP地址，主要是利用了IOXIDResolver 这个接口，通过抓包分析：

![](https://images.payloads.online/2022-10-23-22-53-10.png)

IOXIDResolver 对应的UUID是 99fcfec4-5260-101b-bbcb-00aa0021347a ，因此我们也同样可以使用netsh将这个协议给拦截掉。

```
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=99fcfec4-5260-101b-bbcb-00aa0021347a
add filter
```

添加RPC Filter之前：

![](https://images.payloads.online/2022-10-23-22-53-28.png)

添加RPC Filter之后：

![](https://images.payloads.online/2022-10-23-22-53-38.png)

## 批量添加RPC Filter规则

netsh命令支持以文件作为命令输入，例如：

```
netsh -f <command file>
```

我们可以将多条指令存放到文件中，执行命令加载：

![](https://images.payloads.online/2022-10-23-22-53-53.png)

## 防御****PetitPotam漏洞****

[Benjamin Delpy](https://twitter.com/gentilkiwi) 早在去年有提到可以通过RPC Filter阻断PetitPotam漏洞：

![](https://images.payloads.online/2022-10-23-22-54-06.png)

```
rpc
filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=c681d488-d850-11d0-8c52-00c04fd90f7e
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=df1941c5-fe89-4e79-bf10-463657acf44d
add filter
quit
```

这里索性整理一下全部的Filter规则：

```
rpc
filter
# ----------------------------
# 禁用 MS-EFSR PetitPotam 提权 Encrypting File System Remote (EFSRPC) Protocol - (MS-EFSR)
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=c681d488-d850-11d0-8c52-00c04fd90f7e
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=df1941c5-fe89-4e79-bf10-463657acf44d
add filter

# ----------------------------
# 禁用远程管理系统服务 Service Control Manager Remote Protocol (MS-SCMR) 
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=367ABB81-9844-35F1-AD32-98F038001003
add condition field=remote_user_token matchtype=equal data=D:(A;;KA;;;DA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=367ABB81-9844-35F1-AD32-98F038001003
add filter

# ----------------------------
# 禁用命名空间管理Distributed File System (DFS)
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=4FC742E0-4A10-11CF-8273-00AA004AE673
add condition field=auth_type matchtype=equal data=16
add condition field=auth_level matchtype=equal data=6
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=4FC742E0-4A10-11CF-8273-00AA004AE673
add filter

# ----------------------------
# 禁用DCSync攻击 Directory Replication Service (MS-DRSR)
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=e3514235-4b06-11d1-ab04-00c04fc2dcd2
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;DD)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=e3514235-4b06-11d1-ab04-00c04fc2dcd2
add filter

# ----------------------------
# 禁用LLMNR/NBT-NS Poisoning and SMB Relay
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=a8e0653c-2744-4389-a61d-7373df8b2292
add condition field=auth_type matchtype=equal data=16
add condition field=auth_level matchtype=equal data=6
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=a8e0653c-2744-4389-a61d-7373df8b2292
add filter

# ----------------------------
# 禁用远程枚举用户、添加用户 MS-LSAD & MS-LSAT. MS-LSAT
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=12345778-1234-ABCD-EF00-0123456789AB
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;BA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=12345778-1234-ABCD-EF00-0123456789AB
add filter


# ----------------------------
# 禁用ZeroLogon漏洞Netlogon Remote Protocol - (NRPC)
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=12345678-1234-abcd-ef00-01234567cffb
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;DC)
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;AU)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=12345678-1234-abcd-ef00-01234567cffb
add filter

# ----------------------------
# 禁用MS-RPRN & MS-PAR https://payloads.online/archivers/2022-03-04/1/
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=12345678-1234-ABCD-EF00-0123456789AB
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;DA)
add condition field=auth_level matchtype=equal data=6
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=12345678-1234-ABCD-EF00-0123456789AB
add filter
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=76F03F96-CDFD-44FC-A22C-64950A001209
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;DA)
add condition field=auth_level matchtype=equal data=6
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=76F03F96-CDFD-44FC-A22C-64950A001209
add filter

# ----------------------------
# 禁用远程管理注册表
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=338CD001-2244-31F1-AAAA-900038001003
add condition field=remote_user_token matchtype=equal data=D:(A;;KA;;;DA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=367ABB81-9844-35F1-AD32-98F038001003
add filter


# ----------------------------
# 禁用远程枚举域用户 Security Account Manager (SAM) Remote Protocol (MS-SAMR)
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=12345778-1234-ABCD-EF00-0123456789AC
add condition field=remote_user_token matchtype=equal data=D:(A;;RC;;;BA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=e3514235-4b06-11d1-ab04-00c04fc2dcd2
add filter

# ----------------------------
# 禁用远程枚举域用户 Security Account Manager (SAM) Remote Protocol (MS-SAMR)
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=12345778-1234-ABCD-EF00-0123456789AC
add condition field=remote_user_token matchtype=equal data=D:(A;;RC;;;BA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=e3514235-4b06-11d1-ab04-00c04fc2dcd2
add filter

# ----------------------------
# 禁用NetSessionEnum 会话枚举
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=4b324fc8-1670-01d3-1278-5a47bf6ee188
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;BA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=4b324fc8-1670-01d3-1278-5a47bf6ee188
add filter

# ----------------------------
# 禁用远程管理计划任务
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=1FF70682-0A51-30E8-076D-740BE8CEE98B
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;DA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=1FF70682-0A51-30E8-076D-740BE8CEE98B
add filter
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=378E52B0-C0A9-11CF-822D-00AA0051E40F
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;DA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=378E52B0-C0A9-11CF-822D-00AA0051E40F
add filter
add rule layer=um actiontype=permit
add condition field=if_uuid matchtype=equal data=86D35949-83C9-4044-B424-DB363231FD0C
add condition field=remote_user_token matchtype=equal data=D:(A;;CC;;;DA)
add filter
add rule layer=um actiontype=block
add condition field=if_uuid matchtype=equal data=86D35949-83C9-4044-B424-DB363231FD0C
add filter

quit
```

> ”#“是netsh批量执行的注释符号，上面的所有Filter请自行测试。 


我们可以根据场景需要来设置对应的RPC Filter，这将有效的降低基于RPC协议接口的内网横向技术所带来的风险。

## 总结

本文介绍了RPC Filter技术的概念与使用，并演示了如何通过RPC Filter阻断基于计划任务的横向攻击，并给出了大量RPC Filter的参考，能够有效的应对impacket所提供的内网横向技术的攻击，文末参考的链接是我在编写此文所查阅的资料，对我的帮助很大。其中，对于RPC Filter的设置本文并没有介绍太多，微软的文档资料也比较少，后面有空将会编写对应的自动化加固工具，例如：根据系统的某一个用户制订专属的RPC Filter、防御SERVICE提权到SYSTEM特权的问题解决方案，这些netsh命令可能并不具备此功能，但WFP API具备。如果文中有错误，希望读者能够通过留言指教。

## 参考

- [https://github.com/akamai/akamai-security-research/tree/main/rpc-filters](https://github.com/akamai/akamai-security-research/tree/main/rpc-filters)
- [https://github.com/jsecurity101/MSRPC-to-ATTACK/](https://github.com/jsecurity101/MSRPC-to-ATTACK/)
- [https://www.tiraniddo.dev/2021/08/how-windows-firewall-rpc-filter-works.html](https://www.tiraniddo.dev/2021/08/how-windows-firewall-rpc-filter-works.html)
- [https://googleprojectzero.blogspot.com/2021/08/understanding-network-access-windows-app.html](https://googleprojectzero.blogspot.com/2021/08/understanding-network-access-windows-app.html)
- [https://crfilter.com/](https://crfilter.com/)
- [https://learn.microsoft.com/en-us/windows/win32/api/fwpmtypes/ns-fwpmtypes-fwpm_filter_condition0](https://learn.microsoft.com/en-us/windows/win32/api/fwpmtypes/ns-fwpmtypes-fwpm_filter_condition0)





