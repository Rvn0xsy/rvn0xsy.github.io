---
categories: Web安全
date: "2018-10-19T00:00:44Z"
description: 本文记录一下xss Validator的使用方法
title: xssValidator
url: /archivers/2018-10-19/1
---

本文记录一下xss Validator的使用方法
<!--more-->

* 目录
{:toc}

## 0x00 前言

xss Validator是一个Burp商店的一个高分插件，该插件依赖于[phantomjs](http://phantomjs.org)项目以及Burp的Intruder模块。

## 0x01 安装

### 安装插件

打开Burp，点击“Extender”->“BApp Store”->"XSS Validator"->“install”

![](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-10-19/0x01.png)

### 安装phantomjs

下载页面：http://phantomjs.org/download.html

可根据自己的操作系统类型，选择对应的版本，我这里是Mac OSX

然后下载[xss.js](https://github.com/PortSwigger/xss-validator/raw/master/xss-detector/xss.js)，将它放入phantomjs的执行目录。

## 0x02 测试之前的步骤

```sh
rvn0xsy@Rvn0xsy ~/G/p/bin> pwd
/Users/rvn0xsy/GitProject/phantomjs-2.1.1-macosx/bin
rvn0xsy@Rvn0xsy ~/G/p/bin> ls
phantomjs xss.js
rvn0xsy@Rvn0xsy ~/G/p/bin> ./phantomjs xss.js # 启动监听
```

这时回到Burp的xss Validator插件页面：


![](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-10-19/0x02.png)

其中：

* `Grep Phrase`是XSS执行成功后，能够解析出的字符串，支持自定义。
* `Javascript function`是验证函数，会被解析的时候调用。
* `Javascript event handlers`是监听事件。
* `Payloads`是测试XSS的模板，必须包含`{JAVASCRIPT}`，否则无法判断状态

## 0x03 测试演示

<video src="https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2018-10-19/xssValidator.mp4" controls="controls" width="500px">
哎呀~ 换个浏览器试试吧！
</video>