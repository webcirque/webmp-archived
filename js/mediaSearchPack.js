"use strict";
// Packed XHR
function xhrPack(method = "get", url, spec, callback = {}) {
	if (!(callback.onSuccess)) {
		callback.onSuccess = function (response) {
			console.info(response);
		};
	};
	if (!(callback.onProgress)) {
		callback.onProgress = function (response) {
			console.warn(response);
		};
	};
	if (!(callback.onFail)) {
		callback.onFail = function (response) {
			console.error(response);
		};
	};
	let xhr = null;
	let methods = ["get", "post", "put", "delete"];
	if (methods.indexOf(method.toLowerCase()) < 0) {
		throw(new Error(lang.methodInvalid.replace("$1", method.toUpperCase())));
	} else {
		xhr = new XMLHttpRequest();
		if (spec) {
			if (spec.credentials) {
				xhr.withCredentials = true;
			};
			if (spec.responseType) {
				xhr.responseType = spec.responseType;
			};
		};
		xhr.open(method, url);
		xhr.onreadystatechange = function () {
			if (this.readyState != 4) {
				callback.onProgress({
					state: this.readyState
				});
			} else {
				if (this.status > 199 && this.status < 300) {
					let rep = {
						state: this.readyState,
						response: this.response,
						type: this.responseType,
						status: this.status.toString(),
						json: null
					};
					try {
						if (this.response.constructor == String) {
							rep.text = this.responseText;
						}
					} catch (error) {
						console.error("Response is not text.");
					};
					try {
						if (this.response.constructor == String) {
							rep.xml = this.responseXML;
						}
					} catch (error) {
						console.error("Response is not XML.");
					};
					try {
						if (this.response.constructor == String) {
							rep.json = JSON.parse(rep.text);
						}
					} catch (error) {
						console.error("Response is not JSON.");
					}
					callback.onSuccess(rep);
				} else {
					callback.onFail({
						state: this.readyState,
						status: this.status.toString()
					});
				};
			};
		};
		xhr.send();
	};
	return xhr;
};

//Override HTTP requests
chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
	console.info("Grabbed a request from [$1]".replace("$1", details.url));
	let noReferer = true;
	let noOrigin = true;
	details.requestHeaders.forEach((e) => {
		if (e.name == "Referer") {
			noReferer = false;
			console.warn("Referer header is contained in this request.");
		} else if (e.name == "Origin") {
			noOrigin = false;
			console.warn("Origin header is contained in this request.");
		};
	});
	if (details.url.indexOf("-hz") != -1) {
		console.info("This video is a normal one.");
		if (noReferer) {
			console.warn("No Referer header is contained in this request.\nAdding...");
			details.requestHeaders.push({
				name: "Referer",
				value: "https://www.bilibili.com/video/"
			});
		};
		if (noOrigin) {
			console.warn("No Origin header is contained in this request.\nAdding...");
			details.requestHeaders.push({
				name: "Origin",
				value: "https://www.bilibili.com/"
			});
		};
	} else {
		console.info("This video is from bangumi.");
		if (noReferer) {
			console.warn("No Referer header is contained in this request.\nAdding...");
			details.requestHeaders.push({
				name: "Referer",
				value: "https://www.bilibili.com/bangumi/play"
			});
		};
		if (noOrigin) {
			console.warn("No Origin header is contained in this request.\nAdding...");
			details.requestHeaders.push({
				name: "Origin",
				value: "https://www.bilibili.com/"
			});
		};
	};
	console.log("Request headers have been edited.\n%o", details.requestHeaders);
	return {
		requestHeaders: details.requestHeaders
	};
}, {
	urls: ["*://*.acgvideo.com/*"]
}, ["requestHeaders", "blocking"]);

//Get search results
// https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=1&n=20&w=此处搜索文本&format=json&loginUin=0&hostUin=0&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&remoteplace=txt.yqq.song&t=0&aggr=1&cr=1&catZhida=1&flag_qc=0
self.search = {};
search.qq = function (word, page = 1, number = 20, successCallback, errorCallback = function (object) {
	console.error(object);
}) {
	let xhr = xhrPack("get", "https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=$1&n=$2&w=$3&format=json&loginUin=0&hostUin=0&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&remoteplace=txt.yqq.song&t=0&aggr=1&cr=1&catZhida=1&flag_qc=0)"
		.replace("$1", page)
		.replace("$2", number)
		.replace("$3", word)
	, {
		credentials: true
	}, {
		onSuccess: function (data) {
			successCallback(data.json.data.song.list);
		},
		onFail: function (data) {
			console.error(data);
		}
	});
	return xhr;
};
search.bilibili = function (word, page, successCallback, errorCallback = function (object) {
	console.error(object);
}) {
	let xhr = xhrPack("get", "https://search.bilibili.com/all?keyword=$1&page=$2"
		.replace("$1", word)
		.replace("$2", page)
	, {
		credentials: true
	}, {
		onSuccess: function (data) {}
	});
}
search.bilibili.Bangumi = function (seasonId, name) {
	this.season = seasonId;
	this.name = name;
}

