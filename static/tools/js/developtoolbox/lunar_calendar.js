/**
 * 原创未找到, 转载网站 http://blog.csdn.net/natineprince/article/details/4180270
 *
 * 2014-04-30
 */ 

;(function($) {

var now = new Date();
var lunarinfo = new Array(0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0);
//==== 传回农历 y年的总天数    
function lyeardays(y) {
    var i, sum = 348
    for (i = 0x8000; i > 0x8; i >>= 1) sum += (lunarinfo[y - 1900] & i) ? 1 : 0
    return (sum + leapdays(y))
}
//==== 传回农历 y年闰月的天数    
function leapdays(y) {
    if (leapmonth(y)) return ((lunarinfo[y - 1900] & 0x10000) ? 30 : 29)
    else return (0)
}
//==== 传回农历 y年闰哪个月 1-12 , 没闰传回 0    
function leapmonth(y) {
    return (lunarinfo[y - 1900] & 0xf)
}
//====================================== 传回农历 y年m月的总天数    
function monthdays(y, m) {
    return ((lunarinfo[y - 1900] & (0x10000 >> m)) ? 30 : 29)
}
//==== 算出农历, 传入日期物件, 传回农历日期物件    
//     该物件属性有 .year .month .day .isleap .yearcyl .daycyl .moncyl    
function lunar(objdate) {
    var i, leap = 0,
        temp = 0;
    var basedate = new Date(1900, 0, 31);
    var offset = (objdate - basedate) / 86400000;
    this.daycyl = offset + 40;
    this.moncyl = 14;
    for (i = 1900; i < 2050 && offset > 0; i++) {
        temp = lyeardays(i);
        offset -= temp;
        this.moncyl += 12;
    }
    if (offset < 0) {
        offset += temp;
        i--;
        this.moncyl -= 12;
    }
    this.year = i;
    this.yearcyl = i - 1864;
    leap = leapmonth(i); //闰哪个月    
    this.isleap = false
    for (i = 1; i < 13 && offset > 0; i++) {
        //闰月    
        if (leap > 0 && i == (leap + 1) && this.isleap == false) {
            --i;
            this.isleap = true;
            temp = leapdays(this.year);
        } else {
            temp = monthdays(this.year, i);
        }
        //解除闰月    
        if (this.isleap == true && i == (leap + 1)) this.isleap = false
        offset -= temp
        if (this.isleap == false) this.moncyl++
    }
    if (offset == 0 && leap > 0 && i == leap + 1)
        if (this.isleap) {
            this.isleap = false;
        } else {
            this.isleap = true;
            --i;
            --this.moncyl;
        }
    if (offset < 0) {
        offset += temp;
        --i;
        --this.moncyl;
    }
    this.month = i
    this.day = offset + 1
}

function cday(m, d) {
    var nstr1 = new Array('日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十');
    var nstr2 = new Array('初', '十', '廿', '卅', '　');
    var s;
    if (m > 10) {
        s = '十' + nstr1[m - 10]
    } else {
        s = nstr1[m]
    }
    s += '月'
    if (s == "十二月") s = "腊月";
    if (s == "一月") s = "正月";
    switch (d) {
        case 10:
            s += '初十';
            break;
        case 20:
            s += '二十';
            break;
        case 30:
            s += '三十';
            break;
        default:
            s += nstr2[Math.floor(d / 10)];
            s += nstr1[d % 10];
    }
    return (s);
}

function solarday2(timestamp) {
	if(timestamp) now = timestamp;
    var sdobj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var ldobj = new lunar(sdobj);
    var cl = '';
    //农历bb'+(cld[d].isleap?'闰 ':' ')+cld[d].lmonth+' 月 '+cld[d].lday+' 日    
    var tt = cday(ldobj.month, ldobj.day);
	return now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日 农历" + tt + "";
}

// 对外部提供函数
$.calendar = {
	'response': solarday2
};

}(jQuery));