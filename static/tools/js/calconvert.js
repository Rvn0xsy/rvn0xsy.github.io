// 转载网站 http://tool.ckd.cc/calendar/

;(function($) {
	$.calendar_convert = function(M) {
		
		FIRSTYEAR = 1936;
		LASTYEAR = 2031;
	
		LunarCal = [
		new tagLunarCal(23, 3, 2, 17, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0),
		/* 1936 */
		new tagLunarCal(41, 0, 4, 23, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1), new tagLunarCal(30, 7, 5, 28, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1), new tagLunarCal(49, 0, 6, 33, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1), new tagLunarCal(38, 0, 0, 38, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1),
		/* 1940 */
		new tagLunarCal(26, 6, 2, 44, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0), new tagLunarCal(45, 0, 3, 49, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0), new tagLunarCal(35, 0, 4, 54, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1), new tagLunarCal(24, 4, 5, 59, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1),
		/* 1944 */
		new tagLunarCal(43, 0, 0, 5, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1), new tagLunarCal(32, 0, 1, 10, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1), new tagLunarCal(21, 2, 2, 15, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1), new tagLunarCal(40, 0, 3, 20, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1),
		/* 1948 */
		new tagLunarCal(28, 7, 5, 26, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1), new tagLunarCal(47, 0, 6, 31, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1), new tagLunarCal(36, 0, 0, 36, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0), new tagLunarCal(26, 5, 1, 41, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1),
		/* 1952 */
		new tagLunarCal(44, 0, 3, 47, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1), new tagLunarCal(33, 0, 4, 52, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0), new tagLunarCal(23, 3, 5, 57, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1), new tagLunarCal(42, 0, 6, 2, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1),
		/* 1956 */
		new tagLunarCal(30, 8, 1, 8, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0), new tagLunarCal(48, 0, 2, 13, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0), new tagLunarCal(38, 0, 3, 18, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1), new tagLunarCal(27, 6, 4, 23, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0),
		/* 1960 */
		new tagLunarCal(45, 0, 6, 29, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0), new tagLunarCal(35, 0, 0, 34, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1), new tagLunarCal(24, 4, 1, 39, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0), new tagLunarCal(43, 0, 2, 44, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0),
		/* 1964 */
		new tagLunarCal(32, 0, 4, 50, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1), new tagLunarCal(20, 3, 5, 55, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0), new tagLunarCal(39, 0, 6, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0), new tagLunarCal(29, 7, 0, 5, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1),
		/* 1968 */
		new tagLunarCal(47, 0, 2, 11, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1), new tagLunarCal(36, 0, 3, 16, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0), new tagLunarCal(26, 5, 4, 21, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1), new tagLunarCal(45, 0, 5, 26, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1),
		/* 1972 */
		new tagLunarCal(33, 0, 0, 32, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1), new tagLunarCal(22, 4, 1, 37, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1), new tagLunarCal(41, 0, 2, 42, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1), new tagLunarCal(30, 8, 3, 47, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1),
		/* 1976 */
		new tagLunarCal(48, 0, 5, 53, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1), new tagLunarCal(37, 0, 6, 58, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1), new tagLunarCal(27, 6, 0, 3, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0), new tagLunarCal(46, 0, 1, 8, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0),
		/* 1980 */
		new tagLunarCal(35, 0, 3, 14, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1), new tagLunarCal(24, 4, 4, 19, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1), new tagLunarCal(43, 0, 5, 24, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1), new tagLunarCal(32, 10, 6, 29, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1),
		/* 1984 */
		new tagLunarCal(50, 0, 1, 35, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0), new tagLunarCal(39, 0, 2, 40, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1), new tagLunarCal(28, 6, 3, 45, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0), new tagLunarCal(47, 0, 4, 50, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1),
		/* 1988 */
		new tagLunarCal(36, 0, 6, 56, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0), new tagLunarCal(26, 5, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1), new tagLunarCal(45, 0, 1, 6, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0), new tagLunarCal(34, 0, 2, 11, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0),
		/* 1992 */
		new tagLunarCal(22, 3, 4, 17, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0), new tagLunarCal(40, 0, 5, 22, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0), new tagLunarCal(30, 8, 6, 27, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1), new tagLunarCal(49, 0, 0, 32, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1),
		/* 1996 */
		new tagLunarCal(37, 0, 2, 38, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1), new tagLunarCal(27, 5, 3, 43, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1), new tagLunarCal(46, 0, 4, 48, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1),
		/* 1999 */
		new tagLunarCal(35, 0, 5, 53, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1),
		/* 2000 */
		new tagLunarCal(23, 4, 0, 59, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1), new tagLunarCal(42, 0, 1, 4, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1), new tagLunarCal(31, 0, 2, 9, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0), new tagLunarCal(21, 2, 3, 14, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1),
		/* 2004 */
		new tagLunarCal(39, 0, 5, 20, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1), new tagLunarCal(28, 7, 6, 25, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1), new tagLunarCal(48, 0, 0, 30, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1), new tagLunarCal(37, 0, 1, 35, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1),
		/* 2008 */
		new tagLunarCal(25, 5, 3, 41, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1), new tagLunarCal(44, 0, 4, 46, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1), new tagLunarCal(33, 0, 5, 51, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1), new tagLunarCal(22, 4, 6, 56, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0),
		/* 2012 */
		new tagLunarCal(40, 0, 1, 2, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0), new tagLunarCal(30, 9, 2, 7, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1), new tagLunarCal(49, 0, 3, 12, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1), new tagLunarCal(38, 0, 4, 17, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0),
		/* 2016 */
		new tagLunarCal(27, 6, 6, 23, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1), new tagLunarCal(46, 0, 0, 28, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0), new tagLunarCal(35, 0, 1, 33, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0), new tagLunarCal(24, 4, 2, 38, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1),
		/* 2020 */
		new tagLunarCal(42, 0, 4, 44, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1), new tagLunarCal(31, 0, 5, 49, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0), new tagLunarCal(21, 2, 6, 54, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1), new tagLunarCal(40, 0, 0, 59, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1),
		/* 2024 */
		new tagLunarCal(28, 6, 2, 5, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0), new tagLunarCal(47, 0, 3, 10, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1), new tagLunarCal(36, 0, 4, 15, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1), new tagLunarCal(25, 5, 5, 20, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0),
		/* 2028 */
		new tagLunarCal(43, 0, 0, 26, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1), new tagLunarCal(32, 0, 1, 31, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0), new tagLunarCal(22, 3, 2, 36, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0)];
	
		/* 西曆年每月之日數 */
		SolarCal = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
		/* 西曆年每月之累積日數, 平年與閏年 */
		SolarDays = [
		0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365, 396, 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366, 397];
	
		AnimalIdx = ["馬 ", "羊 ", "猴 ", "雞 ", "狗 ", "豬 ", "鼠 ", "牛 ", "虎 ", "兔 ", "龍 ", "蛇 "];
		LocationIdx = ["南", "東", "北", "西"];
	
		if (M == 0) { //阳历到阴历
			
			var tmp = PUT.input().replace(/年|月|日|时|分|秒|\//g, '-').replace('日', '');
			tmp = tmp.split('-');
			
			if (isNaN(tmp[0]) || isNaN(tmp[1]) || isNaN(tmp[2])) return PUT.alert("请输入合法阳历年月日数值。");
			SolarYear = parseInt(tmp[0]);
			SolarMonth = parseInt(tmp[1]);
			SolarDate = parseInt(tmp[2]);
	
			if (SolarYear <= FIRSTYEAR || SolarYear > LASTYEAR) return PUT.alert("请输入1936-2031有效年份。");
	
			sm = SolarMonth - 1;
	
			if (sm < 0 || sm > 11) return PUT.alert("请输入有效月份。");
			if(tmp[2] > 31 || tmp[2] < 1) return PUT.alert("请输入有效天数。");
	
			leap = GetLeap(SolarYear);
	
			if (sm == 1) d = leap + 28;
			else d = SolarCal[sm];
	
			if (SolarDate < 1 || SolarDate > d) return 3;
	
			y = SolarYear - FIRSTYEAR;
			acc = SolarDays[leap * 14 + sm] + SolarDate;
			kc = acc + LunarCal[y].BaseKanChih;
			Kan = kc % 10;
			Chih = kc % 12;
			Location = LocationIdx[kc % 4];
			Age = kc % 60;
			if (Age < 22) Age = 22 - Age;
			else Age = 82 - Age;
	
			Age = Age + 3;
	
			if (Age < 10) Age = Age + 60;
	
			Animal = AnimalIdx[Chih];
	
			if (acc <= LunarCal[y].BaseDays) {
				y--;
				LunarYear = SolarYear - 1;
				leap = GetLeap(LunarYear);
				sm += 12;
				acc = SolarDays[leap * 14 + sm] + SolarDate;
			}
			else LunarYear = SolarYear;
	
			l1 = LunarCal[y].BaseDays;
			for (i = 0; i < 13; i++) {
				l2 = l1 + LunarCal[y].MonthDays[i] + 29;
				if (acc <= l2) break;
				l1 = l2;
			}
	
			LunarMonth = i + 1;
			LunarDate = acc - l1;
			im = LunarCal[y].Intercalation;
	
			if (im != 0 && LunarMonth > im) {
				LunarMonth--;
				if (LunarMonth == im) LunarMonth = -im;
			}
	
			if (LunarMonth > 12) LunarMonth -= 12;
	
			PUT.output(LunarYear + "年" + LunarMonth + "月" + LunarDate + "日");
	
			tmp = '';
			return 0;
		}
	
		else
		/* 阴历转阳历 */
		{
			var tmp = PUT.input().replace(/年|月|日|时|分|秒|\//g, '-').replace('日', '');
			tmp = tmp.split('-');
			
			if (isNaN(tmp[0]) || isNaN(tmp[1]) || isNaN(tmp[2])) return PUT.alert("请输入合法农历年月日数值。");

			LunarYear = parseInt(tmp[0]);
			LunarMonth = parseInt(tmp[1]);
			LunarDate = parseInt(tmp[2]);
	
			if (LunarYear < FIRSTYEAR || LunarYear >= LASTYEAR) return PUT.alert("请输入1936-2031有效年份。");
	
			y = LunarYear - FIRSTYEAR;
			im = LunarCal[y].Intercalation;
			lm = LunarMonth;
	
			if (lm < 0) {
				if (lm != -im) return PUT.alert("请输入有效月份。");
			}
			else if (lm < 1 || lm > 12) return PUT.alert("请输入有效月份。");
	
			if (im != 0) {
				if (lm > im) lm++;
				else if (lm == -im) lm = im + 1;
			}
			lm--;
	
			if (LunarDate > LunarCal[y].MonthDays[lm] + 29) return PUT.alert("农历日期不正确。");
	
			acc = 0;
			for (i = 0; i < lm; i++) {
	
				acc += LunarCal[y].MonthDays[i] + 29;
	
			}
	
			acc += LunarCal[y].BaseDays + LunarDate;
	
			leap = GetLeap(LunarYear);
	
			for (i = 13; i >= 0; i--) {
	
				if (acc > SolarDays[leap * 14 + i]) break;
			}
			SolarDate = acc - SolarDays[leap * 14 + i];
	
			if (i <= 11) {
	
				SolarYear = LunarYear;
				SolarMonth = i + 1;
			}
			else {
	
				SolarYear = LunarYear + 1;
				SolarMonth = i - 11;
			}
	
			leap = GetLeap(SolarYear);
			y = SolarYear - FIRSTYEAR;
	
			//acc = SolarDays[leap][SolarMonth-1] + SolarDate; 
			acc = SolarDays[leap * 14 + SolarMonth - 1] + SolarDate;
	
			weekday = (acc + LunarCal[y].BaseWeekday) % 7;
			kc = acc + LunarCal[y].BaseKanChih;
			kan = kc % 10;
			chih = kc % 12;
	
			PUT.output(SolarYear + "年" + SolarMonth + "月" + SolarDate + "日 ");
	
			tmp = '';
			return 0;
		} //else结束
	}

	/* 闰年, 返回 0 平年, 1 闰年 */
	function GetLeap(year) {
		if (year % 400 == 0) return 1;
		else if (year % 100 == 0) return 0;
		else if (year % 4 == 0) return 1;
		else return 0;
	}
	
	function tagLunarCal(d, i, w, k, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13) {
		this.BaseDays = d;
		/* 1 月 1 日到正月初一的累计日 */
		this.Intercalation = i;
		/* 闰月月份. 0==此年沒有闰月 */
		this.BaseWeekday = w;
		/* 此年 1 月 1 日为星期减 1 */
		this.BaseKanChih = k;
		/* 此年 1 月 1 日之干支序号减 1 */
		this.MonthDays = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13];
		/* 此农历年每月之大小, 0==小月(29日), 1==大月(30日) */
	}
}(jQuery));
