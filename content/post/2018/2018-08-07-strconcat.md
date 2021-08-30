---
categories: C++/C
date: "2018-08-07T00:00:00Z"
description: 本文记录一下实现strcat函数的过程
title: C语言strcat函数实现
url: /archivers/2018-08-07/1
---

本文记录一下实现strcat函数的过程
<!--more-->
* 目录
{:toc}

## 0x01 strcat函数

### 原型：

```c
char *strcat(char *dest, const char *src);
```
### 参数

`dest` 为目标字符串指针，`src` 为源字符串指针。

### 说明

`strcat()` 会将参数 `src` 字符串复制到参数 `dest` 所指的字符串尾部；`dest` 最后的结束字符 `NULL` 会被覆盖掉，并在连接后的字符串的尾部再增加一个 `NULL`。

**注意： dest 与 src 所指的内存空间不能重叠，且 dest 要有足够的空间来容纳要复制的字符串**

### 返回值

返回`dest` 字符串起始地址。

## 0x02 实现原理

```c
char dest[20] = {'a','v','8','d','\0','7','w','s'};
char src[5] = {'a','v','8','d','\0'};
```

假设要将src拼接到dest后面，首先要找到第一个dest中的`\0`，然后在后面赋值。

在网上找到了一个非常好的案例：

```c
char * strconcat(char *a,char *b){
    char *p=a;
    if(a==NULL || b==NULL)
        return NULL;
    while(*p)
        p++;
    while(*p++=*b++);
    return a;
}
```
首先创建一个指针变量，指向目标字符串的首地址，然后不断偏移……

**while还真好用（真香）**

等到`while`偏移到第一个`\0`的时候，将要拼接的字符串也逐个开始偏移、赋值。

总之写的很精辟！