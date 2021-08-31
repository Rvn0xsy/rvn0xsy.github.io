---
categories: web安全
date: "2017-10-12T00:00:00Z"
description: PHP代码审计技巧总结
title: PHP代码审计技巧总结
url: /archivers/2017-10-12/1
---
本篇文章简述一下我的个人代码审计方面的技巧 技术不精勿喷 [+] 文章转载请注明出处
<!--more-->
* 目录
{:toc}

## 0x00 与PHP的那些情缘

> 在2016年完成了PHP程序猿的蜕变，成为一个刚刚步入大城市的年轻小伙，面对灯红酒绿的都市——“魔都”，让我对未来越加坚定又迷茫。


早在2013年就自己花钱买了一本《Dreamweaver + PHP 动态网站开发》，名字都有些模糊了，依稀记得封面是粉红色的。
当时打开书后，一脸懵逼，感觉自己的大脑无法接收这些知识，身边的朋友都在享受生活(LOL盛行)，而我对游戏并不是那么感冒，除了 [小霸王]。

### 辍学
16岁的我决定辍学 - 高一 ，觉得自己如果继续待在这个没有希望的学校（由于中考贪玩，失利），未来更加的昏暗无力，尽管现在觉得学校的那些知识真的真的对现在很有用。感叹……

### 起点
辍学后开始走向信息安全的道路，一个小小的梦想就是当上渗透测试工程师，当时也没多少朋友，比较内向，去了一所中专技校，想学个网络工程方面的技能，帮别人公司布线，配置路由器交换机什么的，一个月能拿到5000就满足了，与此同时也在信安领域的大门外面徘徊。

边看渗透教程边找网站实战，经验也上来了，时间久了发现自己的认知度不够，就想学个脚本语言，自学了很久，写了很多工具，然后毕业了。在上技校的这两年，接触了交换机，路由器，以及计算机网络的组成原理，其余的都是被学校带着玩，为了打响品牌效应，也没学到多少。

毕业后我的编程基础算是打扎实了，遇到找工作的问题，身边的同学基本上月薪才2000-3000，谁会给你一个乳臭未干的小孩5000，虽说在班上能力出众，但是对于社会的认知度完全不达标。我就想做程序猿了，当时另外一个兴趣萌芽也被培养出来了，那就是coding 。在安全行业，给我最大帮助的就是编程了。毕业后去了一家php培训机构，为了打下坚实的开发基础，了解互联网上比较成熟的开发技术，就搞了半年，半年后还是由于年龄太小，找不到工作，就找朋友推荐去乙方公司工作，工作期间利用所学到的知识将各大漏洞从头到尾梳理了一遍，从手工到自动化再到简单的代码审计。

## 0x01 开始我的代码审计之路 - 脚本解释器

从漏洞的根源洞察漏洞，无疑是最爽的挖掘漏洞的方式，而PHP这门语言由于它太过于灵活，太好上手了，在某些开发环境中也容易出很多问题，这里我不盘点有哪些问题，但是可以肯定扎实的学习PHP肯定是比JAVA、.NET等强类型语言要难一点点，因为它的灵活不好把握。

首先你可以理解一下脚本解释器于脚本代码之间的关系：

脚本解释器，是一个脚本运行的环境中不可或缺的一部分，我们的每一行脚本代码、每一个字符都将经过它变成其他形态的数据，最终转换为二进制以供计算机理解。

由于现在的科技日新月异，每一门语言也在争先恐后的争夺效率、使用率、安全性而不断的进化，所以你需要选择一个适中的稳定版本来学习。

## 0x02 开始我的代码审计之路 - 你好数据库

```php
<?php
echo "Hello Database";
?>
```

在这里你要具备灵活使用一款数据库的技能，它可以是各种类型的，但是你在使用之前需要学习标准的“结构化查询语言”。

于PHP结合使用的最多的数据库就是MySQL了，没错，它的图标就是一个海豚，目前被Oracle收购了。

MySQL这款数据库非常适合新手使用，数据类型不多，并且能够适用你的各种基本需求（事务、触发器、主从复制……）

