// Thread
function refresherThreadFunc() {
	// Save playback info
	if (video.readyState == 4) {
		if (window.CryptoJS) {
			if (CryptoJS.SHA1) {
				let hash = CryptoJS.SHA1(video.currentSrc);
				let item = {
					"currentTime": video.currentTime,
					"currentVolume": audio.volume,
					"offset": config.delay
				}
				if (window.subt) {
					item.subtitle = subt.caption;
				}
				localStorage.setItem("WEBMPF:" + hash, JSON.stringify(item));
			}
		}
	}
	// Subtitle Sync
	if (window.subt) {
		// Will be using elsl.media.subtitles.render
		// But use basic first
		if (window.Subtitles) {
			if (window.subt) {
				subList = subt.currentSub(audio.currentTime);
				let scnt = 0;
				gui.subtitle.innerHTML = "";
				while (scnt < subList.length) {
					while (subList[scnt].text.search("\n") != -1) {
						subList[scnt].text = subList[scnt].text.replace("\n", "<br/>");
					}
					gui.subtitle.innerHTML += subList[scnt].text + "<br/>";
					scnt ++;
				}
				let subSize = Math.round((innerWidth * innerHeight) / 921600 * 24 * 2) / 2;
				if (subSize < 12) {
					subSize = 12;
				}
				gui.subtitle.style.fontSize = subSize.toString() + "px";
			}
		}
	}
	// Show time
	let currentMin = Math.floor(video.currentTime / 60).toString();
	while (currentMin.length < 2) {
		currentMin = "0" + currentMin;
	}
	let currentSec = Math.floor(video.currentTime % 60).toString();
	while (currentSec.length < 2) {
		currentSec = "0" + currentSec;
	}
	gui.timeNow.innerHTML = currentMin + ":" + currentSec + "&#32;&#32;-";
	currentMin = Math.floor(video.duration / 60).toString();
	while (currentMin.length < 2) {
		currentMin = "0" + currentMin;
	}
	currentSec = Math.floor(video.duration % 60).toString();
	while (currentSec.length < 2) {
		currentSec = "0" + currentSec;
	}
	gui.timeAll.innerHTML = "+&#32;&#32;" + currentMin + ":" + currentSec;
	// Show FPS
	fps.last = fps.curr;
	fps.curr = new Date();
	fps.innerHTML = (Math.round(1000 / (timeSt(fps.curr) - timeSt(fps.last)))).toString() + "FPS " + fps.curr.toLocaleDateString();
	let timeArr = [fps.curr.getHours().toString(), fps.curr.getMinutes().toString(), fps.curr.getSeconds().toString()];
	for (let countA = 0; countA < timeArr.length; countA++) {
		if (timeArr[countA].length < 2) {
			timeArr[countA] = "0" + timeArr[countA];
		}
	}
	if (window.subt) {
		gui.time.innerHTML = lang.loadedSub;
	} else {
		gui.time.innerHTML = lang.noSub;
	}
	// Show video playing
	if (video.paused) {
		btn.play.style.display = "";
		btn.pause.style.display = "none";
		if (video.readyState == 4) {
			gui.pio.style.display = "";
		}
		else {
			gui.pio.style.display = "none";
		}
	}
	else {
		btn.play.style.display = "none";
		btn.pause.style.display = "";
		gui.pio.style.display = "none";
	}
	// Timebar
	gui.timeBar.style.width = (innerWidth - 72) + "px";
	gui.timeP.style.width = Math.floor(video.currentTime / video.duration * (innerWidth - 70)) + "px";
	let vcs = video.src.split("/");
	if (info.file) {
		if (video.readyState == 4) {
			gui.title.innerHTML = decodeURI(vcs[vcs.length - 1]);
			gui.loadAni.style.display = "none";
		}
		else if (video.readyState == 3) {
			gui.title.innerHTML = decodeURI(vcs[vcs.length - 1]) + " - " + lang.videoCanNextFrame;
			gui.loadAni.style.display = "";
		}
		else if (video.readyState == 0) {
			gui.title.innerHTML = decodeURI(vcs[vcs.length - 1]) + " - " + lang.noData;
			gui.loadAni.style.display = "none";
		}
		else {
			gui.title.innerHTML = decodeURI(vcs[vcs.length - 1]) + " - " + lang.videoDecoding;
			gui.loadAni.style.display = "";
		}
	}
	// Volume
	if (video.currentTime + config.delay - audio.currentTime > 0.1) {
		if (video.readyState == 4 && audio.readyState == 4) {
			if (video.currentTime + config.delay - audio.currentTime > 0.1) {
				audio.currentTime = video.currentTime + config.delay;
			}
			else {
				audio.currentTime += 0.04;
			}
			gui.status.push(lang.videoSynced + " " + (Math.round((video.currentTime + config.delay - audio.currentTime) * 1000) / 1000).toString());
		}
	}
	else if (video.currentTime + config.delay - audio.currentTime < -0.1) {
		if (video.readyState == 4 && audio.readyState == 4) {
			if (video.currentTime + config.delay - audio.currentTime < -0.1) {
				audio.currentTime = video.currentTime + config.delay;
			}
			else {
				audio.currentTime -= 0.04;
			}
			gui.status.push(lang.videoSynced + " " + (Math.round((video.currentTime + config.delay - audio.currentTime) * 1000) / 1000).toString());
		}
	}
	document.title = "[" + gui.title.innerText + "] WebMP DR28";
	exchangeData = {
		"type": "info:player-core",
		"title": document.title,
		"currentTime": video.currentTime,
		"duration": video.duration
	};
	if (window.info) {
		if (info.src) {
			exchangeData.src = info.src;
		}
		if (info.start) {
			exchangeData.start = info.start;
		}
	}
	window.top.postMessage(exchangeData, "*");
	// Volume icon
	if (audio.volume > 0.6 && audio.muted == false) {
		gui.volume.src = "img/volumeUp.png";
	}
	else if (audio.volume <= 0.6 && audio.muted == false && audio.volume != 0) {
		gui.volume.src = "img/volumeDown.png";
	}
	else {
		gui.volume.src = "img/muted.png";
	}
	if (video.playbackRate % 1 == 0) {
		gui.speed.innerHTML = "x" + video.playbackRate.toString() + ".0";
	}
	else {
		gui.speed.innerHTML = "x" + video.playbackRate.toString();
	}
	gui.volume.show.innerHTML = Math.round(audio.volume * 100) + "%";
	// Battery
	if (window.batteryAPI) {
		if (batteryAPI.charging) {
			battery.style.color = "#0f0";
			battery.innerHTML = Math.round(batteryAPI.level * 100).toString() + "% " + lang.charging;
		}
		else {
			if (batteryAPI.level >= 0.5) {
				battery.style.color = "rgb(" + ((1 - batteryAPI.level) * 510).toString() + ",255,0)";
			}
			else {
				battery.style.color = "rgb(255," + ((batteryAPI.level) * 510).toString() + ",0)";
			}
			battery.innerHTML = Math.round(batteryAPI.level * 100).toString() + "% " + lang.discharging;
		}
	}
}
// Document loader
document.onreadystatechange = function() {
	if (document.readyState.toLowerCase() == "interactive") {
		console.log("WebMP started loading...");
		// Load APIs
		if (window.navigator) {
			if (navigator.getBattery) {
				navigator.getBattery().then(function(value) {
					batteryAPI = value;
					batteryAPI.onlevelchange = function() {
						if (!(this.notified)) {
							if (batteryAPI.level <= 0.2) {
								notify.push("sound/lowBattery.aac");
								gui.status.push(lang.lowBattery)
							}
						}
					}
				});
			}
		}
		// Load elements
		document.body.tabIndex = "-1";
		config = {};
		config.delay = 0;
		video = document.getElementsByTagName("video")[0];
		audio = document.getElementsByTagName("audio")[0];
		let files = document.getElementById("fbtn");
		fps = document.getElementById("FPS");
		btn = {};
		gui = {};
		btn.play = document.getElementById("playbtn");
		btn.pause = document.getElementById("pausebtn");
		gui.title = document.getElementById("title");
		gui.timeNow = document.getElementById("time-now");
		gui.timeAll = document.getElementById("time-all");
		gui.timeBar = document.getElementById("time-bar");
		gui.timeP = document.getElementById("time-played");
		gui.pio = document.getElementById("play-if-ok");
		gui.loadAni = document.getElementById("loading-anime");
		gui.status = document.getElementById("status");
		gui.window = document.getElementById("vid-win");
		gui.volume = document.getElementById("volume");
		gui.volume.show = document.getElementById("volumeshow");
		gui.volume.panel = document.getElementById("volumepanel");
		gui.battery = document.getElementById("battery");
		gui.speed = document.getElementById("speed");
		gui.subfbtn = document.getElementById("subfbtn");
		notify = document.getElementById("notify");
		gui.sub = document.getElementById("sub");
		gui.subtitle = document.getElementById("subtitle");
		gui.time = document.getElementById("time");
		// Load
		video.addEventListener("readystatechange", function() {
			if (this.readyState == 4) {
				if (window.CryptoJS) {
					if (CryptoJS.SHA1) {
						let hash = CryptoJS.SHA1(video.currentSrc);
						let obj = eval("(" + localStorage.getItem("WEBMPF:" + hash) + ")");
						if (obj) {
							if (obj.currentTime) {
								video.currentTime = obj.currentTime;
							}
							if (obj.currentVolume) {
								audio.volume = obj.currentVolume;
							}
							if (obj.offset) {
								config.delay = obj.offset;
							}
							if (obj.subtitle) {
								subt = new Subtitles(obj.subtitle);
							}
						}
					}
				}
			}
		});
		// Subtitles loader
		gui.sub.onclick = function() {
			gui.subfbtn.click();
		}
		gui.subfbtn.oninput = function() {
			let file = this.files[0];
			if (file.name) {
				let fileRead = new FileReader();
				fileRead.onloadend = function() {
					if (this.error) {
						notify.push("sound/error.aac");
						gui.status.push(lang.subReadError);
					}
					else {
						subt = new Subtitles(this.result);
						subt.import.srt();
						console.log(subt);
					}
				}
				fileRead.readAsText(file);
			}
		}
		// Notification sounds
		notify.push = function(sound) {
			this.src = sound;
			this.autoplay = true;
			this.play();
		}
		// Volume panel
		gui.volume.show.onclick = function() {
			if (gui.volume.panel.style.display == "none") {
				gui.volume.panel.style.display = "";
				shift = window.shift || 0;
			}
			else {
				gui.volume.panel.style.display = "none";
			}
		}
		// Click to seek
		gui.timeNow.onclick = function() {
			if (video.currentTime >= 10) {
				video.currentTime -= 10;
			}
			else if (video.currentTime == 0) {
				gui.status.push(lang.alreadyHead);
			}
			else {
				video.currentTime = 0;
			}
		};
		gui.timeAll.onclick = function() {
			if (video.currentTime <= video.duration - 10) {
				video.currentTime += 10;
			}
			else if (video.currentTime == video.duration) {
				gui.status.push(lang.alreadyEnd);
				notify.push("sound/error.aac");
			}
			else {
				video.currentTime = video.duration;
			}
		};
		// Volume control
		gui.volume.onclick = function() {
			audio.muted = !(audio.muted);
		}
		// On push
		gui.status.push = function(text) {
			if (this.lastNumber) {
				clearTimeout(this.lastNumber);
			}
			this.innerHTML = text;
			document.body.click();
			this.lastNumber = setTimeout(function() {
				gui.status.innerHTML = "";
				gui.lastNumber = null;
			}, 3000);
		}
		// Test if loaded modulized or independantly
		if (window.top != window) {
			gui.status.push(lang.loadedCore);
		}
		// On resize
		window.onresize = function() {
			gui.loadAni.style.top = (innerHeight / 2 - 36) + "px";
			gui.loadAni.style.left = (innerWidth / 2 - 36) + "px";
		}
		gui.loadAni.style.top = (innerHeight / 2 - 36) + "px";
		gui.loadAni.style.left = (innerWidth / 2 - 36) + "px";
		// Pre FPS announce
		fps.last = new Date();
		fps.curr = new Date();
		// Load refresher
		refresherThread = setInterval(refresherThreadFunc, 20);
		// Load media
		if (window.TabSearch) {
			info = TabSearch(location.search);
			if (info.file) {
				video.src = info.file;
				video.volume = 0;
				audio.src = info.file;
			}
			if (info.start) {
				video.currentTime = parseFloat(info.start);
				audio.currentTime = parseFloat(info.start);
			}
			else {
				gui.title.innerHTML = lang.noArgs;
			}
		}
		// Load buttons
		btn.play.onmouseup = function() {
			video.play();
			audio.play();
		}
		btn.pause.onmouseup = function() {
			video.pause();
			audio.pause();
		}
		gui.pio.onmouseup = function() {
			video.play();
			audio.play();
		}
		// Smart resource
		document.body.onblur = function() {
			clearInterval(refresherThread);
			refresherThread = setInterval(refresherThreadFunc, 1000);
			console.log(lang.resourceSlowed);
			document.body.onfocus = function() {
				clearInterval(refresherThread);
				refresherThread = setInterval(refresherThreadFunc, 20);
				console.log(lang.resourceRegained);
			}
		}
		// Load progress
		document.body.onmousedown = function() {
			config.mouse = true;
		}
		document.body.onmouseup = function() {
			config.mouse = false;
		}
		gui.timeBar.addEventListener("mousedown", function(e) {
			config.lastPause = config.lastPause || video.paused;
			video.pause();
			audio.pause();
			let offset = parseInt(getComputedStyle(gui.timeBar).left);
			let overall = parseInt(getComputedStyle(gui.timeBar).width);
			let percent = (e.clientX - offset) / overall;
			video.currentTime = percent * video.duration;
			audio.currentTime = percent * audio.duration;
		}, true);
		gui.timeBar.addEventListener("mouseup", function() {
			if (config.lastPause == false) {
				video.play();
				audio.play();
			}
			config.lastPause = null;
		}, true);
		gui.timeBar.addEventListener("mousemove", function(e) {
			if (config.mouse) {
				let offset = parseInt(getComputedStyle(gui.timeBar).left);
				let overall = parseInt(getComputedStyle(gui.timeBar).width);
				let percent = (e.clientX - offset) / overall;
				video.currentTime = percent * video.duration;
				audio.currentTime = percent * audio.duration;
			}
		}, true);
		// Auto fader
		document.body.addEventListener("mousemove", function() {
			document.getElementById("bottom").style.display = "";
			document.getElementById("vid-mask").style.cursor = "default";
			if (window.lastMove) {
				clearTimeout(lastMove);
			}
			lastMove = setTimeout(function() {
				document.getElementById("bottom").style.display = "none";
				document.getElementById("vid-mask").style.cursor = "none";
			}, 4000);
		});
		document.body.addEventListener("click", function() {
			document.getElementById("bottom").style.display = "";
			if (window.lastMove) {
				clearTimeout(lastMove);
			}
			lastMove = setTimeout(function() {
				document.getElementById("bottom").style.display = "none";
			}, 4000);
		});
		// Key responder
		document.body.onkeydown = function(e) {
			console.log(e.which);
			switch (e.which) {
				case 32:
					// Space
					if (video.paused) {
						video.play();
						audio.play();
					}
					else {
						video.pause();
						audio.pause();
					}
					break;
				case 13:
					// Enter
					gui.status.push(lang.useFs);
					notify.push("sound/notify.aac")
					break;
				case 37:
					// Left arrow
					gui.timeNow.click();
					break;
				case 38:
					// Up arrow
					document.getElementById("volume-btn-plus").click();
					break;
				case 39:
					// Right arrow
					gui.timeAll.click();
					break;
				case 40:
					// Down arrow
					document.getElementById("volume-btn-minus").click();
					break;
				case 79:
					// O key
					if (e.ctrlKey) {
						gui.subfbtn.click();
						break;
					}
			}
		}
		// Alternative menu
		document.oncontextmenu = function() {
			return false;
		}
	}
}
// Volume public method
function volume(action) {
	if (action == 2) {
		if (audio.volume < 0.9) {
			audio.volume = (parseInt(gui.volume.show.innerHTML) + 1) / 100;
		}
		else {
			audio.volume = 1;
		}
	}
	else if (action == 1) {
		if (audio.volume > 0.1) {
			audio.volume = (parseInt(gui.volume.show.innerHTML) - 1) / 100;
		}
		else {
			audio.volume = 0;
			notify.push("sound/error.aac")
		}
	}
	else if (action == 3) {
		if (video.playbackRate - 0.5 < 0.1) {
			video.playbackRate = 0.5;
			audio.playbackRate = video.playbackRate;
		}
		else {
			video.playbackRate = (Math.round(video.playbackRate * 10) - 1) / 10;
			audio.playbackRate = video.playbackRate;
		}
	}
	else if (action == 4) {
		if (2 - video.playbackRate < 0.1) {
			video.playbackRate = 2;
			audio.playbackRate = video.playbackRate;
		}
		else {
			video.playbackRate = (Math.round(video.playbackRate * 10) + 1) / 10;
			audio.playbackRate = video.playbackRate;
		}
	}
}
shift = 0;
//Subtitles
//Used elsl.media.subtitles
//Supporter
timeSt = function(time) {
	if (time.constructor == Date) {
		let month = time.getMonth();
		let year = time.getFullYear();
		let timestamp = time.getMilliseconds() + time.getSeconds() * 1000 + time.getMinutes() * 60000 + time.getHours() * 3600000 + time.getDate() * 86400000 + time.getMonth() * 2592000000;
		if (month > 2) {
			if (year % 4 == 0) {
				if (year % 400 == 0) {
					timestamp += 86400000;
				}
				else if (year % 100 != 0) {
					timestamp += 86400000;
				}
			}
			if (month >= 11) {
				timestamp += 345600000;
			}
			else if (month >= 9) {
				timestamp += 259200000;
			}
			else if (month == 8) {
				timestamp += 172800000;
			}
			else if (month >= 6) {
				timestamp += 86400000;
			}
			else if (month == 3) {
				timestamp -= 86400000;
			}
		}
		else if (month == 2) {
			timestamp += 86400000;
		}
		return timestamp;
	}
}
// Language
if (window.navigator) {
	if (window.navigator.language) {
		switch (navigator.language.toLowerCase()) {
			case "zh":
			case "zh-hans":
			case "zh-cn":
				console.log("Language: 简体中文");
				lang = {
					"noArgs": "文件未指定",
					"resourceSlowed": "已智能释放资源",
					"resourceRegained": "资源已重载",
					"videoDecoding": "媒体解码中……",
					"noData": "无数据",
					"videoCanNextFrame": "即将就绪",
					"videoSynced": "视音频尝试同步",
					"useFs": "请使用 F11 全屏",
					"alreadyEnd": "已经到了末尾了",
					"alreadyHead": "已经到了最开始了",
					"charging": "电源已连接",
					"discharging": "剩余电量",
					"lowBattery": "电池电量过低！",
					"noSub": " (无字幕)",
					"loadedCore": "已经作为核心加载",
					"loadedSub": "(字幕已加载)"
				}
				break;
			case "zh-tw":
			case "zh-hant":
			case "zh-hk":
				console.log("Language: 正體中文");
				lang = {
					"noArgs": "檔案未指定",
					"resourceSlowed": "已減少資源用量",
					"resourceRegained": "檔案已重載",
					"videoDecoding": "檔案讀取中……",
					"noData": "無數據",
					"videoCanNextFrame": "即將就緒",
					"videoSynced": "音畫試圖同步",
					"useFs": "請使用 F11 進入滿屏",
					"alreadyEnd": "檔案已播放完畢",
					"alreadyHead": "檔案已至頭部",
					"charging": "正在充電",
					"discharging": "剩餘電量",
					"lowBattery": "電池電量太低啦！",
					"noSub": " (無字幕)",
					"loadedCore": "已經作為核心裝載",
					"loadedSub": "(字幕已裝載)"
				}
			default:
				console.log("Language: English");
				lang = {
					"noArgs": "File not set",
					"resourceSlowed": "Slowed down refreshing.",
					"resourceRegained": "Refreshing sped up.",
					"videoDecoding": "Decoding media...",
					"noData": "No data",
					"videoCanNextFrame": "Almost ready",
					"videoSynced": "AV synced.",
					"useFs": "Use F11 to enter fullscreen.",
					"alreadyEnd": "Media has already ended.",
					"alreadyHead": "Media has already gone to the head.",
					"charging": "Charging",
					"discharging": "left",
					"lowBattery": "Battery too low!",
					"noSub": " (No Subtitles)",
					"loadedCore": "Loaded as core",
					"loadedSub": "(CC)"
				}
		}
	}
}