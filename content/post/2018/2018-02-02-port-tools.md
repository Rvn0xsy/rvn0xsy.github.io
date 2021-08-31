---
categories: 内网渗透
date: "2018-02-02T00:00:00Z"
description: '本篇文章主要是总结一下常见端口转发姿势。 '
title: 内网渗透常见端口转发方式
url: /archivers/2018-02-02/1
---
本篇文章主要是总结一下常见端口转发姿势。
<!--more-->

* 目录
{:toc}

## 0x01 前言

由于在内网渗透的过程中面对的网络环境都是千奇百怪的，我们需要探测连接情况。

需要使用到端口转发技术来让我们访问到内网其他主机中，或者将内网中某个端口转发到本地。

* 端口映射 ： 端口映射是将一台主机的内网(LAN)IP地址映射成一个公网(WAN)IP地址，当用户访问提供映射端口主机的某个端口时，服务器将请求转移到本地局域网内部提供这种特定服务的主机；
* 

工具列表：

----


| 工具名称| 主要用途 | 平台 | 备注 |
| - | - | - | - |
| lcx | 端口映射 | Windows   |  只支持tcp协议的端口转发，非系统内置 |
| netsh | 端口映射 | Windows | 只支持tcp协议的端口转发 | 
| rinetd | 反向代理 | Linux  | 需要安装包 |
| Earthworm | 端口映射、Socks5代理 | Linux、Windows、MacOS、Arm-Linux | 非系统内置 |
| reGeorg | Socks5 代理 | 常见脚本语言 | 需脚本环境执行，且网络状况较好 |
| Metasploit portfwd | 端口映射 | MSF -> Metpreter会话 | 需要网络状况较好 |
| socat | 端口映射 | Linux | 可能需要安装 |
| Metasploit->socks4a | 反向代理 | MSF -> Metpreter会话 | 需要会话主机有外网代理IP |
| tunna | HTTP隧道 | 常见脚本语言 | 需脚本环境执行，且网络状况较好 |


### 网络拓扑

![网络拓扑][0x01]


## 0x02 lcx

### lcx 参数

```
lcx-<listen|tran|slave> <option> [-log logfile]
[option:]

 -listen <监听端口> <转发端口> 

 -tran<监听端口> <目标地址> <目标端口>

 -slave <目标主机> <目标端口> <本地主机><本机端口>
```

### 端口映射 - 无法访问内网情况下

> 网络情况：A无法访问B主机上的端口，但B可以访问外网

在这种常见的内网环境下，我们可以使用LCX这款工具来帮助我们实现一个端口映射。

首先在A主机上监听两个端口，这两个端口用于交换B主机发送来的数据以及转发A主机发送的数据。
 
这个原理可能有些烧脑，但是仔细跟着我做一遍相信你可以有一个大概的认识 :) 


* A主机上执行命令：`lcx.exe -listen 4455 1234`

* B主机上执行命令：`lcx.exe -slave {A主机IP地址} {A主机端口} {B主机本地IP地址} {B主机某个需要转发出去的端口}`


PS：这两条命令没有先后顺序，谁先执行都可以，建议先在A主机监听后再去执行B主机上的命令。

原理简述：

A主机首先监听的两个端口为 4455 和 1234 ，大概意思就是将4455接收到的主机转发给1234。当然执行这条命令之前，要保证4455及1234未被其他应用程序占用，并且A主机必须是一个B主机能够进行通信的IP地址。

B主机会首先连接A主机的4455端口，此时A主机与B主机建立连接状态，如果我们访问A主机的1234端口，我们发送的数据会经过4455端口发送给B主机需要转发的目标端口。

大致就是 A与B要建立一个通道，将1234的数据不断的传送到B上的目标端口，中间也包括B主机目标端口响应的数据。


### 端口转发 - 能够访问内网某台主机

> 网络情况：A能够访问B主机的任何端口，但是无法访问C主机上的端口

这种大部分情况是A已经能够轻松B主机，而想要去访问C，可以使用LCX的tran参数。

在B主机上执行：`lcx.exe -tran {监听端口} {C主机IP地址} {C主机端口}`

此时我们访问B主机上监听的端口就相当于访问了C主机上的端口。

## 0x03 netsh

