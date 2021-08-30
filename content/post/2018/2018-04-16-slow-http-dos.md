---
categories: Web安全测试学习手册
date: "2018-04-16T00:00:00Z"
description: 《Web安全测试学习手册》- Slow HTTP DOS
title: Slow HTTP DOS
url: /archivers/2018-04-16/2
---
《Web安全测试学习手册》- Slow HTTP DOS
<!--more-->

* 目录
{:toc}

## 0x00 Slow HTTP DOS - 介绍

### 1）什么是Slow HTTP DOS

Slow HTTP DOS(Slow HTTP Denial of Service Attack)，译为缓慢的HTTP拒绝服务，这类攻击方式出现在许多公开协议中。

### 2）Slow HTTP DOS的特点

Slow HTTP DOS是一个应用层拒绝服务攻击，主要针对协议为HTTP，攻击的成本很低，并且能够消耗服务器端资源，占用客户端连接数，导致正常用户无法连接服务器。

## 0x01 Slow HTTP DOS - 风险等级

**中**

## 0x02 Slow HTTP DOS - 原理

既然是一个HTTP协议的缓慢攻击，这就要从HTTP协议说起了。

首先HTTP协议的报文都是一行一行的，类似于：

```
GET / HTTP/1.1\r\n
Host : payloads.online\r\n
Connection: keep-alive\r\n
Keep-Alive: 900\r\n
Content-Length: 100000000\r\n
Content_Type: application/x-www-form-urlencoded\r\n
Accept: *.*\r\n
\r\n
```

那么报文中的`\r\n`是什么？

`\r\n`代表一行报文的结束也被称为空行（CRLF），而`\r\n\r\n`代表整个报文的结束

从上面贴出的`GET`请求包可以看出，我们的客户端请求到服务器后，告知服务器这个连接需要保留。

通常我们知道HTTP协议采用“请求-应答”模式，当使用普通模式，即非KeepAlive模式时，每个请求/应答客户和服务器都要新建一个连接，完成之后立即断开连接`（HTTP协议为无连接的协议）`；当使用`Keep-Alive模式（又称持久连接、连接重用）`时，Keep-Alive功能使客户端到服 务器端的连接持续有效，当出现对服务器的后继请求时，Keep-Alive功能避免了建立或者重新建立连接。


那么当我们客户端发送一个报文，不以`CRLF`结尾，而是10s发送一行报文，我们的报文需要80s才能发送完毕，这80s内，服务器需要一直等待客户端的CRLF，然后才能解析这个报文。


如果客户端使用更多的程序发送这样的报文，那么服务器端会给客户端留出更多的资源来处理、等待这迟迟不传完的报文。假设服务器端的客户端最大连接数是100个，我们使用测试程序先连接上100次服务器端，并且报文中启用Keep-Alive，那么其他正常用户101、102就无法正常访问网站了。


## 0x03 Slow HTTP DOS - 常见场景

大多出现在默认安装好的Apache Web中，未合理设置客户端连接数导致的。

## 0x04 测试方案

使用Slow HTTP Test 工具进行检测

Kali Linux 安装 ：apt-get install slowhttptest 


SlowHTTPTest是一个可配置的应用层拒绝服务攻击测试攻击，它可以工作在Linux，OSX和Cygwin环境以及Windows命令行接口，可以帮助安全测试人员检验服务器对慢速攻击的处理能力。

这个工具可以模拟低带宽耗费下的DoS攻击，比如慢速攻击，慢速HTTP POST，通过并发连接池进行的慢速读攻击（基于TCP持久时间）等。慢速攻击基于HTTP协议，通过精心的设计和构造，这种特殊的请求包会造成服务器延时，而当服务器负载能力消耗过大即会导致拒绝服务。

### Slow Header

```
slowhttptest -c 65500 -H -i 10 -r 200 -s 8192 -t SLOWHEADER -u http://payloads.online
```

该攻击会像我们刚才讲的慢速传递HTTP报文，占用服务器资源让其等待我们最后的CRLF。


### Slow Read

```
slowhttptest -c 65500 -X -r 1000 -w 10 -y 20 -t SLOWREAD -n 5 -z 32 -u http://payloads.online
```

该攻击会在Web服务器响应内容传输回来的时候，我们客户端缓慢的读取响应报文，这样服务器端也会一直等待客户端来接收完毕。


### Slow Post

```
slowhttptest -c 65500 -B -i 10 -r 200 -s 8192 -t SLOWBODY -u http://payloads.online
```

该攻击会构造一个POST数据包，将数据缓慢传输，使服务器端一直等待接收报文。

## 0x05 修复方案

* 1.设置合适的 timeout 时间（Apache 已默认启用了 reqtimeout 模块），规定了 Header 发送的时间以及频率和 Body 发送的时间以及频率

* 2.增大 MaxClients(MaxRequestWorkers)：增加最大的连接数。根据官方文档，两个参数是一回事，版本不同，MaxRequestWorkers was called MaxClients before version 2.3.13. The old name is still supported.

