/**
 * 常用小工具集合于一身，为我们的工作带来了福音。
 * 所有功能代码都未压缩，方便大家进行参考及学习。
 * 有一部分代码来自于互联网，特别感谢默默贡献的朋友们！
 *
 * site: box3.cn E-mail: fanjiapeng@126.com  blog: www.yulonghu.com
 * [注] 非常感谢大家的帮助与反馈，谢谢您的使用。
 */
 
if(top.location !== self.location) {
	top.location = self.location;
}

// 编辑器
var editor  = null;

// 颜色选择器
var mycolor = null;
// 默认视为已扩展程序启动
var EXT_ENVIRONMENT = true;
// 设定域名常量
var DOMAIN = 'http://payloads.online';
// 公用类库
var lib = {
	// 命令行
	'command' : function() {
		
	},
	// 工具栏封装函数
	'tools' : function() {
		//var tools = $('.CodeMirror').position();
		//var tools_width = $('.CodeMirror').width();
		// 上下移动
		//$("#tools").css({'left':tools.left + tools_width - 15, 'top': tools.top}).show();
		// 不能大于CodeMirror高度
		var top = $(document).scrollTop();
		var height = $('.CodeMirror').height();
		if(top > 0) {
			top = (top > height - 390) ? (height - 390): top;
		}
		//$("#tools").stop(true).animate({'marginTop': top}, "fast");
	},
	// 文本框封装函数
	'txtbox': function(height) {
		// new
		var height = $(window).height() - 41/*nav*/ - 40/*body padding-top*/ - 135.8/*copyright*/ - 34.8/*command*/;
		var width = $(window).width() - 320/*menu*/ - 20/*margin-left*/ - 32/*scroll*/;
		if (height < 400) height = 400;
		if (width < 300) width = 500;
		$(".span12").width(width);
		$('.CodeMirror').height(height).css('z-index', 3);
		$(".CodeMirror-gutters").height(height);
		/* 左右分割的状态栏 */
		if ($(window).width() < 1290) {
			$('#ipaddr').css('float', 'left');
			$('#command').height(70);
		} else {
			$('#ipaddr').css('float', 'right');
			$('#command').height(35);
		}
	},
	// 提示信息框
	'popup': function() {
		var tools_width = $(window).width();
		var tools_height = $('.CodeMirror').height();
		$("#alert-msg").css("margin-left", parseInt(tools_width/2)).css("top", parseInt(tools_height/2));
	},
	'txtbox_tools_popup': function(height){
		lib.txtbox(height);
		//lib.tools(height);
		lib.popup(height);
	}
};

var Command = {
	'run': function() {
		//var text = new Array['md5', 'crc32'];
		var search_text = '';
		if(editor.lineCount() != 2) {
			return false;
		}
		
		search_text = editor.getLine(editor.firstLine());
		if(search_text.indexOf("\n") == -1) {
			return false;
		}
	}	
}

