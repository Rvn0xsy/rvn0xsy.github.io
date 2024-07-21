---
date: "2021-01-31T00:00:00Z"
description: 近年来终端安全检测与响应的产品发展迅速，我们不得不意识到，安全是在一个循环中发展的，从人们意识到安全开始，大部分了解到层面都是病毒、木马，然后接着是浏览器相关的Web安全领域，最后又开始回到终端。这个议题我们通过了解Windows操作系统下的访问控制技术，站在攻防的不同角度去进行对抗，提升自身的知识储备，个人觉得这些知识适用于许多使用Windows操作系统的用户。
title: Windows权限控制相关的防御与攻击技术
url: /archivers/2021-01-31/1
---

## 0x00 前言

近年来终端安全检测与响应的产品发展迅速，我们不得不意识到，安全是在一个循环中发展的，从人们意识到安全开始，大部分了解到层面都是病毒、木马，然后接着是浏览器相关的Web安全领域，最后又开始回到终端。这个议题我们通过了解Windows操作系统下的访问控制技术，站在攻防的不同角度去进行对抗，提升自身的知识储备，个人觉得这些知识适用于许多使用Windows操作系统的用户。

## 0X01 安全描述符(Security Descriptors，SD)

在Windows中，每一个安全对象实体都拥有一个安全描述符，安全描述符包含了被保护对象相关联的安全信息的数据结构，它的作用主要是为了给操作系统提供判断来访对象的权限。

```
0:000> dt nt!_security_descriptor
ntdll!_SECURITY_DESCRIPTOR
   +0x000 Revision         : UChar  # 版本
   +0x001 Sbz1             : UChar  # 大小
   +0x002 Control          : Uint2B # 一组标志，用于限定安全描述符或安全描述符的各个字段的含义
   +0x008 Owner            : Ptr64 Void # 指定对象的所有者（SID）
   +0x010 Group            : Ptr64 Void # 指定对象的主组（SID）
   +0x018 Sacl             : Ptr64 _ACL # 系统访问控制列表
   +0x020 Dacl             : Ptr64 _ACL # 自主访问控制列表
```

### Windows具体有哪些安全对象？

- 进程
- 线程
- 文件
- 服务
- 计划任务
- 互斥体
- 管道
- 油槽
- 文件共享
- 访问令牌
- 注册表
- 打印机
- 作业
- ...

一般情况下，大部分用户接触更多的可能就是文件了，我们就以文件开始，文件对于我们去学习访问控制是最直观的。

一个文件的权限描述符主要表现为：