目前许多的PHP开源项目大多都基本支持MySQL的结合架构，他们是最流行的 Gay & Gay 组合

## 0x03 开始我的代码审计之路 - 具有一定的数据处理能力

PHP有八大数据类型：布尔值、字符串、整数型、浮点型、对象、资源、数组、NULL.

一个优秀的程序猿能够分析需求、设计数据库、高效率的编码，但是这些前提都要深入的了解该语言内置的数据类型，然后将现实生活中的需求“对象”化，这里的对象化是程序思维，计算机无法直接表达我们的情绪、显示我们的名字、播放你想要的歌曲、打开你想看的视频。

But…… 自然界的万物其实都可以用计算机来表达，为什么呢？ 因为万物都是一个对象，对象的每个属性都可以把它用基本数据类型表示出来，这些基本数据类型组合起来就是每个独立的个体。

人是由各个器官组成的，各个器官我们可以将它当成一个数字、字符串、整数都可以，但是阅读代码的人必须和你要保持同样的认知层面

就好像你下班后走在马路上，看到几个小朋友在过家家，他们有一个游戏规则，谁来当爸爸、谁来当妈妈。 在他们的世界里，他们认为的已经与你所认为的不一样的，这就是为什么计算机里那么多的符号组合、技术的迭代产生了那么多的技术概念 OR 名词。

面对这么多各种类型的数据，你要具备一定的数据处理能力，举一个简单的例子，我的域名是：payloads.online，如果我有一个需求只取得payloads然后保存到数据库中，你该怎么做？

程序猿想到：字符串处理函数！

DBA想到：一条SQL就搞定！

普通人想到：Copy / Paste

如果数据的量大了，第一个歇菜的肯定是普通人，计算机的效率比人高多了~

下面我们根据网站的各种业务来将数据分类，这样你就可以理解为什么需要一定的数据处理能力了 :)

1. 注册功能
2. 注销功能
3. 发表评论功能
4. 回复功能
5. 下载文件功能
6. 上传图片功能

一、注册功能 

我们要根据需求列出服务器端需要接收的数据，假设有用户名、密码、邮箱、手机号等

二、注销功能

根据需要我们要回收令牌资源，保存用户操作以及状态(操作日志、当前用户等级等)。

三、发表评论功能

要判断用户评论的是不是空、是不是恶意代码、回复的哪篇文章

四、回复功能

回复给谁，是否能够无限回复？ 有没有权限限制

五、下载文件功能

下载哪个文件，是否有下载权限

六、上传图片功能

上传的是哪种类型的文件？允许上传多大的？保存在哪里？是谁上传的？

其实面对这些问题，用户肯定都没有思考过，他们只是使用，出了问题就叫“网管”

上述的一些情况中，任何有一个问题没有处理，那肯定就会出现BUG，必须具备一定的数据处理能力才能解决这些问题。

建议：去掌握该语言的数据处理函数[针对字符串操作的、针对布尔值、数组、对象、资源……]函数(Functions)


## 0x04 开始我的代码审计之路 - 快速查阅的能力

在审计的过程中，我一般会准备一个能上网的电脑，它必须满足我使用搜索引擎的需求，除了电脑还要基本函数手册(php.net)。

不仅仅是PHP的哦~ 

* Html
* Javascript
* PHP函数手册
* 基本开源框架的手册
* Jquery

许多函数、关键字我们可能只是在大脑中形成了一个索引，但是不依靠搜索的话，无法取得想要的内容。很多朋友可能都跟我一样吧，脑袋里只有索引，没有东西，非常依赖搜索引擎。

这就类似于你在电脑的文件夹里找你想要的东西，总会触发一些索引的  - 可以自己感受一下。

## 0x05 开始我的代码审计之路 - 断点

所谓的断点就是在程序按照流程执行的过程中，执行完断点代码时就会停止执行。

这种断点我们需要灵活理解一下，敲敲代码：

```php
<?php 
$arr = array(1,2,3,4,5);
var_dump($arr); 
?>

```

上面的代码中并没有断点，而是dump出来了$arr里放的是什么东西，我们的IDE可以下断点，这个后面讲。

