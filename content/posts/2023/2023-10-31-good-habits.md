---
title: "需要保持的几个好习惯"
date: 2023-10-31
description: 在这里我梳理一些工作和生活需要保持的几个好习惯，用于时刻提醒自己继续保持。
url: /archivers/2023-10-31/good-habits
tags: 心情随笔
---

<aside>
😀 在这里我梳理一些工作和生活需要保持的几个好习惯，用于时刻提醒自己继续保持。

</aside>

### 使用带密码的私钥

使用带密码的私钥能够确保公私钥文件被窃取后，依然无法使用。

```bash
# ssh-keygen 命令
$ ssh-keygen -t rsa -f secret-key
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase): # 输入密码
Enter same passphrase again: # 输入密码

```

![0](https://images.payloads.online/2024-07-29-fcceb13ae2e9e9954f3e168e822e583565003cf814c46b123015ed18723b01f8.png)  

### 使用命令行提示工具 oh-my-zsh

[oh my zsh](https://ohmyz.sh/)

```bash
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

$ vim .zshrc

# 我使用的插件
plugins=(
git 
docker 
zsh-syntax-highlighting 
zsh-autosuggestions 
zsh-completions 
copyfil    
e emoji
extract
sudo
)
```

### 使用更好的替代命令

在Linux命令行下，会经常使用系统命令进行工作，但是内置的命令功能很单一，需要做一些增强，我这里摘取部分配置：

```bash
# https://github.com/AmineZouitine/rmt.rs
# 删除文件备份
alias rm='rmt'
# https://github.com/lsd-rs/lsd
# 查看文件列表高亮
alias ls='lsd'
# 使用pyenv管理Python环境
eval "$(pyenv init -)"
# 这里放一些零散的二进制文件工具
export PATH=$HOME/.local/bin:$PATH
# 这里放一些常用的管理系统的Bash脚本
export PATH=$HOME/scripts:$PATH
```

### 将后台程序变成服务

后台程序就是那些没有界面，但是需要命令行运行的程序，这类程序我其实不太喜欢将他们单独运行在一个终端中，Linux\Windows\MacOS都有提供创建服务的功能，我这里举例Clash服务的管理：

![1](https://images.payloads.online/2024-07-29-6235a4a002d7db198ce53560655278dccec9d0ac72f41fc1139b18655b9e27e1.png)  

通过systemctl可以控制Clash服务的启动和暂停，在scripts目录中放置了操作iptables转发规则的脚本：

![2](https://images.payloads.online/2024-07-29-8a9b0f9c0ed11a124153ebe49adb20d43a471199f9992184ad7a8c705faff3be.png)  


MacOS可以通过创建，需要创建一个以`plist` 扩展名的XML文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
          "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.clash.myservice</string>
    <key>Program</key>
    <string>/path/to/your/clash</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

将 `clash.plist` 文件移动到MacOS的LaunchAgents目录中:

```bash
$ mv clash.plist ~/Library/LaunchAgents/
$ launchctl load ~/Library/LaunchAgents/clash.plist
$ launchctl enable gui/501/clash 
$ launchctl stop clash
$ launchctl start clash
```

### 保持使用浏览器收藏夹的好习惯

大概在去年Chrome翻译服务被ban以后，开始使用Edge，在国内同步相对比较方便，因此做了一下迁移，目前使用起来感觉良好。

![3](https://images.payloads.online/2024-07-29-1f81d6fa776a8b86b4e02ce024cbb28dcdefe900c6443830328feac6a780ddba.png)  


### 使用命令切换Java环境版本

Arch Linux可以通过archlinux-java命令切换Java版本：

![4](https://images.payloads.online/2024-07-29-71fcbdba07b902f095b20a6332b1a571aeb1295b4486a48f2a52da25af8a00fe.png)  

[Java - ArchWiki](https://wiki.archlinux.org/title/Java)

![5](https://images.payloads.online/2024-07-29-01444e4c4e92fdb6748737b8c0d5177aebe2f57e457dd87be68076cd6de7959e.png)  

### 使用DoH/DoT保护DNS隐私

DoH（DNS over HTTPS）是一种安全的DNS协议扩展，它通过使用HTTPS协议对DNS查询进行加密来保护DNS通信的隐私和安全性。

传统的DNS协议（DNS over UDP/TCP）在传输过程中是明文的，这意味着网络上的任何人都可以查看和截取DNS查询和响应的内容。这可能会导致个人隐私泄露、信息篡改和劫持等问题。

DoH通过将DNS流量封装在加密的HTTPS连接中来解决这些问题。它使用SSL/TLS协议对DNS查询和响应进行加密，确保数据的机密性和完整性。这使得DNS流量看起来和其他HTTPS流量一样，很难被识别和干扰。

由于我的Clash是开机自动启动的，本机的所有DNS流量都会转发到Clash，因此我只需要配置Clash的NameServer即可：

![6](https://images.payloads.online/2024-07-29-d488f58ebdaac0368a534fc55c70865d39e448f2a7f2d55637a8fd9b08710f21.png)  

在浏览器（Edge）层面可以直接设置：

![7](https://images.payloads.online/2024-07-29-79bdd18d44e81577d010e692288ef1b2f93a834236a9bcc0e2b3679e4dbf0937.png)  


手机层面也可以通过导入描述文件：

https://github.com/paulmillr/encrypted-dns

![8](https://images.payloads.online/2024-07-29-1deb4b2d25f54747b13b3fdb35716180c042271b304fd01a3f1660b1e0d83baf.png)  


### 常用Todo工具

有些时候想做一件事情（临时决定），但是当下没有时间，不能让想法只停留在想法上，我会使用Todo类的工具进行记录，iPhone/MacOS上都有一个名字叫“提醒”的软件，能够实现设备同步，但最早我是使用Microsoft To Do.

![9](https://images.payloads.online/2024-07-29-2e4c7870af36ee012db6bdb7045b44adfbd09aa3c1c53cb992efa3290bbc6728.png)  

### 使用Z-library收集书籍

![10](https://images.payloads.online/2024-07-29-184b6f1b3f465021db9fdcdab816af6cd28e0208e00843465c8c7ae2d641bd3e.png)  

在学习比较体系的知识的时候，我往往会先搜索相关书籍，然后将书籍的电子版保存下来。Z-library是全球最大的线上图书馆了，陆陆续续我的书单也丰富了起来：

![11](https://images.payloads.online/2024-07-29-67f064441b79b618c4e817ca51c3be4826b6d04c4dc39c4b3aaf6a707c6527f5.png)  
