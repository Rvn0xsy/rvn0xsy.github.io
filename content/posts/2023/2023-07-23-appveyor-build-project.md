---
title: "使用Appveyor构建VS项目-快速编译"
date: 2023-07-23
description: 在工作中经常会看到一些做的比较好的C++开源项目，但是作者没有编写CI/CD去构建项目，发布Release版本的二进制文件，因此需要自己手动编译，但有时候又是临时的环境，还需要安装Visual Studio之类的IDE来构建，比较麻烦，因此appveyor可以支持各类语言的构建环境，只需要在网页上就可以发布二进制程序，解决了本地安装开发环境的痛点。
url: /archivers/2023-07-23/appveyor
tags: appveyor
---

## 前言

<aside>
📋 在工作中经常会看到一些做的比较好的C++开源项目，但是作者没有编写CI/CD去构建项目，发布Release版本的二进制文件，因此需要自己手动编译，但有时候又是临时的环境，还需要安装Visual Studio之类的IDE来构建，比较麻烦，因此appveyor可以支持各类语言的构建环境，只需要在网页上就可以发布二进制程序，解决了本地安装开发环境的痛点。

</aside>

## Appveyor简介

<aside>
💡 AppVeyor是一家成立于2011年的私人持有的加拿大公司。

我们为Windows开发人员提供持续集成工具。该服务是免费提供给开源项目使用的，我们为私有项目提供订阅服务，并在客户现场提供AppVeyor企业安装服务。

迄今为止，已有超过50,000名开发人员使用了AppVeyor，并运行了超过1000万次构建。AppVeyor受到微软、谷歌、Facebook、Mozilla、Slack、GitHub等公司的信任。