$(document).ready(function(){
	// show all
	$('#bar').css('display', '');
	$('#develop_tools').css('display', '');
	$('#loading').remove();
	
	// editor
	typeof($.menu) != "undefined" && $.menu.response();
	editor = CodeMirror.fromTextArea(document.getElementById("output"), {
		//mode: "text/html",
		mode: "javascript",
		styleActiveLine: false,
		lineNumbers: true,
		lineWrapping: true,
		matchBrackets: true,
		autofocus: true,
		extraKeys: {
			"F11": function(cm) {
			  cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			  $('.CodeMirror').css('margin-top', cm.getOption("fullScreen") ? 45 : 0);
			},
			"Esc": function(cm) {
				if(editor.options.fullScreen) {
				  editor.options.extraKeys.F11(editor);
				}
			}
			/*,
			"Enter": function(cm) {
				//Command.run();
				//cm.indentLine('add', '\n');
			}
			*/
		},
		addToHistory: true
	});
	
	editor.setOption("theme", "default");

	editor.on("change", function(c){
		$("#out_size").text(ONE.getlength());
	});
	
	$(".build_click").on('click', function(){	
		var str_params = $(this).attr('params');
		if(!$(this).attr('name')) return false;
		
		try {
			
			ONE[$(this).attr('name')](str_params, $(this));
			//func.dd("POST", DOMAIN + "/developtoolbox/menu.php?menu=" + $.trim($(this).text()));
		} catch(e) {
			PUT.alert($.trim($(this).text()) + ": " + "本次操作失败了!");
		}
	});
	
	// 清空
	$("#output_clear").on('click', function(){PUT.output(''); editor.focus();});
	
	// 全屏
	$('#output_fullscreen').on('click', function(){editor.options.extraKeys.F11(editor);editor.focus();});
	
	// 导航处点击开发工具箱
	$('.container>a').on('click', function(){
		if(editor.options.fullScreen) {
			editor.options.extraKeys.F11(editor);
		} else {
			$('.nav>li:eq(0)').trigger('click');
		}
		
		editor.focus();
		return false;
	});
	
	// sha_key
	$(".on_sha_key").on('click', function(){
		$('#on_sha_key_error').hide();
		var data = ONE.sha($("#output-key").attr('name'), $(this), PUT.input_key());
		if (data.length > 0) {
			PUT.output(data);
			modal.close('myModal-key');
		} else {
			$('#on_sha_key_error').text('-_- 加密或解密失败了! ('+Math.random()+')').show();
		}
	});
	
	// beautification start
	$('.options-0_css').on('click', function() {
		modal.open('myModal-cssbeautify');
	});
	
	$('#cssbeautify-submit').on('click', function() {
		ONE.compressbeautify('0_css');
		modal.close('myModal-cssbeautify');
	});
	// beautification end
	
	// jsmin start
	$('.options-1_jsmin').on('click', function() {
		modal.open('myModal-jsmin');
	});
	
	$('#jsmin-submit').on('click', function() {
		ONE.compressbeautify('1_jsmin');
		modal.close('myModal-jsmin');
	});
	// jsmin end
	
	// jsbeautify start + htmlbeautify start
	$('.options-0_jsbeautify').on('click', function() {
		$('.jsbeautify-submit').attr('data', 'jsbeautify');
		modal.open('myModal-jsbeautify');
	});
	
	$('.options-0_htmlbeautify').on('click', function() {
		$('.jsbeautify-submit').attr('data', 'htmlbeautify');
		modal.open('myModal-jsbeautify');
	});
	
	$('.jsbeautify-submit').on('click', function() {
		ONE.compressbeautify('0_'+ $(this).attr('data'));
		modal.close('myModal-jsbeautify');
	});
	// jsbeautify end + htmlbeautify end
	
	// timedata start 后期再优化、封装下
	$('.options-0_timedate').on('click', function() {
		modal.open('myModal-timedate');
	});
	
	$('#timedate-submit').on('click', function() {
		ONE.timedate(3);
		modal.close('myModal-timedate');
	});
	// timedata end
	
	lib.txtbox_tools_popup();
});

