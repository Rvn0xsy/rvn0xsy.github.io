/**
 * 常用小工具集合于一身，为我们的工作带来了福音。
 * 开发工具箱功能项管理
 */
 
if(top.location !== self.location) {
	top.location = self.location;
}

;(function($) {
	
	// 所有功能
	var menu = {
		'menu_one': {
			'urlencode:1':'Url_Encode','urlencode:0':'Url_Decode', 
			'base64encode:1':'Base64_Encode', 'base64encode:0':'Base64_Decode',
			'unicode:0':'Unicode_JS 解码', 'jsonencode:0':'Json_Decode', 
			'beautification:0_all':'通用代码美化', 'compress:1_all':'通用代码压缩',
			'viewsource:1': '读取远程URL内容', 'upperlower:0':'小写 → 大写',
			'md5:1_32': 'MD5加密32_小写','uuid_guid:1': 'UUID / GUID', 
			'md5:2_32': 'MD5加密32_大写', 'timedate:2':'毫秒时间戳 → 日期',
			'rmb:1':'人民币 → 大写', 'compressbeautify|group:0_htmlbeautify': 'HTML 美化',
			'timedate:1':'Unix时间戳 → 日期', 'docntotw:0':'繁体 → 简体',
			'getcolor:1':'颜色选择器', 'qrcode:1': '漂亮二维码',
		},
		'menu_two': {
			'urlencode:1':'Url_Encode', 'urlencode:0':'Url_Decode', 'base64encode:1':'Base64_Encode', 'base64encode:0':'Base64_Decode',
			'escape:1':'Escape', 'escape:0':'UnEscape', 
			'rgbhex:1':'HEX → RGB', 'rgbhex:0':'RGB → HEX',
			'docntotw:1':'简体 → 繁体', 'docntotw:0':'繁体 → 简体',
			'upperlower:1':'大写 → 小写', 'upperlower:0':'小写 → 大写',
			'ascii:1':'字符数字 → ASCII', 'ascii:0':'ASCII → 字符数字',
			'convert:1':'字符串转义', 'convert:0':'去除转义符', 
			'rmb:-1':'人民币 → 大写', 'cntopinyin:1': '汉字 → 拼音'
			},
		'menu_three' : {
				'md5:1_32': 'MD5加密32_小写', 'md5:2_32': 'MD5加密32_大写', 'md5:1_16': 'MD5加密16_小写', 'md5:2_16': 'MD5加密16_大写', 'sha:1_0': 'SHA1', 'sha:2_256': 'SHA2_256', 'sha:2_512':'SHA2_512', 'sha:3_512':'SHA3_512',
				'sha:3_384':'SHA3_384', 'sha:3_256':'SHA3_256', 'sha:3_224':'SHA3_224', 'sha:RIPEMD_160':'RIPEMD_160', 
				'sha:AES_Encrypt':'AES_Encrypt','sha:AES_Decrypt':'AES_Decrypt', 'sha:DES_Encrypt':'DES_Encrypt', 'sha:DES_Decrypt':'DES_Decrypt',
				'sha:TripleDES_Encrypt':'TripleDES_Encrypt', 'sha:TripleDES_Decrypt':'TripleDES_Decrypt', 'sha:Rabbit_Encrypt':'Rabbit_Encrypt',
				'sha:Rabbit_Decrypt':'Rabbit_Decrypt', 'sha:RC4_Encrypt':'RC4_Encrypt', 'sha:RC4_Decrypt':'RC4_Decrypt','crc32:1':'64位 CRC32'
			},
		'menu_four': {
			'hex:1':'十 → 二进制', 'hex:2':'十 → 八进制', 'hex:3':'十 → 十六进制', 'hex:4':'二 → 十进制', 'hex:5':'八 → 十进制', 'hex:6':'十六 → 十进制', 'hex:7':'二 → 八进制', 'hex:8':'八 → 二进制',
			'hex:9':'二 → 十六进制' ,'hex:10':'十六 → 二进制', 'hex:11':'八 → 十六进制', 'hex:12':'十六 → 八进制', 
			'string_octal:1_8':'字符串 → 八进制', 'string_octal:0_8':'八进制 → 字符串', 'string_octal:1_10':'字符串 → 十进制', 'string_octal:0_10':'十进制 → 字符串',
			'string_octal:1_16':'字符串 → 16进制', 'string_octal:0_16':'16进制 → 字符串',
			'string_octal:-1_16':'16进制 → 字符串（老版本兼容）'
		},
		'menu_five': {
			'compress:1_all':'通用代码压缩', 'beautification:0_all':'通用代码美化',
			'compressbeautify|group_0:1_htmlcompress': 'HTML 压缩', 'compressbeautify|group:0_htmlbeautify': 'HTML 美化',
			'compressbeautify|group:1_jsmin': 'JSMin 压缩', 'compressbeautify|group:0_jsbeautify': 'JS 美化',
			'jscompress:1':'JS 压缩加密', 'jscompress:0':'JS eval_解密',
			'compressbeautify|group_0:1_cssreplace': 'CSS 压缩', 'compressbeautify|group:0_css': 'CSS 美化',
			'htmlencode:1':'HTML标记 → 实体', 'htmlencode:0':'实体 → HTML标记', 'jshtml:0':'HTML → JS', 'jshtml:1':'JS → HTML',
			'unicode:1':'Unicode_JS 编码', 'unicode:0':'Unicode_JS 解码', 'chineseutf8:1':'Unicode_Html编码'
		},
		'menu_six': {
			'viewsource:1': '读取远程URL内容', 'jsonencode:0':'Json_Decode', 
			'calconvert:1':'阳历 → 农历', 'calconvert:2':'农历 → 阳历', 'getlength:1':'计算字符长度',
			//'timestamp:1':'时间戳 → 日期', 'timestamp:2':'日期 → 时间戳', 'numupplower:1':'数字大小写对照表', 
			'timedate:1':'Unix时间戳 → 日期', 'timedate:2':'毫秒时间戳 → 日期', 'compressbeautify|group:0_timedate':'日期 → 时间戳', 
			'getcolor:1':'颜色选择器',
			'serialize_json:1': 'Serialize → JSON',
			'removelinenumber:1': '去除行首行号', 'trim:1': 'Trim', 'uuid_guid:1': 'UUID / GUID', 
			'expression:1': '计算表达式',
		},
		'menu_seven':{
			'XSS:1':'XSS',
		}
	}
	
	// 特殊按钮追加样式
	function style(name) {
		var obj = {
			"qrcode":"icon-qrcode",
			"qrcode_reader":"icon-qrcode",
			'http': 'icon-eye-open',
		}
		
		return obj[name] ? "<i class=\""+ obj[name] +"\"></i>" : '';
	}
	
	// 一次性输出菜单
	function response() {
		//if(!val) return false;
		var str_tmp   = ''; // 临时变量
		var int_count = 0;  // 计数器
		var str_split = ''; // 获取参数
		var str_btn   = ''; // btn-group or btn
		var str_btn_style =  storage.get(storage.define['DEFINE_BTN_STYLE_NAME']) || 'btn'; // 按钮样式
		var str_custom_func = ''; // 自定义常用功能
		
		if((str_custom_func = storage.get(storage.define['DEFINE_CUSTOM_FUNCTION'])) && str_custom_func != '{}') {
			menu.menu_one = JSON.parse(str_custom_func);
		}
		
		$.each(menu, function(key, val){
		
			if(!val) return false;
			int_count = 0; str_tmp = str_split = str_btn = '';
			
			$.each(val, function(key1, val1){

				// button 参数以冒号分隔
				str_split = key1.split(":");
				
				if(key1.indexOf('|') !== -1) {
					str_btn = str_split[0].split('|');
					
					// group_0 代表是btn-group, 无下拉菜单
					str_tmp += str_btn[1] !== 'group_0' ? '<div class="btn-group" style="margin-left:0px;"><button type="button" style="min-height:32px;width: '+(str_btn_style=='btn'?'112px;':'103px')+';"' : '<button type="button" ';
					str_tmp += " class=\"build_click "+str_btn_style+"\" name=\""+str_btn[0]+"\"";
					str_tmp += str_split[1] ? " params=\""+str_split[1]+"\"" : '';
					// 设置横向两个按钮之间的间距
					str_tmp += " style=\"width:137px; padding: 0px 0.6px; height:auto; min-height:32px;";
					str_tmp += ((int_count % 2) == 0 ? "margin-right:4px;": '');
					str_tmp += "\">";
					str_tmp +=val1+"</button> ";
					
					// 第二个小按钮
					str_tmp += str_btn[1] !== 'group_0' ? '<button type="button" class="btn dropdown-toggle '+str_btn_style.replace('button ', '')+' options-'+str_split[1]+'" data-toggle="dropdown" style="width:auto;min-height:32px;'+(str_btn_style!='btn'?'height:34px;':'')+((int_count % 2) == 0 ? "margin-right:8px;": '')+'"><span class="caret"></span></button></div>' : '';
				} else {
					str_tmp += "<button class=\"build_click "+str_btn_style+"\" name=\""+str_split[0]+"\"";
					str_tmp += str_split[1] ? " params=\""+str_split[1]+"\"" : '';
					str_tmp += " style=\"width:137px; padding: 0px 0.6px; height:auto; min-height:32px;"
					str_tmp += ((int_count % 2) == 0 ? "margin-right:4px;": '');
					str_tmp += "\">";
					str_tmp += (style(str_split[0])|| '') + " ";
					str_tmp +=val1+"</button> ";
				}
				
				++int_count;
			});
			
			$("#"+key+" .accordion-inner").append(str_tmp);
		});
	}
	
	// 获取全部keys
	function get_keys(obj) {
		var keys = [];
		
		if(!obj) return false;
		for(var val in obj) {
			if(val) keys.push(val);	
		}
		
		return keys;
	}
	
	// 获取全部values	
	function get_values(obj) {
		var values = [];
		
		if(!obj) return false;
		for(var val in obj) {
			if(obj[val]) values.push(obj[val]);	
		}
		
		return values;
	}
	
	// uniq
	Array.prototype.unique = function(){
		var res = [];
		var json = {};
		
		for(var i = 0; i < this.length; i++){
			if(!json[this[i]]){
				res.push(this[i]);
				json[this[i]] = 1;
			}
		}
		
		return res;
	}
	
	// 根据内容搜索click_id
	function find_txt(content) {
		if(!content) return false;
		
		var str_txt = '';
		
		$.each(menu, function(key, val){
			$.each(val, function(key1, val1){
				if($.trim(val1) == $.trim(content)) {
					str_txt = $.trim(key1);
					return false;
				}
			});
			
			if(str_txt) return false;
		});
		
		return str_txt;
	}
	
	function finds(obj, txt) {
		if(!obj || !txt) return false;
		var str_txt = false;
		
		$.each(obj, function(key, val){
			if($.trim(val) == $.trim(txt)) {
				str_txt = $.trim(key);
				return false;
			}
		})
		
		return str_txt;
	}
	
	// 对外部提供函数
	$.menu = {
		'response': function() {
			response();
		},
		'obj_menu': function() {
			var obj = [];
			$.each(menu, function(key, val){
				obj = obj.concat(get_values(val));	
			})
			
			return obj.unique();
		},
		'find_txt': function(content) {
			var str_tmp = find_txt(content);
			if(!str_tmp) return false;
			
			return str_tmp.split(':');
		},
		'get_values': get_values,
		'finds': finds,
		'source': menu
	};
	
}(jQuery));