[About | AppVeyor](https://www.appveyor.com/about/)

</aside>

## 构建Github项目

AppVeyor提供了它特有的配置文件用于声明构建动作，开发者可以通过编写AppVeyor配置文件来控制程序的发布流程。

这里只讨论没有AppVeyor配置文件的项目，以https://github.com/goldshtn/etrace为例，etrace是一个命令行工具，用于实时跟踪 ETW 事件和 处理现有的 .etl 录制文件。它的灵感来自Microsoft [ELT](https://github.com/Microsoft/Microsoft.Diagnostics.Tracing.Logging/tree/master/utils/LogTool)工具。

![0](https://images.payloads.online/2024-07-29-5dc81fb4ac997c5b4bde39e315f39c8f87b29af725c22684aec2530770030f47.png)  


该项目没有AppVeyor配置文件，首先Fork这个项目到自己账户名下，然后访问https://www.appveyor.com/，以Github账户登录，并且授权读取此仓库。

![1](https://images.payloads.online/2024-07-29-b3783ff0a64525ecfe7a180228595ce723443326cd8b6f720cf98246f0cd7b25.png)  


在Github这一栏可以看到授权的仓库，点击 **+ADD** 就可以进入项目的构建配置界面：

![2](https://images.payloads.online/2024-07-29-0901705e6c5f3cc7db29338176b4c9558f1e87bf3a5e092df44706d38ae89b61.png)  


由于这个项目是采用C#开发的，所以我们着重关注C#相关的配置：

![3](https://images.payloads.online/2024-07-29-1b7abdb53043453e086a25620f4411330f445299864c87d91beb53bc87a47890.png)  


在Before build script中输入如下命令，会在开始编译之前去下载这个项目所依赖的库：

```bash
nuget restore
```

<aside>
💡 "nuget restore" 是NuGet命令行工具中的一个命令。它用于还原（restore）一个项目（project）所依赖的所有NuGet包（NuGet packages）。

在开发.NET应用程序时，通常会使用NuGet来管理项目所依赖的第三方库和组件。NuGet是.NET生态系统中最受欢迎的包管理器之一，它提供了一个中央存储库，开发人员可以从中获取各种软件包和库。

"nuget restore"命令会读取项目文件（.csproj或.vbproj）中的依赖关系，并下载或还原所需的NuGet包，以确保项目可以成功编译和构建。这个命令通常在CI/CD（持续集成/持续交付）过程中使用，以确保在构建项目之前，所有的依赖关系都被正确地还原和安装。

</aside>

除此之外，还可以在环境配置中设置安装开发库的命令：

![4](https://images.payloads.online/2024-07-29-d2dbacd81fcf3c3ae4c2d9dad8dbfaafff18b18a138d0b6d46d966c00c66e23c.png)  


最后一步就是设置二进制文件打包了，点击artifacts，可以配置要打包的路径，必须是相对路径，C#的程序一般会将二进制文件生成到bin目录下，所以我这里就写：etrace\bin

![5](https://images.payloads.online/2024-07-29-250ee79944bc86c985221b13aee115fb153e56ca50d88d16799a3eebb3d29c44.png)  


保存后，回到项目页面，点击Start New Build就开始构建了：

![6](https://images.payloads.online/2024-07-29-51d2f8ad59c102c96729da44ee8c88a28706eefb90c6a52e00e4ae94c055db8b.png)  


稍微等待一下，就可以看到构建好的程序了，直接下载就可以使用。

![7](https://images.payloads.online/2024-07-29-71e3d69c746a01016da0b57aa98abcd4de9029ce06eec2f5ef3127062e78cb7d.png)  


## 使用AppVeyor构建Mimikatz

Mimikatz是[gentilkiwi](https://github.com/gentilkiwi)使用C语言开发的Windows安全工具，该工具有着丰富的功能，能过从内存中提取明文密码，哈希，PIN码和kerberos票据、哈希传递等等，随着越来越多的黑客滥用此工具进行一些非法活动，因此[gentilkiwi](https://github.com/gentilkiwi)每发布一个Release，Release中的Mimikatz样本就会被标记为黑客工具，这对红队带来了一些小麻烦，通过AppVeyor我们可以自动化的做一些静态特征处理，然后自动构建产生新的工具。

gentilkiwi已经在Mimikatz项目中内置了一个AppVeyor的配置文件，这个配置文件会随着项目改动自动触发AppVeyor的构建流程。

![8](https://images.payloads.online/2024-07-29-0238150c9f7ae7a6d62517d0ec9e5beef84f2e8d1e8ba4110fc3a425d8ceb3c1.png)  


我们要做的就是先Fork一份Mimikatz到自己的项目中，然后开始修改AppVeyor配置文件：

![9](https://images.payloads.online/2024-07-29-eed2a89c92d68e937b3d5989177a2671ac1b8178540e0fea812447eb0967a88c.png)  


这里我只是做了一个工作，就是将代码中的所有Mimikatz字符串替换为aabbcc，当然还可以做很多其它的替换操作。

```powershell
ls;
Copy-Item C:\projects\mimikatz\mimikatz\mimikatz.ico C:\projects\mimikatz\mimikatz\aabbcc.ico;
(Get-ChildItem -Path "." -Recurse -File -Include *.h,*.c,*.vcxproj,*.rc) | ForEach-Object {
    $newFileName = $_.Name -replace "mimikatz\.(h|c|rc)", "aabbcc.`$1"
    $newPath = Join-Path -Path $_.Directory.FullName -ChildPath $newFileName
    (Get-Content $_.FullName) | ForEach-Object {
        $_ -ireplace "mimikatz", "aabbcc"
    } | Set-Content $newPath
    if ($newFileName -ne $_.Name) {
        Remove-Item $_.FullName
    }
    Write-Host $newPath
};
ls mimikatz;
```

其中替换图标的操作可以改为从互联网下载某个地址的图标，这里就不赘述了。

我的配置文件地址：[mimikatz/appveyor.yml at master · Rvn0xsy/mimikatz (github.com)](https://github.com/Rvn0xsy/mimikatz/blob/master/appveyor.yml)

编译好的成品如下：

![10](https://images.payloads.online/2024-07-29-18c0cd95132052716e08d5844cb251b3db4c09f7487d1523a9e96868b54287de.png)  


![11](https://images.payloads.online/2024-07-29-d9018d95f27c32bf006dc370d0994e10e4d4581b5adc4cff146abc3381b59298.png)  


## 🥪总结

通过在线的CI/CD工具可以省去搭建环境的时间，由于CI/CD是事件触发的，每次改动都可以生成新的样本，相当于可以无限次的使用，若是有一些工具实在是非常敏感、静态特征多，可以像我这样写一个类似的批处理加入到CI/CD中做一些简单的对抗处理，本文仅仅是抛砖引玉，我相信还有更节约时间、更高效的方式。