---
categories: Linux
date: "2018-11-06T00:00:00Z"
description: Linux账户登录加固
title: Linux账户登录加固
url: /archivers/2018-11-06/2
---

Linux账户登录加固
<!--more-->

## 0x00 用户账户添加与删除

### 添加用户

**useradd**

参考：https://www.cnblogs.com/irisrain/p/4324593.html

```sh
useradd [-d home] [-s shell] [-c comment] [-m [-k template]] [-f inactive] [-e expire ] [-p passwd] [-r] name

    -c：加上备注文字，备注文字保存在passwd的备注栏中。

　　-d：指定用户登入时的主目录，替换系统默认值/home/<用户名>

　　-D：变更预设值。

　　-e：指定账号的失效日期，日期格式为MM/DD/YY，例如06/30/12。缺省表示永久有效。

　　-f：指定在密码过期后多少天即关闭该账号。如果为0账号立即被停用；如果为-1则账号一直可用。默认值为-1.

　　-g：指定用户所属的群组。值可以使组名也可以是GID。用户组必须已经存在的，期默认值为100，即users。

　　-G：指定用户所属的附加群组。

　　-m：自动建立用户的登入目录。

　　-M：不要自动建立用户的登入目录。

　　-n：取消建立以用户名称为名的群组。

　　-r：建立系统账号。

　　-s：指定用户登入后所使用的shell。默认值为/bin/bash。

　　-u：指定用户ID号。该值在系统中必须是唯一的。0~499默认是保留给系统用户账号使用的，所以该值必须大于499。
```

添加一个user1用户：

* 允许shell登录
* 自动创建home目录
* 指定home目录
* 设置用户3天后禁止登录
* 设置uid为599

```sh
useradd -d /home/test -m -u 599 -s /bin/bash -f 3 user1
```

**adduser**


参考：http://www.runoob.com/linux/linux-comm-adduser.html

```sh
adduser [--home DIR] [--shell SHELL] [--no-create-home] [--uid ID]
[--firstuid ID] [--lastuid ID] [--gecos GECOS] [--ingroup GROUP | --gid ID]
[--disabled-password] [--disabled-login] [--encrypt-home] USER
   Add a normal user

adduser --system [--home DIR] [--shell SHELL] [--no-create-home] [--uid ID]
[--gecos GECOS] [--group | --ingroup GROUP | --gid ID] [--disabled-password]
[--disabled-login] USER
   Add a system user

adduser --group [--gid ID] GROUP
addgroup [--gid ID] GROUP
   Add a user group

addgroup --system [--gid ID] GROUP
   Add a system group

adduser USER GROUP
   Add an existing user to an existing group

general options:
  --quiet | -q      don't give process information to stdout
  --force-badname   allow usernames which do not match the
                    NAME_REGEX[_SYSTEM] configuration variable
  --help | -h       usage message
  --version | -v    version number and copyright
  --conf | -c FILE  use FILE as configuration file
```

添加一个user2用户：

* 允许shell登录
* 自动创建home目录
* 指定home目录
* 设置用户3天后禁止登录
* 设置uid为599

```sh
adduser --shell /bin/bash --home /home/test --uid 599
```

### 删除用户

```sh
userdel [usernames]
```

## 0x01 用户锁定与解锁

锁定：

```sh
passwd -l [usernames]
```

```sh
usermod -L [usernames]
```

解锁：

```sh
usermod -U [usernames]
```

```sh
passwd -u [usernames]
```

## 0x02 SSH 加固

参考：http://www.jinbuguo.com/openssh/sshd_config.html

禁止ROOT登录：

```sh
vim /etc/ssh/sshd_config
PermitRootLogin without-password 改为 PermitRootLogin no
```

禁止某用户登录：

```sh
DenyUsers root    #Linux系统账户
```

允许某用户登录：

```sh
AllowUsers root
```

设置user1不允许登录：
```sh
usermod -s /usr/sbin/nologin user1
```

不允许密码登录：

```sh
PermitRootLogin without-password
```

设置authorized_keys目录：

```sh
AuthorizedKeysFile %h/.ssh/authorized_keys

             存放该用户可以用来登录的 RSA/DSA 公钥。
             该指令中可以使用下列根据连接时的实际情况进行展开的符号：
             %% 表示'%'、%h 表示用户的主目录、%u 表示该用户的用户名。
             经过扩展之后的值必须要么是绝对路径，要么是相对于用户主目录的相对路径。
             默认值是".ssh/authorized_keys"。
```

端口：

```sh
Port 2243
```

添加公钥：

```sh
ssh-copy-id -i ~/.ssh/id_rsa.pub root@xxx.xxx.xxx.xxx
```