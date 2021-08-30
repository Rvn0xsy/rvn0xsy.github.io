---
author: Rvn0xsy
date: "2017-08-17T00:00:00Z"
description: tomcat后台getshell
title: 渗透中tomcat部署war包Getshell
url: /archivers/2017-08-17/2
---
本文演示一下tomcat后台getshell
<!--more-->
* 目录
{:toc}

## Tomcat 爆破

在渗透测试中，我们经常遇到tomcat后台被默认部署在外部的情况，类似于`http://192.168.3.204:8080/host-manager/html`

在这种情况下，我们都会选择去爆破来进入后台部署shell。 

先抓取一下我们的登录包：

```
GET /host-manager/html HTTP/1.1
Host: 192.168.3.204:8080
User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0 FirePHP/0.7.4
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3
Accept-Encoding: gzip, deflate
DNT: 1
x-insight: activate
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Authorization: Basic YWRtaW46MTIzNDU2
```
在Tomcat后台登录的数据包中我们发现它会将输入的账号和密码都编码成Base64密文。

格式：`用户名:密码` => `admin:123456` => `YWRtaW46MTIzNDU2`


这里我们可以采用Metasploit中的tomcat爆破辅助模块，当然也可以用BurpSuite来爆破：


将数据包发送到Intruder模块，添加一个变量：

![Intruder](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x06.jpg)

在设置Payload的时候要使用自定义迭代器：

![Intruder](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x07.jpg)

由于登录令牌都是`base64`加密的，我们需要 `[用户名]:[密码]`这样的格式进行`base64encde`才可以发送出去，我们设置三个迭代payload分别代表：用户名、:、密码、。


![Intruder](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x08.jpg)

第一位设置用户名这类的字典，可以多个。

![payloads](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x09.jpg)

第二位设置`:`，只需要一个即可。

![payloads](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x10.jpg)

第三位设置密码，可以多个。


然后设置一个编码器，选择`base64`这个函数：

![encoder](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x11.jpg)

接下来再将url编码去掉，因为在base64密文里`=`会被编码成`%3d`。

![urldecode](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x12.jpg)



设置完毕后，我们可以爆破了：

![payloads](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x13.jpg)

## Tomcat 部署war getshell

在获取到令牌后，我们可以进入Tomcat后台了：

![login](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x14.jpg)

在这个后台，我们可以操作每个应用的状态……以及读取每个应用下的Session。

但是这都不是最大的安全隐患 :)

下面来讲一下如何制作war包。

> war包：Java web工程，都是打成war包，进行发布，如果我们的服务器选择TOMCAT等轻量级服务器，一般就打出WAR包进行发布


![tomcat](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x15.jpg)

先准备了一个JSP的一句话木马，安装好JDK环境，我的目录是在`C:\Program Files (x86)\Java\jdk1.8.0_131\bin`,这个目录下又个文件叫`jar.exe`。

执行:`jar -cvf [war包名称].war 打包目录`


![maked](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x16.jpg)

我们现在已经打包好了一个WAR包。

找到Tomcat管理页面中的`WAR file to deploy`进行上传就可以部署了。

![war](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x17.jpg)

应用列表已经出现了我们的目录：

![application](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x18.jpg)

访问文件名即可：

![shell](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x19.jpg)


## 总结

在爆破的时候发现频率过高会有爆破不成功的现象，最好是调整一下短时间内请求的次数。