//Get media
self.media = {};
media.quality = {
	AUTO: -1,
	FAST: 0,
	COMMON: 1,
	NORMAL: 1,
	HIGH: 2,
	ULTRA: 3,
	LOSSLESS: 3,
	P360: 16,
	P480: 32,
	P720: 64,
	P1080: 80,
	PAUTO: 0
};
media.qq = function (mid, quality = media.quality.AUTO, successCallback, errorCallback = function (object) {
	console.error(object);
}) {
	let cookies = chrome.cookies.getAll({domain:".qq.com"}, function (cookies) {
		let loginUin = -1;
		let hostUin = 0;
		let shortUin = -1;
		let guid = 0;
		cookies.forEach(function (e) {
			switch (e.name) {
				case "pgv_pvid": {
					guid = parseInt(e.value);
					break;
				};
				case "ptui_loginuin": {
					loginUin = parseInt(e.value);
					shortUin = e.value % 8192;
					break;
				};
			};
		});
		let data = {
			    "req": {
				"module": "CDN.SrfCdnDispatchServer",
				"method": "GetCdnDispatch",
				"param": {
					"guid": guid.toString(),
					"calltype": 0,
					"userip": ""
				}
			},
			"req_0": {
				"module": "vkey.GetVkeyServer",
				"method": "CgiGetVkey",
				"param": {
					"guid": guid.toString(),
					"songmid": [mid],
					"songtype": [0],
					"uin": loginUin.toString(),
					"loginflag": 1,
					"platform": "20"
				}
			},
			"comm": {
				"uin": loginUin,
				"format": "json",
				"ct": 24,
				"cv": 0
			}
		};
		let musicu = xhrPack("get", "https://u.y.qq.com/cgi-bin/musicu.fcg?-=getplaysongvkey&loginUin=$1&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=y.qq.json&needNewCode=0&data=$2"
			.replace("$1", loginUin.toString())
			.replace("$2", encodeURIComponent(JSON.stringify(data)))
		, {
			credentials: true
		}, {
			onSuccess: function (data) {
				let vkey = data.json.req_0.data.midurlinfo[0].vkey;
				let streamingAddress = data.json.req_0.data.sip[Math.floor(Math.random()*2)];
				if (quality == 0) {
					streamingAddress += data.json.req_0.data.midurlinfo[0].filename;
					streamingAddress += "?guid=$3&vkey=$1&uin=$2&fromtag=66"
					.replace("$1", vkey)
					.replace("$2", shortUin)
					.replace("$3", guid);
				}
				else if (quality == 1) {
					streamingAddress += "M500" + mid + ".mp3";
					streamingAddress += "?guid=$3&vkey=$1&uin=$2&fromtag=1"
					.replace("$1", vkey)
					.replace("$2", shortUin)
					.replace("$3", guid);
				}
				else if (quality == 2) {
					streamingAddress += "M800" + mid + ".mp3";
					streamingAddress += "?guid=$3&vkey=$1&uin=$2&fromtag=33"
					.replace("$1", vkey)
					.replace("$2", shortUin)
					.replace("$3", guid);
				}
				else if (quality == 3) {
					streamingAddress += "F000" + mid + ".flac";
					streamingAddress += "?guid=$3&vkey=$1&uin=$2&fromtag=33"
					.replace("$1", vkey)
					.replace("$2", shortUin)
					.replace("$3", guid);
				};
				successCallback(streamingAddress);
			},
			onFail: function () {
				console.error("Failed to get song VKEY.");
			}
		});
	});
};
media.bilibili = {};
media.bilibili.bangumi = function (aid, cid, epid, quality = media.PAUTO,successCallback, errorCallback = function (object) {
	console.error(object);
}) {
	xhrPack("get", "https://api.bilibili.com/pgc/player/web/playurl?avid=$1&cid=$2&type=&otype=json&ep_id=$3&qn=$4"
		.replace("$1", aid)
		.replace("$2", cid)
		.replace("$3", epid)
		.replace("$4", quality)
	, {credentials:true}, {
		onSuccess: function (data) {
			successCallback(data.json.result.durl);
		}
	});
};
media.bilibili.video = function (aid, quality = media.PAUTO, successCallback, errorCallback = function (object) {
	console.error(object);
}) {
	let xhr1 = xhrPack("get", "https://www.bilibili.com/video/av" + aid, {}, {
		onSuccess: function (data) {
			let domParser = new DOMParser();
			let tempDocument = domParser.parseFromString(data.text, "text/html");
			let videoInfo = JSON.parse(tempDocument.getElementsByTagName("script")[3].innerText.replace("window.__INITIAL_STATE__=","").replace(";(function(){var s;(s=document.currentScript||document.scripts[document.scripts.length-1]).parentNode.removeChild(s);}());",""));
			let cid = videoInfo.videoData.cid;
			let xhr2 = xhrPack("get", "https://api.bilibili.com/x/player/playurl?avid=$1&cid=$2&qn=$3"
				.replace("$1", aid)
				.replace("$2", cid)
				.replace("$3", quality)
			, {
				credentials: true
			}, {
				onSuccess: function (response) {
					successCallback(response.json.data.dash);
				}
			});
		}
	});
};

//Episodes
self.episodes = {};
episodes.bilibili = function (sid, successCallback, errorCallback = function (object) {
	console.error(object);
}) {
	xhrPack("get", "https://bangumi.bilibili.com/web_api/get_ep_list?season_id=$1&season_type=1"
		.replace("$1", sid)
	, {
		credentials: true
	}, {
		onSuccess: function (data) {
			successCallback(data.json.result);
		}
	});
}