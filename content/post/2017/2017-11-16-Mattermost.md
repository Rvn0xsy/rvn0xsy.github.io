---
categories: 随便折腾
date: "2017-11-16T00:00:00Z"
description: 本文记录一下搭建Mattermost服务的过程
title: 搭建Mattermost并开启Https
url: /archivers/2017-11-16/1
---
本文记录一下搭建Mattermost服务的过程
<!--more-->
* 目录
{:toc}

## 0x00 简介
Mattermost 是一个 Slack 的开源替代品。

Mattermost 采用 Go 语言开发，这是一个开源的团队通讯服务。为团队带来跨 PC 和移动设备的消息、文件分享，提供归档和搜索功能。

## 0x01 下载安装

```bash
wget https://releases.mattermost.com/3.6.2/mattermost-3.6.2-linux-amd64.tar.gz
tar zxvf mattermost-3.6.2-linux-amd64.tar.gz
```

## 0x02 数据库环境准备 - postgrsql

它其实支持两种数据库 [Mysql & Postgresql]

但是我不推荐使用MySQL，它在启动的时候会创建数据库，这个过程容易出很多问题，根数据库存储引擎有关。

在开始之前，你需要根据你的操作系统来安装Postgresql => [看这里](https://docs.mattermost.com/install/install-rhel-66.html#installing-postgresql-database)

设置数据库过程：

```bash
root@Kali:~# service postgresql start
root@Kali:~# su postgres 
postgres@Kali:/root$ psql
psql (9.6.2)
输入 "help" 来获取帮助信息.

postgres=# CREATE DATABASE mattermost; # 创建数据库
postgres=# CREATE USER mmuser WITH PASSWORD '123456'; # 创建一个用户
postgres=# GRANT ALL PRIVILEGES ON DATABASE mattermost to mmuser; # 将数据库的权限赋予用户
postgre=# \q # 退出
```

设置完毕后，我们需要更改一些配置。


## 0x03 设置数据库

打开`config/config.json`

```json
"DriverName": "postgres",
        "DataSource": "postgres://mmuser:123456@127.0.0.1:5432/mmtest?sslmode=disable\u0026connect_timeout=10",
```

上面是我改好后的状态，可以参照我的。

```json
"DataSource":"postgresql"://用户名:密码@数据库地址:数据库端口/数据库名称?其他配置……
```

## 0x04 支持中文

```json
"LocalizationSettings": {
        "DefaultServerLocale": "zh-CN",
        "DefaultClientLocale": "zh-CN",
        "AvailableLocales": "zh-CN"
    }
```

## 0x05 允许任何用户注册

`"EnableOpenServer": true`


## 0x06 创建证书

```basg
root@Kali:~/mattermost/ssl# openssl genrsa -des3 -out root.key 1024
Generating RSA private key, 1024 bit long modulus
........++++++
............................++++++
e is 65537 (0x010001)
Enter pass phrase for root.key:
Verifying - Enter pass phrase for root.key:

root@Kali:~/mattermost/ssl# openssl req -new -x509 -key root.key -out root.crt -days 365
Enter pass phrase for root.key:
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:cn
State or Province Name (full name) [Some-State]:cn
Locality Name (eg, city) []:cn
Organization Name (eg, company) [Internet Widgits Pty Ltd]:cn
Organizational Unit Name (eg, section) []:cn
Common Name (e.g. server FQDN or YOUR name) []:cn
Email Address []:cn@test.com
root@Kali:~/mattermost/ssl#  openssl genrsa -out server.key 1024
Generating RSA private key, 1024 bit long modulus
..............++++++
................++++++
e is 65537 (0x010001)

root@Kali:~/mattermost/ssl#  openssl req -new -key server.key -out server.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:cn
State or Province Name (full name) [Some-State]:cn
Locality Name (eg, city) []:cn
Organization Name (eg, company) [Internet Widgits Pty Ltd]:cn
Organizational Unit Name (eg, section) []:cn
Common Name (e.g. server FQDN or YOUR name) []:cn
Email Address []:cn@test.com
Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:123456
An optional company name []:cn

root@Kali:~/mattermost/ssl# openssl ca -in server.csr -out server.crt -keyfile root.key -cert root.crt -days 365
Using configuration from /usr/lib/ssl/openssl.cnf
Enter pass phrase for root.key:
Can't open ./demoCA/index.txt.attr for reading, No such file or directory
139626525074624:error:02001002:system library:fopen:No such file or directory:../crypto/bio/bss_file.c:74:fopen('./demoCA/index.txt.attr','r')
139626525074624:error:2006D080:BIO routines:BIO_new_file:no such file:../crypto/bio/bss_file.c:81:
Check that the request matches the signature
Signature ok
Certificate Details:
        Serial Number: 1 (0x1)
        Validity
            Not Before: Nov 16 07:00:45 2017 GMT
            Not After : Nov 16 07:00:45 2018 GMT
        Subject:
            countryName               = cn
            stateOrProvinceName       = cn
            organizationName          = cn
            organizationalUnitName    = cn
            commonName                = cn
            emailAddress              = cn@test.com
        X509v3 extensions:
            X509v3 Basic Constraints: 
                CA:FALSE
            Netscape Comment: 
                OpenSSL Generated Certificate
            X509v3 Subject Key Identifier: 
                FA:BA:4F:7B:7D:13:EE:B9:7C:CF:D2:14:C5:19:7F:1D:E7:D1:B8:FF
            X509v3 Authority Key Identifier: 
                keyid:AB:7F:78:D4:7C:D7:F2:5C:E4:6A:0E:15:EF:C5:16:C8:66:C5:BB:54

Certificate is to be certified until Nov 16 07:00:45 2018 GMT (365 days)
Sign the certificate? [y/n]:y
1 out of 1 certificate requests certified, commit? [y/n]y
Write out database with 1 new entries
Data Base Updated
root@Kali:~/mattermost/ssl# ls
demoCA  root.crt  root.key  server.crt  server.csr  server.key
```

## 0x07 配置SSL参数

将密钥的位置填入`config.json`：
```
"ConnectionSecurity": "TLS",
        "TLSCertFile": "/root/mattermost/ssl/server.crt",
        "TLSKeyFile": "/root/mattermost/ssl/server.key",
        "Forward80To443": true
```

并且激活允许Mattermost绑定到低端口的功能：

`sudo setcap cap_net_bind_service=+ep ./platform`

## 0x08 启动

```bash
root@Kali:~/mattermost/ssl# ../bin/platform 
[2017/11/16 15:01:03 CST] [EROR] Failed to load system translations for 'zh-CN' attempting to fall back to 'en'
[2017/11/16 15:01:03 CST] [INFO] Loaded system translations for 'en' from '/root/mattermost/i18n/en.json'
[2017/11/16 15:01:03 CST] [INFO] Current version is 3.6.0 (3.6.2/Tue Jan 31 21:02:59 UTC 2017/1a9891f0f5671551d28be54a99155b907480cc5c/a704f18b1b14f56588a8a57042517fc51a826658)
[2017/11/16 15:01:03 CST] [INFO] Enterprise Enabled: true
[2017/11/16 15:01:03 CST] [INFO] Current working directory is /root/mattermost/ssl
[2017/11/16 15:01:03 CST] [INFO] Loaded config file from /root/mattermost/config/config.json
[2017/11/16 15:01:03 CST] [INFO] Server is initializing...
[2017/11/16 15:01:03 CST] [INFO] Pinging SQL master database
[2017/11/16 15:01:03 CST] [INFO] Starting 4 websocket hubs
[2017/11/16 15:01:03 CST] [INFO] License key from https://mattermost.com required to unlock enterprise features.
[2017/11/16 15:01:03 CST] [INFO] Starting Server...
[2017/11/16 15:01:03 CST] [INFO] Server is listening on :8065
2017/11/16 15:01:15 http: TLS handshake error from 192.168.3.101:56725: tls: first record does not look like a TLS handshake
2017/11/16 15:01:20 http: TLS handshake error from 192.168.3.101:56726: tls: first record does not look like a TLS handshake
2017/11/16 15:01:24 http: TLS handshake error from 192.168.3.106:43963: tls: oversized record received with length 21536
2017/11/16 15:01:24 http: TLS handshake error from 192.168.3.106:43965: tls: oversized record received with length 21536
2017/11/16 15:02:15 http: TLS handshake error from 192.168.3.106:44003: tls: first record does not look like a TLS handshake
2017/11/16 15:02:23 http: TLS handshake error from 192.168.3.106:44005: tls: oversized record received with length 21536
```

![0x00](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/2017-11-16/0x00.png)

## 0x09 我的配置 - (config.json)仅供参考

```json
{
    "ServiceSettings": {
        "SiteURL": "",
        "ListenAddress": ":8065",
        "ConnectionSecurity": "TLS",
        "TLSCertFile": "/root/mattermost/ssl/server.crt",
        "TLSKeyFile": "/root/mattermost/ssl/server.key",
        "UseLetsEncrypt": false,
        "LetsEncryptCertificateCacheFile": "./config/letsencrypt.cache",
        "Forward80To443": true,
        "ReadTimeout": 300,
        "WriteTimeout": 300,
        "MaximumLoginAttempts": 10,
        "SegmentDeveloperKey": "",
        "GoogleDeveloperKey": "",
        "EnableOAuthServiceProvider": false,
        "EnableIncomingWebhooks": true,
        "EnableOutgoingWebhooks": true,
        "EnableCommands": true,
        "EnableOnlyAdminIntegrations": true,
        "EnablePostUsernameOverride": false,
        "EnablePostIconOverride": false,
        "EnableTesting": false,
        "EnableDeveloper": false,
        "EnableSecurityFixAlert": true,
        "EnableInsecureOutgoingConnections": false,
        "EnableMultifactorAuthentication": false,
        "EnforceMultifactorAuthentication": false,
        "AllowCorsFrom": "",
        "SessionLengthWebInDays": 30,
        "SessionLengthMobileInDays": 30,
        "SessionLengthSSOInDays": 30,
        "SessionCacheInMinutes": 10,
        "WebsocketSecurePort": 4458,
        "WebsocketPort": 9999,
        "WebserverMode": "gzip",
        "EnableCustomEmoji": false,
        "RestrictCustomEmojiCreation": "all",
        "TimeBetweenUserTypingUpdatesMilliseconds": 5000,
        "EnableUserTypingMessages": true
    },
    "TeamSettings": {
        "SiteName": "Mattermost",
        "MaxUsersPerTeam": 50,
        "EnableTeamCreation": true,
        "EnableUserCreation": true,
        "EnableOpenServer": true,
        "RestrictCreationToDomains": "",
        "EnableCustomBrand": false,
        "CustomBrandText": "",
        "CustomDescriptionText": "",
        "RestrictDirectMessage": "any",
        "RestrictTeamInvite": "all",
        "RestrictPublicChannelManagement": "all",
        "RestrictPrivateChannelManagement": "all",
        "RestrictPublicChannelCreation": "all",
        "RestrictPrivateChannelCreation": "all",
        "RestrictPublicChannelDeletion": "all",
        "RestrictPrivateChannelDeletion": "all",
        "UserStatusAwayTimeout": 300,
        "MaxChannelsPerTeam": 2000,
        "MaxNotificationsPerChannel": 1000000
    },
    "SqlSettings": {
        "DriverName": "postgres",
        "DataSource": "postgres://mmuser:123456@127.0.0.1:5432/mmtest?sslmode=disable\u0026connect_timeout=10",
        "DataSourceReplicas": [],
        "MaxIdleConns": 20,
        "MaxOpenConns": 300,
        "Trace": false,
        "AtRestEncryptKey": "s39t38dnizfxgch3kufhoimk38nyomwj"
    },
    "LogSettings": {
        "EnableConsole": true,
        "ConsoleLevel": "INFO",
        "EnableFile": true,
        "FileLevel": "INFO",
        "FileFormat": "",
        "FileLocation": "",
        "EnableWebhookDebugging": true,
        "EnableDiagnostics": true
    },
    "PasswordSettings": {
        "MinimumLength": 5,
        "Lowercase": false,
        "Number": false,
        "Uppercase": false,
        "Symbol": false
    },
    "FileSettings": {
        "MaxFileSize": 52428800,
        "DriverName": "local",
        "Directory": "./data/",
        "EnablePublicLink": false,
        "PublicLinkSalt": "5rrmcmfuja88qpn9heodi3edyaw5d6xf",
        "ThumbnailWidth": 120,
        "ThumbnailHeight": 100,
        "PreviewWidth": 1024,
        "PreviewHeight": 0,
        "ProfileWidth": 128,
        "ProfileHeight": 128,
        "InitialFont": "luximbi.ttf",
        "AmazonS3AccessKeyId": "",
        "AmazonS3SecretAccessKey": "",
        "AmazonS3Bucket": "",
        "AmazonS3Region": "us-east-1",
        "AmazonS3Endpoint": "s3.amazonaws.com",
        "AmazonS3SSL": true
    },
    "EmailSettings": {
        "EnableSignUpWithEmail": true,
        "EnableSignInWithEmail": true,
        "EnableSignInWithUsername": true,
        "SendEmailNotifications": false,
        "RequireEmailVerification": false,
        "FeedbackName": "",
        "FeedbackEmail": "",
        "FeedbackOrganization": "",
        "SMTPUsername": "",
        "SMTPPassword": "",
        "SMTPServer": "",
        "SMTPPort": "",
        "ConnectionSecurity": "",
        "InviteSalt": "x13o9bb1xbnt8phgoekuy9oce67shuee",
        "PasswordResetSalt": "8xmxdbkfe9ya3couyy6h1oxu81bgsbbc",
        "SendPushNotifications": false,
        "PushNotificationServer": "",
        "PushNotificationContents": "generic",
        "EnableEmailBatching": false,
        "EmailBatchingBufferSize": 256,
        "EmailBatchingInterval": 30
    },
    "RateLimitSettings": {
        "Enable": false,
        "PerSec": 10,
        "MaxBurst": 100,
        "MemoryStoreSize": 10000,
        "VaryByRemoteAddr": true,
        "VaryByHeader": ""
    },
    "PrivacySettings": {
        "ShowEmailAddress": true,
        "ShowFullName": true
    },
    "SupportSettings": {
        "TermsOfServiceLink": "https://about.mattermost.com/default-terms/",
        "PrivacyPolicyLink": "https://about.mattermost.com/default-privacy-policy/",
        "AboutLink": "https://about.mattermost.com/default-about/",
        "HelpLink": "https://about.mattermost.com/default-help/",
        "ReportAProblemLink": "https://about.mattermost.com/default-report-a-problem/",
        "SupportEmail": "feedback@mattermost.com"
    },
    "GitLabSettings": {
        "Enable": false,
        "Secret": "",
        "Id": "",
        "Scope": "",
        "AuthEndpoint": "",
        "TokenEndpoint": "",
        "UserApiEndpoint": ""
    },
    "GoogleSettings": {
        "Enable": false,
        "Secret": "",
        "Id": "",
        "Scope": "profile email",
        "AuthEndpoint": "https://accounts.google.com/o/oauth2/v2/auth",
        "TokenEndpoint": "https://www.googleapis.com/oauth2/v4/token",
        "UserApiEndpoint": "https://www.googleapis.com/plus/v1/people/me"
    },
    "Office365Settings": {
        "Enable": false,
        "Secret": "",
        "Id": "",
        "Scope": "User.Read",
        "AuthEndpoint": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "TokenEndpoint": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "UserApiEndpoint": "https://graph.microsoft.com/v1.0/me"
    },
    "LdapSettings": {
        "Enable": false,
        "LdapServer": "",
        "LdapPort": 389,
        "ConnectionSecurity": "",
        "BaseDN": "",
        "BindUsername": "",
        "BindPassword": "",
        "UserFilter": "",
        "FirstNameAttribute": "",
        "LastNameAttribute": "",
        "EmailAttribute": "",
        "UsernameAttribute": "",
        "NicknameAttribute": "",
        "IdAttribute": "",
        "PositionAttribute": "",
        "SyncIntervalMinutes": 60,
        "SkipCertificateVerification": false,
        "QueryTimeout": 60,
        "MaxPageSize": 0,
        "LoginFieldName": ""
    },
    "ComplianceSettings": {
        "Enable": false,
        "Directory": "./data/",
        "EnableDaily": false
    },
    "LocalizationSettings": {
        "DefaultServerLocale": "zh-CN",
        "DefaultClientLocale": "zh-CN",
        "AvailableLocales": "zh-CN"
    },
    "SamlSettings": {
        "Enable": false,
        "Verify": false,
        "Encrypt": false,
        "IdpUrl": "",
        "IdpDescriptorUrl": "",
        "AssertionConsumerServiceURL": "",
        "IdpCertificateFile": "",
        "PublicCertificateFile": "",
        "PrivateKeyFile": "",
        "FirstNameAttribute": "",
        "LastNameAttribute": "",
        "EmailAttribute": "",
        "UsernameAttribute": "",
        "NicknameAttribute": "",
        "LocaleAttribute": "",
        "PositionAttribute": "",
        "LoginButtonText": "With SAML"
    },
    "NativeAppSettings": {
        "AppDownloadLink": "https://about.mattermost.com/downloads/",
        "AndroidAppDownloadLink": "https://about.mattermost.com/mattermost-android-app/",
        "IosAppDownloadLink": "https://about.mattermost.com/mattermost-ios-app/"
    },
    "ClusterSettings": {
        "Enable": false,
        "InterNodeListenAddress": ":8075",
        "InterNodeUrls": []
    },
    "MetricsSettings": {
        "Enable": false,
        "BlockProfileRate": 0,
        "ListenAddress": ":8067"
    },
    "AnalyticsSettings": {
        "MaxUsersForStatistics": 2500
    },
    "WebrtcSettings": {
        "Enable": false,
        "GatewayWebsocketUrl": "",
        "GatewayAdminUrl": "",
        "GatewayAdminSecret": "",
        "StunURI": "",
        "TurnURI": "",
        "TurnUsername": "",
        "TurnSharedKey": ""
    }
}
```