```php
<?php
$arr = array(1,2,3,4,5);
var_dump($arr); // print_r()也可以，但是不具备查看变量数据类型的功能
die;  // 终止当前脚本执行 或者用 exit();函数
?>
```


## 0x06 开始我的代码审计之路 - 自定义断点

自定义断点就是可以自行写一个方法(函数)，在源码中的每个函数加一个钩子，每次其他方法执行，都可以调用这个自定义断点；

```php
<?php
function var_dump_and_die($arr,$is_die = false){
	var_dump($arr);
	if($is_die){
		die;
	}
}
?>
```

### 调试输入与输出 - 输出

对于框架站，我们主要寻找输入输出类，用于调试数据。

例如：CI框架的：Input类，我们定义到它获取全局数组的那个方法；

https://github.com/bcit-ci/CodeIgniter/blob/develop/system/core/Input.php

```php
/**
	 * Fetch from array
	 *
	 * Internal method used to retrieve values from global arrays.
	 *
	 * @param	array	&$array		$_GET, $_POST, $_COOKIE, $_SERVER, etc.
	 * @param	mixed	$index		Index for item to be fetched from $array
	 * @param	bool	$xss_clean	Whether to apply XSS filtering
	 * @return	mixed
	 */
	protected function _fetch_from_array(&$array, $index = NULL, $xss_clean = FALSE)
	{
		// If $index is NULL, it means that the whole $array is requested
		isset($index) OR $index = array_keys($array);
		// allow fetching multiple keys at once
		if (is_array($index))
		{
			$output = array();
			foreach ($index as $key)
			{
				$output[$key] = $this->_fetch_from_array($array, $key, $xss_clean);
			}
			return $output;
		}
		if (isset($array[$index]))
		{
			$value = $array[$index];
		}
		elseif (($count = preg_match_all('/(?:^[^\[]+)|\[[^]]*\]/', $index, $matches)) > 1) // Does the index contain array notation
		{
			$value = $array;
			for ($i = 0; $i < $count; $i++)
			{
				$key = trim($matches[0][$i], '[]');
				if ($key === '') // Empty notation will return the value as array
				{
					break;
				}
				if (isset($value[$key]))
				{
					$value = $value[$key];
				}
				else
				{
					return NULL;
				}
			}
		}
		else
		{
			return NULL;
		}
		return ($xss_clean === TRUE)
			? $this->security->xss_clean($value)
			: $value;
	}

```

该方法处理了POST/GET超全局数组，我们可以在这个基础上构建自己的函数，将数据dump在页面上，这样每个调用Input类的数据都将被打印在页面上。

但是这种方法会产生大量的字符串，服务器处理也很慢，不是一种高效的办法。

### 调试输入与输出 - 输入

https://github.com/bcit-ci/CodeIgniter/blob/develop/system/core/CodeIgniter.php

第 481 行：

```php
<?php
/*
 * ------------------------------------------------------
 *  Call the requested method
 * ------------------------------------------------------
 */
	call_user_func_array(array(&$CI, $method), $params); // 去调用$CI中的$method 传入$params参数
?>

```

参考php官网的例子：http://php.net/manual/zh/function.call-user-func-array.php

```php
<?php
function foobar($arg, $arg2) {
    echo __FUNCTION__, " got $arg and $arg2\n";
}
class foo {
    function bar($arg, $arg2) {
        echo __METHOD__, " got $arg and $arg2\n";
    }
}


// Call the foobar() function with 2 arguments
call_user_func_array("foobar", array("one", "two"));

// Call the $foo->bar() method with 2 arguments
$foo = new foo;
call_user_func_array(array($foo, "bar"), array("three", "four"));
?>

/*
输出如下：
foobar got one and two
foo::bar got three and four
*/
```

这里我们可以将$params进行其他操作 :) 也能够构建沙盒、漏洞预警采集什么的。

### 针对某个方法的输入输出调试

