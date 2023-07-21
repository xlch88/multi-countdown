export default {
	formatSecond(result) {
		const d = Math.floor(result / 86400);
		const h = Math.floor((result / 3600) % 24);
		const m = Math.floor((result / 60) % 60);
		const s = Math.floor(result % 60);
		result = s + "秒";
		if (m > 0) {
			result = m + "分" + result;
		}
		if (h > 0) {
			result = h + "时" + result;
		}
		if (d > 0) {
			result = d + "天" + result;
		}

		return result;
	},

	formatTime(time_, fmt = "yyyy-MM-dd") {
		let time = new Date(time_);
		let o = {
			"M+": time.getMonth() + 1, //月份
			"d+": time.getDate(), //日
			"h+": time.getHours(), //小时
			"m+": time.getMinutes(), //分
			"s+": time.getSeconds(), //秒
			"q+": Math.floor((time.getMonth() + 3) / 3), //季度
			S: time.getMilliseconds(), //毫秒
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (const k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return fmt;
	},
};
