// Resize window
wmpResizeWindow = function () {
	if (innerWidth >= innerHeight) {
		wmpMenuBar.style.width = "48px";
		wmpMenuBar.style.height = "";
		wmpDisplay.style.width = (innerWidth - 48).toString() + "px";
		wmpDisplay.style.height = "";
	} else {
		wmpMenuBar.style.width = "";
		wmpMenuBar.style.height = "48px";
		wmpDisplay.style.width = "";
		wmpDisplay.style.height = (innerHeight - 48).toString() + "px";
	}
}
// Hide tabs
hideAllTabs = function () {
	let count = 0;
	let target = wmpDisplay.getElementsByTagName("iframe");
	while (count < target.length) {
		target[count].style.display = "none";
		count++;
	};
	wmpPlayerCore.style.display = "";
	wmpPlayerCore.style.filter = "blur(2px)";
}
// Full screen
function toggleFullScreen() {
	let fullScreenElement = document.webkitFullscreenElement || document.mozFullscreenElement || document.fullscreenElement;
	if (fullScreenElement) {
		if (document.mozExitFullscreen) {
			document.mozExitFullscreen();
		} else {
			document.webkitExitFullscreen();
		};
	} else {
		if (document.body.webkitRequestFullscreen) {
			document.body.webkitRequestFullscreen();
		} else {
			document.body.mozRequestFullscreen();
		};
	};
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js').then(function() {
		console.log("Service Worker Registered"); 
	});
}

// Load document
document.addEventListener("readystatechange", function () {
	if (this.readyState.toLowerCase() == "interactive") {
		// Load elements
		wmpMenuBar = document.getElementById("menubar");
		wmpMenuBar.btnList = Array.from(wmpMenuBar.getElementsByTagName("div"));
		wmpDisplay = document.getElementById("display");
		wmpPlayerCore = document.getElementById("player-core");
		wmpSettingsTab = document.getElementById("settings-tab");
		wmpPlaylistTab = document.getElementById("playlist-tab");
		window.onresize = wmpResizeWindow;
		wmpResizeWindow();
		// Receive data
		addEventListener("message", function (ev) {
			granted = true;
			switch (ev.data.type.split(":")[0]) {
				case "info": {
					switch (ev.data.type) {
						case "info:player-core": {
							granted = false;
							coreData = ev.data;
							document.title = coreData.title;
							if (coreData.media) {
								wmpPlaylistTab.contentWindow.postMessage({
									"specify": "nowPlayingMedia",
									"data": coreData.media
								}, "*");
							};
						};
						default: {
						}
					}
					break;
				};
				case "forward": {
					switch (ev.data.type) {
						case "forward:player-core": {
							wmpPlayerCore.contentWindow.postMessage(ev.data.data, "*");
							break;
						};
						case "forward:settings": {
							wmpSettingsTab.contentWindow.postMessage(ev.data.data, "*");
							break;
						};
						case "forward:playlist": {
							wmpPlaylistTab.contentWindow.postMessage(ev.data.data, "*");
							break;
						};
					}
					break;
				};
				case "jump": {
					let count = 0;
					while (count < wmpMenuBar.btnList.length) {
						wmpMenuBar.btnList[count].className = "tab-item";
						count++;
					};
					switch (ev.data.type) {
						case "jump:settings": {
							hideAllTabs();
							wmpMenuBar.btnList[3].className = "tab-item-active";
							document.getElementById("settings-tab").style.display = "";
						};
					}
					break;
				};
				case "output": {
					window.open("data:text/csv," + encodeURIComponent(ev.data.data));
					break;
				};
				case "ready": {
					switch (ev.data.type) {
						case "ready:player-core": {
							if (ev.data.specify == "requireBasic") {
								let visualizerSetup = localStorage.getItem("WEBMPS:visualizer");
								if (new Boolean(visualizerSetup)) {
									wmpPlayerCore.contentWindow.postMessage({
										"type": "info:settings",
										"specify": "changeVisualizerMode",
										"data": visualizerSetup.toLowerCase()
									}, "*");
									console.warn("Visualizer: " + visualizerSetup);
								} else {
									console.info("No visualizer set.");
								}
							}
							break;
						}
					};
					break;
				};
				case "fullSc": {
					toggleFullScreen();
					break;
				};
			}
			if (window.debugMode && window.granted) {
				console.info(ev.data);
			}
		});
		// Actions for items
		let wmpMenuBarCount = 0;
		while (wmpMenuBarCount < wmpMenuBar.btnList.length) {
			wmpMenuBar.btnList[wmpMenuBarCount].addEventListener("mouseup", function () {
				let count = 0;
				while (count < wmpMenuBar.btnList.length) {
					wmpMenuBar.btnList[count].className = "tab-item";
					count++;
				};
				this.className = "tab-item-active";
			});
			wmpMenuBarCount++;
		}
		wmpMenuBar.btnList[0].addEventListener("mouseup", function () {
			hideAllTabs();
			document.getElementById("start-tab").style.display = "";
		});
		wmpMenuBar.btnList[2].addEventListener("mouseup", function () {
			hideAllTabs();
			document.getElementById("playlist-tab").style.display = "";
		});
		wmpMenuBar.btnList[3].addEventListener("mouseup", function () {
			hideAllTabs();
			document.getElementById("settings-tab").style.display = "";
		});
		wmpMenuBar.btnList[1].addEventListener("mouseup", function () {
			hideAllTabs();
			wmpPlayerCore.style.filter = "";
		});
		wmpMenuBar.btnList[1].addEventListener("contextmenu", function () {
			toggleFullScreen();
		});
		// Pass information to core
		// Pass search queries
		if (window.TabSearch) {
			let wmpPassParam = TabSearch(location.search);
			let wmpPlayerCorePath = "core.htm?";
			if (wmpPassParam.file) {
				wmpPlayerCorePath += "file=" + wmpPassParam.file;
			}
			if (wmpPassParam.start) {
				if (wmpPlayerCorePath != "core.htm?") {
					wmpPlayerCorePath += "&";
				}
				wmpPlayerCorePath += "start=" + wmpPassParam.start;
			}
			if (JSON.stringify(wmpPassParam) != "{\"\":\"undefined\"}") {
				wmpPlayerCore.src = wmpPlayerCorePath;
			}
		}
		// Pass file info
		document.body.addEventListener("dragenter", function (e) {
			wmpPlayerCore.style.display = "none";
			e.preventDefault();
			e.stopPropagation();
		}, true);
		document.body.addEventListener("dragover", function (e) {
			e.preventDefault();
			e.stopPropagation();
		}, true);
		document.body.addEventListener("dragleave", function (e) {
			wmpPlayerCore.style.display = "";
			e.preventDefault();
			e.stopPropagation();
		}, true);
		document.body.addEventListener("drop", function (e) {
			wmpPlayerCore.style.display = "";
			e.preventDefault();
			e.stopPropagation();
			let count = 0;
			let df = e.dataTransfer;
			wmpPlayerCore.contentWindow.postMessage({
				"type": "info:gui",
				"specify": "playBlobMedia",
				"data": df.files
			}, "*");
		}, true);
		// Disable all menu queries
		document.oncontextmenu = () => {
			return false;
		};
	}
});