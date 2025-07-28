---
title: "记录一下配置Clash透明代理"
date: 2023-08-07
description: 日常办公和上网需要挂不同的代理，切换起来有点麻烦，所以记录一下配置Clash透明代理的流水账
url: /archivers/2023-08-07/clash-config
tags: [clash]
---

<aside>
😀 我日常使用Arch Linux来进行办公，但公司的办公网络和上网需要挂不同的代理，浏览器切换起来有点麻烦，我需要一个解决方案支持配置规则的方式来让我系统上的流量进行选择性的转发，我发现Clash+iptables（Linux用户独有的福利）可以非常简单的做到。

</aside>

# 📝Clash是什么？

https://github.com/Dreamacro/clash

Clash是一个支持多种协议隧道转发的工具，主要功能如下：

- Inbound: HTTP, HTTPS, SOCKS5 server, TUN device
- Outbound: Shadowsocks(R), VMess, Trojan, Snell, SOCKS5, HTTP(S), Wireguard
- Rule-based Routing: dynamic scripting, domain, IP addresses, process name and more
- Fake-IP DNS: minimises impact on DNS pollution and improves network performance
- Transparent Proxy: Redirect TCP and TProxy TCP/UDP with automatic route table/rule management
- Proxy Groups: automatic fallback, load balancing or latency testing
- Remote Providers: load remote proxy lists dynamically
- RESTful API: update configuration in-place via a comprehensive API

目前作者还在维护[高级核心版](https://dreamacro.github.io/clash/premium/introduction.html)（免费），为了尝试支持更多功能。

# 🪢关于透明代理

这里可以参考之前写过的一篇介绍：

[Linux透明代理在红队渗透中的应用 | 倾旋的博客](https://payloads.online/archivers/2020-11-13/1/)

# 配置Clash服务

这里需要注意的是需要设置redir-port，这个选项: *Linux 和 macOS 的透明代理服务端口 (TCP 和 TProxy UDP 重定向)*

```yaml
port: 7890
socks-port: 7891
allow-lan: true
redir-port: 7892
mode: Rule
log-level: info
external-controller: 127.0.0.1:9090
experimental:
  interface-name: enp34s0 # your interface-name
dns:
  enable: true
  listen: 127.0.0.1:53
  nameserver:
    - 223.5.5.5
  fallback:
    - 'tls://1.1.1.1:853'
    - 'tcp://1.1.1.1'
    - 'tcp://208.67.222.222:443'
    - 'tls://dns.google'
```

除此之外，最好编写一个服务文件，将Clash运行在其他用户身份下：

```
[Unit]
Description=clash daemon

[Service]
Type=simple
StandardError=journal
User=clash
Group=clash
CapabilityBoundingSet=CAP_NET_BIND_SERVICE CAP_NET_ADMIN
AmbientCapabilities=CAP_NET_BIND_SERVICE CAP_NET_ADMIN
ExecStart=/usr/bin/clash -d /home/arch/.config/clash
Restart=on-failure

[Install]
WantedBy=default.target
```

将服务文件拷贝到：/etc/systemd/system/

```
$ sudo systemctl daemon-reload # 重新扫描服务单元变更
$ sudo systemctl enable clash  # 开机启动
$ sudo systemctl start clash   # 启动Clash
```

设置DNS服务器地址，直接/etc/resolv.conf文件即可：

```
# /etc/resolv.conf
nameserver 127.0.0.1
```

# 配置iptables规则

在iptables中有一个owner模块，可以过滤指定用户的流量，对我们来说只需要将clash运行在一个单独的用户身份下，对这个用户的所有流量放行即可。

![0](https://images.payloads.online/2024-07-29-f3fe5de39caf1acc5768e1e07a6f58105a5754e7a95d912b73d6c7da2af6fae4.png)  


iptables命令：

```
# 添加规则
sudo iptables -t nat -A OUTPUT -p tcp -m owner ! --uid-owner clash ! -d 127.0.0.1 -j REDIRECT --to-port 7892

# 删除规则
sudo iptables -t nat -D OUTPUT -p tcp -m owner ! --uid-owner clash ! -d 127.0.0.1 -j REDIRECT --to-port 7892
```

这个命令的意思是将所有不属于用户ID为"clash"的TCP流量重定向到端口7892。

# 配置Clash规则

```yaml
proxies:
  - ...server1
  - ...server2
proxy-groups:
  - name: ProxyChian1
    type: select
    proxies:
      - server1
      - DIRECT
- name: ProxyChian2
    type: select
    proxies:
      - DIRECT
	- name: 工作环境
    type: select
    proxies:
      - server1
rules:
  - DOMAIN-SUFFIX,local,ProxyChian2
  - DOMAIN-SUFFIX,localhost,ProxyChian2
  - DOMAIN-SUFFIX,payloads.online,工作环境
  - IP-CIDR,10.10.0.0/16,工作环境,no-resolve
  - IP-CIDR,10.20.0.0/24,工作环境,no-resolve
  - .....
```

通过rules可以配置不同的DNS域名、IP-CIDR目标地址的流量该走到哪个代理链上，这里我的规则仅仅只是示例，为了达到更好的网络体验，规则是上达几百行的。

![1](https://images.payloads.online/2024-07-29-6530f58ed8ca3b853ddd4f691bc570234ca5738c3ff21958ce688559d1355bc1.png)  


如此一来，工作/上网问题不需要切换代理解决了。