* 3.默认安装的 Apache 存在 Slow Attack 的威胁，原因就是虽然设置的 timeoute，但是最大连接数不够，如果攻击的请求频率足够大，仍然会占满 Apache 的所有连接

针对不同的Server其对慢速http拒绝服务攻击防范方法也不同，建议使用以下措施防范慢速http拒绝服务攻击：
 
### WebSphere
 
* 1、限制 HTTP 数据的大小
在WebSphere Application Server 中进行如下设置：
 
任何单个 HTTP 头的默认最大大小为 32768 字节。可以将它设置为不同的值。
 
HTTP 头的默认最大数量为 50。可以将它设置为不同的限制值。
 
另一种常见的 DOS 攻击是发送一个请求，这个请求会导致一个长期运行的 GET 请求。WebSphere Application Server Plug-in 中的 ServerIOTimeoutRetry 属性可限制任何请求的重试数量。这可以降低这种长期运行的请求的影响。
 
设置限制任何请求正文的最大大小。详见参考链接。
 
* 2、设置keepalive参数
 
打开ibm http server安装目录，打开文件夹conf，打开文件httpd.conf,查找KeepAlive值，改ON为OFF,其默认为ON。
 
这个值说明是否保持客户与HTTP SERVER的连接，如果设置为ON，则请求数到达MaxKeepAliveRequests设定值时请求将排队，导致响应变慢。
 
 
### Weblogic
 
* 1、在配置管理界面中的协议->一般信息下设置 完成消息超时时间小于400
* 2、在配置管理界面中的协议->HTTP下设置 POST 超时、持续时间、最大 POST 大小为安全值范围。

 
### Nginx
 
* 1、通过调整$request_method，配置服务器接受http包的操作限制；
* 2、在保证业务不受影响的前提下，调整client_max_body_size, client_body_buffer_size, client_header_buffer_size,large_client_header_buffersclient_body_timeout, client_header_timeout的值，必要时可以适当的增加；
* 3、对于会话或者相同的ip地址，可以使用HttpLimitReqModule and HttpLimitZoneModule参数去限制请求量或者并发连接数；
* 4、根据CPU和负载的大小，来配置worker_processes 和 worker_connections的值，公式是：max_clients = worker_processes * worker_connections。
 
### Apache

 
建议使用mod_reqtimeout和mod_qos两个模块相互配合来防护。

* 1、mod_reqtimeout用于控制每个连接上请求发送的速率。配置例如：
#请求头部分，设置超时时间初始为10秒，并在收到客户端发送的数据后，每接收到500字节数据就将超时时间延长1秒，但最长不超过40秒。可以防护slowloris型的慢速攻击。
RequestReadTimeout header=10-40,minrate=500
#请求正文部分，设置超时时间初始为10秒，并在收到客户端发送的数据后，每接收到500字节数据就将超时时间延长1秒，但最长不超过40秒。可以防护slow message body型的慢速攻击。
RequestReadTimeout body=10-40,minrate=500
需注意，对于HTTPS站点，需要把初始超时时间上调，比如调整到20秒。
 
* 2、mod_qos用于控制并发连接数。配置例如：

当服务器并发连接数超过600时，关闭keepalive

QS_SrvMaxConnClose 600

限制每个源IP最大并发连接数为50

QS_SrvMaxConnPerIP 50
这两个数值可以根据服务器的性能调整。
 
 
### IHS服务器


请您先安装最新补丁包，然后启用`mod_reqtimeout`模块，在配置文件中加入：

```
LoadModule reqtimeout_module modules/mod_reqtimeout.so
```

为`mod_reqtimeout`模块添加配置：

```
<IfModule mod_reqtimeout.c>
RequestReadTimeout header=10-40,MinRate=500 body=10-40,MinRate=500
</IfModule>
```

对于HTTPS站点，建议header=20-40,MinRate=500。

* 参见：http://www-01.ibm.com/support/docview.wss?uid=swg21652165
 
 
### F5负载均衡修复建议

 
F5负载均衡设备有相应的防护模块，如无购买可参考附件中的详细配置过程。

关于F5的慢速攻击防护配置，请参考以下链接：
* https://support.f5.com/kb/en-us/solutions/public/10000/200/sol10260.html
* https://devcentral.f5.com/articles/mitigating-slow-http-post-ddos-attacks-with-irules-ndash-follow-up
 
### tomcat服务器

解决方案：
* 1、设置Tomcat / server.xml文件    connectiontimeout 值，默认为20000ms，修改为8000ms(Tomcat 自身安全漏洞)
* 2、设置AJAX的全局timeout时间（默认为30000ms） $.ajaxSetup({timeout:8000}).

<address>
感谢<b><a href="mailto:lyquan16@gmail.com">Wingkyun</a></b>给予我的修复建议<br>
</address>