var ONE = {
	// 菜单
	'menu' : function() {
		$(".menu").on('click', function(){
			var _self = $(this);
			_self.addClass("active").siblings(".menu").removeClass("active");
			$(".accordion").hide();
			$("#" + _self.attr('name')).show();
			lib.txtbox_tools_popup();		
			editor.focus();
		});
	},
	// must 必须检测文本框内容是否为空
	'init':  function(must) {
		if(must && PUT.input().length < 1) {
			PUT.alert("请在文本框里填写内容。");
			editor.focus();
			return false;
		}
		
		return true;
	},
	
	//<!--常用功能 - 默认设置 开始-->
	'timestamp' : function(type) {
		if(!ONE.init()) return false;
		if(type == 1) {
			PUT.output(ONE.timestamp_assist(PUT.input()));
		} else {
			if(PUT.input()) {
				var str_tmp = PUT.input().replace(/年|月|:|时|分|日|\s+/g, '-').replace(/上午|下午|秒/g, ' ').replace(/\//g, '-');
				var str_new_tmp = str_tmp.split('-');
				if(!str_new_tmp[3] || typeof str_new_tmp[3] == "undefind") {
					str_new_tmp[3] = -8; str_new_tmp[4] = '00'; str_new_tmp[5] = '00';
				} else {
					str_new_tmp[3] = parseInt(str_new_tmp[3] - 8);
				}
				var t = new Date(Date.UTC(parseInt(str_new_tmp[0]), parseInt(str_new_tmp[1] - 1), parseInt(str_new_tmp[2]), parseInt(str_new_tmp[3]||0), parseInt(str_new_tmp[4]||0), parseInt(str_new_tmp[5]||0)));
				PUT.output(t.getTime() / 1000);
			} else {
				PUT.output(Date.parse(new Date()) / 1000);
			}
		}
	},
	'timestamp_assist' : function(source, force) {
		var str_tmp = '', t = '';
		var str_split = source.toString().split("\n");
		for(var i in str_split) {
			if(typeof str_split[i] == 'function') continue;
			// 判断是否值合法
			if(!isNaN(str_split[i])) {
				t = str_split[i] ? new Date(parseInt(str_split[i]) * (str_split[i].length == 13 ? 1 : 1000)) : new Date();
				str_tmp += t.getFullYear() + "年" + (t.getMonth() + 1) + "月" + t.getDate() + "日" + (!force ? (t.getHours() + "时" + t.getMinutes() + "分" + t.getSeconds() + "秒"): '');
			} else {
				// 归还原值
				str_tmp += str_split[i];
			}
			
			str_tmp += "\n";
		}
		
		return str_tmp;
	},
	'looks_like_html' : function(source) {
		var trimed = source.replace(/^[ \t\n\r]+/, '');
		var mark = '<' + '!-' + '-';
		return (trimed && (trimed.substring(0, 1) === '<' && trimed.substring(0, 4) !== mark));
     },
	'compress' : function(type) {
		if(!ONE.init(true)) return false;
		ONE.compressbeautify(ONE.looks_like_html(PUT.input()) ? '1_htmlcompress' : '1_jsmin');
	},
	'beautification' : function(type) {
		if(!ONE.init(true)) return false;
		ONE.compressbeautify(ONE.looks_like_html(PUT.input()) ? '0_htmlbeautify' : '0_jsbeautify');
	},
	'compressbeautify' : function(type, str) {

		// 临时性排除日期转时间戳
		if($.trim(type)!="0_timedate" && !ONE.init(true)) return false;
		
		var str_tmp = (typeof str!="undefined" && str == 'outside' ? str : PUT.input()).replace(/^\s+/, '');
		
		var str_split = type.split('_');
		switch(parseInt(str_split[0])) {
			case 1:
				var str_tmp = PUT.input();
				switch(str_split[1]) {
					case 'jsmin':
						str_tmp = jsmin('', str_tmp.replace(/\<\!\-\-(.|\n)*?\-\-\>/g,''), parseInt($('#myModal-jsmin').find('input[name=jsmin-level]:checked').val()||2));
					break;
					case 'cssreplace':
						str_tmp = str_tmp.replace(/\/\*(.|\n)*?\*\//g, "").replace(/\<\!\-\-(.|\n)*?\-\-\>/g,'');
						str_tmp = str_tmp.replace(/\s*([\{\}\:\;\,])\s*/g, "$1").replace(/\,[\s\.\#\d]*\{/g, "{");
						str_tmp = str_tmp.replace(/;\s*;/g, ";");
					break;
					case 'htmlcompress':
						str_tmp = str_tmp.replace(/\n+/g, '').replace(/[\s]+/g, ' ');
						str_tmp = str_tmp.replace(/\<\!\-\-(.|\n)*?\-\-\>/g, '').replace(/\s+</g, '<');
					break;
				}
				
				PUT.output(str_tmp);
			break;
			default:
				switch(str_split[1]) {
					case 'css':
						var options = {
							indent_size: '    '
						};
						
						var modal_id = $('#myModal-cssbeautify');
						if(modal_id.find('input[name=cssbeautify-space]:checked').val() == "2") {
							options.indent = '  ';
						} else if(modal_id.find('input[name=cssbeautify-space]:checked').val() == "tab") {
							options.indent = '\t';
						}
						
						if (modal_id.find('input[name=cssbeautify-brackets]:checked').val() == "separate-line") {
							options.openbrace = 'separate-line';
						}
						
						if (modal_id.find('input[name=cssbeautify-auto]:checked').val() == "1") {
							options.autosemicolon = true;
						}
						
						PUT.output(cssbeautify(modal_id.find('input[name=cssbeautify-note]:checked').val() == "1" ? PUT.input().replace(/\/\*(.|\n)*?\*\//g,'').replace(/\<\!\-\-(.|\n)*?\-\-\>/g,''): PUT.input(), options));
					break;
					
					case 'jsbeautify':
					case 'htmlbeautify':
						var options = {
							indent_size: '    '
						};
						
						var modal_id = $('#myModal-jsbeautify');
						options.indent_size = parseInt(modal_id.find('input[name=jsbeautify-space]:checked').val());
						options.indent_char = options.indent_size == 1 ? '\t' : ' ';
						options.max_preserve_newlines = parseInt(modal_id.find('input[name=jsbeautify-newline]:checked').val());
						options.preserve_newlines = options.max_preserve_newlines !== -1;
						options.wrap_line_length = parseInt(modal_id.find('input[name=jsbeautify-wrap]:checked').val());
						options.brace_style = modal_id.find('input[name=jsbeautify-bracestyle]:checked').val();
						if (modal_id.find('input[name=jsbeautify-unescape-strings]:checked').val() == "1") {
							options.unescape_strings = 1;
						}
						if (modal_id.find('input[name=jsbeautify-space-before-conditional]:checked').val() == "1") {
							options.space_before_conditional = 1;
						}
						
						var str_tmp = PUT.input();
						
						if (modal_id.find('input[name=jsbeautify-note]:checked').val() == "1") {
							if(str_split[1] == "jsbeautify") str_tmp = str_tmp.replace(/\/\*(.|\n)*?\*\//g,'').replace(/\/\/(.|\n)*?(\n)/g, '\n');
							str_tmp = str_tmp.replace(/\<\!\-\-(.|\n)*?\-\-\>/g,'');
						}
						// remove [keep_array_indentation、break_chained_methods、indent_scripts、space_after_anon_function]
						PUT.output(str_split[1] == 'htmlbeautify'? html_beautify(str_tmp, options) : js_beautify(str_tmp, options));
					break;
					case 'timedate':
						return ONE.timedate(3);
					break;
				}
			break;
		}
	},
	'getcolor' : function(type, _self) {
		if(!ONE.init()) return false;
		
		if(!mycolor) {
			_self.bind("change",function(){
				this.value && PUT.output(this.value);
				this.value && $(this).css('background-image', 'linear-gradient(to bottom,#fff,'+(this.value)+')')||$(this).css('background-image', '');
			});
			
			mycolor = _self.cxColor({color:"#e6e6e6"});
		}
		
		mycolor.show();
		$('.cxcolor>table>tbody>tr>td').bind('mouseout', function(){
			var color_val = $(this).attr('title');
			color_val && PUT.output(color_val);
			_self.css('background-image', 'linear-gradient(to bottom,#fff,'+color_val+')')||$(this).css('background-image', '');
		});
	},
	'alltostring': function() {
		if(!ONE.init()) return false;
		var val=PUT.input(),
		rel=(new Function("return '"+val.replace(/'/g,"\\'").replace(/\\\\'/g,"\\'").replace(/\n|\r/g,'<br>')+"'"))();
		PUT.ouput(rel);
	},
	'cntopinyin': function() {
		if(!ONE.init(true)) return false;
		func.post_new("POST", DOMAIN + '/developtoolbox/pinyin.php', PUT.input());
	},
	'serialize_json': function(){
		if(!ONE.init(true)) return false;
		func.post_new("POST", DOMAIN + '/developtoolbox/serialize_json.php', PUT.input());
	},
	'timedate': function(type) {
		var source = PUT.input();
		var str_tmp = '', result = '', t = '';
		var str_split = source.toString().split("\n");
		
		if(type > 2) {
			var zone = new Date().getTimezoneOffset() / 60;
			for(var i in str_split) {
				// 跳过unique
				if(typeof str_split[i] == 'function') continue;
				if(str_split[i].length < 4) {
					str_tmp += str_split[i] + "\n";
					continue;	
				}
				t = str_split[i].match(/([\d]{0,4})[/年-]([\d]{0,2})[/月-]([\d]{0,2})[/日-]?[\s]?([\d]{0,3})?[时:]?([\d]{0,2})?[分:]?([\d]{0,2})?[秒:]?([\d+]{0,3})?/);
				// 未匹配到正确结果
				if(t) {
					result = new Date(Date.UTC(parseInt(t[1]), parseInt(t[2] - 1), parseInt(t[3]), parseInt(t[4]||0) + zone, parseInt(t[5]||0), parseInt(t[6]||0), parseInt(t[7]||0)));
					// 弹窗选项
					str_tmp += (t[7] || $('#myModal-timedate input:checked').val() == 2)  ? result.getTime() : result.getTime() / 1000;
				} else {
					str_tmp += str_split[i];
				}
				str_tmp += "\n";
			}
			
			// 默认值
			if(!$.trim(str_tmp)) {
				str_tmp = new Date().getTime();
				str_tmp = Math.floor(str_tmp / 1000) + "\n" + str_tmp;
			}
		} else {
			if(!ONE.init(true)) return false;
			for(var i in str_split) {
				// 跳过unique
				if(typeof str_split[i] == 'function') continue;
				// 判断是否值合法
				if(str_split[i].length > 1 && $.trim(str_split[i]) && !isNaN(str_split[i])) {
					// 10位时间戳，用毫秒时间戳功能转换时，自动补全000
					t = str_split[i] ? new Date(parseInt(str_split[i]) * (type == 1 ? 1000 : (str_split[i].length == 10 ? 1000 : 1))) : new Date();
					str_tmp += t.getFullYear() + "年" + (t.getMonth() + 1) + "月" + t.getDate() + "日" + t.getHours() + "时" + t.getMinutes() + "分" + t.getSeconds() + "秒";
					type == 2 && (str_tmp += t.getMilliseconds() + "毫秒");
				} else {
					// 归还原值
					str_tmp += str_split[i];
				}
				str_tmp += "\n";
			}
		}
		
		PUT.output(str_tmp);
	},
	//<!--常用功能 - 默认设置 结束-->
	
	//<!--编码转换 开始--!>
	'urlencode' : function(type, charset) {
		if(!ONE.init(true)) return false;
		
		var method = 'urlencode';
		if (type == 0) {
			method = 'urldecode';
			//decodeURIComponent
			PUT.output(decodeURIComponent(PUT.input()));
		}else{
			PUT.output(encodeURIComponent(PUT.input()));
		}
	},
	'base64encode': function(type) {
		if(!ONE.init(true)) return false;
		$.base64.utf8encode = true;
		
		PUT.output(type == 1 ? $.base64.btoa(PUT.input()) : $.base64.atob(PUT.input(), true));
	},
	'escape': function(type, charset) {
		if(!ONE.init(true)) return false;
		PUT.output(type == 1 ? escape(PUT.input()) : unescape(PUT.input()));
	},
	'docntotw' : function(type) {
		if(!ONE.init(true)) return false;
		PUT.output(type == 1 ? PUT.input().s2t() : PUT.input().t2s());		
	},
	'upperlower' : function(type) {
		if(!ONE.init(true)) return false;
		PUT.output(type == 1 ? PUT.input().toLowerCase() : PUT.input().toUpperCase());	
	},
	'ascii' : function(type) {
		if(!ONE.init(true)) return false;
		var str_tmp = '', str_mod = '', arr_data = '', str_len = '';
		if(type < 1) {
			arr_data = PUT.input().split(' ');
			if(!arr_data) return;
			str_len = arr_data.length;
			for(var i = 0; i < str_len; i++){
				str_tmp += str_mod + String.fromCharCode(arr_data[i]);
				str_mod = ' ';
			}
		} else {
			str_len = PUT.input().length;
			for(var i = 0; i < str_len; i++){
				str_tmp += str_mod + PUT.input().charCodeAt(i);
				str_mod = ' ';
			}
		}
		PUT.output(str_tmp.replace(/\s+/g, ' '));
		str_tmp = str_mod = '';
	},
	'htmlencode' : function(type) {
		if(!ONE.init(true)) return false;
		var str_tmp = (type == 1) ? htmlentities.encode(PUT.input()) : htmlentities.decode(PUT.input());
		PUT.output(str_tmp);
	},
	'unicode' : function(type) {
		if(!ONE.init(true)) return false;
		if(type > 0) {
			PUT.output(PUT.input().replace(/[^\u0000-\u00FF]/g, function($0){return escape($0).replace(/(%u)(\w{4})/gi,'\\u$2').toLowerCase()}));
		} else {
			PUT.output(unescape(PUT.input().replace(/\\/g, "%")));
		}
		//PUT.output(type == 1 ? $.unicode.decToHex(PUT.input()) : $.unicode.hexToDec(PUT.input()));
	},
	'rmb' : function() {
		if(!ONE.init(true)) return false;
		var str_tmp = convertCurrency(PUT.input());
		str_tmp && PUT.output(str_tmp);
	},
	'jsonencode' : function(type) {
		if(!ONE.init(true)) return false;
		if(type == 1) {
			//var json_secure = $.secureEvalJSON(PUT.input());
			PUT.output($.toJSON(PUT.input()));
		} else {
			try {
				var json_secure = JSON.stringify(JSON.parse(PUT.input()));
				if(json_secure) {
					var options = {
						indent_size: 4,
						unescape_strings: 1,
						indent_char: ' '
					};
					PUT.output(js_beautify(json_secure, options));
				}
			} catch(e) {
				PUT.alert('不是合法的JSON格式数据。');
			}
		}
	},
	'jshtml': function(type) {
		if(ONE.init(true)) {
			if(type == 0) {
				PUT.output("document.writeln(\""+PUT.input().replace(/\'/g,"\\\'").replace(/\"/g,"\\\"").split('\n').join("\");\ndocument.writeln(\"")+"\");");
			}else{
				PUT.output(PUT.input().replace(/document.writeln\("/g,"").replace(/"\);/g,"").replace(/\\\"/g,"\"").replace(/\\\'/g,"\'"));
			}
		}	
	},
	'convert' : function(type) {
		if(ONE.init(true)) {
			if(type == 1) {
				PUT.output(PUT.input().replace(/\\/g,"\\\\").replace(/\"/g,"\\\""));
			}else{
				PUT.output(PUT.input().replace(/\\\\/g,"\\").replace(/\\\"/g,'\"'));
			}
		}	
	},
	'rgbhex' : function(type) {
		if(ONE.init(true)) PUT.output($.rgbHex(PUT.input()));
	},
	'chineseutf8': function(type) {
		if(!ONE.init(true)) return false;
		if(type > 0) {
			PUT.output(PUT.input().replace(/[^\u0000-\u00FF]/g, function($0){return escape($0).replace(/(%u)(\w{4})/gi,'&#x$2;')}));
		} else {
			PUT.output(unescape(PUT.input().replace(/&#x/g,'%u').replace(/\\u/g,'%u').replace(/;/g,'')));
		}
	},
	//<!--编码转换 结束--!>	
	
	//<!--加密解密 开始--!>	
	'md5' : function(type) {
		if(!ONE.init(true)) return false;
		var str_split = type.split('_');
		var md5_len = parseInt(str_split[1] || 32);
		var str_tmp = $.md5(PUT.input(), md5_len);
		PUT.output(str_split[0] == 1 ? str_tmp.toLowerCase() : str_tmp.toUpperCase());
	},
	'sha': function(name, _self, key) {
		if(!ONE.init(true)) return false;
		var str_txt = '';
		$('#on_sha_key_error').hide();
		
		try {
			switch(name) {
				case '1_0':
					str_txt = CryptoJS.SHA1(PUT.input());
				break;
				case '2_256':
					str_txt = CryptoJS.SHA256(PUT.input());
				break;
				case '2_512':
					str_txt = CryptoJS.SHA512(PUT.input());
				break;
				case '3_512':
					str_txt = CryptoJS.SHA3(PUT.input());
				break;
				case '3_384':
					str_txt = CryptoJS.SHA3(PUT.input(), { outputLength: 384 });
				break;
				case '3_256':
					str_txt = CryptoJS.SHA3(PUT.input(), { outputLength: 256 });
				break;
				case '3_224':
					str_txt = CryptoJS.SHA3(PUT.input(), { outputLength: 224 });
				break;
				case 'RIPEMD_160':
					str_txt = CryptoJS.RIPEMD160(PUT.input());
				break;
				case 'AES_Encrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.AES.encrypt(PUT.input(), PUT.input_key());
					}
				break;
				case 'AES_Decrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.AES.decrypt(PUT.input(), PUT.input_key());
						if(str_txt) str_txt = str_txt.toString(CryptoJS.enc.Utf8);
					}
				break;
				case 'DES_Encrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.DES.encrypt(PUT.input(), PUT.input_key());
					}
				break;
				case 'DES_Decrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.DES.decrypt(PUT.input(), PUT.input_key());
						if(str_txt) str_txt = str_txt.toString(CryptoJS.enc.Utf8);
					}
				break;
				case 'TripleDES_Encrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.TripleDES.encrypt(PUT.input(), PUT.input_key());
					}
				break;
				case 'TripleDES_Decrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.TripleDES.decrypt(PUT.input(), PUT.input_key());
						if(str_txt) str_txt = str_txt.toString(CryptoJS.enc.Utf8);
					}
				break;
				case 'Rabbit_Encrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.Rabbit.encrypt(PUT.input(), PUT.input_key());
					}
				break;
				case 'Rabbit_Decrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.Rabbit.decrypt(PUT.input(), PUT.input_key());
						if(str_txt) str_txt = str_txt.toString(CryptoJS.enc.Utf8);
					}
				break;
				case 'RC4_Encrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.RC4.encrypt(PUT.input(), PUT.input_key());
					}
				break;
				case 'RC4_Decrypt':
					if(typeof key == "undefined") {
						modal.open('myModal-key', name);
						return false;
					} else {
						str_txt = CryptoJS.RC4.decrypt(PUT.input(), PUT.input_key());
						if(str_txt) str_txt = str_txt.toString(CryptoJS.enc.Utf8);
					}
				break;
			}
		} catch(e) {
			str_txt = '';
		}
		
		// 带model key区分处理 2015-06-28
		if ($('#myModal-key').css('display') == 'block') {
			return str_txt.toString();
		} else {
			PUT.output(str_txt);
		}
	},
	//<!--加密解密 结束--!>	
	
	//<!--进制转换 开始--!>	
	'hex' : function(type) {
		if(!ONE.init(true)) return false;
		var str_tmp = '';
		var put_data = $.trim(PUT.input());

		switch(parseInt(type))
		{
			case(1):str_tmp = parseInt(put_data).toString(2);break;
			case(2):str_tmp = parseInt(put_data).toString(8);break;
			case(3):str_tmp = parseInt(put_data).toString(16);break;
			case(4):str_tmp = parseInt(put_data, 2);break;
			case(5):str_tmp = parseInt(put_data, 8);break;
			case(6):str_tmp = parseInt(put_data, 16);break;
			case(7):str_tmp = parseInt(put_data, 2).toString(8);break; 
			case(8):str_tmp = parseInt(put_data, 8).toString(2);break; 
			case(9):str_tmp = parseInt(put_data, 2).toString(16);break; 
			case(10):str_tmp = parseInt(put_data, 16).toString(2);break; 
			case(11):str_tmp = parseInt(put_data, 8).toString(16);break; 
			case(12):str_tmp = parseInt(put_data, 16).toString(8);break;
			default:str_tmp = parseInt(put_data).toString(2);break;
		}
		
		PUT.output((!str_tmp || str_tmp == 'NaN') ? '' : (isNaN(str_tmp) ? str_tmp.toUpperCase() : str_tmp));
		put_data = '';
	},
	'string_octal' : function(type) {
		if(!ONE.init(true)) return false;
		var arr_tmp = new Array();
		
		var str_split = type.split('_');
		if(typeof str_split[0] == 'undefined') str_split[0] = 1;
		if(typeof str_split[1] == 'undefined') str_split[1] = 16;
		
		var temp = (str_split[1] == 8||str_split[0]==-1) ? "\\" : ((str_split[1] == 10) ? "," : ((str_split[1] == 16) ? "\\x" : " "));

		if(str_split[0] == 1) {
			for (var i = 0; i < PUT.input().length; i++) {
				arr_tmp += temp + PUT.input().charCodeAt(i).toString(str_split[1]);
			}
		} else {
			arr_tmp = $.unicode.hexToDec(PUT.input()).replace(str_split[1]==10?(/\,[\w]+/ig):(/\\[\w]+/ig), function(a){a=a.replace(temp, '');return String.fromCharCode(parseInt(a, str_split[1]));});
		}
		PUT.output(arr_tmp);
		arr_tmp = temp = null;
	},
	//<!--进制转换 结束--!>
	
	//<!--综合归类 开始--!>
	'viewsource' : function() {
		if(!ONE.init(true)) return false;
		if(PUT.input().substring(0, 7) != "http://" && PUT.input().substring(0, 8) != "https://") {
			PUT.output("http://" + PUT.input());
		}
		$.ajax({
		  url: EXT_ENVIRONMENT ? PUT.input() : DOMAIN + '/developtoolbox/ajax.php?url=' + PUT.input(),
		  cache: false,
		  timeout: 15000,
		  dataType: "html",
		  success: function(html){
			  PUT.output(html);
		  },
		  error: function (XMLHttpRequest, textStatus, errorThrown) {
			  PUT.alert("获取内容失败了。");
		  }
		});
	},
	'calconvert' : function(type){
		if(type == 1) {
			if(PUT.input().length < 1) ONE.timestamp(1);
			$.calendar_convert(0);
		} else {
			PUT.input().length < 1 ? ONE.timestamp(1) : $.calendar_convert(1);
		}
	},
	'getlength' : function(type) {
		if(!type) {
			return PUT.input().utf8_size();
		} else {
			PUT.output(PUT.input().utf8_size());
		}
	},
	'numupplower': function(){
		PUT.output("1　2　3　4　5　6　7　8　9　10　100　1000\r\n一 二 三 四 五 六 七 八 九 十　百\t千 \r\n壹 贰 叁 肆 伍 陆 柒 捌 玖 拾　佰\t仟");	
	},
	'qrcode' : function() {
		var url = '/page/qrcode.html', tmp = PUT.input();
		if(tmp.length > 0)
		{
			url += '?url=' + encodeURIComponent(tmp);
		}
		func.openurl(url);
	},
	'removelinenumber': function(){
		if(!ONE.init(true)) return false;
		var txt = PUT.input().split("\n");
		var tmp = '';
		for(var i in txt) {
			if(typeof txt[i] == 'function') continue;
			tmp += $.trim(txt[i].replace(/^[\d]+[\.|\,|\。|\:|\：]?[\s+]?/, '')) + "\n";
		}
		
		PUT.output(tmp);
	},
	'trim': function() {
		if(!ONE.init(true)) return false;
		var txt = PUT.input().split("\n");
		var tmp = '';
		for(var i in txt) {
			if(typeof txt[i] == 'function') continue;
			tmp += $.trim(txt[i]) + "\n";
		}
		
		PUT.output(tmp);
	},
	'uuid_guid': function() {
		var createUuid = (function (uuidRegEx, uuidReplacer) {
			return function () {
				return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
			};
		})(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == "x" ? r : (r & 3 | 8);
			return v.toString(16);
		});
		var data = PUT.input();
		PUT.output(createUuid() + "\n" + data);
	},
	'expression': function() {
		try{
			PUT.output(eval(PUT.input()));
		} catch(e) {
			PUT.output(e);
		}
	},
	'crc32': function() {
		PUT.output($.crc32(PUT.input()));
	},
	'jscompress': function(type){
		if(type > 0) {
			PUT.output($.jscompress(PUT.input(), 0));
		} else {
			PUT.output(eval(PUT.input().replace('eval', '').replace('EVAL', '')));
			ONE.beautification();
		}
	},
	'XSS': function(type){
		if(type > 0) {
			PUT.output("<script>alert(1);</script>");
		} else {
			PUT.output(eval(PUT.input().replace('eval', '').replace('EVAL', '')));
			ONE.beautification();
		}
	},
	// <!--综合归类 结束--!>
	
	// <!--信息栏 开始-->
	'cloudcenter': function() {
		/*
		$.ajax({
		  url: DOMAIN + "/developtoolbox/online.php?dev=2.3.0.0" + (EXT_ENVIRONMENT ? '' : '&src=web'),
		  cache: false,
		  timeout: 5000,
		  dataType: "json",
		  success: function(data){
			if(data.updateurl) {
				$("#ipaddr>code").html('<a href='+DOMAIN+'/download/'+encodeURIComponent(data.updateurl)+' target="_blank" style="color:#d14;">亲，请升级更新哟！开发工具箱最新版本：'+encodeURIComponent(data.updatever)+'</a>');
			} else {
				var arr_t = ['天', '一', '二', '三', '四', '五', '六'];
				var str_tmp = "您的IP：" +data.ip+ " / ";
				var t = new Date(parseInt(data.timestamp) * 1000);
				str_tmp += "星期"+arr_t[t.getDay()] + " ";
				str_tmp += $.calendar.response(t)+" / ";
				str_tmp += parseInt(data.online) + "人在线 / ";
				
				$("#ipaddr>span").text(str_tmp);
				$('#mj').text(data.msg.substring(0, 210));
				delete str_tmp;
			}

		  },
		  error: function (XMLHttpRequest, textStatus, errorThrown) {
			  $("#ipaddr>span").text('亲，无法连接到官方云中心。');
		  }
		});*/
	}
	// <!--信息栏 结束-->
}

$(function(){
	// SKIN
	ONE.menu();
	var border_color = storage.get(storage.define['DEFINE_BORDER_COLOR']) || '#DDD';
	var other_color  = storage.get(storage.define['DEFINE_BTN_STYLE_NAME']) || 'btn';
	$('#tools button,#tools a').removeClass().addClass('button-circle ' + other_color);
	$('#command button').removeClass().addClass(other_color);
	// 设置命令行按钮非经典模式下样式
	if(other_color != 'btn') {
		$('#command button').css({'height':'30px', 'line-height':'30px'});
	}
	$('.CodeMirror').css('border-color', border_color);
	$('#command').css('border-color', border_color);
	$('.accordion-group').css('border-color', border_color);
	$('.accordion-inner').css('border-top-color', border_color);
	
	$('#mj').css('color', border_color=='#DDD'?'#5a5a5a':border_color);
	$('#ipaddr>code').css('color', border_color=='#DDD'?'#868383':border_color);
	delete border_color, other_color;
	
	// 撤销功能
	$("#tools_undo").bind("click", function(){
		var history = editor.historySize();
		if(history.undo > 0) editor.undo(); editor.focus();
	});
	// 重做
	$("#tools_redo").bind("click", function(){
		var history = editor.historySize();
		if(history.redo > 0) editor.redo(); editor.focus();
	});
	
	// 浏览器信息、tools链接
	//$("#useragent").text(navigator.userAgent ? navigator.userAgent : '未知浏览器');
	$('#tools button').each(function(i, data) {
		var tmp = $(this).attr('data') || '';
		if(tmp) {
			$(this).bind('click', function(){
				func.openurl(tmp);
			});
		}
	});
	
	// 复制到开发工具箱
	try{
		chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
			PUT.selection_text();
		});
	} catch(e){
		// 显示备案号
		$('#beian').show();
		// 显示下载按钮
		$('#tools>p:eq(6)>button').show();
		// 更换导航链接到首页
		$('#nav-href').attr('href', 'index.html');
		EXT_ENVIRONMENT = false;
	}
	PUT.selection_text();
	
	// 模糊搜索
	try
	{
		$('#typeahead').typeahead({'items': 8,'source': $.menu.obj_menu()});
	}
	catch(e)
	{}
	
	$("#command_do").on('click', function(){
		if(!ONE.init(true)) return false;
		
		if(!$("#typeahead").val()) PUT.alert("命令行不能为空。");
		var click_id = $.menu.find_txt($("#typeahead").val());
		if(!click_id) {
			PUT.alert();
		} else {
			$($("button[name="+click_id[0]+"][params="+click_id[1]+"]")[0]).trigger("click");
		}
		return false;
	});
	
	$("form").submit(function(){
		return false;
	});

	$("#typeahead").on('keydown', function(e){
		if(e.keyCode == 13 || e.keyCode == 9) {
			setTimeout(function(){
				$("#command_do").trigger("click");
			}, 100);
		}
	});
	
	// alert弹出手动关闭
	$('#alert-close,#alert-msg').on('click', function(){
		if(timeout) window.clearTimeout(timeout);
		$("#alert-msg").removeClass("in").hide();
	});
	
	// 每隔3分钟重新连接一次云中心
	ONE.cloudcenter();
	window.setInterval(function(){
		ONE.cloudcenter();
	}, 180000);
	
	// mj显示
	window.setTimeout(function(){
		$('table').fadeIn('fast');
	}, 1000);
	
	// 短链 ----start
	var id = $.getUrlVar('id'), shareid = $.getUrlShareId();
	if(id || shareid)
	{
		func.post_new('get', DOMAIN + '/developtoolbox/short_url.php?method=view', 'id=' + (id ? id : shareid));
	}
	
	$("#short_url").on('click', function(){
		/*
		if(!ONE.init(true)) return false;
		var data = PUT.input();
		if(data)
		{
			func.post_new('post', DOMAIN + '/developtoolbox/short_url.php?method=add', data, '', function(data){
				modal.open('myModal-shorturl');
				$('#short_url_txt').text(data['data']);
			});
		}
		*/
	});
	// 短链 ----end
});

$(window).resize(function() {
	lib.txtbox_tools_popup();
}).scroll(function() {
	//lib.tools();
});
