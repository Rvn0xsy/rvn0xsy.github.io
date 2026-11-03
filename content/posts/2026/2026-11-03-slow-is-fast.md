---
title: "慢即是快——企者不立，跨者不行"
date: 2026-11-03
description: 道德经："企者不立，跨者不行"，意为不可好高骛远、急功近利。分享我在 AI 时代下对经验资产化、项目级配置与回归基本功的一些思考。
url: /archivers/2026-11-03/slow-is-fast
tags: AI相关,心情随笔
---



> 道德经："企者不立，跨者不行"，意为**不可好高骛远、急功近利。无论是踮起脚硬撑着高度，还是超负荷迈大步急于赶路，都是不符合自然规律的 "矫揉造作" 状态，费力且无法持久。**

最近我也开始思考我应当如何应对AI时代周身这么快速的变化，当下正好有几件正在做的事情，遂进行一次分享。在 AGENT 、Harness 等概念潮流在 2026 年席卷而来时，我也经历了好几个心态阶段，从一开始自己动手做、再到 AGENT 编排，接着又研究 AGENT 记忆工程怎么嵌入到我的生活方方面面，也花了很多精力去各种探索尝试，今天不禁想停下来思考，AI给我带来了什么？我要用 AI 完成什么事情？

在生活方面，我把 AI 用到帮我记账、分析财务状况、健康状况分析、保险筛选、小病问诊、待办记录、答疑百科等场景，甚至也会通过 AI 去读取日志做一点简单的心理状态评估，可谓是无所不用其极，但距离我理想的状态还是有一些距离——"我想拥有一个贾维斯"。

> 贾维斯（J.A.R.V.I.S.）是美国漫威漫画旗下人工智能系统，全称 Just A Rather Very Intelligent System，其名称源自托尼・斯塔克的管家埃德温・贾维斯。

我梦想里的贾维斯可以直接理解我的意图，拆分任务然后递进的解决问题，但这是理想状态，当前我还没有做到这个程度上，目前在 "如何让 AGENT 知我懂我"的路上我探索的还不够，我理解 Harness 工程本质上解决的根本问题是怎么帮助人类把事情做对。


## 持续经验资产化

光我手上换过的主力 `Coding Agent` 都好几个了：`Claude Code -> OpenCode -> Codex -> DeepSeek Harness -> Pi -> Oh My Pi`，还有一些知名的开源软件：Multica 、Orca、Paseo 等，工具一大堆，确没有把其中一个完完全全的用好。

怎么算用好呢？我认为应该像是微信，成为日常，每个功能都比较熟悉，打开就能干活（摸鱼）一样自然。里边存储着自己生活或工作的很多信息和现实链接的人，与自己的身份也是紧密绑定的。

