---
categories: 高效
date: "2018-08-16T00:00:00Z"
description: 本文记录virtualenv的使用
title: Python virtualenv
url: /archivers/2018-08-16/1
---

本文记录virtualenv的使用。
<!--more-->
* 目录
{:toc}

## 0x00 virtualenv 简介

virtualenv 用来建立一个虚拟的python环境，为了解决Python各种库的冲突问题。

## 0x01 virtualenv 安装

### 通用安装方法

```sh
pip install virtualenv
```

### Ubuntu/Kali/Debian

```sh
apt-get upgrade && apt-get update
apt-get install virtualenv
```

## 0x02 virtualenv 使用

### 帮助信息

```sh
~$ virtualenv -h
Usage: virtualenv [OPTIONS] DEST_DIR

Options:
  --version             显示程序的版本号并退出
  -h, --help            显示程序的帮助信息并退出
  -v, --verbose         增强输出
  -q, --quiet           减少输出
  -p PYTHON_EXE, --python=PYTHON_EXE   Python的可执行路径(/usr/bin/python)
  --clear               清除安装的库
  --no-site-packages    给出一个干净的环境，不包含系统已安装的库
  --system-site-packages 包含系统库
  --always-copy         始终复制文件而不是符号链接。
  --relocatable         使一个现有的virtualenv环境这会修复脚本并生成所有.pth文件
  --no-setuptools       不要在新的virtualenv中安装setuptools
  --no-pip              不要在新的virtualenv中安装pip
  --no-wheel            不要在新的virtualenv中安装wheel
  --extra-search-dir=DIR 在DIR中寻找setuptools/pip
  --download            从PyPI下载预安装的软件包
  --no-download, --never-download 不要从PyPI下载预安装的软件包
  --prompt=PROMPT       为此环境提供备用提示前缀
  --setuptools          已废弃
  --distribute          已废弃
  --unzip-setuptools    已废弃
```

### 查看当前版本

```sh
~$ virtualenv --version
16.0.0
```

### 配置一个新的环境

```sh
~$ which python # 查看Python路径
/usr/bin/python
~$ virtualenv --no-site-packages -p /usr/bin/python MyNewEnv # 创建环境目录
Running virtualenv with interpreter /usr/bin/python
New python executable in /home/liyingzhe/MyNewEnv/bin/python
Installing setuptools, pip, wheel...done.
~$ ls MyNewEnv/ # 查看环境目录
bin  include  lib  local  pip-selfcheck.json
~$ source MyNewEnv/bin/activate # 将环境生效
(MyNewEnv)
(MyNewEnv) ~$ pip list # 查看已安装的库
Package    Version
---------- -------
pip        18.0
setuptools 40.0.0
wheel      0.31.1
```

此时我们可以安装一些新的库

```sh
(MyNewEnv) ~$ pip install requests
Collecting requests
  Using cached https://files.pythonhosted.org/packages/65/47/7e02164a2a3db50ed6d8a6ab1d6d60b69c4c3fdf57a284257925dfc12bda/requests-2.19.1-py2.py3-none-any.whl
Collecting idna<2.8,>=2.5 (from requests)
  Using cached https://files.pythonhosted.org/packages/4b/2a/0276479a4b3caeb8a8c1af2f8e4355746a97fab05a372e4a2c6a6b876165/idna-2.7-py2.py3-none-any.whl
Collecting certifi>=2017.4.17 (from requests)
  Using cached https://files.pythonhosted.org/packages/16/1f/50d729c104b21c1042aa51560da6141d1cab476ba7015d92b2111c8db841/certifi-2018.8.13-py2.py3-none-any.whl
Collecting chardet<3.1.0,>=3.0.2 (from requests)
  Using cached https://files.pythonhosted.org/packages/bc/a9/01ffebfb562e4274b6487b4bb1ddec7ca55ec7510b22e4c51f14098443b8/chardet-3.0.4-py2.py3-none-any.whl
Collecting urllib3<1.24,>=1.21.1 (from requests)
  Using cached https://files.pythonhosted.org/packages/bd/c9/6fdd990019071a4a32a5e7cb78a1d92c53851ef4f56f62a3486e6a7d8ffb/urllib3-1.23-py2.py3-none-any.whl
Installing collected packages: idna, certifi, chardet, urllib3, requests
Successfully installed certifi-2018.8.13 chardet-3.0.4 idna-2.7 requests-2.19.1 urllib3-1.23
(MyNewEnv) ~$
```

### 退出环境

```sh
(MyNewEnv) ~$ deactivate
```

### 使用已有的环境

```sh
# 假设 MyNewEnv已经被创建
~$ source MyNewEnv/bin/activate # 将环境生效
```