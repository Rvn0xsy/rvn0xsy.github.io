---
categories: Windows
date: "2019-01-31T00:00:00Z"
description: 快过年了，最近学不进去东西，总结一下之前的基础知识，顺便结合起来。
title: BMP位图隐写
url: /archivers/2019-01-31/1
---

## 0x01 BMP简介

BMP（全称Bitmap）是Windows操作系统中的标准图像文件格式，可以分成两类：设备有向量相关位图（DDB）和设备无向量相关位图（DIB），使用非常广。它采用位映射存储格式，除了图像深度可选以外，不采用其他任何压缩，因此，BMP文件所占用的空间很大。BMP文件的图像深度可选lbit、4bit、8bit及24bit。BMP文件存储数据时，图像的扫描方式是按从左到右、从下到上的顺序。由于BMP文件格式是Windows环境中交换与图有关的数据的一种标准，因此在Windows环境中运行的图形图像软件都支持BMP图像格式。

典型的BMP图像文件由四部分组成：

* 1：位图头文件数据结构，它包含BMP图像文件的类型、显示内容等信息；
* 2：位图信息数据结构，它包含有BMP图像的宽、高、压缩方法，以及定义颜色等信息；
* 3：调色板，这个部分是可选的，有些位图需要调色板，有些位图，比如真彩色图（24位的BMP）就不需要调色板；
* 4：位图数据，这部分的内容根据BMP位图使用的位数不同而不同，在24位图中直接使用RGB，而其他的小于24位的使用调色板中颜色索引值。

当然，我们不需要了解那么多，唯一比较重要的就是文件数据结构。

## 0x02 BMP文件格式

第一个知识点：BM (0x4D 0x42)

![2019-01-31-16-00-25](https://images.payloads.online/4be2fdaa-4f5f-11ec-aab0-00d861bf4abb.png)

所有的BMP文件都以这两个字节开头（固定格式）。

[详解大端模式和小端模式](https://www.cnblogs.com/mingcaoyouxin/p/4286310.html)

**由于个人计算机都是以小端存储的，所以你看到的0x4D 0x42都要从0x4D由右向左开始读取。**

第二个知识点：BMP文件大小

![2019-01-31-16-02-53](https://images.payloads.online/4c1ecef2-4f5f-11ec-a65b-00d861bf4abb.png)

0x00072D46 = 470342（Byte） = 470KB

所以这个BMP的文件大小是470KB，也就是说一个图片软件，校验图片是否损坏、是否完整，都是通过读取这四个字节来判断的。

当然在Web领域也是一样，在图片进行渲染的过程中也会判断文件是否完整。


## 0x03 偏移量-像素位置

BMP的格式我们不介绍太多，关键是找到像素的偏移量就够了，有了偏移量就能够覆盖像素，每一个像素的宽度是3个字节，也就是色光三原色的RGB值。

![2019-01-31-16-16-59](https://images.payloads.online/4c568f90-4f5f-11ec-8291-00d861bf4abb.png)

**其中36前面的00 00 00 00是保留位，没有意义。**

36 00 00 00(0x36)转换成十进制是54。

也就是说，从BMP文件的第一个字节开始，到第54个字节就是像素的开始。

![2019-01-31-16-21-16](https://images.payloads.online/4c8c9144-4f5f-11ec-982e-00d861bf4abb.png)

三个D8就是一个像素。

## 0x04 写入内容

这个过程中，我们可以写入shellcode、PE文件、字符串等。

这里我只是写入了一个“Hello world !!!”：

```c

// ConsoleApplication1.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <iostream>
#include <Windows.h>
#include <winsock.h>
// int WinMain(HINSTANCE hinstance,HINSTANCE hprevinstance,LPSTR lpcmdline,int ncmdshow)
int main()
{
	CHAR text[] = "Hello world !!!";
	LPCWCHAR pFilename = TEXT("C:\\Users\\Rvn0xsy\\source\\repos\\ConsoleApplication1\\Debug\\splash.bmp");
	LPCWCHAR pSaveFilename = TEXT("C:\\Users\\Rvn0xsy\\source\\repos\\ConsoleApplication1\\Debug\\save.bmp");
	// 创建文件句柄，打开图片
	HANDLE hFile = CreateFile(pFilename, GENERIC_ALL, 0, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == INVALID_HANDLE_VALUE) {
		std::wcout << GetLastError();
		MessageBox(0, TEXT("CreateFile"), TEXT("Error"), MB_OK);
		return 0;
	}
	// 获取文件大小
	DWORD dwFileSize;
	dwFileSize=GetFileSize(hFile, NULL);
	// 申请一个与文件大小对应的内存空间
	CHAR * lpBuffer =(CHAR *) HeapAlloc(GetProcessHeap(), HEAP_ZERO_MEMORY, dwFileSize);
	// 将文件内容读入内存
	ReadFile(hFile, lpBuffer, dwFileSize, &dwFileSize, NULL);
	// 获取第一个像素点对应的首字节
	DWORD * point = (DWORD*)(lpBuffer + 10);

	// 获取首个像素地址
	CHAR* lpData = (lpBuffer + (*point));
	// 写入内容
	CopyMemory(lpData, text, sizeof(text));
	//创建保存副本
	HANDLE hSave = CreateFile(pSaveFilename, GENERIC_ALL, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	WriteFile(hSave, lpBuffer, dwFileSize, &dwFileSize, NULL); // 写入文件
	CloseHandle(hSave); // 保存

	// 释放堆
	HeapFree(GetProcessHeap(), 0, lpBuffer);

	// 关闭文件
	CloseHandle(hFile);
}
```

效果如下：

![2019-01-31-16-24-59](https://images.payloads.online/4ccb0744-4f5f-11ec-8fae-00d861bf4abb.png)


对图片的影响只是像素级别的，不会出现缺损问题。

## 0x05 科普

使用CMD命令制作生成图片木马很可能会导致图片缺损，原因是有概率会覆盖掉偏移量、或者代码超出了偏移范围。

