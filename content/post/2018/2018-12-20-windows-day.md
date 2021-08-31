---
categories: C++/C
date: "2018-12-20T00:00:00Z"
description: 总结一下最近学习Windows编程的知识点。
title: 最近学习Windows编程总结
url: /archivers/2018-12-20/1
---


## 0x00 Windows 字符编码

目前Windows最常见的字符集：

* 1.ASCII
* 2.Unicode
* 3.UTF-16
* 4.UTF-8

Unicode是一个字符集，UTF-16是Unicode的存储实现，Windows中的Unicode默认是UTF-16存储方式。

Unicode：
* UTF-16：一个字符占用两个字节
* UTF8-8：一个字符占用两个字节，一般用于网络传输

### 各个字符集的BOM头

* UTF-8：EF BB BF
* UTF-16LE：FF FE
* UTF16BE：FE FF

### Windows字符数据类型

```c
CHAR -> char
PSTR -> char *
WCHAR -> wchar_t
PWSTR -> wchar_t *
TCHAR -> 一个宏，当前是什么字符集，编译出来就是什么字符集
PTSTR -> TCHAR * (有利于跨平台)
```

开发中推荐使用“TEXT”宏与PTSTR类型的字符串指针。

## 0x01 Windows进程创建

进程是一个程序正在运行的一个实例，它由一个内核对象和一个地址空间组成。

内核对象与地址空间都在4GB的虚拟内存中，内核占2GB高地址，低地址的2GB给程序的堆栈使用。

在Windows中，系统通过句柄管理进程中的资源，句柄存储在内核空间中的一个全局句柄表中，而每个进程也都有一个句柄表，这个句柄表是私有的。

**PID** 是指的是全局句柄表的值。

### 进程执行的加载过程

* 1.映射EXE
* 2.创建内核对象EPROCESS
* 3.映射系统DLL（ntdll.dll）
* 4.创建线程内核对象ETHREAD
* 5.系统启动线程、映射DLL（ntdll.LdrInitalizeThunk）、线程开始执行

### 创建进程

```c
BOOL CreateProcess
(
LPCTSTR lpApplicationName,
LPTSTR lpCommandLine,
LPSECURITY_ATTRIBUTES lpProcessAttributes,
LPSECURITY_ATTRIBUTES lpThreadAttributes,
BOOL bInheritHandles,
DWORD dwCreationFlags,
LPVOID lpEnvironment,
LPCTSTR lpCurrentDirectory,
LPSTARTUPINFO lpStartupInfo,
LPPROCESS_INFORMATIONlpProcessInformation
);
```

### 线程与进程的关系

进程是一个程序正在运行的一个实例，它提供了一块存储代码的空间，在进程被创建时，系统也会给进程创建一个主线程（primary thread），主线程负责执行代码，一个进程没有线程是无法运行的。

一个进程可以拥有多个线程，但是永远是先拥有主线程，通过主线程创建其他线程。

每个进程都至少有一个线程负责运行代码，否则进程将进入睡眠状态，或被系统销毁。

当主线程运行完毕，进程也将会被销毁。

句柄表：由操作系统内核维护的一个二维表格。

使用句柄值（HANDLE）对应内核对象，每个进程内的句柄都是不一样的，但都存在于全局句柄表。

全局句柄表中的句柄ID就是操作系统的进程列表中的PID。

一个进程在运行后，通过线程执行，一个进程必须拥有一个线程

### 线程操作函数

* 暂停线程：SuspendThread(hThread)
* 恢复线程：ResumeThread(hThread)

**ResumeThread函数**

在暂停状态中创建一个线程，就能够在线程有机会执行任何代码之前改变线程的运行环境（如优先级）。

一旦改变了线程的环境，必须使线程成为可调度线程。要进行这项操作，可以调用ResumeThread，将调用CreateThread函数时返回的线程句柄传递给它（或者是将传递给CreateProcess的ppiProcInfo参数指向的线程句柄传递给它）：如果ResumeThread函数运行成功，它将返回线程的前一个暂停计数，否则返回0xFFFFFFFF。

单个线程可以暂停若干次。如果一个线程暂停了3次，它必须恢复3次，然后它才可以被分配给一个CPU。


**SuspendThread函数**

当创建线程时，除了使用 CRETE_SUSPENDED也可以调用SuspendThread函数来暂停线程的运行：任何线程都可以调用该函数来暂停另一个线程的运行（只要拥有线程的句柄）。线程可以自行暂停运行，但是不能自行恢复运行。

与ResumeThread一样SuspendThread返回的是线程的前一个暂停计数。线程暂停的最多次数可以是MAXIMUM_SUSPEND_COUNT次（在WinNT. h中定义为127）。

注意，SuspendThread与内核方式的执行是异步进行的，但是在线程恢复运行之前，不会发生用户方式的执行。

