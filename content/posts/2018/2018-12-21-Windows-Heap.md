---
categories: C++/C
date: "2018-12-21T00:00:00Z"
description: Windows - Heap、Virtual
title: Windows - 内存管理
url: /archivers/2018-12-21/1
---

## 0x00 Windows Heap

每个线程都有自己的堆栈，堆用于在内存中存储未知大小的数据，由堆管理器管理，而栈用于保存函数执行状态，存储局部变量。

## 0x01 申请堆空间的步骤 - Heap API

* HeapCreate // 创建堆句柄（内核对象）
* GetProcessHeap // 获取一个堆句柄
* GetProcessHeaps // 获取所有堆句柄
* HeapAlloc // 申请堆空间
* HeapReAlloc // 在HeapAlloc的基础上申请一块堆空间
* HeapFree // 释放堆空间
* HeapDestory // 销毁堆句柄

## 0x02 HeapCreate Example

```c
// ConsoleApplication2.cpp : 定义控制台应用程序的入口点。
// 堆管理
#include "stdafx.h"
#include <iostream>
#include <Windows.h>

VOID P(wchar_t * contents) {
	std::wprintf(contents);
	system("pause");
	exit(0);
}

int _tmain()
{

	// 堆管理
	/*
	# 创建堆
	HANDLE HeapCreate(
	  DWORD  flOptions,
	  SIZE_T dwInitialSize,
	  SIZE_T dwMaximumSize
	);
	
	flOptions: 1.HEAP_CREATE_ENABLE_EXECUTE 代码允许执行
			   2.HEAP_GENERATE_EXCEPTIONS 如果分配内存失败，会产生异常
			   3.HEAP_NO_SERIALIZE 不进行连续存取
	dwInitialSize: 堆的初始化大小，如果为0，则系统会自动分配一个大小。
	dwMaximumSize: 堆的最大值，如果为0，将是一个可增长的堆，可以达到系统能够分配的最大值。
	*/
	HANDLE hHeap = HeapCreate(HEAP_CREATE_ENABLE_EXECUTE, 0, 0);
	if (hHeap == NULL) {
		P(TEXT("Error HeapCreate() ...\n"));
	}

	/*
	# 获取堆句柄
	HANDLE GetProcessHeap();
	函数返回堆句柄，如果返回值为NULL，获取堆失败
	*/
	HANDLE hHeapRand = GetProcessHeap();
	if (hHeapRand == NULL) {
		P(TEXT("GetProcessHeap() : No Heap ...\n"));
	}
	/*
	# 获取堆句柄
	DWORD GetProcessHeaps(
	  DWORD   NumberOfHeaps, // 输入参数，要获取的句柄数量
	  PHANDLE ProcessHeaps   // 输出参数，句柄数组，用于保存多个句柄
	);
	函数返回堆句柄，如果返回值为NULL，获取堆失败
	*/
	CONST DWORD dwHeapMax = 1024;
	HANDLE hHeapsNum[dwHeapMax];
	DWORD dwHeapNum = GetProcessHeaps(dwHeapMax, hHeapsNum);
	std::wcout << "Heap number : " << dwHeapNum << std::endl;

	/*
	# 为堆分配内存
	DECLSPEC_ALLOCATOR LPVOID HeapAlloc(
		HANDLE hHeap,  // 堆句柄
		DWORD  dwFlags,// 内存分配标志
		SIZE_T dwBytes // 分配大小（字节为单位）
	);
	dwFlags: 
		HEAP_GENERATE_EXCEPTIONS -> 抛出异常
		HEAP_NO_SERIALIZE -> 不连续存储
		HEAP_ZERO_MEMORY -> 将内存块全部清零
	*/
	
	LPTSTR tAlloc = (LPTSTR)HeapAlloc(hHeapRand, HEAP_ZERO_MEMORY, 1000);
	/*
	# 在已分配的基础上继续分配
	DECLSPEC_ALLOCATOR LPVOID HeapReAlloc(
	  HANDLE                 hHeap, // 堆句柄
	  DWORD                  dwFlags, // 内存分配标志
	  _Frees_ptr_opt_ LPVOID lpMem, // 分配内存后的位置
	  SIZE_T                 dwBytes // 分配大小（字节为单位）
	);
	*/
	
	HeapReAlloc(hHeapRand, HEAP_ZERO_MEMORY| HEAP_REALLOC_IN_PLACE_ONLY, (LPVOID)tAlloc,24);
	lstrcpy((LPTSTR)tAlloc, TEXT("HEllo"));
	DWORD dwHeapSize = HeapSize(hHeapRand, HEAP_NO_SERIALIZE, tAlloc);
	std::wcout << "HeapSize : " << dwHeapSize << std::endl;
	HeapFree(hHeapRand, HEAP_NO_SERIALIZE, tAlloc);
	HeapDestroy(hHeapRand);
	std::wprintf(TEXT("Success ... \n"));
	system("pause");
    return 0;

}
```

