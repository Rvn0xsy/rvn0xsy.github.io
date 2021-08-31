---
categories: C++/C
date: "2018-12-20T00:00:00Z"
description: 通过使用文件映射来增强修改文件的效率
title: Windows 文件映射
url: /archivers/2018-12-20/windows-FileMapping
---

## 0x00 文件映射的原理

文件映射(Mapping)是一种能够将文件内容映射到进程的虚拟地址空间的技术。视图(view)是一个由映射句柄开辟的一块虚拟地址空间，用于存放文件内容，当文件被映射完成后，改写视图虚拟地址空间的内容就相当于更改文件内容。

一般情况下，当代码运行完毕后，视图将会被自动写入文件中。


## 0x01 文件映射的步骤

* CreateFile()...
* CreateFileMapping()...
* MapViewofFile()...
* FlushViewofFile()...

首先需要创建一个文件句柄，然后再创建一个文件映射的Mapping内核对象，通过映射获得视图。

## 0x02 文件映射简单代码

```c
// ConsoleApplication2.cpp : 定义控制台应用程序的入口点。
//
#include "stdafx.h"
#include <iostream>
#include <Windows.h>

int _tmain()
{
	// 内存映射
	// CreateFile()...
	// CreateFileMapping()...
	// MapViewofFile()...
	// FlushViewofFile...
	HANDLE hFile = CreateFile(TEXT("C:\\Temp\\99.txt"), GENERIC_ALL, 0, NULL, OPEN_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == INVALID_HANDLE_VALUE) {
		std::wcout << GetLastError();
		MessageBox(0, TEXT("CreateFile"), TEXT("Error"), MB_OK);
		return 0;
	}
	HANDLE hMap = CreateFileMapping(hFile, NULL, PAGE_READWRITE, 0, 1024, TEXT("f"));
	if (hMap == INVALID_HANDLE_VALUE) {
		return -1;
	}
	TCHAR szBuff[100] = TEXT("sssss\n");
	TCHAR * pFileVoid = (TCHAR *)MapViewOfFile(hMap, FILE_MAP_ALL_ACCESS, 0, 0, 1024);
	_tcscpy_s(pFileVoid, _countof(szBuff), szBuff);
	std::wprintf(pFileVoid);
	system("pause");
	CloseHandle(hMap);
	CloseHandle(hFile);
    return 0;
}
```

## 0x03 API List

```c
HANDLE WINAPI CreateFile(
  _In_     LPCTSTR               lpFileName,
  _In_     DWORD                 dwDesiredAccess,
  _In_     DWORD                 dwShareMode,
  _In_opt_ LPSECURITY_ATTRIBUTES lpSecurityAttributes,
  _In_     DWORD                 dwCreationDisposition,
  _In_     DWORD                 dwFlagsAndAttributes,
  _In_opt_ HANDLE                hTemplateFile
);
```
-----

```c
HANDLE WINAPI CreateFileMapping(
  _In_     HANDLE                hFile,
  _In_opt_ LPSECURITY_ATTRIBUTES lpAttributes,
  _In_     DWORD                 flProtect,
  _In_     DWORD                 dwMaximumSizeHigh,
  _In_     DWORD                 dwMaximumSizeLow,
  _In_opt_ LPCTSTR               lpName
);
```
----
```c
LPVOID WINAPI MapViewOfFile(
  _In_ HANDLE hFileMappingObject,
  _In_ DWORD  dwDesiredAccess,
  _In_ DWORD  dwFileOffsetHigh,
  _In_ DWORD  dwFileOffsetLow,
  _In_ SIZE_T dwNumberOfBytesToMap
);
```
-----
```c
BOOL WINAPI FlushViewOfFile(
  _In_ LPCVOID lpBaseAddress,
  _In_ SIZE_T  dwNumberOfBytesToFlush
);
```
----
```c
BOOL WINAPI UnmapViewOfFile(
  _In_ LPCVOID lpBaseAddress
);
```
----
```c
BOOL WINAPI UnmapViewOfFile(
  _In_ LPCVOID lpBaseAddress
);
```

## 0x04 创建一个超大文件

在写Example的过程中，我发现申请映射的内存空间会把每个字节写入文件中。

把`MapViewOfFile`的`dwMaximumSizeHigh`和`dwMaximumSizeLow`设置为一个超大值时，就能够把那么大的内存写入文件。

当然前提是映射的空间不得大于`CreateFileMapping`的`dwMaximumSizeHigh`和`dwMaximumSizeLow`。

例如：

```c

// ConsoleApplication2.cpp : 定义控制台应用程序的入口点。
//
#include "stdafx.h"
#include <iostream>
#include <Windows.h>

int _tmain()
{   DWORD dwFileSize = 1024*1024*1024;
	HANDLE hFile = CreateFile(TEXT("C:\\Temp\\99.txt"), GENERIC_ALL, 0, NULL, OPEN_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	HANDLE hMap = CreateFileMapping(hFile, NULL, PAGE_READWRITE, 0, dwFileSize, TEXT("f"));
	if (hMap == INVALID_HANDLE_VALUE) {
		return -1;
	}
	TCHAR * pFileVoid = (TCHAR *)MapViewOfFile(hMap, FILE_MAP_ALL_ACCESS, 0, 0, dwFileSize);
	CloseHandle(hMap);
	CloseHandle(hFile);
    return 0;
}
```

这样就能够创建一个1024\*1024\*1024个字节的文件了。
