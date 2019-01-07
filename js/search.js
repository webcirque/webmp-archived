// Media APIs
mediaUrl = {};
searchUrl = {};
lyricsUrl = {};
albumCoverUrl = {};

// mediaUrls
mediaUrl.qq = (mid, quality = "lq", handlers = {
	onSuccess: (e) => {
		console.info(e);
	},
	onFail: (e) => {
		console.error(e);
	}
}) => {
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
					let mediaReq = new XMLHttpRequest;
					mediaReq.responseType = "blob";
					mediaReq.onreadystatechange = function () {
						if (this.readyState == 4) {
							if (this.status == 200) {
								if (handlers.onSuccess) {
									handlers.onSuccess(this);
								}
							} else {
								if (handlers.onFail) {
									handlers.onFail(this);
								}
							}
						} else if (this.readyState == 0) {
							if (handlers.onFail) {
								handlers.onFail(this);
							}
						}
					};
					switch (quality.toLowerCase()) {
						case "lq":
						case "fast": {
							let mediaReqUrl = "http://dl.stream.qqmusic.qq.com/C400" + mid + ".m4a?vkey=" + vkeyVal + "&guid=5150825362&fromtag=1";
							mediaReq.open("GET", mediaReqUrl);
							mediaReq.send();
							break;
						};
						case "nq":
						case "cq":
						case "common": {
							let mediaReqUrl = "http://dl.stream.qqmusic.qq.com/M500" + mid + ".mp3?vkey=" + vkeyVal + "&guid=5150825362&fromtag=1";
							mediaReq.open("GET", mediaReqUrl);
							mediaReq.send();
							break;
						};
						case "hq":
						case "high": {
							let mediaReqUrl = "http://dl.stream.qqmusic.qq.com/M800" + mid + ".mp3?vkey=" + vkeyVal + "&guid=5150825362&fromtag=1";
							mediaReq.open("GET", mediaReqUrl);
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

searchUrl.qq = (text, page = 1, number = 20, handlers = {
		onSuccess: function (e, o) {
		console.log(o.list);
	},
	onFail: function (e) {
		console.error(e);
		throw(new Error("Failed to get search results from QQMusic."));
	},
	onProgress: function (e) {
		console.warn("Request entered the ready state of " + e.readyState);
	}
}) => {
	let searchQuery = new XMLHttpRequest;
	searchQuery.open("GET", "https://c.y.qq.com/soso/fcgi-bin/client_search_cp?g_tk=5381&p={$page$}&n={$number$}&w={$searchText$}&format=json&loginUin=0&hostUin=0&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&remoteplace=txt.yqq.song&t=0&aggr=1&cr=1&catZhida=1&flag_qc=0".replace("{$searchText$}", text).replace("{$page$}", page).replace("{$number$}", number));
	searchQuery.onreadystatechange = function () {
		switch (this.readyState) {
			case 4: {
				if (this.status == 200) {
					if (handlers.onSuccess) {
						handlers.onSuccess(this, JSON.parse(this.responseText));
					}
				} else {
					if (handlers.onFail) {
						handlers.onFail(this);
					}
				}
				break;
			};
			default: {
				if (handlers.onProgress) {
					handlers.onProgress(this);
				}
			}
		}
	};
	searchQuery.send();
}