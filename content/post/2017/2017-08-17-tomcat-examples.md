---
author: 科拉实验室-倾旋
date: "2017-08-17T00:00:00Z"
description: 渗透中tomcat Examples目录中关于Session的分析，如何越权
title: 渗透中tomcat Examples目录中关于Session的分析
url: /archivers/2017-08-17/1
---
渗透中tomcat Examples目录中关于Session的分析，如何越权
<!--more-->
* 目录
{:toc}

## 0x00 前言

昨晚安装了Tomcat，想总结一下关于JSP WEB部署方面的安全加固方案，于是搜索到了一个关于tomcat服务安装时自带的一个Examples目录下的Session操作页面产生的安全隐患。

但是参考网上的文章，发现存在一定的鸡肋问题，在文末与大家一起探讨。

位于：`examples/servlets/sessions.html`

## 0x01 环境

* 服务器：Windows Server 2008 R2
* HTTP Server Version：Apache Tomcat/7.0.79
* 端口：8080
* IP Address ：192.168.3.204


![访问页面](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x01.jpg)

访问页面如上所示，我们获得了一个Session ID，这个Session ID是代表了我们当前的一个身份会话。

## 0x02 关于Session

我们按照网上的参考文章新建几个文件：

```
2017/08/17  10:24               201 index.jsp#登录后的页面，如果没有管理员Session，则会跳转到login.jsp
2017/08/17  10:55               274 login.jsp#登录表单页面
2017/08/17  10:25               438 login2.jsp#处理登录页面
```

index.jsp code:

```java
<%
if(session.getAttribute("login")
!= null && ((String)session.getAttribute("login")).equals("admin"))
{
out.println("Login");
}else{
response.sendRedirect("login.jsp");
}
%> 
```

login.jsp code:

```html
<html>
<head>
<meta charset="UTF-8">
</head> 
<body>
<form action="login2.jsp" method="POST" >
username:<input type="text" name="username"><br>
password:<input type="text" name="password"
><br>
<input type="submit" value="login"><br>
<form>
</body>
</html>
```

login2.jsp code:

```java

<%
if
(request.getParameter("username") != null && request.getParameter("password") != null) {
	String username = request.getParameter("username"); 
	String password = request.getParameter("password"); 
	//验证身份
	if (username.equals("admin") && password.equals("admin")) {
	session.setAttribute("login","admin");
	response.sendRedirect("index.jsp");
	}
	else {
	response.sendRedirect("login.jsp");
	}
}
%>
```

以上文件位于站点根目录（Webapps）下的`login`文件夹。

我们通过Examples下的Session操作页面来设置一个Session内容，Name为login，Value为admin。

![设置Session](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x02.jpg)

```
Session ID: 3C907C44B42E097983D71357924FE43D 
Created: Thu Aug 17 12:16:06 CST 2017
Last Accessed: Thu Aug 17 12:37:00 CST 2017
The following data is in your session:
login = admin
```

```
GET /login/login.jsp HTTP/1.1
Host: 192.168.3.204:8080
User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0 FirePHP/0.7.4
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3
Accept-Encoding: gzip, deflate
Cookie: JSESSIONID=3C907C44B42E097983D71357924FE43D
x-insight: activate
Connection: keep-alive
Upgrade-Insecure-Requests: 1
```

设置成功后，我们直接访问login下的index.jsp文件，得到响应头如下：


```
HTTP/1.1 302 Found
Server: Apache-Coyote/1.1
Location: login.jsp
Content-Type: text/html;charset=ISO-8859-1
Content-Length: 0
Date: Thu, 17 Aug 2017 04:42:14 GMT
```

可以看到并没有利用成功，那么是什么原因呢？

我们看看向Session中设置令牌的页面响应头：

```
HTTP/1.1 200 OK
Server: Apache-Coyote/1.1
Set-Cookie: JSESSIONID=DF6A3AFB904871AC3F636C16B87B6364; Path=/examples
Content-Type: text/html;charset=ISO-8859-1
Content-Length: 1131
Date: Thu, 17 Aug 2017 04:47:54 GMT
```
可以发现当前这个响应给Session ID设置了一个有效路径。

我们获取到的Session是一个位于Examples文件夹的有效令牌，当我们用`/examples`目录下的令牌访问`/login`是无效的。

我们来看看设置Session的页面源代码：

```java
import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class SessionExample extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response)
    throws IOException, ServletException
    {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(true);  // 如果获取不到 Session 就创建一个 Session

        // print session info

        Date created = new Date(session.getCreationTime());
        Date accessed = new Date(session.getLastAccessedTime());
        out.println("ID " + session.getId());
        out.println("Created: " + created);
        out.println("Last Accessed: " + accessed);

        // set session info if needed

        String dataName = request.getParameter("dataName");
        if (dataName != null && dataName.length() > 0) {
            String dataValue = request.getParameter("dataValue");
            session.setAttribute(dataName, dataValue);
        }

        // print session contents

        Enumeration e = session.getAttributeNames();
        while (e.hasMoreElements()) {
            String name = (String)e.nextElement();
            String value = session.getAttribute(name).toString();
            out.println(name + " = " + value);
        }
    }
}
```

关于`request.getSession(true)`官方好像没有对Session有效路径做介绍，参考的文章中大多都说 Session是全局有效的。

但是在Cookie中是对路径也有限制的。

## 0x03 成功的一次

这一次是成功了，但是项目必须部署在Examples目录下，我将Login下的文件都放入此目录。

![set session](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x03.jpg) 

获得一个新的Session，并且设置login为admin。

直接访问`http://192.168.3.204:8080/examples/index.jsp`

![login](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x04.jpg) 

可以看到已经进入我们想要的页面了。

![Cookie](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-08-17/0x05.jpg) 

并且Session ID相同。

## 0x04 总结

此篇文章涉及到了Session的特性，以及Cookie与Session ID的关系，另外还有一定的疑问存在，`Examples目录下的Session是不是全局的？`

此漏洞过于鸡肋，况且也不会有应用部署到这个演示文件夹下，权当安全研究 ~~ 

再有一个问题就是，我们不知道Session中的Name和Value到底设置成什么才可以伪造其他身份，这些都是开发人员的习惯和标准，又增大了一个利用难度，所以说：鸡肋！鸡肋！鸡肋！

后文继续总结Tomcat的其他安全隐患……