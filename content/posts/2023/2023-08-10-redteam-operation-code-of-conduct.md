---
title: "红队行动守则"
date: 2023-08-10
description: 这篇文章是收集了多数红队在进行红队行动的经验之谈，由于工作发展原因，不再继续红队相关的工作，因此决定分享出来。
url: /archivers/2023-08-10/redteam-operation-code-of-conduct
tags: redteam
---


<aside>
📌 这篇文章是收集了多数红队在进行红队行动的经验之谈，由于工作发展原因，不再继续红队相关的工作，因此决定分享出来。

</aside>

## 攻击注意事项

- 使用免杀Webshell（文件特征、流量特征），禁止使用开源社区通用Webshell，这些是我过去常用的Webshell: https://github.com/Rvn0xsy/usefull-code
- 尽可能的删除依赖工具的软件特征、流量特征
- 打点后先进行权限维持(并且最好都额外打一个内存马) 原因：单个Webshell即使免杀，也有可能被防守方发现，一旦被删除就失去了服务器控制权
- 不执行敏感的操作(如反弹Shell)
- 获取权限后的信息收集，通过网络、应用业务、服务器登录日志、命令执行日志判断当前机器是否是蜜罐
- 核心关键隧道：使用规避内存扫描的C2解决方案
- 端口反连使用常见端口，伪装正常应用流量(25,110,80,443,993,995,8080,8443)
- C2基础设施配置为HTTPS/DNS上线，最好勿用HTTP，证书采用CDN服务商或Let’s Encrypt
- 搭建正向的Web代理后，应当先研究如何提升隧道传输质量，避免多人扫描

[Web正向代理的思考 | 倾旋的博客](https://payloads.online/archivers/2020-11-01/1/)

- 内网探测工具的选择尽可能脚本化、去特征、低频率
- 隧道建立：采用开源魔改工具实现，避免流量和样本特征与公开的重合
- 弱口令扫描：低频、小字典、优先尝试SSH/RDP/MySQL/MSSQL等弱口令（分两类：有数据的服务器、有管理端口的服务器）
- 登录Linux服务器，应当避免Bash History被记录可使用sh来执行命令，或设置环境变量避免Bash记录历史命令。

```bash
python -c 'import pty;pty.spawn("/bin/sh")'
# or
unset HISTORY HISTFILE HISTSAVE HISTZONE HISTORY HISTLOG; 
export HISTFILE=/dev/null; 
export HISTSIZE=0;
export HISTFILESIZE=0
```

- 操作合规：非必要情况下，不修改任何服务器用户密码
- 操作合规：非必要情况下，不使用破坏性较强的Exploit或者工具
- 操作合规：非必要情况下，不要对内网进行大规模探测 例如不要/8
- 操作合规：非必要情况下，切勿上来就进行扫描探测，先应对当前主机做详细的信息搜集和分析
- 工具存放：工具统一存放在隐藏目录下，文件名称命名为服务进程（tomcat/nginx）等，有AV/EDR情况，工具应先本地测试免杀之后，再落地到目标服务器，最好有多个平替工具

## 反溯源注意事项

- 外网攻击时：尽量使用虚拟机进行渗透，并且测试时不提交包含个人特征信息的手机号码、QQ、微信、其他信息，最好日常工作的浏览器和渗透攻击的浏览器用两个。一般我会创建攻击机的虚拟机快照，项目结束恢复初始状态，干干净净。
- 内网攻击时：攻击结束必须进行痕迹清理，及时删除自用软件，如Webshell、免杀上线马、0day工具、扫描工具、自研工具，甚至包含系统日志。
- 短线社工钓鱼：尽量避开技术人员，从非技术人员入手，钓鱼信息为非实名信息
- 短线社工钓鱼：远程获取的可执行文件，谨慎点击(尤其是VPN客户端，谨防蜜罐)，可以上传各类沙箱进行检测，同时运行可以采用虚拟机的方式。
- 在开源社区获得系统或工具源代码后，谨慎打开，防止IDE的编译、加载、调试选项内藏上线命令。

## 职业操守

- 禁止下载、更改业务数据（企业数据），修改业务系统密码（如路由器、Web站点后台、VPN）降低业务影响。
- 禁止使用会造成不良后果的攻击方式（如DDOS攻击）。
- 测试结束后删除Webshell等恶意文件或记住固定存放位置。
- 禁止使用境外跳板机、VPN。
- 使用统一攻击资源与授权攻击工具。
- 对项目、行动内容在公开场合进行保密，不产生任何舆论影响。