## 0x03 虚拟内存页管理

### 申请虚拟内存页

**VirtualAlloc**

```c
LPVOID WINAPI VirtualAlloc(
  _In_opt_ LPVOID lpAddress, 分配内存页面的起始位置
  _In_     SIZE_T dwSize,    内存区域大小（Byte）
  _In_     DWORD  flAllocationType, 分配类型（MEM_COMMIT|MEM_RESERVED|MEM_RESET|MEM_RESET_UNDO）
  _In_     DWORD  flProtect 内存的保护属性 (PAGE_NOACCESS|PAGE_GUARD|PAGE_NOCACHE|PAGE_WRITECOMBINE)
);
```
进程的虚拟内存页面存在三种状态：

* Free（空闲）
* Reserved（保留）
* Committed（提交）


Free：进程不能访问这种页面，因为这个页面还没有被分配。任何属于这个页面的虚拟内存地址进行访问都将引用异常。

Reserved：页面被保留以备将来使用，这些页面已被分配，但是没使用，物理地址空间中的内存不存在与其对应的物理内存分页。处于被保留的内存分页也不能被访问。

Committed：内存已经被分配，并且已经被使用，具有与之对应的物理地址空间中的内存分页。

VirtualAlloc可用于指定分配的内存是什么状态，如果当前内存的状态是Committed，则可以直接访问。

VirtualAlloc能够将内存页面的状态从Free、Reserved改为Committed，也可以将Free->Reserved，Reserved->Committed。

### Return value

如果函数成功，则返回值是分配的页面区域的基址。

如果函数失败，则返回值为NULL。

### 内存的保护属性

* PAGE_NOACCESS
* PAGE_GUARD
* PAGE_NOCACHE
* PAGE_WRITECOMBINE

