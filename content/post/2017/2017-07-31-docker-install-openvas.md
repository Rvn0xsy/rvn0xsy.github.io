---
categories: 漏洞检测
date: "2017-07-31T00:00:00Z"
description: 本文简述docker安装openvas
title: 在Docker中安装openvas
url: /archivers/2017-07-31/2
---
本文简述docker安装openvas
<!--more-->
* 目录
{:toc}

## 安装过程
镜像是从阿里云pull下来的：`docker pull  registry.cn-hangzhou.aliyuncs.com/secends/openvas`

安装过程：

```bash
liyingzhe@ThundeRobot:~/下载$ docker pull  registry.cn-hangzhou.aliyuncs.com/secends/openvas
Using default tag: latest
latest: Pulling from secends/openvas

6599cadaf950: Pull complete 
23eda618d451: Pull complete 
f0be3084efe9: Pull complete 
52de432f084b: Pull complete 
a3ed95caeb02: Pull complete 
7f9ef9bd6c98: Pull complete 
323caba9d1cc: Pull complete 
73a9f4a66d02: Pull complete 
Digest: sha256:adaf2ce11c97e9a924a053a97edf2b159daa0c8cd575ae5c5e2fe7a7cdb2c190
Status: Downloaded newer image for registry.cn-hangzhou.aliyuncs.com/secends/openvas:latest
liyingzhe@ThundeRobot:~/下载$ docker images
REPOSITORY                                           TAG                 IMAGE ID            CREATED             SIZE
registry.cn-hangzhou.aliyuncs.com/imxieke/kali       latest              6759704c31d9        4 months ago        1.668 GB
registry.cn-hangzhou.aliyuncs.com/gengxiaoxin/lnmp   latest              4f9feeb5a907        11 months ago       318.2 MB
registry.cn-hangzhou.aliyuncs.com/secends/openvas    latest              f254e0f3b11d        14 months ago       3.51 GB
#把80映射到本机9392
liyingzhe@ThundeRobot:~/下载$ docker run -it -p 9392:80 f254e0f3b11d
Starting Redis
Starting Openvas...
Starting gsad
Starting rebuild process...
This may take a minute or two...
Checking setup
openvas-check-setup 2.3.3
  Test completeness and readiness of OpenVAS-8
  (add '--v6' or '--v7' or '--v9'
   if you want to check for another OpenVAS version)

  Please report us any non-detected problems and
  help us to improve this check routine:
  http://lists.wald.intevation.org/mailman/listinfo/openvas-discuss

  Send us the log-file (/tmp/openvas-check-setup.log) to help analyze the problem.

Step 1: Checking OpenVAS Scanner ... 
        OK: OpenVAS Scanner is present in version 5.0.5.
        OK: OpenVAS Scanner CA Certificate is present as /var/lib/openvas/CA/cacert.pem.
        OK: redis-server is present in version v=2.8.4.
        OK: scanner (kb_location setting) is configured properly using the redis-server socket: /var/run/redis/redis.sock
        OK: redis-server is running and listening on socket: /var/run/redis/redis.sock.
        OK: redis-server configuration is OK and redis-server is running.
        OK: NVT collection in /var/lib/openvas/plugins contains 47056 NVTs.
        WARNING: Signature checking of NVTs is not enabled in OpenVAS Scanner.
        SUGGEST: Enable signature checking (see http://www.openvas.org/trusted-nvts.html).
        OK: The NVT cache in /var/cache/openvas contains 47056 files for 47056 NVTs.
Step 2: Checking OpenVAS Manager ... 
        OK: OpenVAS Manager is present in version 6.0.8.
        OK: OpenVAS Manager client certificate is present as /var/lib/openvas/CA/clientcert.pem.
        OK: OpenVAS Manager database found in /var/lib/openvas/mgr/tasks.db.
        OK: Access rights for the OpenVAS Manager database are correct.
        OK: sqlite3 found, extended checks of the OpenVAS Manager installation enabled.
        OK: OpenVAS Manager database is at revision 146.
        OK: OpenVAS Manager expects database at revision 146.
        OK: Database schema is up to date.
        OK: OpenVAS Manager database contains information about 47056 NVTs.
        OK: At least one user exists.
        OK: OpenVAS SCAP database found in /var/lib/openvas/scap-data/scap.db.
        OK: OpenVAS CERT database found in /var/lib/openvas/cert-data/cert.db.
        OK: xsltproc found.
Step 3: Checking user configuration ... 
        WARNING: Your password policy is empty.
        SUGGEST: Edit the /etc/openvas/pwpolicy.conf file to set a password policy.
Step 4: Checking Greenbone Security Assistant (GSA) ... 
        OK: Greenbone Security Assistant is present in version 6.0.10.
Step 5: Checking OpenVAS CLI ... 
        SKIP: Skipping check for OpenVAS CLI.
Step 6: Checking Greenbone Security Desktop (GSD) ... 
        SKIP: Skipping check for Greenbone Security Desktop.
Step 7: Checking if OpenVAS services are up and running ... 
        OK: netstat found, extended checks of the OpenVAS services enabled.
        ERROR: OpenVAS Scanner is NOT running!
        FIX: Start OpenVAS Scanner (openvassd).
        OK: OpenVAS Manager is running and listening on all interfaces.
        OK: OpenVAS Manager is listening on port 9390, which is the default port.
        OK: Greenbone Security Assistant is listening on port 80, which is the default port.

 ERROR: Your OpenVAS-8 installation is not yet complete!

Please follow the instructions marked with FIX above and run this
script again.

If you think this result is wrong, please report your observation
and help us to improve this check routine:
http://lists.wald.intevation.org/mailman/listinfo/openvas-discuss
Please attach the log-file (/tmp/openvas-check-setup.log) to help us analyze the problem.

Done.
Starting infinite loop...
Press [CTRL+C] to stop..
```
## 遇到的问题

openvas密码忘记问题：
```bash
liyingzhe@ThundeRobot:~/下载$ docker exec 9a57ef793c73 openvasmd --delete-user=admin  #删除用户admin
User deleted.
liyingzhe@ThundeRobot:~/下载$ docker exec 9a57ef793c73 openvasmd --create-user=admin  #创建用户，并且生产密码
User created with password '4fb3b80b-c1e8-413d-985f-9574c6aca9b5'.
```

此时就可以愉快的使用了！
