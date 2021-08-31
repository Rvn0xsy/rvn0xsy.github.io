/**
 * 开发工具箱类库封装
 *
 * 开发者：范家鹏  E-mail：fanjiapeng@126.com  博客：www.yulonghu.com
 * 上次更新时间：2016-11-20
 */

// Alert弹窗
var timeout = null;
var globals = {
	'url': 'http://payloads.online'
}
 
// localStorage封装
var storage = {
	'define': {
		'DEFINE_BTN_STYLE_NAME': 'btn-style',
		'DEFINE_CUSTOM_FUNCTION': 'custom-func',
		'DEFINE_BORDER_COLOR': 'border-color'
	},
	"init" :  function() {
		return window.localStorage ? true : false;
	},
	"get" : function(key) {
		if(!this.init()) {
			return key ? $.trim(cookie.get(storage.pre(key))) : '';
		}
		return key ? $.trim(window.localStorage.getItem(storage.pre(key))) : '';
	},
	"set" : function(key, val) {
		if(!this.init()) {
			return key ? $.trim(cookie.set(storage.pre(key), $.trim(val))) : '';
		}
		return (key && val) ? window.localStorage.setItem(storage.pre(key), $.trim(val)) : '';
	},
	"del" : function(key) {
		if(!this.init()) {
			return key ? cookie.del(storage.pre(key)) : '';
		}
		if(key) $.trim(window.localStorage.removeItem(storage.pre(key)));		
	},
	"pre" : function(key) {
		return typeof key != "undefind" ? 'developtoolbox_' + key : '';
	}
};

// 优先采用localStorage, 其次采用cookie存储
var cookie = {
	"get" : function(key) {
		return $.cookie(key);
	},
	"set" : function(key, val) {
		return $.cookie(key, val);
	},
	"del" : function(key) {
		$.removeCookie(key);	
	}
}

// 动态加载文件
$.extend({
    includePath: '',
    include: function(file) {
        var files = typeof file == "string" ? [file] : file;
        for (var i = 0; i < files.length; i++) {
            var name = files[i].replace(/^\s|\s$/g, "");
            $("<link>").attr({
				rel: "stylesheet",
				type: "text/css",
				href: name
			}).appendTo("head");
        }
    }
});

// 获取URL参数函数
$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

$.extend({
	getUrlShareId: function() {
		var urlpath = window.location.pathname;
		if (urlpath.length > 1 && urlpath.indexOf('/share/') != -1) {
			return urlpath.replace('/share/', '');
		}
		return false;
	}
})

// 函数库封装
var func = {
	// 倒计时关闭页面
	// 配置页 10分钟之后自动关闭
	"closepage_timeout" : function(t) {
		if($('#timeout').length < 1) {
			return false;
		}
		var DEFINE_INT_TIME = t ? Math.ceil(t) : 9;
		var DEFINE_SECOND = 59;
		var requesttime = window.setInterval(function(){
			if(--DEFINE_SECOND <= 0) {
				DEFINE_SECOND = 59; 
				if(--DEFINE_INT_TIME < 0) {
					window.clearInterval(requesttime);
					window.close();
				}
			}
			$('#timeout').text(DEFINE_INT_TIME + '分'+ DEFINE_SECOND  +'秒');
		}, 1000);
	},
	// copyright
	"copyright": function() {
		$("body").prepend('<div class="navbar navbar-fixed-bottom">'+
	'<div class="navbar-inner">'+
	'  <div class="container" style="line-height:41px;text-align:center;width:100%">Copyright &copy;<strong style="color:#08c">2012-2018</strong>　<a href="http://www.box3.cn/"><code>box3.cn</code></a>　版本号：<strong style="color:#08c">v2.3.0.3</strong>　上次更新：<strong style="color:#08c">2018-03-31</strong></div>'+
	'</div></div>');
	},
	"post_new" : function(method, url, data, data_type, callback) {
		if(!data_type)
		{
			data_type = 'json';
		}
		
		$.ajax({
		  url: url,
		  timeout: 140000,
		  type : method,
		  data: data,
		  dataType: data_type,
		  success: function(html){
			if (callback){
				callback(html);
			} else {
				if (html['errno'] > 0) {
					PUT.alert(html['errmsg']);
				} else {
					PUT.output(html['data']);
				}
			}
		  },
		  error: function (XMLHttpRequest, textStatus, errorThrown) {
			  PUT.alert("啊！网络不稳定，请重试。");
		  }
		});
	},
	"dd": function(method, url) {
		$.ajax({
		  url: url,
		  timeout: 140000,
		  type : method,
		});
	},
	'openurl': function(url) {
		if(!url || typeof url == "undefined") {
			return false;
		}
		var obj_win = window.open(url);
		obj_win = null;
	},
	'utf16to8': function(str) {
		if(str.length < 1) return;
		
		var out, i, len, c;
		out = "";
		len = str.length;
		for (i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if ((c >= 0x0001) && (c <= 0x007F)) {
				out += str.charAt(i);
			} else if (c > 0x07FF) {
				out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
				out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
				out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
			} else {
				out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
				out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
			}
		}
		return out;
	}
}

// utf8-size封装
String.prototype.utf8_size = function(str_charset) {
	var int_len = this.length;
	var int_total = 0;
	
	str_charset = str_charset ? str_charset.toLowerCase() : '';

	if(int_len < 1) return int_total;
	
	if(str_charset === 'utf-16' || str_charset === 'utf16') {
		for(i = 0; i < int_len; i++) {
			str_charcode = this.charCodeAt(i);
			if(str_charcode <= 0xffff) {
				int_total += 2;
			} else {
				int_total += 4;
			}
		}

		return int_total;
	}

	for(i = 0; i < int_len; i++) {
		str_charcode = this.charCodeAt(i);
		if(str_charcode <= 0x007f) {
        	int_total += 1;
        } else if(str_charcode <= 0x07ff) {
        	int_total += 2;
        } else if(str_charcode <= 0xffff) {
            int_total += 3;
        } else {
            int_total += 4;
        }
    }

	return int_total;
};

// 输入、输出封装
var default_msg = "";
var PUT = {
	'input' : function() {
		var content = $.trim(editor.getValue());
		return content;
	},
	'output' : function(content) {
		content = $.trim(content);;
		if(content.length > 0) {
			editor.setValue(content);
		} else {
			editor.setValue(default_msg);
		}
		editor.focus();
		return true;
	},
	'append': function(content) {
		return true;
	},
	'alert' : function(content) {
		if(content) $("#alert-msg-txt").text(content);
		// 兼容IE
		$("#alert-msg").addClass("in").show();
		if(timeout) window.clearTimeout(timeout);
		timeout = window.setTimeout(function(){
			$("#alert-msg").removeClass("in").hide();
		}, 2600);
	},
	'input_key' : function() {
		return $.trim($("#output-key").val());;	
	},
	'selection_text' : function() {
		if(storage.get('msg')) {
			PUT.output(storage.get('msg'));
			storage.del('msg');
		}
	}
};

// 弹窗
var modal = {
	'open' : function(id, name) {
		$("#output-key").attr('name', name);
		$('#'+ id).modal({
			backdrop:true,
			keyboard:true,
			show:true
		}).on('shown', function() {
			$("#output-key").select();
		});
	},
	'close': function(id) {
		$('#'+ id).modal('hide');
	}
}