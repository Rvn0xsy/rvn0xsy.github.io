---
title: "利用RDAP数据确定资产边界"
date: 2024-10-23
description: 在传统的渗透测试初始阶段，我们通常依赖域名备案信息、企业工商信息和网络空间测绘数据来确定资产归属。然而，这些方法可能存在信息不完整或过时的问题。本文将介绍一种创新的方法来精确界定资产范围：利用注册数据访问协议（RDAP）。
url: /archivers/2024-10-23/search-ip-via-rdap
tags: redteam
---

## 前言

在传统的渗透测试初始阶段，我们通常依赖域名备案信息、企业工商信息和网络空间测绘数据来确定资产归属。然而，这些方法可能存在信息不完整或过时的问题。本文将介绍一种创新的方法来精确界定资产范围：利用注册数据访问协议（RDAP）。

RDAP作为Whois协议的现代化替代品，提供了更全面、准确和实时的域名注册信息。通过RDAP，我们可以获取域名持有者、管理员联系方式、注册和到期日期等关键信息，从而更有效地识别和验证目标资产。此外，RDAP的结构化数据格式便于自动化处理，能够显著提高资产梳理的效率。

在接下来的章节中，我们将深入探讨如何利用RDAP数据进行资产边界确定，包括查询技巧、数据解析方法以及与其他信息源的交叉验证策略。通过掌握这种新方法，安全专业人员可以更全面、准确地评估目标环境，为后续的渗透测试工作奠定坚实基础。

## 什么是注册数据访问协议？

注册数据访问协议（RDAP）是一种用于访问互联网域名注册数据的协议。RDAP提供了一种比传统的Whois协议更安全和结构化的方式来查询域名、IP地址和自治系统号码的信息。它支持认证和授权、国际化以及标准化的数据格式，旨在解决Whois协议中的许多限制和缺陷。

注册数据访问协议（RDAP）的发展始于2011年，由互联网工程任务组（IETF）负责制定。RDAP的目标是取代传统的Whois协议，解决其在安全性、隐私保护、数据格式标准化等方面的不足。2015年，IETF正式发布了RDAP的相关标准文档，使其成为互联网域名注册数据访问的现代化协议。

## IANA - 互联网分配号码权威机构

在探讨RDAP协议之前，我们必须提及IANA（Internet Assigned Numbers Authority，互联网分配号码权威机构）。IANA是互联网的基石之一，负责全球互联网的唯一标识符分配和协调工作。它的核心职能包括管理DNS根区域、分配IP地址和自治系统编号，以及注册互联网协议的相关参数。作为一个关键的技术组织，IANA确保了互联网的稳定性和互通性，让全球的用户和信息得以顺畅连接。

中国与IANA的关系主要体现在中国作为全球互联网的重要组成部分，积极参与全球互联网的治理和技术发展。中国通过其国家域名注册机构CNNIC（China Internet Network Information Center）参与IANA的相关工作，负责中国国家顶级域名.cn的注册和管理，以及IP地址资源的分配与管理，其他国家也是类似的情况。2016年，IANA的管理权从美国政府正式移交给了全球互联网社群，这一过程中，中国作为多利益相关方之一，参与了相关的讨论和决策，因此我们可以通过IANA公开的信息获取到不同国家分配的IP地址范围。

## 通过RDAP数据获取国家/组织分配的IP范围

RDAP 是基于RESTful的Web服务，因此错误代码、用户标识、身份认证和访问控制可以通过HTTP协议进行提供，我们可以使用简单的Curl工具访问RDAP数据，而RDAP数据分别由区域互联网注册管理机构分别管理，如果要访问中国的网络分配资源，我们需要查找到对应的服务器。

> 现在世界上有五个正在运作的区域互联网注册管理机构：
> 
> 
> 美洲互联网号码注册管理机构（American Registry for Internet Numbers，ARIN）
> 欧洲IP网络资源协调中心
> 亚太网络信息中心（Asia-Pacific Network Information Centre，APNIC）
> 拉丁美洲及加勒比地区互联网地址注册管理机构（Latin American and Caribbean Internet Address Registry，LACNIC）
> 非洲网络信息中心（African Network Information Centre，AfriNIC）
> 
> 下文中简称 “信息中心”。
> 