在实际环境中，调用SuspendThread时必须小心，因为不知道暂停线程运行时它在进行什么操作。如果线程试图从堆栈中分配内存，那么该线程将在该堆栈上设置一个锁。当其他线程试图访问该堆栈时，这些线程的访问就被停止，直到第一个线程恢复运行。

## 0x02 Windows 文件操作

* ZeroMemory(des,size)
* GetLogicalDriveStringA(length,buffer)
* FindFirstVolumeA(buffer,length) => return hVolume
* FindNextVolumeA(hVolume,buffer,length)
* FindVolumeClose(hVolume)

```c
// ConsoleApplication1.cpp : 定义控制台应用程序的入口点。
//

#include "stdafx.h"
#include <Windows.h>

int main()
{
	CHAR drives[255] = {0};
	ZeroMemory(drives, 255);
	DWORD devLen = GetLogicalDriveStringsA(254, drives);
	for (size_t i = 0; i < sizeof(drives); i++)
	{
		TCHAR s = drives[i];
		if (s == '\0') {
			continue;
		}
		printf("%c\n", drives[i]);
	}
	ZeroMemory(drives, 255);
	HANDLE hVolume = FindFirstVolumeA(drives, 255);
	if (INVALID_HANDLE_VALUE == hVolume) {
		return 0;
	}
	while (FindNextVolumeA(hVolume, drives, 255)) {
		printf("Volume : %s \n",drives);
	}

	FindVolumeClose(hVolume);
	system("pause");
    return 0;
	// ss

}
```

```c
UINT GetDriveTypeA(
  LPCSTR lpRootPathName
);
```

lpRootPathName : 驱动器的根目录。

需要一个尾随反斜杠。如果此参数为NULL，则该函数使用当前目录的根。
Return Value :

```
DRIVE_UNKNOWN -> 0 无法确定驱动器类型。
DRIVE_NO_ROOT_DIR ->1 根路径无效; 例如，指定路径上没有安装卷。
DRIVE_REMOVABLE -> 2 驱动器有可移动介质; 例如，软盘驱动器，拇指驱动器或闪存卡读卡器。
DRIVE_FIXED -> 3 驱动器有固定的媒体; 例如，硬盘驱动器或闪存驱动器。
DRIVE_REMOTE -> 4 该驱动器是远程（网络）驱动器。
DRIVE_CDROM -> 5 该驱动器是CD-ROM驱动器。
DRIVE_RAMDISK -> 6 驱动器是RAM磁盘。
```

```c
GetVolumeInformation(
  lpRootPathName: PChar;               {磁盘驱动器代码字符串}
  lpVolumeNameBuffer: PChar;           {磁盘驱动器卷标名称}
  nVolumeNameSize: DWORD;              {磁盘驱动器卷标名称长度}
  lpVolumeSerialNumber: PDWORD;        {磁盘驱动器卷标序列号}
  var lpMaximumComponentLength: DWORD; {系统允许的最大文件名长度}
  var lpFileSystemFlags: DWORD;        {文件系统标识}
  lpFileSystemNameBuffer: PChar;       {文件操作系统名称}
  nFileSystemNameSize: DWORD           {文件操作系统名称长度}
): BOOL;

// ConsoleApplication1.cpp : 定义控制台应用程序的入口点。
//

#include "stdafx.h"
#include <Windows.h>

int main()
{
	CHAR drives[255] = {0};
	ZeroMemory(drives, 255);
	DWORD devLen = GetLogicalDriveStringsA(254, drives);
	for (size_t i = 0; i < sizeof(drives); i++)
	{
		TCHAR s = drives[i];
		if (s == '\0') {
			continue;
		}
		printf("%c\n", drives[i]);
	}
	ZeroMemory(drives, 255);
	HANDLE hVolume = FindFirstVolumeA(drives, 255);
	if (INVALID_HANDLE_VALUE == hVolume) {
		return 0;
	}
	while (FindNextVolumeA(hVolume, drives, 255)) {
		printf("Volume : %s \n",drives);
		DWORD dwVolumeSerNumber;
		CHAR lpRootPathName[MAX_PATH];
		CHAR lpVolumName[MAX_PATH];
		CHAR szFileSystemNameBuffer[MAX_PATH];
		DWORD dwMaxLength;
		DWORD dwFileSystemFlags;
		if (!GetVolumeInformationA(
			drives,
			lpVolumName,
			MAX_PATH,
			&dwVolumeSerNumber,
			&dwMaxLength,
			&dwFileSystemFlags,
			szFileSystemNameBuffer,
			MAX_PATH)) {
			return FALSE;
		}
		printf("%s\n", lpVolumName);
	}
	FindVolumeClose(hVolume);
	system("pause");
    return 0;
}


```

### 读写文件