> 网络情况：A无法连接C的端口，但是可以连接B，所以能在B上进行端口转发

### 说明

netsh工具都自带portproxy功能。目前只支持tcp协议的端口转发，前提需要作为portproxy的主机需要安装IPV6,安装可以不启用IPV6。

### 安装IPV6

`netsh  interface ipv6 install`

### 转发

```
netsh interface portproxy add v4tov4 listenaddress=10.10.18.1 listenport=4455 connectaddress=10.10.12.1  connectport=8080
```

**此时A访问B(10.10.18.1)的4455端口就相当于访问C(10.10.12.1)的8080端口**

### 删除转发记录

```netsh interface portproxy delete v4tov4 listenaddress={B的IP}  listenport={B的端口}```

### 查看转发记录

```netsh interface portproxy show  v4tov4```

## 0x04 rinetd

> 网络情况：A无法连接C的端口，但是可以连接B，所以能在B上进行端口转发

linux下简单好用的工具rinetd，实现端口映射/转发/重定向

Rinetd是为在一个Unix和Linux操作系统中为重定向传输控制协议(TCP)连接的一个工具。Rinetd是单一过程的服务器，它处理任何数量的连接到在配置文件`etc/rinetd`中指定的地址/端口对。尽管rinetd使用非闭锁I/O运行作为一个单一过程，它可能重定向很多连接而不对这台机器增加额外的负担。


官网地址:http://www.boutell.com/rinetd

软件下载:wget http://www.boutell.com/rinetd/http/rinetd.tar.gz

### 安装

```
tar zxvf rinetd.tar.gz
cd rinetd
make
make install
```


### 配置文件

配置文件结构如下：

| 源地址 | 源端口 | 目的地址 | 目的端口
| - | - | - | - |
| 0.0.0.0 | 8080 | 10.10.12.1 | 8080|
|0.0.0.0 |9090 |10.10.12.1 |3389|
|0.0.0.0 |80  | 10.10.12.1 |80|


`/etc/rinetd.conf`文件中指定了每条转发记录：

```
0.0.0.0 8080 10.10.12.1 8080
0.0.0.0 9090 10.10.12.1 3389
0.0.0.0 80   10.10.12.1 80
```

**PS：0.0.0.0表示本机绑定所有可用地址**

将所有发往B主机的8080端口的请求转发到10.10.12.1的8080端口

同样的，其他都是一样的意思；


## 0x05 Earthworm

### 简介

EW 是一套便携式的网络穿透工具，具有 SOCKS v5服务架设和端口转发两大核心功能，可在复杂网络环境下完成网络穿透。

**PS：该工具已经集成了lcx的所有功能**

该工具共有 6 种命令格式（ssocksd、rcsocks、rssocks、lcx_slave、lcx_listen、lcx_tran）。

官网：http://rootkiter.com/EarthWorm/

### 端口转发

> 网络情况：A无法连接C的端口，但是可以连接B，所以能在B上进行端口转发

原理与LCX相同，只是命令参数有所改变：

```
./ew -s lcx_tran -l 1080 -f 10.10.12.1 -g 9999
```

将所有发往B主机的1080端口的请求转发到10.10.12.1的9999端口

### 正向 SOCKS v5 服务器

> 网络情况：A无法连接C的端口，但是可以连接B，所以能在B上进行SOCKS代理转发

```
./ew -s ssocksd -l 1080
```

此时A主机配置上B主机的socks5服务，即可访问C主机

### 反弹 SOCKS v5 服务器

> 网络情况：A无法连接C的端口，但是B可以连接A，所以需要B连接A，来创建一个Socks5服务(类似于lcx的反向连接)

* 先在一台具有公网 IP 的主机A上运行以下命令：

```
./ew -s rcsocks -l {A主机Socks服务端口} -e {A主机转发端口} 
```

* 在目标主机B上启动 SOCKS v5 服务 并反弹到公网主机的8888端口

```
/ew -s rssocks -d {A主机IP地址} -e {A主机端口} 
```


## 0x06 reGeorg

### 简介

Git地址：https://github.com/sensepost/reGeorg.git

reGeorg是一个Python2.7环境下开发的一款结合Webshell进行端口复用的工具，能够将数据通过在本地建立的Socks服务转发到内网环境。

