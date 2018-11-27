// Message
addEventListener("message", function(e) {
	switch (e.data.type) {
		case "info:gui": {
			switch (e.data.specify) {
				case "playBlobMedia": {
					loadBlobMedia(e.data.data);
					break;
				};
				case "playURLMedia": {
					loadURLMedia(e.data.data);
					break;
				};
			};
			break;
		};
		case "info:settings": {
			switch (e.data.specify) {
				case "changeVisualizerMode": {
					visualizerMode = e.data.data;
					break;
				};
			};
		};
	};
});
// Data saving thread
function dataSaverThreadFunc() {
	// Save playback info
	if (video.readyState == 4) {
		if (window.CryptoJS) {
			if (CryptoJS.SHA1) {
				let hash = "";
				if (info.file) {
					hash = CryptoJS.SHA1(video.currentSrc);
				} else if (blobMedia) {
					hash = CryptoJS.SHA1(blobMedia.name);
				}
				let item = {
					"currentTime": video.currentTime,
					"currentVolume": audio.volume,
					"offset": config.delay,
					"currentPlaybackRate": audio.playbackRate,
					"mediaInfo": {
						"mediaName": gui.title.innerHTML,
						"mediaDuration": audio.duration
					}
				}
				if (window.subt) {
					item.subtitle = subt.text;
				}
				if (window.mediaMode == "B") {
					item.origin = blobURL;
					item.mediaType = blobMedia.type;
				} else if (window.mediaMode == "S") {
					item.origin = video.currentSrc;
				}
				if (video.videoHeight * video.videoWidth > 0) {
					item.mediaInfo.frameWidth = video.videoWidth;
					item.mediaInfo.frameHeight = video.videoHeight;
				}
				localStorage.setItem("WEBMPF:" + hash, JSON.stringify(item));
			}
		}
	}
}
// Refresher thread
function refresherThreadFunc() {
	// Subtitle Sync
	if (window.subt) {
		// Will be using elsl.media.subtitles.render
		// But use basic first
		if (window.Subtitles) {
			if (window.subt) {
				subList = subt.currentSub(audio.currentTime);
				let scnt = 0;
				let subContent = "";
				while (scnt < subList.length) {
					while (subList[scnt].text.search("\n") != -1) {
						subList[scnt].text = subList[scnt].text.replace("\n", "<br/>");
					}
					subContent += "<span>" + subList[scnt].text + "</span><br/>";
					scnt ++;
				}
				gui.subtitle.innerHTML = subContent;
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
	gui.timeNow.innerHTML = "&#32;&#32;&lt;--" + currentMin + ":" + currentSec;
	currentMin = Math.floor(video.duration / 60).toString();
	while (currentMin.length < 2) {
		currentMin = "0" + currentMin;
	}
	currentSec = Math.floor(video.duration % 60).toString();
	while (currentSec.length < 2) {
		currentSec = "0" + currentSec;
	}
	gui.timeAll.innerHTML = currentMin + ":" + currentSec + "--&gt;&#32;&#32;";
	// Show FPS
	fps.last = fps.curr;
	fps.curr = new Date();
	fps.innerHTML = (Math.round(1000 / (timeSt(fps.curr) - timeSt(fps.last)))).toString() + "FPS";
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
	vcs = video.src.split("/");
	if (info.file) {
		mediaMode = "S";
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
	} else if (window.blobMedia) {
		mediaMode = "B";
		if (video.readyState == 4) {
			gui.title.innerHTML = blobMedia.name;
			gui.loadAni.style.display = "none";
		}
		else if (video.readyState == 3) {
			gui.title.innerHTML = blobMedia.name + " - " + lang.videoCanNextFrame;
			gui.loadAni.style.display = "";
		}
		else if (video.readyState == 0) {
			gui.title.innerHTML = blobMedia.name + " - " + lang.noData;
			gui.loadAni.style.display = "none";
		}
		else {
			gui.title.innerHTML = blobMedia.name + " - " + lang.videoDecoding;
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
	window.parent.postMessage(exchangeData, "*");
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
			battery.innerHTML = "<span style=\"color:#fff;\">[" + mediaMode + "] </span>" + Math.round(batteryAPI.level * 100).toString() + "% " + lang.charging;
		}
		else {
			if (batteryAPI.level >= 0.5) {
				battery.style.color = "rgb(" + ((1 - batteryAPI.level) * 510).toString() + ",255,0)";
			}
			else {
				battery.style.color = "rgb(255," + ((batteryAPI.level) * 510).toString() + ",0)";
			}
			battery.innerHTML = "<span style=\"color:#fff;\">[" + mediaMode + "] </span>" + Math.round(batteryAPI.level * 100).toString() + "% " + lang.discharging;
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
		inactive = false;
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
		volumeBtnDown = document.getElementById("volume-btn-minus");
		volumeBtnUp = document.getElementById("volume-btn-plus");
		gui.canvas = document.getElementById("audio-visualizer");
		gui.canvas.width = gui.canvas.clientWidth;
		gui.canvas.height = gui.canvas.clientHeight;
		gui.vidMask = document.getElementById("vid-mask");
		gui.ctx = gui.canvas.getContext("2d");
		mediaMode = "S";
		// Force zero volume
		video.muted = true;
		// Default visualizer
		visualizerMode = "empty";
		visualizerModeList = ["empty", "osc-xy", "fft", "osc"];
		// Data saving thread
		dataSaverThread = setInterval(dataSaverThreadFunc, 500);
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
		// Show playback settings
		gui.vidMask.oncontextmenu = function () {
			window.parent.postMessage({
				"type": "jump:settings",
				"specify": "originalFrame",
				"data": "player-core"
			}, "*");
			window.parent.postMessage({
				"type": "forward:settings",
				"specify": "player-core",
				"data": {
					"type": "info:gui",
					"specify": "enterSettingsTab",
					"data": "playback"
				}
			}, "*");
			
			return false;
		}
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
		gui.volume.show.onmousedown = function () {
			shift = 0;
		}
		gui.speed.onclick = gui.volume.show.onclick;
		gui.speed.onmousedown = function () {
			shift = 2;
		};
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
			gui.canvas.width = innerWidth;
			gui.canvas.height = innerHeight;
		}
		gui.loadAni.style.top = (innerHeight / 2 - 36) + "px";
		gui.loadAni.style.left = (innerWidth / 2 - 36) + "px";
		// Pre FPS announce
		fps.last = new Date();
		fps.curr = new Date();
		// Load refresher
		refresherThread = setInterval(refresherThreadFunc, 33.3);
		visualizerThread = setInterval(audioVisualizer, 12.5);
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
			//clearInterval(visualizerThread);
			refresherThread = setInterval(refresherThreadFunc, 1000);
			console.log(lang.resourceSlowed);
			window.inactive = true;
			document.body.onfocus = function() {
				window.inactive = false;
				clearInterval(refresherThread);
				refresherThread = setInterval(refresherThreadFunc, 33.3);
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
					volume(2 + shift);
					break;
				case 39:
					// Right arrow
					gui.timeAll.click();
					break;
				case 40:
					// Down arrow
					volume(1 + shift);
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
		// Dragging
		document.body.addEventListener("dragenter", function (e) {
			e.preventDefault();
			e.stopPropagation();
		}, true);
		document.body.addEventListener("dragover", function (e) {
			e.preventDefault();
			e.stopPropagation();
		}, true);
		document.body.addEventListener("dragleave", function (e) {
			e.preventDefault();
			e.stopPropagation();
		}, true);
		document.body.addEventListener("drop", function (e) {
			e.preventDefault();
			e.stopPropagation();
			let count = 0;
			let df = e.dataTransfer;
			loadBlobMedia(df.files);
		}, true);
		// Inform history
		window.parent.postMessage({
			"type": "ready:player-core",
			"specify": "requireBasic"
		}, "*");
	}
}
// Volume public method
function volume(action) {
	if (action == 2) {
		if (audio.volume < 0.99) {
			audio.volume = (parseInt(gui.volume.show.innerHTML) + 1) / 100;
		}
		else {
			audio.volume = 1;
		}
	}
	else if (action == 1) {
		if (audio.volume > 0.01) {
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
// Load Blob Media
function loadBlobMedia(files) {
	video.pause();
	audio.pause();
	info.file = null;
	let count = 0;
	while (count <files.length) {
		console.info(files[count]);
		if (files[count].type.indexOf("video") == 0 || files[count].type.indexOf("audio") == 0) {
			if (window.blobURL) {
				// Clear previous blob
				URL.revokeObjectURL(blobURL);
				window.blobURL = undefined;
			}
			blobMedia = files[count];
			blobURL = URL.createObjectURL(blobMedia);
			vcs = [blobMedia.name];
			video.src = blobURL;
			audio.src = blobURL;
			analyzeAudio();
		} else if (files[count].type == "") {
			let fileName = files[count].name;
			switch (fileName.split(".")[fileName.split(".").length - 1].toLowerCase()) {
				case "srt": {
					let fileRead = new FileReader();
					fileRead.onloadend = function () {
						if (this.error) {
							notify.push("sound/error.aac");
							gui.status.push(lang.subReadError);
						}
						else {
							subt = new Subtitles(this.result);
							subt.import.srt();
							console.log(subt);
						}
					};
					fileRead.readAsText(files[count]);
					break;
				}
			}
		}
		count ++;
	}
}
// Load URL Media
function loadURLMedia(url, name = lang.defaultTitle) {
	if (window.blobURL) {
		// Clear previous blob
		URL.revokeObjectURL(blobURL);
		window.blobURL = undefined;
		window.blobMedia = undefined;
	}
	info.file = null;
	URLMediaRequest = new XMLHttpRequest();
	URLMediaRequest.responseType = "blob";
	URLMediaRequest.open("GET", url, true);
	URLMediaRequest.already = false;
	URLMediaRequest.onreadystatechange = function () {
		if (this.readyState == 4) {
			if (window.blobURL) {
				// Clear previous blob
				URL.revokeObjectURL(blobURL);
				window.blobURL = undefined;
				window.blobMedia = undefined;
			}
			blobMedia = this.response;
			if (blobMedia != null) {
				mediaMode = "B";
				blobMedia.name = name;
				blobURL = URL.createObjectURL(blobMedia);
				video.src = blobURL;
				audio.src = blobURL;
				analyzeAudio();
			};
		}
	};
	URLMediaRequest.onprogress = function () {
		if (window.blobURL) {
			// Clear previous blob
			URL.revokeObjectURL(blobURL);
			window.blobURL = undefined;
			window.blobMedia = undefined;
		}
		blobMedia = new Blob();
		blobMedia.name = lang.loadingBlob;
		blobURL = URL.createObjectURL(blobMedia);
		mediaMode = "B";
		video.src = blobURL;
		audio.src = blobURL;
	}
	URLMediaRequest.onerror = function () {
		video.src = url;
		audio.src = url;
		info.file = url;
		mediaMode = "S";
		vcs = url.split("/");
		analyzeAudio();
	};
	URLMediaRequest.send();
}
// Audio
analyzeAudio = function () {
	if (!(window.audioConnected)) {
		audioCxt = new AudioContext();
		audioMedia = audioCxt.createMediaElementSource(audio);
		audioSP = audioCxt.createScriptProcessor(512, audioMedia.channelCount, audioMedia.channelCount);
		audioMedia.connect(audioSP);
		audioSP.connect(audioCxt.destination);
		audioAnl = audioCxt.createAnalyser();
		audioChannels = audioCxt.createChannelSplitter(audioMedia.channelCount);
		audioMedia.connect(audioAnl);
		audioConnected = true;
	}
	visualizer = {};
	visualizerLastFrame = timeSt(new Date);
	visualizerCurrentFrame = timeSt(new Date);
	audioSP.onaudioprocess = function (e) {
		input = [];
		output = [];
		for (let za = 0; za < audioMedia.channelCount; za ++)  {
			input[za] = e.inputBuffer.getChannelData(za);
			output[za] = e.outputBuffer.getChannelData(za);
			for (let zb = 0; zb < input[za].length; zb ++) {
				output[za][zb] = input[za][zb];
			}
		}
	}
}
// Audio Visualizer
function audioVisualizer () {
	if (!(window.inactive)) {
		switch (visualizerMode.toLowerCase()) {
			case "osc-xy": {
				if (gui.canvas && video.videoHeight * video.videoWidth < 16 && audio.paused == false) {
					canvasCleared = false;
					gui.ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
					gui.ctx.fillRect(0, 0, gui.canvas.width, gui.canvas.height);
					gui.ctx.fillStyle = "#ff0";
					if (window.audioCxt) {
						let oscilloArea = 0;
						if (gui.canvas.width > gui.canvas.height) {
							oscilloArea = gui.canvas.height;
						} else {
							oscilloArea = gui.canvas.width;
						}
						if (audioMedia.channelCount > 1) {
							let jumpSample = 1;
							for (let zc = 1; zc < 512 / jumpSample; zc ++) {
								let lineTransparency = 0;
								let lineThreshold = 0.1 * jumpSample;
								let lineLength = Math.sqrt(((input[0][zc * jumpSample] - input[0][zc-1]) / audio.volume) ** 2 + ((input[1][zc] - input[1][(zc-1) * jumpSample]) / audio.volume) ** 2);
								if (lineLength < lineThreshold) {
									lineTransparency = (-1) * lineLength / lineThreshold + 1;
								}
								gui.ctx.strokeStyle = "rgba(255,255,0,"+ lineTransparency + ")";
								gui.ctx.beginPath();
								gui.ctx.moveTo((-1) * input[0][(zc-1) * jumpSample] * oscilloArea * 0.9 / audio.volume + gui.canvas.width / 2, input[1][(zc-1) * jumpSample] * oscilloArea * 0.9 / audio.volume + gui.canvas.height / 2);
								gui.ctx.lineTo((-1) * input[0][zc * jumpSample] * oscilloArea * 0.9 / audio.volume + gui.canvas.width / 2, input[1][zc * jumpSample] * oscilloArea * 0.9 / audio.volume + gui.canvas.height / 2);
								gui.ctx.stroke();
							}
						}
					}
				}
				break;
			};
			case "empty": {
				if (gui.canvas && !(window.canvasCleared)) {
					gui.ctx.clearRect(0, 0, gui.canvas.width, gui.canvas.height);
					canvasCleared = true;
				}
				break;
			};
			case "fft": {
				if (gui.canvas && video.videoHeight * video.videoWidth < 16 && audio.paused == false) {
					canvasCleared = false;
					gui.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
					gui.ctx.clearRect(0, 0, gui.canvas.width, gui.canvas.height);
					audioFloatData = new Uint8Array(audioAnl.frequencyBinCount);
					audioAnl.getByteFrequencyData(audioFloatData);
					frequencyDivision = 2 ** Math.floor(Math.log2(gui.canvas.width / 8));
					frequencyWidth = 1024 / frequencyDivision;
					barWidth = gui.canvas.width / frequencyDivision;
					shrunkAudioData = [];
					for (let ze = 0; ze < frequencyDivision; ze ++) {
						shrunkAudioData[shrunkAudioData.length] = Math.round(Math.max(...Array.from(audioFloatData.slice(frequencyWidth * ze, frequencyWidth * (ze + 1) - 1))) / 255 * 1000) / 1000;
					}
					shrunkAudioData.forEach((e, i) => {
						gui.ctx.fillStyle = "#ff0";
						gui.ctx.fillRect(i * barWidth, gui.canvas.height * (1 - shrunkAudioData[i]), barWidth, gui.canvas.height * shrunkAudioData[i]);
					});
					gui.ctx.font = "16px Verdana";
					gui.ctx.textAlign = "end";
					gui.ctx.fillText("FW:" + frequencyWidth.toString(), gui.canvas.width - 1, 36);
				}
			}
		}
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
					"noSub": " (<font color=\"#f00\">字幕</font>)",
					"loadedCore": "已经作为核心加载",
					"loadedSub": "(<font color=\"#0f0\">字幕</font>)",
					"defaultTitle": "无标题媒体",
					"loadingBlob": "获取网络资源中",
					"audioVisualizerStarted": "音频可视化模块已启动",
					"choose2dVisualizer": "请选择2D可视化效果"
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
					"noSub": " (<font color=\"#f00\">字幕</font>)",
					"loadedCore": "已經作為核心裝載",
					"loadedSub": "(<font color=\"#0f0\">字幕</font>)",
					"defaultTitle": "無標題檔案",
					"loadingBlob": "獲取網路檔案中",
					"audioVisualizerStarted": "音聲可視化模塊已裝載",
					"choose2dVisualizer": "請選擇2D可視化效果"
				};
				break;
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
					"noSub": " (<font color=\"#f00\">CC</font>)",
					"loadedCore": "Loaded as core",
					"loadedSub": "(<font color=\"#0f0\">CC</font>)",
					"defaultTitle": "Unknown media",
					"loadingBlob": "Fetching online content",
					"audioVisualizerStarted": "Started audio visualizer",
					"choose2dVisualizer": "Please choose a 2D visualizer"
				}
		}
	}
}