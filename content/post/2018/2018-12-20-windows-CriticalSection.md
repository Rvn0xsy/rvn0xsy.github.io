---
categories: C++/C
date: "2018-12-20T00:00:00Z"
description: 使用临界区保证多个线程读写全局变量进行同步。
title: Windows - 线程同步
url: /archivers/2018-12-20/Windows-CriticalSection
---

## 0x00 线程基础

每个线程的堆栈空间不同，在多线程执行时，可以互不干扰的运行，但是全局变量保存在全局区，当多个线程读写全局变量时，由于读写操作不是原子的，会发生程序错乱。

### 为什么不是原子？

当自增、自减时，需要两行汇编指令，而CPU线程调度的最小单位是一行汇编指令，所以当某个值自增时，操作就不是原子的。


为了保证多线程读写全局变量达到同步，可以使用临界区技术，Windows正是实现了这个技术，提供了对应的API。


## 0x01 令牌线程同步

代码：

```c
// ConsoleApplication2.cpp : 定义控制台应用程序的入口点。
//
#include "stdafx.h"
#include <iostream>
#include <Windows.h>

DWORD num = 100;
CRITICAL_SECTION cs;

DWORD WINAPI ThreadPro1() {
	EnterCriticalSection(&cs);
	while (num > 0) {
		std::wcout << "Thread num :" << num << " Thread ID :" << GetCurrentThreadId() << std::endl;
		num--;
	}
	LeaveCriticalSection(&cs);
	return 10;
}

DWORD WINAPI ThreadPro2() {
	EnterCriticalSection(&cs);
	while (num > 0) {
		std::wcout << "Thread num :" << num << " Thread ID :" << GetCurrentThreadId() << std::endl;
		num--;
	}
	LeaveCriticalSection(&cs);
	return 10;
}

int _tmain()
{
	HANDLE hThread[2];
	InitializeCriticalSection(&cs);
	hThread[0] = CreateThread(NULL, 0,(PTHREAD_START_ROUTINE) ThreadPro1, NULL, 0, NULL);
	hThread[1] = CreateThread(NULL, 0, (PTHREAD_START_ROUTINE)ThreadPro2, NULL, 0, NULL);
	WaitForMultipleObjects(2, hThread, TRUE,INFINITE);
	std::wprintf(TEXT("Success ... \n"));
	system("pause");
    return 0;

}
```

## 0x02 令牌API

```
CRITICAL_SECTION cs; // 创建临界区变量
InitializeCriticalSection(CRITICAL_SECTION *); // 初始化临界区变量
EnterCriticalSection(CRITICAL_SECTION *);//获取临界区变量
LeaveCriticalSection(CRITICAL_SECTION *);//离开临界区
```

## 0x03 互斥体

CRITICAL_SECTION是在进程的虚拟内存空间的一种锁，互斥体（Mutex）是用于内核级资源（内核空间）的线程同步锁，如：跨进程间的读写内核级资源。

### 创建互斥体

```c
HANDLE hMutex = CreateMutex(NULL, FALSE, TEXT("hello"));
/*
	if (GetLastError() == ERROR_ALREADY_EXISTS) {
		std::wcout << "Allready exists Mutex ..." << std::endl;
		system("pause");
		return 0;
	}
*/    
```
函数原型：

```
HANDLE WINAPI CreateMutex(
  _In_opt_ LPSECURITY_ATTRIBUTES lpMutexAttributes,
  _In_     BOOL                  bInitialOwner,
  _In_opt_ LPCTSTR               lpName
);
```
* lpMutexAttributes 安全描述符
* bInitialOwner 如果为TRUE则只对当前进程的内存空间有效，如果为FALSE，则对内核空间有效（系统全局）。
* lpName 内核对象名称

**多个进程要使用同一个互斥体时，内核对象的名称必须相同。**

当互斥体已经被创建时，在其他进程中或在当前进程中调用`CreateMutex`，使用`GetLastError`可以捕获到`ERROR_ALREADY_EXISTS`常量。通过判断`ERROR_ALREADY_EXISTS`就可以知道当前进程有没有另外一个相同的进程了。


源代码：

```c
// ConsoleApplication2.cpp : 定义控制台应用程序的入口点。
//
#include "stdafx.h"
#include <iostream>
#include <Windows.h>

int _tmain()
{
	HANDLE hMutex = CreateMutex(NULL, FALSE, TEXT("hello"));
	if (GetLastError() == ERROR_ALREADY_EXISTS) {
		std::wcout << "Allready exists Mutex ..." << std::endl;
		system("pause");
		return 0;
	}
	WaitForSingleObject(hMutex, INFINITE);

	for (INT i = 0; i < 10; i++)
	{
		Sleep(1000);
		std::wcout << GetCurrentProcessId() << ":" << i << std::endl;
	}
	ReleaseMutex(hMutex);
	std::wprintf(TEXT("Success ... \n"));
	system("pause");
    return 0;

}
```