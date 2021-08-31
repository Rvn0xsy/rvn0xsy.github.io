---
date: "2019-04-02T00:00:00Z"
description: 解决一个Python socketserver BaseRequestHandler传参问题
title: BaseRequestHandler 传参问题
url: /archivers/2019-04-02/2
---

最近在写[Cooolis-ms](https://github.com/Rvn0xsy/Cooolis-ms)的时候遇到一个坑，学艺不精靠搜索，最终解决了。

问题主要是不知道如何把`ArgumentParser`处理的参数传递到继承了`BaseRequestHandler`的`class`中。

通常情况下，创建一个TCP的`socketserver`代码如下：

```python

import socketserver

class MyTCPHandler(socketserver.BaseRequestHandler):
    def handle(self):
        while True:
            try:
                self.data = self.request.recv(1024).strip()
                print("{} wrote:".format(self.client_address[0]))
                print(self.data)
                self.request.send(self.data.upper())
            except ConnectionResetError as e:
                print("err",e)
                break

if __name__ == "__main__":
    HOST,PORT = "localhost",9999
    server = socketserver.ThreadingTCPServer((HOST,PORT),MyTCPHandler)
    server.serve_forever() 
```

假若我想对`MyTCPHandler`进行一些修饰，添加一些成员属性，那就需要覆盖`__init__`函数，很多资料告诉我调用`super`可以解决，但是`BaseRequestHandler`是有参数的，这些参数必须由`ThreadingTCPServer`进行传递。

因此，通过`stackoverflow`上的一个[大神](https://stackoverflow.com/questions/6875599/with-python-socketserver-how-can-i-pass-a-variable-to-the-constructor-of-the-han)解决了问题：


```python
import socketserver

class MyTCPHandler(socketserver.BaseRequestHandler):
    def __init__(self,request, client_address, server,name):
        self.name = name
        super().__init__(request, client_address, server)
    def handle(self):
        while True:
            try:
                self.data = self.request.recv(1024).strip()
                print("{} wrote:".format(self.client_address[0]))
                print(self.data)
                self.request.send(self.data.upper())
            except ConnectionResetError as e:
                print("err",e)
                break
    @classmethod
    def Creator(cls, *args, **kwargs):
        def _HandlerCreator(request, client_address, server):
            cls(request, client_address, server, *args, **kwargs)
        return _HandlerCreator

if __name__ == "__main__":
    HOST,PORT = "localhost",9999
    name = 'handle'
    server = socketserver.ThreadingTCPServer((HOST,PORT),MyTCPHandler.Creator(name))
    server.serve_forever()
```

调用`Creator`就可以传递多余的参数。

这个问题解决了，代码都在[Cooolis-ms](https://github.com/Rvn0xsy/Cooolis-ms)里体现。