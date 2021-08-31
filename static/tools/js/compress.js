/** 
 * 2014-12-16 fanjiapeng@126.com
 * 周知：当前版本还不兼容 chrome 扩展
 */
;(function($) {
	$.jscompress = function(A, B) {
		var C = A;
		var D = /'.*?'|".*?"/g;
		var E = A.match(D);
		if (E) {
			var F = E.length;
			var G = /(\(|\)|\\|\.|\||\[|\]|\^|\*|\+|\?|\$)/g;
			for (var H = 0; H < F; H++) {
				C = C.replace(new RegExp(E[H].replace(G, "\\$1")), "zzstring" + H + "zz");
			}
		}
		var D = /[=(,]\s*\/.+?[^\\]\/.*?[;,)]/g;
		var J = [];
		var K = A.match(D);
		if (K) {
			var F = K.length;
			var M = /(\/.*\/)/;
			for (var H = 0; H < K.length; H++) {
				J.push(K[H].match(M)[1]);
			}
			K = J;
			F = K.length;
			var G = /(\(|\)|\\|\.|\||\[|\]|\^|\*|\+|\?|\$)/g;
			for (var H = 0; H < F; H++) {
				C = C.replace(new RegExp(K[H].replace(G, "\\$1")), "zzreg" + H + "zz");
			}
		}
		C = C.replace(/([^\\]|^)(\/\*[\s\S]*?\*\/){1}/g, "$1");
		C = C.replace(/([^\\]|^){1}\/\/.*/g, "$1");
		C = compress1(C);
		var Q = ['new ', 'delete ', 'do ', 'else ', 'return ', 'typeof ', 'var ', 'function ', ' in '];
		F = Q.length;
		for (var H = 0; H < F; H++) {
			C = C.replace(new RegExp("\\b" + Q[H].replace(" ", "\\s"), "g"), "zzres" + H + "zz");
		}
		C = C.replace(/\s/g, '');
		for (var H = 0; H < F; H++) {
			C = C.replace(new RegExp("zzres" + H + "zz", "g"), Q[H]);
		}
		if (K) {
			F = K.length;
			for (var H = 0; H < F; H++) C = C.replace(new RegExp("zzreg" + H + "zz"), K[H]);
		}
		if (E) {
			F = E.length;
			for (var H = 0; H < F; H++) C = C.replace(new RegExp("zzstring" + H + "zz"), E[H]);
		}
		if (B) return C;
		return compress4(C);
	}
	function compress1(E) {
		var B = /function/;
		var C = E.search(B);
		if (C == -1) return E;
		var D = E.substring(0, C);
		var E = E.substring(C, E.length);
		var F = compress2(E);
		var G = F[0];
		E = F[1];
		D += compress3(G) + compress1(E);
		return D;
	}
	function compress2(A) {
		var B = /{/g;
		var C = /}/;
		var D = '';
		var E = 0;
		var F = true;
		while (F) {
			E--;
			var G = A.search(C);
			var H = A.substring(0, G + 1);
			var I = H.match(B);
			if (I) E += I.length;
			D += H;
			A = A.substring(G + 1, A.length);
			F = (E > 0);
		}
		return [D, A];
	}
	function compress3(A) {
		var B = 0;
		var C = A.substring(A.search(/\(/) + 1, A.search(/\)/)).replace(/\s/g, '');
		var D = 0;
		var E = C.split(',');
		if (C) D = E.length;
		for (var F = 0; F < D; F++) {
			while (B > 25 && B < 32 || A.search(new RegExp("\\b" + String.fromCharCode(65 + B) + "\\b") || (B > 90 && B < 97)) != -1) B++;
			var G = new RegExp("([^.\\w]|^)" + E[F] + "\\b", "g");
			A = A.replace(G, "$1" + String.fromCharCode(65 + B));
			B++;
		}
		var H = /\bvar\s(.+?)[;\r=]/g;
		var I = /(\(|\)|\\|\.|\||\[|\]|\^|\*|\+|\?|\$)/g;
		var J = A.match(H);
		if (J) {
			D = J.length;
			for (var F = 0; F < D; F++) {
				J[F] = J[F].replace(/\[.+?\]/g, '').replace(/\(.+?\)/g, '');
				var L = /(\w*)\b/;
				var M = J[F].replace(H, "$1").split(/,/);
				len = M.length;
				for (var N = 0; N < len; N++) {
					while (B > 25 && B < 32 || A.search(new RegExp("\\b" + String.fromCharCode(65 + B) + "\\b") || (B > 90 && B < 97)) != -1) B++;
					var O = M[N].match(L, "$1")[0];
					var G = new RegExp("([^.\\w]|^)" + O + "\\b", "g");
					A = A.replace(G, "$1" + String.fromCharCode(65 + B));
					B++;
				}
			}
		}
		return A;
	}
	function compress4(A) {
		var B = [];
		var C = {};
		function insertIntoHashMap(word) {
			var D = convertIndex(B.length);
			var E = new RegExp("\\b" + D + "\\b");
			if (A.match(E)) {
				B.push("");
				C[D] = B.length - 1;
				return insertIntoHashMap(word);
			}
			B.push(word);
			C[word] = B.length - 1;
		}
		function compressWord(word) {
			if (isNaN(C[word])) {
				insertIntoHashMap(word);
			}
			return convertIndex(C[word]);
		}
		function convertIndex(i) {
			var F = "";
			if (i >= 62) F = convertIndex(parseInt(i / 62));
			i = i % 62;
			if (i > 35) F += String.fromCharCode(i + 29);
			else F += i.toString(36);
			return F;
		}
		var G = A.replace(/\b\w\w+\b/g, compressWord).replace(/\\/g, "\\\\");
		return "eval(function(m,c,h){function z(i){return(i< 62?'':z(parseInt(i/62)))+((i=i%62)>35?String.fromCharCode(i+29):i.toString(36))}for(var i=0;i< m.length;i++)h[z(i)]=m[i];function d(w){return h[w]?h[w]:w;};return c.replace(/\\b\\w+\\b/g,d);}('" + B.join("|") + "'.split('|'),'" + G.replace(/'/g, "\\'").replace(/<\b/g, "<") + "',{}))";
	}
})(jQuery);