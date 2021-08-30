/**
 * 设置功能核心代码
 *
 * 开发者：范家鹏  E-mail：fanjiapeng@126.com  博客：www.yulonghu.com
 * 上次更新时间：2014-04-24
 */

var settings_storage_val = storage.get(storage.define['DEFINE_BTN_STYLE_NAME']) || 'btn';
var DEFINE_BORDER_COLOR = ["#DDD", "#00a1cb", "#7db500", "#f18d05", "#e54028", "#87318c"];

// 获取按钮状态
// 绑定click事件
$('#btn-style-a').find('input[type=radio]').each(function(i, data){
	if(data && $(data).val() == settings_storage_val) {
		$(data).attr('checked', true);
		return false;
	}
}).on('ifChecked', function() {
	storage.set(storage.define['DEFINE_BTN_STYLE_NAME'], $.trim(this.value));
	
	// 是否打开了更新边框颜色选项
	if($('#border-normal i').attr('class') == 'icon-ok') {
		storage.set(storage.define['DEFINE_BORDER_COLOR'], DEFINE_BORDER_COLOR[parseInt($(this).attr('dataindex'))]);
	}
}).end().find('label').css('width', '140px').css('padding-left', 0);

$('#btn-style-a').find('input[type=radio]').next().on('click', function(){
	$(this).prev().trigger('click');
});

// 边框样色开关切换
$('#border-normal').on('click', function(){
	if($('#border-normal i').attr('class') == 'icon-ok') {
		storage.del(storage.define['DEFINE_BORDER_COLOR']);
		$('#border-normal i').removeClass().addClass('icon-remove');
	} else {
		$('#border-normal i').removeClass().addClass('icon-ok');
		storage.set(storage.define['DEFINE_BORDER_COLOR'], DEFINE_BORDER_COLOR[parseInt($('#btn-style-a').find('input[type=radio]:checked').attr('dataindex'))]);
	}
});

// 常用功能	
$('.container li:eq(2)').on('click', function(){
	
	// clear
	$('#btn-style-b').find('fieldset>div').remove();
	
	var custom_func = storage.get(storage.define['DEFINE_CUSTOM_FUNCTION']) ? JSON.parse(storage.get(storage.define['DEFINE_CUSTOM_FUNCTION'])) : '';
	var str_tmp_menu = '';
	
	$.each($.menu.source, function(index, key){
		if(index == 'menu_one') {return true;}
		str_tmp_menu = '<div style="margin-bottom:20px;">';
		$.each(key, function(i, data){
			str_tmp_menu += '<label class="checkbox inline" style="width:200px; margin-left:10px;">'+
				'<input type="checkbox" name="button-style" value="'+data+'" '+($.menu.finds(custom_func, data) ? 'checked' : '')+'>'+
			   ' <button style="width: 170px; text-align:left;" title="'+data+'" class="'+(storage.get(storage.define['DEFINE_BTN_STYLE_NAME']) || 'btn')+'">'+data+'</button>'+
			'</label>';
		});
		
		//$('#btn-style-b').find('legend').before(str_tmp_menu + '</div>');
		$('#btn-style-b fieldset').append(str_tmp_menu +'</div>');
	});
	
	delete str_tmp_menu;
	static_custom_count();
	
	// 调整第一个label样式
	$('form:eq(1)').find('label:eq(0)').css('margin-left', '10px');
	
	$('#btn-style-b').find('input[type=checkbox]').on('ifChanged', function() {
		var str_tmp = storage.get(storage.define['DEFINE_CUSTOM_FUNCTION']);
		if(!str_tmp) str_tmp = {};
		if(typeof str_tmp == 'string') str_tmp = [str_tmp];
		if(str_tmp.length > 0) str_tmp = JSON.parse(str_tmp);
		
		var str_find = $.menu.find_txt($.trim(this.value));
		this.checked ? str_tmp[str_find[0] + ':' + str_find[1]] = $.trim(this.value) : delete str_tmp[str_find[0] + ':' + str_find[1]];

		storage.set(storage.define['DEFINE_CUSTOM_FUNCTION'], str_tmp?JSON.stringify(str_tmp):'');
		static_custom_count();
		
	});
	
	$('#btn-style-b').find('button').next().on('click', function(){
		$(this).prev().trigger('click');
	})
	
	style_icheck();
});

// 还原常用功能
$('#reduction').bind('click', function() {
									   
	var _this = $(this);
	var update = function() {
		$('#btn-style-b').find('input[type=checkbox]:checked').attr('checked', false).iCheck('update');
		static_custom_count();
		storage.del(storage.define['DEFINE_CUSTOM_FUNCTION']);
	}
	
	var classname = function() {
		_this.find('i').removeClass('icon-repeat').addClass('icon-ok');
	}
	
	_this.unbind(); update(); classname();
	
	// 至多2次
	var request = window.setTimeout(function(){
		_this.bind('click', function(){update(); classname();});
		_this.find('i').removeClass('icon-ok').addClass('icon-repeat');
	}, 3000);
}).css('cursor', 'pointer').find('a').tooltip('toggle');
	
// 提示用：更新选择功能项个数
var static_custom_count = function() {
	var int_len = $('form:eq(1)').find('input[type=checkbox]:checked').length;
	$('form:eq(1)').find('legend>span[class=text-success]').text(parseInt(int_len) ? '(' + int_len + ')' : '');
}

var style_icheck = function() {
	$('input').iCheck({
		checkboxClass: 'icheckbox_flat-blue',
		radioClass: 'iradio_flat-blue'
	});
}

$(document).ready(function(){
	style_icheck();
	
	if(storage.get(storage.define['DEFINE_BORDER_COLOR'])) {
		$('#border-normal i').removeClass().addClass('icon-ok');
	}
	
	func.closepage_timeout();
	func.copyright();
});