了解完毕所有的前置知识后，我们可以开始查询全球的IPv4地址分配情况：

https://data.iana.org/rdap/ipv4.json

这个网址是IANA互联网分配号码权威机构的数据网址，上面显示了全球的IPv4在不同信息中心的分配情况，我在中国解析后的地址是属于ICANN的，可见应该是做了一些网络优化。

在响应的Json结构中，我们可以先关注一下APNIC的数据，这部分指的是亚太信息中心管理的IP资源，而中国区域就属于这部分：

```jsx
.....
[
                "1.0.0.0/8",
                "14.0.0.0/8",
                "27.0.0.0/8",
                "36.0.0.0/8",
                "39.0.0.0/8",
                "42.0.0.0/8",
                "43.0.0.0/8",
                "49.0.0.0/8",
                "58.0.0.0/8",
                "59.0.0.0/8",
                "60.0.0.0/8",
                "61.0.0.0/8",
                "101.0.0.0/8",
                "103.0.0.0/8",
                "106.0.0.0/8",
                "110.0.0.0/8",
                "111.0.0.0/8",
                "112.0.0.0/8",
                "113.0.0.0/8",
                "114.0.0.0/8",
                "115.0.0.0/8",
                "116.0.0.0/8",
                "117.0.0.0/8",
                "118.0.0.0/8",
                "119.0.0.0/8",
                "120.0.0.0/8",
                "121.0.0.0/8",
                "122.0.0.0/8",
                "123.0.0.0/8",
                "124.0.0.0/8",
                "125.0.0.0/8",
                "126.0.0.0/8",
                "133.0.0.0/8",
                "150.0.0.0/8",
                "153.0.0.0/8",
                "163.0.0.0/8",
                "171.0.0.0/8",
                "175.0.0.0/8",
                "180.0.0.0/8",
                "182.0.0.0/8",
                "183.0.0.0/8",
                "202.0.0.0/8",
                "203.0.0.0/8",
                "210.0.0.0/8",
                "211.0.0.0/8",
                "218.0.0.0/8",
                "219.0.0.0/8",
                "220.0.0.0/8",
                "221.0.0.0/8",
                "222.0.0.0/8",
                "223.0.0.0/8"
            ],
      [
          "https://rdap.apnic.net/"
      ]
]
....
```

APNIC的RDAP数据库保存在`https://rdap.apnic.net/`上面，我们继续在这个网址后面增加上面的IP地址段，则会得到这些IP被分配的信息：

例如查询：223.0.0.0 ⇒ https://rdap.apnic.net/ip/223.0.0.0

```jsx
....
"remarks": [
        {
            "description": [
                "Beijing Beilong Yunhai Network Data Technology Corporation",
                "",
                "HuaiRou, Beijing, China"
            ],
            "title": "description"
        }
    ],
    "links": [
        {
            "value": "https://rdap.apnic.net/ip/223.0.0.0",
            "rel": "self",
            "href": "https://rdap.apnic.net/ip/223.0.0.0/15",
            "type": "application/rdap+json"
        },
        {
            "value": "https://rdap.apnic.net/ip/223.0.0.0",
            "rel": "related",
            "href": "https://netox.apnic.net/search/223.0.0.0%2F15?utm_source=rdap&utm_medium=result&utm_campaign=rdap_result",
            "type": "text/html"
        }
    ],
    "status": [
        "active"
    ],
    "type": "ALLOCATED PORTABLE",
    "endAddress": "223.1.255.255",
    "ipVersion": "v4",
    "startAddress": "223.0.0.0",
    "objectClassName": "ip network",
    "handle": "223.0.0.0 - 223.1.255.255",
    "entities": [
        {
            "roles": [
                "abuse"
            ],
            "events": [
                {
                    "eventAction": "registration",
                    "eventDate": "2021-09-06T08:20:56Z"
                },
                {
                    "eventAction": "last changed",
                    "eventDate": "2021-11-02T06:50:00Z"
                }
            ],
            "links": [
                {
                    "value": "https://rdap.apnic.net/ip/223.0.0.0",
                    "rel": "self",
                    "href": "https://rdap.apnic.net/entity/IRT-CNBIDCC-CN",
                    "type": "application/rdap+json"
                }
            ]
 ....
```