```c
HANDLE WINAPI CreateFile(
_In_ LPCTSTR lpFileName,
_In_ DWORD dwDesiredAccess,
_In_ DWORD dwShareMode,
_In_opt_ LPSECURITY_ATTRIBUTES lpSecurityAttributes,
_In_ DWORD dwCreationDisposition,
_In_ DWORD dwFlagsAndAttributes,
_In_opt_ HANDLE hTemplateFile
);
```

### 函数声明

```c
HANDLE CreateFile(LPCTSTR lpFileName, //普通文件名或者设备文件名
DWORD dwDesiredAccess, //访问模式（写/读）
DWORD dwShareMode, //共享模式
LPSECURITY_ATTRIBUTES lpSecurityAttributes, //指向安全属性的指针
DWORD dwCreationDisposition, //如何创建
DWORD dwFlagsAndAttributes, //文件属性
HANDLE hTemplateFile //用于复制文件句柄
);
```

```c
// ConsoleApplication1.cpp : 定义控制台应用程序的入口点。
//

#include "stdafx.h"
#include <Windows.h>
#include <iostream>

int main()
{
	LPTSTR FileName = TEXT("c:\\Temp\\1.txt");
	/*
	
	if (DeleteFile(FileName)) {
		MessageBox(0, L"删除成功！", L"INFO", MB_OK);
	}
	else {
		DWORD err = GetLastError();
		MessageBox(0, L"Error", L"INFO", MB_HELP);
	}
	*/
	/*
	if (CopyFile(FileName, TEXT("C:\\Temp\\2.txt"),TRUE)) {
		MessageBox(0, L"COPY成功！", L"INFO", MB_OK);
	}
	if (MoveFile(FileName, TEXT("C:\\Temp\\3.txt"))) {
		MessageBox(0, L"MOVE成功！", L"INFO", MB_OK);
	}
	*/
	HANDLE hFile = CreateFile(TEXT("C:\\Temp\\1.txt"),GENERIC_READ|GENERIC_WRITE,0,NULL,OPEN_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
	if (hFile == INVALID_HANDLE_VALUE) {
		MessageBox(0, L"Error", L"INFO", MB_HELP);
	}
	else {
		CHAR Text[MAX_PATH];
		ZeroMemory(Text, MAX_PATH);
		DWORD ReadLen;
		ReadFile(hFile, Text, MAX_PATH - 1, &ReadLen, NULL);
		std::cout << "Length : " << ReadLen << " Content :" << Text << std::endl;

		DWORD WriteLen;
		CHAR content[] = "Hello world !!!";
		WriteFile(hFile, content, sizeof(content), &WriteLen, FALSE);
	}


	CloseHandle(hFile);
	
	system("pause");
    return 0;
}
```

## 0x03 Windows 线程


```c
HANDLE WINAPI CreateThread(
      _In_opt_  LPSECURITY_ATTRIBUTES  lpThreadAttributes,   
      _In_      SIZE_T                 dwStackSize,
      _In_      LPTHREAD_START_ROUTINE lpStartAddress,
      _In_opt_  LPVOID                 lpParameter,
      _In_      DWORD                  dwCreationFlags,
      _Out_opt_ LPDWORD                lpThreadId
    );
```

第一个参数 lpThreadAttributes 表示线程内核对象的安全属性，一般传入NULL表示使用默认设置。

第二个参数 dwStackSize 表示线程栈空间大小。传入0表示使用默认大小（1MB）。

第三个参数 lpStartAddress 表示新线程所执行的线程函数地址，多个线程可以使用同一个函数地址。

第四个参数 lpParameter 是传给线程函数的参数。

第五个参数 dwCreationFlags 指定额外的标志来控制线程的创建，为0表示线程创建之后立即就可以进行调度，如果为CREATE_SUSPENDED则表示线程创建后暂停运行，这样它就无法调度，直到调用ResumeThread()。

第六个参数 lpThreadId 将返回线程的ID号，传入NULL表示不需要返回该线程ID号。

* SuspendThread(HANDLE Thread); // 阻塞线程
* ResumeThread(HANDLE Thread); // 启动线程

线程可多次阻塞

### 等待线程执行完毕

```c
WaitForSingleObject(
    _In_ HANDLE hHandle,
    _In_ DWORD dwMilliseconds //等待时间 如果为INFINITE 则一直等待
    );
```


### 等待多个线程执行完毕

```c
WaitForMultipleObjects(
    _In_ DWORD nCount,
    _In_reads_(nCount) CONST HANDLE *lpHandles,
    _In_ BOOL bWaitAll,
    _In_ DWORD dwMilliseconds
    );
WaitForMultipleObjects(2, hThread, TRUE, INFINITE);
GetExitCodeThread(
    _In_ HANDLE hThread,
    _Out_ LPDWORD lpExitCode
    );
GetExitCodeThread(hThread[0], &ExitThreadCode);
```