```php
<?php
	public function var_dump_and_die($arr,$is_die = false){
			echo '<pre>';
			var_dump($arr);
			echo '</pre>';
			if($is_die){
				die;
			}
		}
	/**
     * 经验值
     */
    public function experience() {

        $this->_experience();

        $uid = (int)$this->input->get('uid');
        print_r($this->input); // 一个调试函数 或者调用自己的调试方法
        $param = array('uid' => $uid, 'type' => 0);
        $this->input->get('search') && $param['search'] = 1;
        list($data, $param) = $this->score_model->limit_page($param, max((int)$this->input->get('page'), 1), (int)$this->input->get('total'));
        $param['uid'] = $uid;
        $_param = $this->input->get('search') ? $this->cache->file->get($this->score_model->cache_file) : $this->input->post('data');
        $_param = $_param ? $param + $_param : $param;
        $this->template->assign(array(
            'list' => $data,
            'name' => SITE_EXPERIENCE,
            'param' => $_param,
            'pages' => $this->get_pagination(dr_url('member/home/experience', $param), $param['total'])
        ));
        $this->template->display('score_index.html');
    }
?>
```

## 0x07 开始我的代码审计之路 - 数据库调试

为什么需要数据库调试？ - 挖掘SQL注入和判断数据库层面是否有保护能力我们都必须知道数据进入数据库以后的形态。

这里需要具备对数据库结构的理解和设计能力，什么样的数据采用什么样的数据类型，分门别类，还有表与表之间的对应关系。

为了保证环境的有效运转，我们依然还是要造一个类似于钩子的轮子，用什么实现呢？

答案就是用日志审计咯~ 

当线上环境开始运转的时候，也就是我们开始分析的时候，开启数据库的日志记录功能，把每条SQL语句都保存到数据库、或文件中用于下一步的自动化分析；

这里说的“将SQL保存到数据库或者文件”中的SQL指的是被脚本过滤后，生成的SQL语句，我们可以自己创建一个表，进行插入。

假设：
```php
<?php
$sql = "INSERT INTO users VALUES('payloads.online','123456','18','倾旋的博客',{$_GET['ID']})";
// echo $sql;
// INSERT INTO users VALUES('payloads.online','123456','18','倾旋的博客',1);
$insertd_sql = str_replace("'","\\'",$sql);
$insert_sql = "INSERT INTO sql_log (method,params,sql)VALUES('register','ID=1',{$inserd_sql})"
// mysql_query(mysql_connect('localhost','root','root',3306),$sql); \\省略
?>
```
如果我们提交?ID=1，那么就会产生一个SQL操作，我们将生成的语句保存到数据库中。

测试之前，再准备一个fuzz的数据列表：

```
<script>
'
%3d
%3D
%a0123
' onerror=x(1)
../../
%' ss
....
```

然后让程序取得SQL lgos自动化匹配这些恶意字符。

## 0x08 开始我的代码审计之路 - 自动化审计？

目前见得最多的就是多线程文件读取进行正则匹配了，它会构建一个风险模型，让你知道哪个文件哪一行调用了某个危险函数，缺点就是不能动态调试。

我挖掘的时候也喜欢这个东西，它虽说不能进行自动化的代码审计，也不是漏洞扫描器，但是可以能快速获取漏洞产生的点，然后人工的逆向跟进:)

上面讲的数据库调试也是属于一些自动化的范畴了，它主要是针对某些经典的漏洞精确查找从而减少我的工作量 ~

这里主要讨论一下未来的代码审计进化方向：

* 肯定是自动化的
* 很少的人工参与
* 语法分析、变量跟进 属于模拟人的动态分析了
* 结果可视化的加强 代码很枯燥，而且文件又多，我们需要这个
* 类似于扫描器的扫描规则、评分标准

## 0x09 开始我的代码审计之路 - 代码审计的未来

代码审计挖掘出来的基本都是通用型漏洞了，取决于它的开源成分。

它还是有很多未来的，因为程序猿的大批涌入，高级代码普通程序猿又写不了，如果程序猿都有一个编码安全标准，估计代码都会比较安全……

这个留下来以后再讨论吧。

下面几篇就是针对这几点我会进行细化，出一些实用性的技巧 :(   还有好多事情没做，先撤了。。