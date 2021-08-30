---
categories: 数据库
date: "2017-10-17T00:00:00Z"
description: 折腾Postgresql数据库的一些随笔
title: 折腾Postgresql数据库
url: /archivers/2017-10-17/1
---
最近学习C语言，突发奇想就想着造一些轮子吧，顺便复习一下C语言。
<!--more-->
* 目录
{:toc}

## 0x00 安装数据库

在MAC OSX下，我直接使用命令：`brew install postgresql` 进行安装。

但是MAC OSX下用的不习惯，就在Docker里面又装了一个，系统是CentOS。

使用命令：`yum -y install postgresql*` 一步搞定~

## 0x01 初始化数据库

```
[root@5f5a39b323c9]# /etc/init.d/postgresql -h
Usage: /etc/init.d/postgresql {start|stop|status|restart|condrestart|try-restart|reload|force-reload|initdb}
```

在这里可以启动`Postgresql`数据库，但是第一次启动需要初始化。

```
[root@5f5a39b323c9]# /etc/init.d/postgresql start

/var/lib/pgsql/data is missing. Use "service postgresql initdb" to initialize the cluster first. // 必须初始化
                                                           [FAILED]
[root@5f5a39b323c9]# service postgresql initdb  # 执行初始化
Initializing database:                                     [  OK  ]
[root@5f5a39b323c9]# /etc/init.d/postgresql start  # 启动数据库服务
[root@5f5a39b323c9]# netstat -ano | grep 5432
tcp        0      0 127.0.0.1:5432              0.0.0.0:*                   LISTEN      off (0.00/0/0)
unix  2      [ ACC ]     STREAM     LISTENING     17207  /tmp/.s.PGSQL.5432
```

## 0x02 认证方式

启动完毕后就要配置账号了，但是在此之前需要看一个认证配置文件：


```
[root@5f5a39b323c9]# vim /var/lib/pgsql/data/pg_hba.conf

---内容如下---


# md5 为密码认证、trust为本地认证，当然支持很多方式
# 说明：
# METHOD can be "trust", "reject", "md5", "password", "gss", "sspi", "krb5",
# "ident", "pam", "ldap" or "cert".  Note that "password" sends passwords
# in clear text; "md5" is preferred since it sends encrypted passwords.
local   all         all                                md5 
host    all         all         127.0.0.1/32           md5
host    all         all         ::1/128                md5
```

## 0x03 创建用户及数据库

接下来需要创建一个子账号。 在安装完毕`postgresql`的时候，它会在系统内部自动创建一个名为`postgres`的数据库管理员账号，这个账号只能从系统内部登录（待解决），我们需要用管理员用户创建一个普通用户，以供我们以后的使用。

```
[root@5f5a39b323c9 cpp]# su postgres
bash-4.1$ 
bash-4.1$ psql
psql (8.4.20)
Type "help" for help.

postgres=# CREATE USER pgsqler WITH PASSWORD '123456'; # 创建一个用户、密码为12356
CREATE ROLE
postgres=# CREATE DATABASE testdb; # 创建一个数据库
CREATE DATABASE
postgres=# GRANT ALL PRIVILEGES ON DATABASE testdb to pgsqler; # 将testdb这个数据库归属于pgsqler
GRANT
postgres=# \q # 退出
```

回到root用户，我们尝试登录数据库：

```
[root@5f5a39b323c9 cpp]# psql -U pgsqler -h localhost -d testdb
Password for user pgsqler: 
psql (8.4.20)
Type "help" for help.

testdb=> 
testdb=> \q
```

一切搞定了~

## 0x04 常用命令总结

登录数据库后可以输入"\?"来获得一些很方便的命令来操作数据库，而不需要去输入复杂的SQL语句：


```
[root@5f5a39b323c9]# psql -U pgsqler -h localhost -d testdb
Password for user pgsqler: 
psql (8.4.20)
Type "help" for help.

testdb=> 
testdb=> \?
General
  \copyright             show PostgreSQL usage and distribution terms
  \g [FILE] or ;         execute query (and send results to file or |pipe)
  \h [NAME]              help on syntax of SQL commands, * for all commands
  \q                     quit psql

Query Buffer
  \e [FILE]              edit the query buffer (or file) with external editor
  \ef [FUNCNAME]         edit function definition with external editor
  \p                     show the contents of the query buffer
  \r                     reset (clear) the query buffer
  \s [FILE]              display history or save it to file
  \w FILE                write query buffer to file

  ........

```


```
列举数据库：\l
选择数据库：\c 数据库名
查看该某个库中的所有表：\dt
切换数据库：\c interface
查看某个库中的某个表结构：\d 表名
查看某个库中某个表的记录：`select * from apps limit 1`;
显示字符集：\encoding
退出psgl：\q
创建数据库：createdb -h 127.0.0.1 -p 5432 -U postgres testdb
连接数据库：psql -h 127.0.0.1 -p 5432 -U postgres testdb
删除数据库：dropdb -h 127.0.0.1 -p 5432 -U postgres testdb
说明：-h表示主机（Host），-p表示端口（Port），-U表示用户（User）
创建数据表：create table tbl(a int);
删除数据表：drop table tbl;
插入数据：insert into tbl(a) values(1);
查看数据：select * from tbl;
备份数据库：pg_dump -U postgres  testdb > d:/testdb.dmp
恢复数据库：psql -U postgres testdb < d:/testdb.dmp
说明：这种方法，实际上是SQL的转储，可加参数（-t）指定多个表。
```

## 0x05 使用C++操作Postgresql

[使用C++操作Postgresql](http://payloads.online/archivers/2017-10-17/2)

