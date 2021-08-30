---
categories: 内网渗透
date: "2018-04-18T00:00:00Z"
description: 《Web安全测试学习手册》- 服务器启用了不安全的HTTP方法
title: 服务器启用了不安全的HTTP方法
url: /archivers/2018-04-18/1
---

《Web安全测试学习手册》- 服务器启用了不安全的HTTP方法
<!--more-->
* 目录
{:toc}

## 0x00 不安全的HTTP方法

### 1）什么是不安全的HTTP方法

开发人员、运维人员一般可能用于调试服务器，开启了一些客户端能够直接读写服务器端文件的方法，例如： DELETE, PUT, COPY, MOVE, PROPFIND, PROPPATCH, SEARCH, LOCK, UNLOCK 等HTTP协议支持的方法。

### 2）不安全的HTTP方法特点

可通过浏览器直接读写服务器端文件

## 0x01 不安全的HTTP方法 - 风险等级

**高**

## 0x02 不安全的HTTP方法 - 原理

|  方法 | 说明
|-|-|
|  PUT 	  |向指定的目录上载文件
|  DELETE	|删除指定的资源
|  COPY	  |将指定的资源复制到Destination消息头指定的位置
|  MOVE	  |将指定的资源移动到Destination消息头指定的位置
|  SEARCH	  |在一个目录路径中搜索资源
|  PROPFIND	  |获取与指定资源有关的信息，如作者、大小与内容类型
|  TRACE	  |在响应中返回服务器收到的原始请求

服务器端由于配置权限不当，导致允许了客户端发送 DELETE, PUT, COPY, MOVE, PROPFIND, PROPPATCH, SEARCH, LOCK, UNLOCK等请求，并且解析请求进行操作文件。

## 0x03 不安全的HTTP方法 - 常见场景

* Tomcat 中间件
* IIS 中间件

## 0x04 测试方案

使用CURL发送OPTIONS请求，查看响应头中的Allow行

命令：`curl -I -X OPTIONS http://payloads.online`


```
➜  ~ curl -I -X OPTIONS http://10.211.55.16/
HTTP/1.1 200 OK
Date: Wed, 18 Apr 2018 02:17:47 GMT
Server: Microsoft-IIS/6.0
MS-Author-Via: DAV
Content-Length: 0
Accept-Ranges: none
DASL: <DAV:sql>
DAV: 1, 2
Public: OPTIONS, TRACE, GET, HEAD, DELETE, PUT, POST, COPY, MOVE, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, SEARCH
Allow: OPTIONS, TRACE, GET, HEAD, DELETE, COPY, MOVE, PROPFIND, PROPPATCH, SEARCH, MKCOL, LOCK, UNLOCK
Cache-Control: private
```

若出现PUT、DELETE....等方法，则存在此风险

![0x00](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-04-18/0x00.png)

## 0x05 修复方案

### IIS 

修改站点权限，取消“写入”

![0x01](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-04-18/0x01.gif)

### Tomcat

修改`web.xml`

```xml
<security-constraint>
<web-resource-collection>
<web-resource-name>fortune</web-resource-name>
<url-pattern>/*</url-pattern>
<http-method>PUT</http-method>
<http-method>DELETE</http-method>
<http-method>HEAD</http-method>
<http-method>OPTIONS</http-method>
<http-method>TRACE</http-method>
</web-resource-collection>
<auth-constraint></auth-constraint>
</security-constraint>
<login-config>
<auth-method>BASIC</auth-method>
</login-config>
```

### Nginx

在 `server`代码块内写入如下代码，用于屏蔽非GET、POST请求：

```
if ($request_method !~* GET|POST) {
            return 403;

   }
```

