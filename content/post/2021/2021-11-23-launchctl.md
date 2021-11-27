---
title: "MacOS任务计划"
date: 2021-11-23T10:10:08+08:00
url: /archivers/2021-11-23/1
description: 使用launchctl注册喝水任务
---

## 0x00 launchctl

> launchctl是一个统一的服务管理框架，启动、停止和管理守护进程、应用程序、进程和脚本。

launchctl 将根据这个plist文件的信息来启动任务，具体可以参考：[Creating Launch Daemons and Agents](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html)

![2021-11-23-13-58-52](../../../static/images/bcdcab96-4f5f-11ec-87b3-00d861bf4abb.png)

以下示例创建一个每五分钟（300 秒）运行一次的作业：


```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.example.touchsomefile</string>
    <key>ProgramArguments</key>
    <array>
        <string>touch</string>
        <string>/tmp/helloworld</string>
    </array>
    <key>StartInterval</key>
    <integer>300</integer>
</dict>
</plist>
```

## 0x01 守护进程服务文件路径

plist按照如下优先级排列（由低到高）：

* ~/Library/LaunchAgents 由用户自己定义的任务项
* /Library/LaunchAgents 由管理员为用户定义的任务项
* /Library/LaunchDaemons 由管理员定义的守护进程任务项
* /System/Library/LaunchAgents 由Mac OS X为用户定义的任务项
* /System/Library/LaunchDaemons 由Mac OS X定义的守护进程任务项

一般情况下，大部分都只用到`~/Library/LaunchAgents`。

## 0x02 定义运行周期

特殊关键字：
* StartInterval: 指定脚本每间隔多长时间（单位：秒）执行一次；
* StartCalendarInterval: 可以指定脚本在多少分钟、小时、天、星期几、月时间上执行，类似如crontab的中的设置；
* StartCalendarInterval: 执行周期；
* RunAtLoad: 加载时执行一次；
* StandardOutPath: 标准输出路径；
* StandardErrorPath: 错误输出路径；

StartCalendarInterval可以按照如下格式制定周期：

```
Minute <integer>
The minute on which this job will be run.

Hour <integer>
The hour on which this job will be run.

Day <integer>
The day on which this job will be run.

Weekday <integer>
The weekday on which this job will be run (0 and 7 are Sunday).

Month <integer>
The month on which this job will be run.
```

## 0x03 每隔2小时提醒喝水

创建一个plist文件命名为：com.drink.water.launchctl.plist，将下面内容保存到：`~/Library/LaunchAgents/com.drink.water.launchctl.plist`

```bash
$ cd ~/Library/LaunchAgents
$ launchctl load com.drink.water.launchctl.plist #加载并运行任务
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.drink.water.launchctl.plist</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/say</string>
        <string>该喝水了！</string>
    </array>
    <key>StartInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
    </dict>
    <key>KeepAlive</key>
    <false/>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/water.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/water.err</string>
</dict>
</plist>
```

launchctl其他操作：

```bash
$ launchctl unload com.drink.water.launchctl.plist # 卸载任务
$ launchctl start com.drink.water.launchctl.plist # 立即执行任务
$ launchctl stop com.drink.water.launchctl.plist # 停止任务
```

## 0x04 思考

Mac下具有和Linux相似的任务计划和守护进程服务，这都是可能会被作为权限维持的办法，并且MacOS的手动软件卸载方式总会残留一些垃圾文件或者目录在文件夹中，经过本篇文章的实践学习，我清理了一部分系统残留的无用plist文件...（有一些软件具有清理启动项的功能，这里不做推荐了。）