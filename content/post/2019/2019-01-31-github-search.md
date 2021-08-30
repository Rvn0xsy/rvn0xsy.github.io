---
categories: Windows
date: "2019-01-31T00:00:00Z"
description: 原来github搜集信息是这么玩的，很精确，总结了以下才知道！
title: Github搜索语法-信息搜集指南
url: /archivers/2019-01-31/2
---

您可以在所有公共GitHub存储库中搜索以下类型的信息，以及您有权访问的所有私有GitHub存储库：

* [Repositories](https://help.github.com/articles/searching-for-repositories)
* [Topics](https://help.github.com/articles/searching-topics)
* [Issues and pull requests](https://help.github.com/articles/searching-issues-and-pull-requests)
* [Code](https://help.github.com/articles/searching-code)
* [Commits](https://help.github.com/articles/searching-commits)
* [Users](https://help.github.com/articles/searching-users)
* [Wikis](https://help.github.com/articles/searching-wikis)

参考：
* [Searching for repositories](https://help.github.com/articles/searching-for-repositories)
* [Searching topics](https://help.github.com/articles/searching-topics)
* [Searching code](https://help.github.com/articles/searching-code)
* [Searching commits](https://help.github.com/articles/searching-commits)
* [Searching issues and pull requests](https://help.github.com/articles/searching-issues-and-pull-requests)
* [Searching users](https://help.github.com/articles/searching-users)
* [Searching wikis](https://help.github.com/articles/searching-wikis)
* [Searching in forks](https://help.github.com/articles/searching-in-forks)


您可以使用[搜索](https://github.com/search)页面或[高级搜索](https://github.com/search/advanced)页面搜索GitHub 。

您可以使用`>`，`>=`，`<`，和`<=`搜索是大于，大于或等于，小于和小于或等于另一个值的值。

### 搜索仓库


| Query | Example |
| --- | --- |
| `>_n_` | **[cats stars:>1000](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A%3E1000&type=Repositories)** 匹配关键字"cats"且star大于1000的仓库 |
| `>=_n_` | **[cats topics:>=5](https://github.com/search?utf8=%E2%9C%93&q=cats+topics%3A%3E%3D5&type=Repositories)** 匹配关键字"cats"且标签数量大于等于5的仓库 |
| `<_n_` | **[cats size:<10000](https://github.com/search?utf8=%E2%9C%93&q=cats+size%3A%3C10000&type=Code)** 匹配关键字"cats"且文件小于10KB的仓库 |
| `<=_n_` | **[cats stars:<=50](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A%3C%3D50&type=Repositories)** 匹配关键字"cats"且star小于等于50的仓库 |
| `_n_..*` | **[cats stars:10..*](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A10..*&type=Repositories)** 匹配关键字"cats"且star大于等于10的仓库 |
| `*.._n_` | **[cats stars:*..10](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A%22*..10%22&type=Repositories)** 匹配关键字"cats"且star小于等于10的仓库 |
| _n_.._n_ | **[cats stars:10..50](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A10..50&type=Repositories)** 匹配关键字"cats"且star大于10且小于50的仓库 |


| Query | Example |
| --- | --- |
| `_n_..*` | **[cats stars:10..*](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A10..*&type=Repositories)** 匹配关键字"cats"且star大于等于10的仓库 |
| `*.._n_` | **[cats stars:*..10](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A%22*..10%22&type=Repositories)** 匹配关键字"cats"且star小于等于10的仓库 |
| _n_.._n_ | **[cats stars:10..50](https://github.com/search?utf8=%E2%9C%93&q=cats+stars%3A10..50&type=Repositories)** 匹配关键字"cats"且star大于10且小于50的仓库 |

以下搜索语法与上面差不多，故此不贴表格了。
### 搜索代码

#### 注意事项
* 只能搜索小于384 KB的文件。
* 只能搜索少于500,000个文件的存储库。
* 登录的用户可以搜索所有公共存储库。
* 除`filename`搜索外，搜索源代码时必须至少包含一个搜索词。例如，搜索`language:javascript`无效，而是这样：`amazing language:javascript`。
* 搜索结果最多可以显示来自同一文件的两个片段，但文件中可能会有更多结果。
* 您不能将以下通配符用作搜索查询的一部分：`. , : ; / \ ' " = * ! ? # $ & + ^ | ~ < > ( ) { } [ ]`。搜索将忽略这些符号。

#### 日期条件
`cats pushed:<2012-07-05` 搜索在2012年07月05日前push代码，且cats作为关键字<br />`cats pushed:2016-04-30..2016-07-04` 日期区间<br />`cats created:>=2017-04-01 ` 创建时间

#### 逻辑运算
AND、OR、NOT

#### 排除运算

`cats pushed:<2012-07-05 -language:java` 搜索在2012年07月05日前push代码，且cats作为关键字，排除`java`语言仓库。

#### 包含搜索

`cats in:file` 搜索文件中包含cats的代码<br />`cats in:path` 搜索路径中包含cats的代码<br />`cats in:path,file` 搜索路径、文件中包含cats的代码<br />`console path:app/public language:javascript ` 搜索关键字console，且语言为javascript，在app/public下的代码

#### 主体搜索

`user:USERNAME`_ _用户名搜索<br />`org:``ORGNAME` 组织搜索<br />`repo:USERNAME/REPOSITORY` 指定仓库搜索

#### 文件大小

`size:>1000` 搜索大小大于1KB的文件

#### 文件名称
`filename:config.php language:php` 搜索文件名为config.php，且语言为php的代码

例如搜索Java项目配置文件：`mail filename:.properties`

![image.png](https://cdn.nlark.com/yuque/0/2019/png/258066/1548771143207-436988a2-c654-4e91-a0ab-46c7ced96594.png#align=left&display=inline&height=838&linkTarget=_blank&name=image.png&originHeight=1676&originWidth=2708&size=552282&width=1354)

#### 扩展名

`extension:EXTENSION` 指定扩展名搜索

例如：`extension:``properties jdbc`


**仅供技术研究！**

### 自动化工具

[https://github.com/UnkL4b/GitMiner](https://github.com/UnkL4b/GitMiner)

![image.png](https://cdn.nlark.com/yuque/0/2019/png/258066/1548771561076-d661712c-56cc-4c48-b37b-c7b6bcae6f88.png#align=left&display=inline&height=871&linkTarget=_blank&name=image.png&originHeight=1742&originWidth=1576&size=257832&width=788)

`python3 gitminer-v2.0.py -c cookie.txt -q 'extension:properties jdbc' -r 'password(.*)' -m passwords`

![image.png](https://cdn.nlark.com/yuque/0/2019/png/258066/1548771909677-18c7f6da-b232-47c2-a860-629a8e5c32db.png#align=left&display=inline&height=878&linkTarget=_blank&name=image.png&originHeight=1756&originWidth=3350&size=452529&width=1675)<br />![image.png](https://cdn.nlark.com/yuque/0/2019/png/258066/1548771893576-424c7172-bd59-409b-a89e-9a96778e2b5f.png#align=left&display=inline&height=937&linkTarget=_blank&name=image.png&originHeight=1874&originWidth=2708&size=411022&width=1354)