**\>\> [内存保护常量](https://docs.microsoft.com/zh-cn/windows/desktop/Memory/memory-protection-constants)**



### VirtualAlloc Example

```c
// ConsoleApplication2.cpp : 定义控制台应用程序的入口点。
// 虚拟内存页管理
#include "stdafx.h"
#include <iostream>
#include <Windows.h>

VOID P(wchar_t * contents) {
	std::wprintf(contents);
	system("pause");
	exit(0);
}

int _tmain()
{

	
	std::wprintf(TEXT("Success ... \n"));

	/*
	LPVOID WINAPI VirtualAlloc(
	  _In_opt_ LPVOID lpAddress, 分配内存页面的起始位置
	  _In_     SIZE_T dwSize,    内存区域大小（Byte）
	  _In_     DWORD  flAllocationType, 分配类型（MEM_COMMIT|MEM_RESERVED|MEM_RESET|MEM_RESET_UNDO）
	  _In_     DWORD  flProtect 内存的保护属性 (PAGE_NOACCESS|PAGE_GUARD|PAGE_NOCACHE|PAGE_WRITECOMBINE)
	);
	*/
	LPTSTR lpVirMem;
	DWORD virtualMemSize = 2 * 1024;
	MEMORY_BASIC_INFORMATION mbi;
	lpVirMem = (LPTSTR)VirtualAlloc(NULL, virtualMemSize, MEM_COMMIT, PAGE_READWRITE);
	if (lpVirMem == NULL) {
		P(TEXT("Alloc Error ! \n"));
	}
	VirtualQuery(lpVirMem, &mbi, sizeof(mbi));
	std::wcout << "Virtual BaseAddress :" << mbi.BaseAddress << std::endl <<
		"AllocationBase :" << mbi.AllocationBase << std::endl <<
		"AllocationProtect :" << mbi.AllocationProtect << std::endl;
	ZeroMemory(lpVirMem, virtualMemSize);
	CopyMemory(lpVirMem, TEXT("Hello World !!!"), sizeof(TEXT("Hello World !!!")));
	std::wcout << lpVirMem << " | " << sizeof(lpVirMem) << std::endl;
	// ********************************************************************
	VirtualFree(lpVirMem, 0, MEM_RELEASE);
	system("pause");
    return 0;

}

/*
Out:
Success ...
Virtual BaseAddress :00310000
AllocationBase :00310000
AllocationProtect :4
Hello World !!! | 4
*/
```

## 0x04 各种内存分配方式的关系

> 内容来源：https://www.cnblogs.com/arsense/p/6505690.html

### 各自的定义和理解

* GlobalAlloc()

GlobalAlloc()主要用于Win32应用程序实现从全局堆中分配出内存供2017-03-05程序使用，是16位WINDOWS程序使用的API，对应于系统的全局栈，返回一个内存句柄，在实际需要使用时，用GlobalLock()来实际得到内存 区。但32位WINDOWS系统中全局栈和局部堆的区别已经不存在了，因此不推荐在Win32中使用该函数，应使用新的内存分配函数HeapAlloc()以得到更好的支持，GlobalAlloc()还可以用，主要是为了 兼容。

一般情况下我们在编程的时候，给应用程序分配的内存都是可以移动的或者是可以丢弃的，这样能使有限的内存资源充分利用，所以，在某一个时候我们分配的那块 内存的地址是不确定的，因为他是可以移动的，所以得先锁定那块内存块，这儿应用程序需要调用API函数GlobalLock函数来锁定句柄。如下： lpMem=GlobalLock(hMem); 这样应用程序才能存取这块内存。所以我们在使用GlobalAllock时，通常搭配使用GlobalLock，当然在不使用内存时，一定记得使用 GlobalUnlock，否则被锁定的内存块一直不能被其他变量使用。

GlobalAlloc对应的释放空间的函数为GlobalFree。

* HeapAlloc()

HeapALloc是从堆上分配一块内存，且分配的内存是不可移动的（即如果没有连续的空间能满足分配的大小，程序不能将其他零散的 空间利用起来，从而导致分配失败），该分配方法是从一指定地址开始分配，而不像GloabalAlloc是从全局堆上分配，这个有可能是全局，也有可能是局部。

* malloc()

是C运行库中的动态内存分配函数，主要用于ANSI C程序中，是标准库函数。WINDOWS程序基本不再使用这种方法进行内存操作，因为它比WINDOWS内存分配函数少了一些特性，如：整理内存。

* new

标准C++一般使用new语句分配动态的内存空间，需要申请数组时，可以直接使用new int\[3\]这样的方式，释放该方法申请的内存空间使用对应的delete语句，需要释放的内存空间为一个数组，则使用delete [] ary;这样的方式。

要访问new所开辟的结构体空间,无法直接通过变量名进行,只能通过赋值的指针进行访问.

new在内部调用malloc来分配内存，delete在内部调用free来释放内存。

* VirtualAlloc

下面是网友的解释 但我个人的理解这个才是内存申请的鼻祖，所有的内存的申请都感觉默认调用了它。

```c
PVOID VirtualAlloc(
    PVOID pvAddress, 
    SIZE_T dwSize, 
    DWORD fdwAllocationType, 
    DWORD fdwProtect)
```

VirtualAlloc是Windows提供的API，通常用来分配大块的内存。例如如果想在进程A和进程B之间通过共享内存的方式实现通信，可以使用该函数（这也是较常用的情况）。不要用该函数实现通常情况的内存分配。该函数的一个重要特性是可以预定指定地址和大小的虚拟内存空间。例如，希望在进程的地址空间中第50MB的地方分配内存，那么将参数 50\*1024\*\`1024 = 52428800 传递给pvAddress，将需要的内存大小传递给dwSize。如果系统有足够大的闲置区域能满足请求，则系统会将该块区域预订下来并返回预订内存的基地址，否则返回NULL。

使用VirtualAlloc分配的内存需要使用VirtualFree来释放。

### 区别与联系

它们之间的区别主要有以下几点：

1、GlobalAlloc()函数在程序的堆中分配一定的内存，是Win16的函数，对应于系统的全局栈，而在Win32中全局栈和局部堆的区别已经不存在了，因此不推荐在Win32中使用该函数。

2、malloc()是标准库函数，而new则是运算符，它们都可以用于申请动态内存。

3、new()实际上调用的是malloc()函数。

4、new运算符除了分配内存，还可以调用构造函数，但是malloc()函数只负责分配内存。

5、对于非内部数据类型的对象而言，只使用malloc()函数将无法满足动态对象的要求，因为malloc()函数不能完成执行构造函数的任务。

6、malloc(); 和 HeapAlloc(); 都是从堆中分配相应的内存，不同的是一个是c run time的函数，一个是windows系统的函数， 对于windows程序来说，使用HeapAlloc();会比malloc();效率稍稍高一些。

### 关于内存的初始化和使用

**内存分配方式**

内存分配方式有三种：

1）从静态存储区域分配。内存在程序编译的时候就已经分配好，这块内存在程序的整个运行期间都存在。例如全局变量，static变量。

（2）在栈上创建。在执行函数时，函数内局部变量的存储单元都可以在栈上创建，函数执行结束时这些存

储单元自动被释放。栈内存分配运算内置于处理器的指令集中，效率很高，但是分配的内存容量有限。

（3） 从堆上分配，亦称动态内存分配。程序在运行的时候用malloc或new申请任意多少的内存，程序员自己负责在何时用free或delete释放内存。动态内存的生存期由我们决定，使用非常灵活，但问题也最多。

**内存使用错误**

发生内存错误是件非常麻烦的事情。编译器不能自动发现这些错误，通常是在程序运行时才能捕捉到。

而这些错误大多没有明显的症状，时隐时现，增加了改错的难度。有时用户怒气冲冲地把你找来，程序却没有

发生任何问题，你一走，错误又发作了。 常见的内存错误及其对策如下：

* 内存分配未成功，却使用了它。

　　编程新手常犯这种错误，因为他们没有意识到内存分配会不成功。常用解决办法是，在使用内存之前检查指针是否为NULL。如果是用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理。

* 内存分配虽然成功，但是尚未初始化就引用它。

　　犯这种错误主要有两个起因：一是没有初始化的观念；二是误以为内存的缺省初值全为零，导致引用初值

错误（例如数组）。 内存的缺省初值究竟是什么并没有统一的标准，尽管有些时候为零值，我们宁可信其无不

可信其有。所以无论用何种方式创建数组，都别忘了赋初值，即便是赋零值也不可省略，不要嫌麻烦。

* 内存分配成功并且已经初始化，但操作越过了内存的边界。

　　例如在使用数组时经常发生下标“多1”或者“少1”的操作。特别是在for循环语句中，循环次数很容易搞

错，导致数组操作越界。

* 忘记了释放内存，造成内存泄露。

　　含有这种错误的函数每被调用一次就丢失一块内存。刚开始时系统的内存充足，你看不到错误。终有一次程序突然死掉，系统出现提示：内存耗尽。

　　动态内存的申请与释放必须配对，程序中malloc与free的使用次数一定要相同，否则肯定有错误

（new/delete同理）。

* 释放了内存却继续使用它。

　
有三种情况：

　　（1）程序中的对象调用关系过于复杂，实在难以搞清楚某个对象究竟是否已经释放了内存，此时应该重新

设计数据结构，从根本上解决对象管理的混乱局面。

　　（2）函数的return语句写错了，注意不要返回指向“栈内存”的“指针”或者“引用”，因为该内存在函

数体结束时被自动销毁。

　　（3）使用free或delete释放了内存后，没有将指针设置为NULL。导致产生“野指针”。

-------------

　　【规则1】用malloc或new申请内存之后，应该立即检查指针值是否为NULL。防止使用指针值为NULL的内存

　　【规则2】不要忘记为数组和动态内存赋初值。防止将未被初始化的内存作为右值使用。

　　【规则3】避免数组或指针的下标越界，特别要当心发生“多1”或者“少1”操作。

　　【规则4】动态内存的申请与释放必须配对，防止内存泄漏。

　　【规则5】用free或delete释放了内存之后，立即将指针设置为NULL，防止产生“野指针”。

