// Forbids context menu and goes back
document.oncontextmenu = () => {
	settingSwitchTo("main");
	window.parent.postMessage({
		"type": "info:settings",
		"specify": "actionAnnounce",
		"data": "goBack"
	}, "*");
	return false;
}

// Languages
if (window.navigator) {
	if (window.navigator.language) {
		switch (navigator.language.toLowerCase()) {
			case "zh":
			case "zh-hans":
			case "zh-cn":
			case "zh-sg":
				lang = {
					"mainSettings": "主设置",
					"playbackSettings": "播放设置",
					"playback": {
						"visualizer": "可视化效果",
						"audioMode": "音频输出模式"
					},
					"miscSettings": "其他设置",
					"displaySettings": "显示设置",
					"playlistSettings": "播放列表设置",
					"searchSettings": "搜索设置",
					"historySettings": "历史设置"
				};
				break;
			case "zh-hant":
			case "zh-tw":
			case "zh-hk":
				lang = {
					"mainSettings": "主設定",
					"playbackSettings": "回放設定",
					"playback": {
						"visualizer": "可視化效果",
						"audioMode": "聲音輸出模式"
					},
					"miscSettings": "其他設定",
					"displaySettings": "顯示設定",
					"playlistSettings": "媒體列表設定",
					"searchSettings": "檢索設定",
					"historySettings": "足跡設定"
				};
				break;
			default:
				lang = {
					"mainSettings": "Settings",
					"playbackSettings": "Playback",
					"playback": {
						"visualizer": "Visualizer",
						"audioMode": "Audio output mode"
					},
					"miscSettings": "Miscellaneous",
					"displaySettings": "Display",
					"playlistSettings": "Playlist",
					"searchSettings": "Search",
					"historySettings": "History"
				};
				break;
		}
	}
}

// Lazy method
function _q(t) {
	return document.querySelector(t);
}
function _qa(t) {
	return document.querySelectorAll(t);
}

// Loads document
document.onreadystatechange = function () {
	switch (this.readyState.toLowerCase()) {
		case "interactive": {
			// When the document has finished framework loading
			settingTabs = {
				"main": document.getElementById("settings-main"),
				"playback": document.getElementById("settings-playback"),
				"misc": document.getElementById("settings-misc"),
				"display": _q("#settings-display"),
				"search": _q("#settings-search"),
				"history": _q("#settings-history"),
				"playlist": _q("#settings-playlist"),
				"visualizer": _q("#settings-visualizer")
			};
			settingSwitchTo = function (t) {
				for (let settingTabName in settingTabs) {
					if (t != settingTabName) {
						settingTabs[settingTabName].style.display = "none";
					} else {
						settingTabs[t].style.display = "";
					}
				}
			};
			settingSwitchTo("main");
			// Language
			if (window.lang) {
				_qa("#text-setup").forEach(function (e) {
					e.innerHTML = lang.mainSettings;
				});
				_qa("#text-playback").forEach(function (e) {
					e.innerHTML = lang.playbackSettings;
					e.onclick = () => {
						settingSwitchTo("playback");
					}
				});
				_qa("#text-misc").forEach(function (e) {
					e.innerHTML = lang.miscSettings;
					e.onclick = () => {
						settingSwitchTo("misc");
					}
				});
				_qa("#text-display").forEach(function (e) {
					e.innerHTML = lang.displaySettings;
					e.onclick = () => {
						settingSwitchTo("display");
					}
				});
				_qa("#text-playlist").forEach(function (e) {
					e.innerHTML = lang.playlistSettings;
					e.onclick = () => {
						settingSwitchTo("playlist");
					}
				});
				_qa("#text-history").forEach(function (e) {
					e.innerHTML = lang.historySettings;
					e.onclick = () => {
						settingSwitchTo("history");
					}
				});
				_qa("#text-search").forEach(function (e) {
					e.innerHTML = lang.searchSettings;
					e.onclick = () => {
						settingSwitchTo("search");
					}
				});
				_qa("#text-visualizer").forEach(function (e) {
					e.innerHTML = lang.playback.visualizer;
					e.onclick = () => {
						settingSwitchTo("visualizer");
					}
				});
			};
			let visualizerModeList = ["empty", "osc-xy", "fft"];
			_q("#drawer-visualizer #text-visualizer-empty").onclick = () => {
				window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:settings",
						"specify": "changeVisualizerMode",
						"data": "empty"
					}
				}, "*");
				localStorage.setItem("WEBMPS:visualizer", "empty");
			};
			_q("#drawer-visualizer #text-visualizer-oscxy").onclick = () => {
				window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:settings",
						"specify": "changeVisualizerMode",
						"data": "osc-xy"
					}
				}, "*");
				localStorage.setItem("WEBMPS:visualizer", "osc-xy");
			};
			_q("#drawer-visualizer #text-visualizer-fft").onclick = () => {
				window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:settings",
						"specify": "changeVisualizerMode",
						"data": "fft"
					}
				}, "*");
				localStorage.setItem("WEBMPS:visualizer", "fft");
			};
			_q("#drawer-visualizer #text-visualizer-fft-f").onclick = () => {
				window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:settings",
						"specify": "changeVisualizerMode",
						"data": "fft-f"
					}
				}, "*");
				localStorage.setItem("WEBMPS:visualizer", "fft-f");
			};
			break;
		};
		case "complete": {
			// When the loading phase is fully finished
			break;
		};
		case "loading": {
			// When the framework is still loading
			break;
		};
	}
}

// Message receiver
addEventListener("message", function (ev) {
	if (window.debugMode) {
		console.info("Message received. Object: %o", ev);
	}
	switch (ev.data.type.split(":")[0].toLowerCase()) {
		case "info": {
			switch (ev.data.type) {
				case "info:gui": {
					switch (ev.data.specify) {
						case "enterSettingsTab": {
							settingSwitchTo(ev.data.data);
						};
					}
				};
			}
			break;
		};
	}
});