看到这里我们就可以很清晰的解读了：

- IP地址段：223.0.0.0 - 223.1.255.255
- 企业公司：Beijing Beilong Yunhai Network Data Technology Corporation

当然，我们可以查询到的信息不止这么多，使用whois查询工具也可以查询，基本上原理和我们刚刚手动完成的动作相同：

```bash
╭─arch@archlinux ~
╰─$ whois 223.0.0.1
% [whois.apnic.net]
% Whois data copyright terms    http://www.apnic.net/db/dbcopyright.html

% Information related to '223.0.0.0 - 223.1.255.255'

% Abuse contact for '223.0.0.0 - 223.1.255.255' is 'djn@cnic.cn'

inetnum:        223.0.0.0 - 223.1.255.255
netname:        CNBIDCC
descr:          Beijing Beilong Yunhai Network Data Technology Corporation
descr:          #88, YangYan Road, Yanqi Economic Development Zone,
descr:          HuaiRou, Beijing, China
country:        CN
admin-c:        YW7200-AP
tech-c:         YW7200-AP
mnt-by:         MAINT-CNNIC-AP
mnt-lower:      MAINT-CNNIC-AP
mnt-irt:        IRT-CNBIDCC-CN
mnt-routes:     MAINT-CNNIC-AP
status:         ALLOCATED PORTABLE
last-modified:  2021-11-02T07:48:00Z
source:         APNIC

irt:            IRT-CNBIDCC-CN
address:        #88, YangYan Road, Yanqi Economic Development Zone,
address:        HuaiRou, Beijing, China
e-mail:         djn@cnic.cn
abuse-mailbox:  djn@cnic.cn
admin-c:        YW7200-AP
tech-c:         YW7200-AP
auth:           # Filtered
mnt-by:         MAINT-CNNIC-AP
last-modified:  2021-11-02T06:50:00Z
source:         APNIC

person:         Dong Jinong
address:        88 Yangyan Road, Yanqi Economic Development Zone,
address:        Huairou District, Beijing
country:        CN
phone:          +86-13811566856
e-mail:         djn@cnic.cn
nic-hdl:        YW7200-AP
mnt-by:         MAINT-CNNIC-AP
last-modified:  2021-11-02T06:43:08Z
source:         APNIC

% This query was served by the APNIC Whois Service version 1.88.25 (WHOIS-AU2)
```

如果你阅读到这里，相信你已经可以理解国内的一些IP地址查询网站是如何做的了: [站长工具](https://tool.chinaz.com/ipwhois?q=223.0.0.0)

但为什么域名有些时候无法查询？我经过查询维基百科，里面写了这一段：RDAP协议已注册的名称资源的RDAP数据库在与ICANN达成协议后进行维护。DNS资源要慢得多，因为ICANN下的注册管理机构数量庞大。此外，随着 GDPR 在2018年5月开始实施，WHOIS和RDAP导致的个人信息泄露问题进一步放缓了应用速度。所以我们通常试图使用whois查询域名，获取到的信息有限。

补充一点，在APNIC下属的网站上，也提供了可视化的查询：

[APNIC-NETOX](https://netox.apnic.net/apnic-at-a-glance/223.0.0.0/15)

## 总结

在这篇文章中，介绍了一种利用注册数据访问协议（RDAP）来精确确定资产边界的方法。RDAP是Whois协议的现代化替代品，提供了更全面和实时的域名注册信息，可以帮助安全专业人员更有效地识别和验证目标资产。文章详细探讨了RDAP的功能、其与IANA和区域互联网注册管理机构的关系，以及如何通过RDAP数据获取国家或组织分配的IP地址范围。通过RDAP，用户可以更精确地确定资产归属，为后续的渗透测试工作奠定基础。我们还可以通过将RDAP获取的IP地址范围，输入到网络空间测绘引擎中，来查找更多边缘资产，对于做资产测绘、漏洞挖掘都有很大帮助，我在写这篇文章之前，尝试搜索了一些规模较大的企业，可以找到很多通常思路搜集不到的IP地址边缘资产和业务系统。