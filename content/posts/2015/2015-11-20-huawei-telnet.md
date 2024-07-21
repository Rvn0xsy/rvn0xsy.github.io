---
categories:
- 网络工程
date: "2015-11-20T00:00:00Z"
description: 本文记录一下华为交换机Telnet远程登录的简单配置
title: 华为交换机Telnet远程登录
url: /archivers/2015-11-20/1
---

本文记录一下华为交换机Telnet远程登录的简单配置


![enter description here][1]


交换机：

```


<Huawei>sys

[Huawei]user-interface vty 0 4

[Huawei-ui-vty0-4]authentication-mode aaa

[Huawei-ui-vty0-4]q

[Huawei-aaa]local-user admin password simple?123456

[Huawei-aaa]local-user admin privilege? level 3

[Huawei-aaa]local-user admin service-type telnet

[Huawei-aaa]q

[Huawei]int vlan 1

[Huawei-Vlanif1]ip address 192.168.1.1 24
```

路由器：


```

<Huawei>sys

[Huawei]int G 0/0/0

[Huawei-GigabitEthernet0/0/0]ip add

[Huawei-GigabitEthernet0/0/0]ip address 192.168.1.2 24

<Huawei>telnet 192.168.1.1

Press CTRL_] to quit telnet mode

Trying 192.168.1.1 …

Connected to 192.168.1.1 …
```

[1]: https://images.payloads.online/d05697e6-4f5e-11ec-a083-00d861bf4abb.png "0x05"
  
  