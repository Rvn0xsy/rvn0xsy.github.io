---
date: "2017-08-21T00:00:00Z"
description: 本文介绍一下几个扫描https漏洞的工具
title: 几个扫描https漏洞的工具
url: /archivers/2017-08-21/2
---
总结几个扫描https漏洞的工具
<!--more-->
* 目录
{:toc}

## 查看网站使用的证书

`openssl s_client -connect www.baidu.com:443`

* 【s_client:作为一个客户端 -connect：连接 +服务器域名:端口】

## 测试是否支持某协议（某低版本协议）

`openssl s_client -tls1_2 -cipher 'ECDH-RSA-RC4-SHA' -connect www.taobao.com:443`

## 测试是否所有不安全的ciphers suite都不支持

`openssl s_client -tls1_2 -cipher "NULL,EXPORT,LOW,DES" -connect www.taobao.com:443`

## 查看目前可被破解的cipher suite　　【openssl】

`openssl ciphers -v "NULL,EXPORT,LOW,DES"`

## 自动识别SSL配置错误、过期协议，过时cipher suite 和hash算法

`sslscan --tlsall www.taobao.com:443`

## 分析证书详细信息

`sslscan --show-certificate --no-ciphersuites www.taobao.com:443`

## 验证https相关漏洞

| 受戒礼漏洞 | openssl s_client -connect zp.czbank.com.cn:443 -cipher RC4 |

| 贵宾犬漏洞 | openssl s_client -ssl3 -connect zp.czbank.com.cn:443 |

| SSL中间人劫持 | openssl s_client -connect zp.czbank.com.cn:443 -cipher EXPORT |

## 检查是否支持会话恢复

`sslyze --regular www.taobao.com:443`

## NAMP枚举SSL脚本

`nmap --script=ssl-enum-ciphers.nse www.taobao.com`

## 在线网站

https://www.ssllabs.com/ssltest
