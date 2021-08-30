// 转载网站 http://www.cnblogs.com/skykang/archive/2011/05/30/2063176.html
// Unicode编码转换
;(function($) {

	var Plugin = $.unicode = function(str) {
		return str;
	}
	
	Plugin.decToHex = function(str) {
		var res=[];
		for(var i=0;i < str.length;i++)
		res[i]=("00"+str.charCodeAt(i).toString(16)).slice(-4);
		return "\\u"+res.join("\\u");
	}
	
	// 修复换行符、反斜杠转义符
	Plugin.hexToDec = function(str) {
		str=str.replace(/\\u00a/g, "\n").replace(/\\u/g, "%u");
		return unescape(str);
	}

}(jQuery));