![2021-01-31-21-43-05](https://images.payloads.online/a87eb66c-4f5f-11ec-adb7-00d861bf4abb.png)

上图中的安全选项卡主要是表述了sethc.exe这个文件能够被哪些用户访问，并且这些用户拥有sethc.exe的哪些权限，如：读取、读取和执行、写入、完全控制等。

![2021-01-31-21-44-40](https://images.payloads.online/a8c5e5a0-4f5f-11ec-b9be-00d861bf4abb.png)

## 0x02 安全描述符的组成

DACL通过一系列ACE定义了所有被允许或者禁止的安全对象的访问者，SACL描述了系统应该审核的内容，系统会根据审核项产生对应的系统日志。

![2021-01-31-21-45-22](https://images.payloads.online/a90af0be-4f5f-11ec-94bd-00d861bf4abb.png)

> 权限选项卡代表了 DACL，审核选项卡代表了 SACL。

### 什么是SID（Security Identifier，SID）


![2021-01-31-21-49-18](https://images.payloads.online/a95f5988-4f5f-11ec-8610-00d861bf4abb.png)

每个参与权限决策的角色都拥有一个SID，这个SID为了保证角色的唯一性。

```
S-[修订级别]-[权值]-[标识符]
```

SID分为两种：

- 内置SID
- 自动分配SID

内置SID有：

- S-1-5-18 (LocalSystem)
- S-1-5-19 (LocalService)
- S-1-5-20 (NetworkService)
- S-1-5-32-544 (Administrators)
- S-1-5-32-545 (Users)
- S-1-5-32-550 (PrintOperators)
- ...

### 相对标识符(Relative Identifer, RID)

```
S-[修订级别]-[权值]-[标识符]-[相对标识符]
```

例如：

- S-1-5-21-xxxx-xxx-500 (Administrator) 本地管理员
- S-1-5-21-xxxx-xxx-501 (Guest) 本地来宾用户
- S-1-5-21-xxxx-xxx-1004 (Workstaion) 本地工作站

其中RID为`500`的用户代表管理员用户，账户个RID值是固定的，通常渗透中常说的RID劫持、克隆用户就是修改其他用户的RID值来实现让系统认为当前用户是管理员。

## 0x03 自主访问控制列表（Discretionary access control list，DACL）

![2021-01-31-21-51-33](https://images.payloads.online/a99be9c0-4f5f-11ec-93a4-00d861bf4abb.png)


解读：每一个Windows进程都拥有一个线程，当程序想要访问某个安全对象时，系统会提取当前线程的访问令牌，然后将访问令牌的权限和被访问的安全对象DACL进行比较。

- Thread A拥有Adrew的访问令牌，当它访问对象Object的时候，系统会从DACL第一个条目开始向下比对，由于第一个ACE是Access denied，并且用户名恰巧是Adrew，因此系统会拒绝访问，返回错误代码5。

- Thread B拥有Jane的访问令牌，当它访问对象Object的时候，系统会从DACL第一个条目开始向下比对，由于第一个ACE不是针对Jane设置的，因此会继续向下比对，当到达第二个ACE时，Jane属于Group A，满足比对条件，因此拥有Write的权限。到达第三个时，如果Jane想要的是读取，那么也会在到达第三个ACE后，获得读取的权限。


这张图很清晰的描述了一个线程访问系统安全对象的过程，也能够帮我们更清楚的理解令牌窃取、假冒的原理。

> [https://docs.microsoft.com/en-us/windows/win32/secauthz/how-dacls-control-access-to-an-object](https://docs.microsoft.com/en-us/windows/win32/secauthz/how-dacls-control-access-to-an-object)

当一个线程访问安全对象时，操作系统会将访问令牌的属性与被访问对象安全描述符中的DACL进行检查，检查的条目就是访问控制条目（Access control entries，ACE），最先检查的ACE优先级越高。

## 0x04 系统访问控制列表（System access control list，SACL）

![2021-01-31-22-00-15](https://images.payloads.online/a9d46df4-4f5f-11ec-98aa-00d861bf4abb.png)

系统访问控制列表主要是配置审核对象的ACE，当这些ACE被允许或拒绝的时候，系统将自动产生“安全”日志。

图中设置了Service.log的SACL，当它的DACL被改变成功后，操作系统会自动帮助我们产生一条安全日志，我们可以提取其中的关键信息，如：

- 时间
- 访问的进程
- 访问的线程ID
- 访问的计算机
- 访问的用户名等
- ...

![2021-01-31-22-03-10](https://images.payloads.online/aa196238-4f5f-11ec-9987-00d861bf4abb.png)


## 0x05 修改访问控制列表（Access control list，ACL）


在Windows中，修改内核对象的方法只有调用API，因此，可以将安全描述符也理解为一个内核对象的属性。

以下是修改ACL的简要过程：

1. 使用 **[GetSecurityInfo](https://docs.microsoft.com/en-us/windows/desktop/api/Aclapi/nf-aclapi-getsecurityinfo)** 或者 **[GetNamedSecurityInfo](https://docs.microsoft.com/en-us/windows/desktop/api/Aclapi/nf-aclapi-getnamedsecurityinfoa)** 函数从对象的[安全描述符](https://docs.microsoft.com/en-us/windows/desktop/SecGloss/s-gly)中获取DACL。
2. 对于每个新的ACE，请调用[BuildExplicitAccessWithName](https://docs.microsoft.com/en-us/windows/desktop/api/Aclapi/nf-aclapi-buildexplicitaccesswithnamea)函数以使用描述ACE的信息填充[EXPLICIT_ACCESS](https://docs.microsoft.com/en-us/windows/desktop/api/AccCtrl/ns-accctrl-explicit_access_a)结构。
3. 调用[SetEntriesInAcl](https://docs.microsoft.com/en-us/windows/desktop/api/Aclapi/nf-aclapi-setentriesinacla)，为新ACE指定现有的ACL和[EXPLICIT_ACCESS](https://docs.microsoft.com/en-us/windows/desktop/api/AccCtrl/ns-accctrl-explicit_access_a)结构的数组。SetEntriesInAcl函数分配和初始化的ACL和的ACE。
4. 调用[SetSecurityInfo](https://docs.microsoft.com/en-us/windows/desktop/api/Aclapi/nf-aclapi-setsecurityinfo)或[SetNamedSecurityInfo](https://docs.microsoft.com/en-us/windows/desktop/api/Aclapi/nf-aclapi-setnamedsecurityinfoa)函数，将新的ACL附加到对象的安全描述符。

下方的链接提供了一个简单的例子：

> [https://docs.microsoft.com/en-us/windows/win32/secauthz/creating-or-modifying-an-acl](https://docs.microsoft.com/en-us/windows/win32/secauthz/creating-or-modifying-an-acl)


### NULL DACL和空DACL

如果属于对象的安全描述符的自由访问控制列表（Discretionary access control list，DACL）设置为NULL，则会创建一个NULL DACL。NULL DACL授予对请求它的任何用户的完全访问权限，不对该对象执行正常的安全检查。


NULL的DACL与空的DACL是有区别的，空DACL是正确分配和初始化的DACL，其中不包含访问控制项（Access control entries，ACE），任何对象都不允许访问。

我发现两个有趣的事情：

1. 如果我将lsass.exe进程的DACL设置为NULL，我发现在系统重启后，再也启动不起来了，一直循环蓝屏。
2. 如果我将lsass.exe进程的DACL设置为空，我发现即便是以Guest用户登录，也不能轻易的转储lsass.exe的内存。应该是有某些保护机制。

## 0x06 土豆（Potato）提权的本质与进程访问控制

土豆系列的提权原理主要是诱导高权限访问低权限的系统对象，导致低权限的对象可以模拟高权限对象的访问令牌（Access Token），进而可以用访问令牌创建进程，达到代码执行。

[《Windows特权提升漏洞-符号》](https://payloads.online/archivers/2020-03-21/1) 提到过：访问控制模型有两个主要的组成部分，访问令牌（Access Token）和安全描述符（Security Descriptor），它们分别是访问者和被访问者拥有的东西。通过访问令牌和安全描述符的内容，Windows可以确定持有令牌的访问者能否访问持有安全描述符的对象。

- 烂土豆(Rotten Potato)提权MS16-075

[https://docs.microsoft.com/zh-cn/security-updates/securitybulletins/2016/ms16-075](https://docs.microsoft.com/zh-cn/security-updates/securitybulletins/2016/ms16-075)

- [CVE-2020-0668](https://itm4n.github.io/cve-2020-0668-windows-service-tracing-eop/)
- [CVE-2020-0683 MSI Packages Symbolic Links Processing - Windows 10 Privilege Escalation](https://www.youtube.com/watch?v=1axTbxPz2_8)
- [CVE-2020-8950](https://github.com/nomi-sec/PoC-in-GitHub#cve-2020-8950)
- [CVE-2020-0683](https://github.com/nomi-sec/PoC-in-GitHub#cve-2020-0686)
- [CVE-2019-1002101](https://github.com/nomi-sec/PoC-in-GitHub#cve-2019-1002101)
- [CVE-2019-0986](https://github.com/nomi-sec/PoC-in-GitHub#cve-2019-0986)
- [CVE-2018-1088](https://github.com/nomi-sec/PoC-in-GitHub#cve-2018-1088)
- ....

这些漏洞要么是利用巧妙的手法获取令牌、要么是用高权限移动文件，因此用户层的提权漏洞大多都需要系统“主动”起来。

## 0x07 访问令牌模拟（Access Token Impersonation）

Windows 的令牌类型：

1. 主令牌（Primary Token）
2. 模拟令牌（Impersonation Token）

渗透中常说的令牌假冒、令牌窃取都是利用Windows的令牌模拟功能获取其他用户的令牌来创建进程。

这两类访问令牌只有在系统重启后才会清除，而授权令牌在用户注销后该令牌会变为模拟令牌，依旧有效。

因此在域渗透的过程中，我们常常发现域管理员登录了某些不安全的机器，会针对这些机器进行定向的攻击，获取机器权限后，寻找域管理员创建的进程，窃取访问令牌进而获取整个域的权限。

### 正常情况下什么时候需要用到令牌模拟？

例如，服务器应用程序为客户端提供某些服务，服务器需要以客户端的权限访问其他资源，这个时候就需要利用令牌模拟的功能。

进程令牌模拟的流程：

1. 调用OpenProcess获取进程句柄
2. 调用OpenProcessToken，传入进程句柄获取访问令牌句柄
3. 调用DuplicateTokenEx，设置访问令牌模拟级别并复制一个令牌句柄
4. 调用CreateProcessWithToken，传入模拟令牌，创建一个新的进程达到代码执行的目的

注意，要达到令牌窃取创建进程的效果需要有一些前提：

- 当前用户必须拥有SeImpersonatePrivilege或SeAssignPrimaryTokenPrivilege特权
- 拥有目标进程的PROCESS_QUERY_INFORMATION权限
- 拥有目标进程访问令牌的`TOKEN_DUPLICATE | TOKEN_IMPERSONATE`权限

Windows将每一个权限都以二进制位标示，但在C语言头文件中是以16禁止标示的。

![2021-01-31-22-10-47](https://images.payloads.online/aa5f8a9c-4f5f-11ec-9212-00d861bf4abb.png)

两个权限的组合就是两个二进制数的与运算结果，由此可以看出Windows进程权限最大可以表示0xFFFF个，也就是2个字节，当然一般情况下用不到那么多。同时，我们也可以推断，任何可以设置权限的安全对象，想要设置全部权限`ALL_ACCESS`，可以全部用0xFFFFFFFF填充。

## 0x08 进程注入（Process Inject）

进程注入是为了解决A进程想要在B进程的安全上下文中执行代码的技术手段。要完成一个进程注入需要A进程的访问令牌拥有B进程的权限。

进程注入的流程：

1. 调用OpenProcess获取进程句柄
2. 调用WriteProcessMemory，传入进程句柄，向进程的虚拟内存空间写入Shellcode
3. 调用CreateRemoteThread，传入进程句柄，创建远程线程

场景：某些终端安全软件禁止用户转储lsass.exe进程内存，但我们可以先进程注入到lsass.exe，然后再转储内存。

![2021-01-31-22-16-26](https://images.payloads.online/aa9a27d8-4f5f-11ec-b281-00d861bf4abb.png)

小技巧：有些软件在失败后返回一些数字，其实是Windows错误代码，我们可以通过`net helpmsg`命令来查看详情。

```
net helpmsg <错误代码>
```

![2021-01-31-22-17-03](https://images.payloads.online/aace09a4-4f5f-11ec-a006-00d861bf4abb.png)


## 0x09 文件的权限修改

在Windows系统中，除了用户交互的窗口以外，还可以通过icacls命令修改文件的权限。

```
icacls c:\windows\* /save AclFile /T
  - 将 c:\windows 及其子目录下所有文件的ACL 保存到 AclFile。

  icacls c:\windows\ /restore AclFile
  - 将还原 c:\windows 及其子目录下存在的 AclFile 内所有文件的 ACL。

  icacls file /grant Administrator:(D,WDAC)
  - 将授予用户对文件删除和写入 DAC 的管理员权限。

  icacls file /grant *S-1-1-0:(D,WDAC)
  - 将授予由 sid S-1-1-0 定义的用户对文件删除和写入 DAC 的权限。
```

还可以查看文件的权限，例如常见的Shift后门：

![2021-01-31-22-17-42](https://images.payloads.online/ab070f92-4f5f-11ec-a1c5-00d861bf4abb.png)

现如今普通用户，包括管理员、系统账户都不能随意更改这个文件了，能够看出Windows对这块有做加强。

### 创建匿名共享

在内网渗透中，经常会需要一个机器的共享作为中转，因此可以使用net share命令快速开启一个任意用户可读可写的共享。

```
net share everyone=C:\Windows /grant:everyone,full
```

![2021-01-31-22-18-14](https://images.payloads.online/ab3ec108-4f5f-11ec-82f4-00d861bf4abb.png)


## 0x10 创造提权漏洞——服务后门

前面提到可以通过API修改内核对象的ACL，那么是否可以通过代码帮助我们完成一些窗口无法做到的操作，例如：任意用户可以读写的内核对象。

我尝试过以下几种方案用作后门：

1. 注册表 成功
2. 任务计划 失败
3. 服务 成功
4. 进程 失败

服务是最容易被利用的，通常情况下，Guest用户是无法启动、创建服务的，通过修改某个服务的ACL，让Guest轻松创建以SYSTEM权限运行的进程。

![2021-01-31-22-19-00](https://images.payloads.online/ab84c306-4f5f-11ec-ae41-00d861bf4abb.png)

由于Windows没有提供修改服务的窗口操作接口，所以按常规情况来看，上机查看的管理员不容易发现这类后门。

> [https://docs.microsoft.com/en-us/windows/win32/services/modifying-the-dacl-for-a-service](https://docs.microsoft.com/en-us/windows/win32/services/modifying-the-dacl-for-a-service)

![2021-01-31-22-19-23](https://images.payloads.online/abc10a82-4f5f-11ec-8408-00d861bf4abb.png)

### Powershell更改服务权限

[https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/set-service?view=powershell-7.1](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/set-service?view=powershell-7.1)

使用Powershell修改服务的权限可以使用Set-Service：

```
$SDDL = "D:(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)(A;;CCLCSWLOCRRC;;;SU)"
Set-Service -Name "BITS" -SecurityDescriptorSddl $SDDL
```

### CMD修改服务权限

想象一个场景，如果随时都拥有一个服务器的权限，但是不能长时间登录某个特权账户，那么可以留置一个任意用户可以修改的系统服务，方便随时提权。

![2021-01-31-22-27-28](https://images.payloads.online/ac1169be-4f5f-11ec-98c9-00d861bf4abb.png)

```
sc setsd <Service Name> <SDDL String>
sc sdset defragsvc "D:(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)"
```

## 0x11 Windows域下的DCSync攻击及后门实现

DCSync是域控之间同步域数据的一个传递方式，一旦攻击者获取了具有域复制权限的特权帐户，攻击者就可以利用复制协议来模仿域控制器，诱使域控制器将域用户相关的数据发送出来。

![2021-01-31-22-28-23](https://images.payloads.online/ac48005a-4f5f-11ec-be47-00d861bf4abb.png)

其中最核心的一步就是调用 [GetNCChanges](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-drsr/b63730ac-614c-431c-9501-28d6aca91894?redirectedfrom=MSDN) 复制用户凭据。

这篇文章中展示了更加详细的原理：[《Mimikatz DCSync Usage, Exploitation, and Detection》](https://adsecurity.org/?p=1729)

### 哪些用户拥有域复制权限？

- Administrators
- Domain Admins
- Enterprise Admins
- ...

使用DcSync技术攻击的前提是获取域管理员权限。

### 什么是域复制权限 — 域扩展权限

Windows活动目录除了支持常规权限以外，还拥有自身对扩展权限，这些扩展权限与常规权限等效，主要是为了限定某些特殊的行为而制定的。

常规权限：

- 读取
- 写入
- 执行

[扩展权限（Extended Rights）](https://docs.microsoft.com/en-us/windows/win32/adschema/extended-rights)：

1. **[Allowed-To-Authenticate](https://docs.microsoft.com/en-us/windows/win32/adschema/r-allowed-to-authenticate)**
2. **[Apply-Group-Policy](https://docs.microsoft.com/en-us/windows/win32/adschema/r-apply-group-policy)**
3. **[Certificate-Enrollment](https://docs.microsoft.com/en-us/windows/win32/adschema/r-certificate-enrollment)**
4. **[Change-Domain-Master](https://docs.microsoft.com/en-us/windows/win32/adschema/r-change-domain-master)**
5. **[Change-Infrastructure-Master](https://docs.microsoft.com/en-us/windows/win32/adschema/r-change-infrastructure-master)**
6. **[DS-Replication-Get-Changes](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes)**
7. **[DS-Replication-Get-Changes-All](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes-all)**
8. [...](https://docs.microsoft.com/en-us/windows/win32/adschema/extended-rights)


### DS-Replication-Get-Changes

从指定NC复制更改所需的扩展权限。

![2021-01-31-22-29-40](https://images.payloads.online/acb2c0c0-4f5f-11ec-be1f-00d861bf4abb.png)

为了方便未来扩展新的特性，每一个扩展权限都具有一个GUID值，如果要对域对象赋予这个权限，可以传入这个GUID值。GUID等效于权限常量。

DS-Replication-Get-Changes扩展权限支持的系统版本：

- **[Windows 2000 Server](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes#windows-2000-server)**
- **[Windows Server 2003](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes#windows-server-2003)**
- **[ADAM](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes#adam)**
- **[Windows Server 2003 R2](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes#windows-server-2003-r2)**
- **[Windows Server 2008](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes#windows-server-2008)**
- **[Windows Server 2008 R2](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes#windows-server-2008-r2)**
- **[Windows Server 2012](https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes#windows-server-2012)**


### DcSync后门实现

通过调用活动目录自身独有的COM组件接口，可以获取域对象的安全描述符，修改方式与本地修改ACL没有太多差别。

[Powerview](https://github.com/PowerShellMafia/PowerSploit/blob/dev/Recon/PowerView.ps1#L8270)实现了Powershell版本的DCSync后门植入：

![2021-01-31-22-30-43](https://images.payloads.online/acece174-4f5f-11ec-991c-00d861bf4abb.png)

```cpp
Add-DomainObjectAcl -TargetIdentity "DC=Domain,DC=com" -PrincipalIdentity <UserName> -Rights DCSync -Verbose
```

我这里实现了一个C++版本的：[https://github.com/Rvn0xsy/PDacl](https://github.com/Rvn0xsy/PDacl)

![2021-01-31-22-33-32](https://images.payloads.online/ad26d0be-4f5f-11ec-aa64-00d861bf4abb.png)

![2021-01-31-22-33-58](https://images.payloads.online/ad79864c-4f5f-11ec-90cc-00d861bf4abb.png)


在Cobalt Strike中以普通用户权限转储NTLM验证成功：

![2021-01-31-22-34-59](https://images.payloads.online/adbf79e0-4f5f-11ec-8d7f-00d861bf4abb.png)

C++实现过程：

- 获取IADsSecurityDescriptor接口指针
- 获取IADsAccessControlList接口指针
- 获取IADsAccessControlEntry接口指针
- 调用IADsAccessControlList::AddAce添加ACE
- 调用IADs::put更新

由于涉及到COM组件对象，所以过程比较繁琐。

### DCSync权限检测

https://github.com/cyberark/ACLight 能够列出所有用户的ACL，可以根据结果进行匹配DS-Replication-Get-Changes权限。

## 参考

- https://docs.microsoft.com/en-us/windows/win32/api/iads/ne-iads-ads_rights_enum
- https://docs.microsoft.com/en-us/windows/win32/ad/example-code-for-setting-a-control-access-right-ace
- https://stealthbits.com/blog/what-is-dcsync-an-introduction/
- https://github.com/PowerShellMafia/PowerSploit/blob/dev/Recon/PowerView.ps1#L8270
- https://docs.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes
- https://3gstudent.github.io/3gstudent.github.io/域渗透-DCSync/
- https://docs.microsoft.com/en-us/windows/win32/ad/how-security-descriptors-are-set-on-new-directory-objects
- https://docs.microsoft.com/en-us/windows/win32/api/iads/nf-iads-iadssecuritydescriptor-copysecuritydescriptor
- https://docs.microsoft.com/en-us/windows/win32/api/_adsi/
- http://systemmanager.ru/adam-sdk.en/ad/setting_access_rights_on_an_object.htm
- https://docs.microsoft.com/en-us/windows/win32/secauthz/order-of-aces-in-a-dacl
- https://www.installsetupconfig.com/win32programming/accesscontrollistacl1_1.html
- https://docs.microsoft.com/en-us/windows/win32/secbp/creating-a-dacl
- https://docs.microsoft.com/en-us/windows/win32/secauthz/security-descriptor-string-format
- https://docs.microsoft.com/en-us/windows/win32/api/iads/nf-iads-iadsaccesscontrollist-addace
- https://docs.microsoft.com/en-us/windows/win32/secauthz/modifying-the-acls-of-an-object-in-c--