那么如何达到这个效果呢？首先肯定是多用、多探索，然后沉淀好属于自己的 Skills、MCP，做好全局的归纳整理。今年有一句话令我印象深刻，就是 "Skill 就是人的经验资产化"，俗称把干一件事的经验转化为Skill的过程称之为**自我蒸馏**。我目前常用的Skill说实话真的不多，用的最多的还是自己改造的 outline Skill，它的功能很简单，就是可以管理我自己私有的笔记服务，其次就是对pdf、xlsx、docx等文档的处理，最后就是grill-me、research等，好像自己写的Skill还是比较少的，更多的是依据开源的进行优化，下面的[reflect-mem-memory](https://github.com/Rvn0xsy/reflect-mem)就是我开源的一个比较轻量、简单易用的记忆 MCP ，长期在用。

```
╭─ ~/.agents/skills ‹master●›
╰─$ ls
 agent   coding   docs  ego-browser   infra   lark   pi   README.md   thinking
╭─ ~/.agents/skills ‹master●›
╰─$ ls docs
 codex-ppt   docx   human-writing   patent-disclosure-skill   pdf   pptx   text-to-image   to-questionnaire   to-spec   to-tickets   wechat-chat-screenshot   writing-for-agents   xlsx
╭─ ~/.agents/skills ‹master●›
╰─$ ls thinking
 ask-matt   grill-me   grill-with-docs   grilling   handoff   research   setup-matt-pocock-skills   steelman   teach   wait-what   wayfinder
╭─ ~/.agents/skills ‹master●›
╰─$ ls coding
 code-review       diagnosing-bugs  implement                       prototype                  sensitive-rg-scanner  triage                       web-design-guidelines
 codebase-design  domain-modeling  improve-codebase-architecture  resolving-merge-conflicts  tdd                   vercel-react-native-skills
╭─ ~/.agents/skills ‹master●›
╰─$ ls agent
 computer-use  ego-browser  orca-cli  orchestration  outline  reflect-mem-memory
```

## 保持洁癖

还有一个观点我也想拿出来讲讲，项目级的配置项目要多用。主流的Coding Agent都支持项目级的配置，不用把每个配置都写到全局，因此我创建了 AI工作空间（临时工作）、工作空间、漏洞挖掘空间等目录，然后在目录下面管理该文件夹所必要的MCP、Skills，尽可能不在全局里写入配置，这么做能够减少侵入，还可以设置bash别名等方式快速进入对应的目录开始干活，例如下面我对二进制分析+手机App漏洞自动挖掘结合的工作目录是这么配置的：

```
╭─ ~rea
╰─$ ls -al .omp
drwxr-xr-x - staff 128 B Thu Oct 29 14:46:47 2026  .
drwxr-xr-x - staff 448 B Thu Oct 29 14:51:28 2026  ..
.rw------- - staff 672 B Thu Oct 29 14:47:41 2026  mcp.json
.rw------- - staff   0 B Thu Oct 29 14:46:11 2026  mcp.json.lock
╭─ ~rea
╰─$ cat .omp/mcp.json
{
  "$schema": "https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/config/mcp-schema.json",
  "mcpServers": {
    "rea": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "rea-agents@6.4.0",
        "mcp"
      ],
      "env": {
        "GHIDRA_INSTALL_DIR": "/opt/homebrew/opt/ghidra/libexec",
        "JAVA_HOME": "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
      },
      "timeout": 300000,
      "description": "REA reverse-engineering tools; Ghidra 12.1.4 headless provider via Homebrew"
    },
    "burp": {
      "type": "sse",
      "url": "http://localhost:9876"
    }
  }
}
╭─ ~rea
╰─$ pwd
/Users/-/Documents/workspace-for-ai/Pi/Pi-rea
╭─ ~rea
╰─$
```

记得上上周，`DeepSeek v4 Flash`和我一起只花了20分钟就把我的OnePlus Ace5 Pro给Root了，还装上了KernelSU，编写了两个模块：植入Burp证书、祛除系统广告，插入USB它就能操作手机进行自动化测试了……

##  回归基本功：把话说清楚

最近我在用DeepSeek V4 Flash和GLM 5.3 Flash进行代码开发工具，在以往进行古法编程的时候我经常会需要构建测试、然后递进式的才能把需求梳理清楚并实现，缺乏全局思考的过程，这导致我对于长程任务的描述语言很有限，如果Vibe Coding任务的工程量很大，最合适的用法是提前确定/goal的目标是什么，最好是有验收标准的目标，这里就很有趣了。我发现我写不清楚，只能一段段的人机协同，有时候还变得急躁想骂两句AI，我想很多人都这样做过。

对于一个类似Akkuman、三米前有蕉皮这类资深的架构师肯定没有这种烦恼，而这变成了我亟待解决的问题，于是我开始让自己慢下来，递进式脑补过程，尝试写几段/goal 提示词，发现越写越好：

```
> 移植 ~/Documents/Git/ABC 下的 BCD、DEF、RST 到当前项目，创建一个 channels 文件夹，以后这个项目要增加一个通道的概念，未来可能会增加很多channel，每个channel 都是一个MCP服务，提供http/stdio模式连接的MCP，channels文件夹下每一个channel 除了源代码都要有README.md \ docs \ AGENTS.md 方便未来原子化开发，你可以考虑抽象出通用的接口，当我告诉AI Coding Agent : 帮我开发一个channel时，它能快速理解channel是什么，然后开始访谈，最后再写代码、验证
> 给 makefile增加一个功能，能够构建、打包发布：BCD、DEF、RST 二进制（windows、linux、macos）每个二进制打包文件里还要包含README.md ，方便使用者快速了解channel，以及包含命令示例参考
> 检查makefile是否和当前项目有出入、缺陷，然后修复，makefile 还要支持 发布镜像、构建中间构建镜像、docker compose启动、停止服务的子命令，还有发布 XXX 二进制文件（一定要包含先进行前端构建、后构建二进制，嵌入二进制），支持macos、windows、linux ，你可以考虑gorelease 这类成熟的发布、构建工具
> 检查若以docker compose启动，数据目录是否在 git 排除列表，方便我本地开发调试，避免把数据也提交到git仓库中，数据目录最好都放到一个目录下
```

这是我一口气写出来的，期间我去安心的喝咖啡了，我想这才是最好的状态，但还不够，我又继续写提示词：

```
IMPORTANT: 要尽可能使用现成的、成熟开源项目和方案、代码，少造轮子
IMPORTANT: 不要一个文件写很多很多行代码，要注意代码文件结构清晰
以上任务你完成后，给我一个进展报告、风险，以及我没有考虑到的地方
> 对项目根目录下的 *.sh *.bat 脚本文件进行整理，挪到 scripts 目录，过时无用的就删掉
> 对项目整体文件夹的结构进行分析、优化，目录结构要清晰、有条理
>  CCC/cmd/cccc/main.go 的参数要支持子命令，可以用golang viper cobra等库进行优化，子命令可以增加：重置管理员密码、服务管理、健康检查、等其他你认为有必要的功能，开发完毕你要进行测试、验证，要有单元测试跑通才可以完成这一项任务
> docker、二进制、源码构建部署的几种方式，要写到 docs 文档里，后续会随着发版本一起构建
> channel 概念介绍也要加入 docs 文档中，然后子章节增加每个channel的介绍、使用方法、错误排查，还有channel如何开发
> 考虑增加https证书部署，你要考虑到VPS主机的IP可能是运营商给的内网IP，但也有公网IP，外部访问的时候，需要指定域名的方式访问，因此还要绑定域名参数
> 分析现阶段架构前端渲染的速度，对页面加载进行提速，还有后端接口的响应速度优化
> 前端的菜单里增加一项"文档/手册"的菜单项，指向 /docs 页面

执行通道的逻辑是： 执行通道下面有三个子菜单，每个菜单项目就是执行通道的名称，页面内容里是可以配置执行通道的安装命令和连接执行通道，以及对话，具体可以参考 ~/Documents/Git/KKKK 的前端设计（关于执行通道部分），你先梳理出来一个开发计划

"通道连接默认读 .env（KALI_MCP_URL + MCP_API_TOKEN）"，这个是错误的。通道管理只负责 创建部署通道、连接、检测通道，从环境变量读取这类参数意味着只能连接、部署1个通道，我要的是可以部署多个同类型通道，然后可以给Agent绑定，或下发任务的时候绑定相关通道，让agent有这些能力，.env中只保留必要的KV
在执行通道的功能处，开发一个安装执行通道的需求，参考：~/Documents/Git/KKKK 里的实现，功能说明：
支持生成安装命令，执行后自动回连平台，这样可以达到自动注册通道的效果，最后作为资深的产品经理分析一下这个项目的菜单项，你给出一个方案进行优化，哪些可以归类的，给出一个归纳方案，我拍板后你再行动
```

以及：

```
我决定对整个项目的前端进行改造，使用HeroUI，你可以参考它的官网：https://heroui.com/
这里有Skills ： https://heroui.com/en/docs/react/getting-started/agent-skills 和MCP：https://heroui.com/en/docs/react/getting-started/mcp-server 你可以把这些需要的东西，安装到当前项目级然后定义一个专业的前端工程师提示词，指定给subagent ，由 subagent 生成一个改造计划，主Agent再进行评估、审核（是否有遗漏的）最后生成一个改造计划的方案，和我讨论使用哪种风格，设计理念、全局的样式，保持原有的所有菜单功能、表单、功能，主要是对样式进行重构，必须使用HeroUI，不要造轮子，如果官网有现成的example，拿来即用。
当前你是在一个worktree里，可以放心改动
```


我知道 OpenAI、Anthropic 的模型更好，可能不需要这么复杂的提示词，但我们可能真的不能丢掉把想法说出来的能力，**语言让智能从个体属性，部分转变为可以在群体之间共享、积累和发展的能力，同样的，语言也让大规模人类合作成为可能**，所以，要回归基本功，多去真诚的交流！