说明：reGeorg需要配合Webshell使用，并且需要一个良好的网络状况。Python环境必须安装Urlib3

### 创建Socks5代理

> 网络情况：A只能连接B主机的80端口，A无法与C进行通信，且B无法与外网进行通信

首先要选择一个适合目标服务器脚本环境的Webshell脚本，将该脚本上传到服务器上，记录下地址

在浏览器中访问会出现很熟悉的 Georg says, 'All seems fine',说明是正常的

例如Webshell地址如：http://10.10.18.1/shell.jsp

进入reGeorg目录，执行`python reGeorgSocksProxy.py -u {Webshell地址} -p {本地Socks5服务监听的端口}`


最后会输出`Starting socks Server [127.0.0.1:端口]`，此时就可以使用浏览器设置Socks代理访问内网主机的端口了。



## 0x07 Metasploit Portfwd

### 简介

Metasploit中的Portfwd是集成于Metpreter会话中的一个后渗透模块，多用于将内网某个主机的端口转发到本地。

### 内网端口转发

> 网络状况：A已经控制了B主机，但是无法与C主机进行通信

```
meterpreter > portfwd -h
Usage: portfwd [-h] [add | delete | list | flush] [args]


OPTIONS:

    -L <opt>  转发: 本地监听地址  反向: 本地主机连接到某个地址
    -R        表示正向反向端口
    -h        帮助信息
    -i <opt>  端口转发条目的索引与交互（请参阅“列表”命令）
    -l <opt>  转发：本地端口收听  反向：本地端口连接
    -p <opt>  转发：远程端口连接  反向：远程端口监听
    -r <opt>  转发：连接到远程主机
```

正向转发端口：

`portfwd -L 127.0.0.1 -l 1212 -r 10.10.12.1 -p 3389`

此时访问本地的1212端口就相当于访问10.10.12.1的3389端口


反向转发端口：

`portfwd -R -L 10.10.18.1 -l 8080 -r 10.10.12.1 -p 8877`

此时访问10.10.18.1的8080端口就相当于访问10.10.12.1的8877端口

## 0x08 socat

参考：http://payloads.online/tools/socat


## 0x09 Metasploit->socks4a

### 简介

该模块是Metasploit下一个辅助模块，用于在本地创建一个socks4a代理，用于通向Metpreter会话上的主机网络。

### 创建socks4a代理

> 网络状况：A已经控制了B主机，但是无法与C主机进行通信

```shell

msf exploit(handler) > use auxiliary/server/socks4a 
msf auxiliary(socks4a) > show options 
Module options (auxiliary/server/socks4a):
   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   SRVHOST  0.0.0.0          yes       The address to listen on
   SRVPORT  1080             yes       The port to listen on.
Auxiliary action:
   Name   Description
   ----   -----------
   Proxy  
msf auxiliary(socks4a) > exploit -y
[*] Auxiliary module execution completed
msf auxiliary(socks4a) > 
[*] Starting the socks4a proxy server
```

* SRVHOST 是服务端IP地址，默认是本机所有IP
* SRVPORT 是Socks4a监听端口

执行后本地会监听一个1080端口，可以使用浏览器代理、或proxychains-ng等工具代理扫描。


## 0x10 tunna

### 简介

Tunna是一套工具，通过HTTP协议建立一个TCP通信隧道，属于端口复用技术。它可以用来绕过防火墙环境中的网络限制。

Git：https://github.com/SECFORCE/Tunna

### 端口转发

> 网络状况：A已经拥有了B主机的Webshell，但是无法对B主机的其他端口进行通信

该工具的使用方法与reGeorg相似，但是比reGeorg更加稳定、快速、高效。

例如(1)：`python proxy.py -u {WebShell地址} -l 1234 -r 3389 -v -n -s`

此时，将目标服务器的3389端口转发到本地的1234端口

例如(2)：`python proxy.py -u {WebShell地址} -l 1234 -r 3389 -a 10.10.12.1 -v -n -s`

此时，将10.10.12.1服务器的3389端口转发到本地的1234端口



## 0x11 结语

可能这次总结的不算很完善，后期有新的工具再向里面添加。



[0x01]: https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-02-03/0x01.png
