// Media APIs
mediaUrl = {};
searchUrl = {};
lyricsUrl = {};
albumCoverUrl = {};

// mediaUrls
mediaUrl.qq = (mid, quality = "nq") => {
	//return "http://dl.stream.qqmusic.qq.com/M800" + id + ".mp3?vkey=75542A364A8732491EFA2A2639A5EECA4065E2EE55A26262A9371E2A5E8FD37C03DB0BEF4F289D1429968BD8F9765DBE5A8BF76598DC5EA4&guid=5150825362&fromtag=1";
	//Get VKEY
	let vkeyFetch = new XMLHttpRequest;
	let vkeyVal = "";
	vkeyFetch.open("GET","https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=1278911659&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&cid=205361747&uin=0&songmid=" + mid + "&filename=C400" + mid + ".m4a&guid=5150825362");
	vkeyFetch.onreadystatechange = function () {
		if (this.readyState == 4) {
			let vkeyObj = JSON.parse(this.responseText);
			vkeyVal = vkeyObj.data.items[0].vkey;
			console.log(vkeyVal);
			if (vkeyVal) {
				if (vkeyVal.length > 0) {
					switch (quality.toLowerCase()) {
						case "nq": {
							let mediaReqUrl = "http://dl.stream.qqmusic.qq.com/C400" + mid + ".m4a?vkey=" + vkeyVal + "&guid=5150825362&fromtag=1";
							let mediaReq = new XMLHttpRequest;
							mediaReq.responseType = "blob";
							mediaReq.open("GET", mediaReqUrl);
							mediaReq.onreadystatechange = function () {
								if (this.readyState == 4) {
									console.log(this.response);
								}
							};
							mediaReq.send();
							break;
						};
					}
				}
			}
		}
	};
	vkeyFetch.send();
};
mediaUrl.netease = (id) => {
	return "http://music.163.com/song/media/outer/url?id=" + id + ".mp3";
};