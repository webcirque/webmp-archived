// Constants
const fpsRange = [60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10];

// Message
addEventListener("message", function(e) {
	switch (e.data.type) {
		case "info:gui": {
			switch (e.data.specify) {
				case "playBlobMedia": {
					if (blobMedia.name == e.data.data.name && blobMedia.size == e.data.data.size && blobMedia.type == e.data.data.type) {
						video.play();
						audio.play();
					} else {
						loadBlobMedia([e.data.data], true, true);
					}
					break;
				};
				case "playURLMedia": {
					loadURLMedia(e.data.data);
					break;
				};
				case "controlPlay": {
					video.play();
					audio.play();
					break;
				};
				case "controlPause": {
					video.pause();
					audio.pause();
					break;
				}
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
	if (window.debugMode) {
		console.info(e.data);
	}
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
					"currentVolume": audioGain.gain.value,
					"offset": config.delay,
					"currentPlaybackRate": audio.playbackRate,
					"mediaInfo": {
						"mediaName": gui.title.innerHTML,
						"mediaDuration": audio.duration
					}
				}
				if (window.subt) {
					item.subtitle = subt.text;
					item.subtitleType = subt.type;
				}
				if (window.mediaMode == "B") {
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
// Audio Panel thread
function audioPanelThreadFunc() {
	// Update the audio panel
	if (window.audioMS) {
		gui.connectMic.style.display = "none";
	} else {
		gui.connectMic.style.display = "";
	};
	if (!(window.audioPublicUsing)) {
		let a = 0;
		switch (activeTileId) {
			case "audio-menu-volume": {
				a = audioGain.gain.value;
				break;
			};
			case "audio-menu-playback": {
				a = audio.playbackRate;
				break;
			};
			case "audio-menu-dyncompr": {
				a = audioDC.threshold.value;
				break;
			};
			case "audio-menu-mic": {
				a = audioMSGain.gain.value;
				break;
			};
			case "audio-menu-eqstart": {
				a = audioEQArray[0].gain.value
				break;
			};
			case "audio-menu-eqbass": {
				a = audioEQArray[1].gain.value
				break;
			};
			case "audio-menu-eqvocal": {
				a = audioEQArray[2].gain.value
				break;
			};
			case "audio-menu-eqtreble": {
				a = audioEQArray[3].gain.value
				break;
			};
			case "audio-menu-eqstop": {
				a = audioEQArray[4].gain.value
				break;
			};
		}
		gui.audioMenuPublic.value = a;
	}
	gui.audioMenuPublic.onmousedown = () => {
		audioPublicUsing = true;
	};
	gui.audioMenuPublic.onmouseup = () => {
		audioPublicUsing = false;
	};
	gui.audioMenuNodes.forEach((e) => {
		e.innerHTML = lang.audioMenuStrings[e.id];
		let extraContent = "";
		switch (e.id) {
			case "audio-menu-volume": {
				extraContent = Math.round(audioGain.gain.value * 100).toString() + "%";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioGain.gain.value;
					gui.audioMenuPublic.step = "0.01";
					gui.audioMenuPublic.max = "2";
					gui.audioMenuPublic.min = "0";
					gui.audioMenuPublic.oninput = function () {
						audioGain.gain.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
			case "audio-menu-playback": {
				if (video.playbackRate % 1 == 0) {
					extraContent = "x" + video.playbackRate + ".0";
				} else {
					extraContent = "x" + video.playbackRate;
				};
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audio.playbackRate;
					gui.audioMenuPublic.step = "0.1";
					gui.audioMenuPublic.max = "2";
					gui.audioMenuPublic.min = "0.5";
					gui.audioMenuPublic.oninput = function () {
						video.playbackRate = this.value;
						audio.playbackRate = this.value;
					};
				};
				break;
			};
			case "audio-menu-dyncompr": {
				extraContent = audioDC.threshold.value.toString() + "dB";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioDC.threshold.value;
					gui.audioMenuPublic.step = "1";
					gui.audioMenuPublic.max = "-8";
					gui.audioMenuPublic.min = "-100";
					gui.audioMenuPublic.oninput = function () {
						audioDC.threshold.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
			case "audio-menu-mic": {
				extraContent = Math.round(audioMSGain.gain.value * 100).toString() + "%";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioMSGain.gain.value;
					gui.audioMenuPublic.step = "0.01";
					gui.audioMenuPublic.max = "4";
					gui.audioMenuPublic.min = "0";
					gui.audioMenuPublic.oninput = function () {
						audioMSGain.gain.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
			case "audio-menu-eqstart": {
				extraContent = audioEQArray[0].gain.value.toString() + "dB";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioEQArray[0].gain.value;
					gui.audioMenuPublic.step = "0";
					gui.audioMenuPublic.max = "15";
					gui.audioMenuPublic.min = "-35";
					gui.audioMenuPublic.oninput = function () {
						audioEQArray[0].gain.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
			case "audio-menu-eqbass": {
				extraContent = audioEQArray[1].gain.value.toString() + "dB";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioEQArray[1].gain.value;
					gui.audioMenuPublic.step = "0";
					gui.audioMenuPublic.max = "15";
					gui.audioMenuPublic.min = "-35";
					gui.audioMenuPublic.oninput = function () {
						audioEQArray[1].gain.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
			case "audio-menu-eqvocal": {
				extraContent = audioEQArray[2].gain.value.toString() + "dB";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioEQArray[2].gain.value;
					gui.audioMenuPublic.step = "0";
					gui.audioMenuPublic.max = "15";
					gui.audioMenuPublic.min = "-35";
					gui.audioMenuPublic.oninput = function () {
						audioEQArray[2].gain.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
			case "audio-menu-eqtreble": {
				extraContent = audioEQArray[3].gain.value.toString() + "dB";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioEQArray[3].gain.value;
					gui.audioMenuPublic.step = "0";
					gui.audioMenuPublic.max = "15";
					gui.audioMenuPublic.min = "-35";
					gui.audioMenuPublic.oninput = function () {
						audioEQArray[3].gain.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
			case "audio-menu-eqstop": {
				extraContent = audioEQArray[4].gain.value.toString() + "dB";
				e.onmouseup = () => {
					gui.audioMenuPublic.value = audioEQArray[4].gain.value;
					gui.audioMenuPublic.step = "0";
					gui.audioMenuPublic.max = "15";
					gui.audioMenuPublic.min = "-35";
					gui.audioMenuPublic.oninput = function () {
						audioEQArray[4].gain.setValueAtTime(this.value, audioCxt.currentTime);
					};
				};
				break;
			};
		};
		e.onclick = function () {
			activeTileId = this.id;
		}
		if (e.id == activeTileId && e.className.indexOf("audio-menu-tile") != -1) {
			e.className = "audio-menu-tile audio-menu-active";
		} else if (e.id == "audio-menu-title") {
			e.className = "audio-menu-title";
		} else {
			e.className = "audio-menu-tile";
		}
		e.innerHTML += extraContent;
	});
}
// Visualizer framerate changer thread
function visualizerShiftingFunc() {
	let fpsAvg = 303;
	fpsAvgDiff = 0;
	fpsHistory.forEach((e) => {
		fpsAvgDiff += Math.abs(e - fpsAvg);
	});
	fpsAvgDiff /= fpsHistory.length;
	let fpsIndex = fpsRange.indexOf(visualizerFPS);
	if (!(window.inactive)) {
		if (fpsAvgDiff > 60) {
			if (fpsIndex < fpsRange.length - 1) {
				// Decrease FPS
				clearInterval(visualizerThread);
				let shiftedFPS = fpsRange[fpsIndex + 1];
				visualizerThread = setInterval(audioVisualizer, 1000 / shiftedFPS);
				visualizerFPS = shiftedFPS;
				fpsHistory = new Uint16Array(visualizerFPS / 2);
			}
		} else if (fpsAvgDiff < 36) {
			if (fpsIndex != 0) {
				// Increase FPS
				clearInterval(visualizerThread);
				let shiftedFPS = fpsRange[fpsIndex - 1];
				visualizerThread = setInterval(audioVisualizer, 1000 / shiftedFPS);
				visualizerFPS = shiftedFPS;
				fpsHistory = new Uint16Array(visualizerFPS / 2);
			}
		}
	}
}
// GUI Refresher thread
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
					while (subList[scnt].text[0].text.search("\n") != -1) {
						subList[scnt].text[0].text = subList[scnt].text[0].text.replace("\n", "<br/>");
					}
					let tempSubContent = "";
					let tempBracketStack = 0;
					Array.from(subList[scnt].text[0].text).forEach((e) => {
						if (e == "{") {
							tempBracketStack ++;
						} else if (e == "}") {
							tempBracketStack --;
						} else {
							if (tempBracketStack < 1) {
								tempSubContent += e;
							}
						}
					});
					subContent += "<span>" + tempSubContent + "</span><br/>";
					scnt ++;
				}
				gui.subtitle.innerHTML = subContent;
				let subSize = Math.round(Math.sqrt(innerWidth * innerHeight / 1280 / 720) * 36);
				if (subSize < 12) {
					subSize = 12;
				};
				gui.subtitle.style.fontSize = subSize.toString() + "px";
			}
		}
	} else {
		gui.subtitle.innerHTML = "";
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
	fps.innerHTML = (Math.round(1000 / (timeSt(fps.curr) - timeSt(fps.last)))).toString() + "($1)".replace("$1", visualizerFPS);
	if (!(window.inactive)) {
		fpsHistory[fpsHistoryWriterPin] = Math.round(10000 / (timeSt(fps.curr) - timeSt(fps.last)));
		if (fpsHistoryWriterPin >= fpsHistory.length - 1) {
			fpsHistoryWriterPin = 0;
		} else {
			fpsHistoryWriterPin ++;
		}
	};
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
		"duration": video.duration,
	};
	if (window.info) {
		if (info.src) {
			exchangeData.src = info.src;
		}
		if (info.start) {
			exchangeData.start = info.start;
		}
	};
	if (window.blobMedia) {
		exchangeData.media = blobMedia;
	};
	window.parent.postMessage(exchangeData, "*");
	// Ready to develop playlist
	video.onended = () => {
		if (video.videoHeight == 0 && video.videoWidth == 0) {
			window.parent.postMessage({
				"type": "forward:playlist",
				"data": {
					"specify": "commonAnnounce",
					"data": "mediaEnded"
				}
			}, "*");
		}
	};
	// Volume icon
	if (audioGain.gain.value > 0.6 && audio.muted == false) {
		gui.volume.src = "img/volumeUp.png";
	}
	else if (audioGain.gain.value <= 0.6 && audio.muted == false && audioGain.gain.value != 0) {
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
	gui.volume.show.innerHTML = Math.round(audioGain.gain.value * 100) + "%";
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
	// Media info table
	if (gui.mediaInfo && video.videoWidth < 4 && audio.readyState > 0) {
		if (window.visualizerMode) {
			if (visualizerMode.toLowerCase() != "osc-xy") {
				gui.mediaInfo.style.display = "block";
				gui.mediaInfo.artist.children[0].innerHTML = lang.miArtist;
				gui.mediaInfo.album.children[0].innerHTML = lang.miAlbum;
				gui.mediaInfo.mtitle.children[0].innerHTML = lang.miTitle;
				if (window.mediaInfo) {
					gui.mediaInfo.artist.children[1].innerHTML = mediaInfo.tags.artist || lang.unknown;
					gui.mediaInfo.album.children[1].innerHTML = mediaInfo.tags.album || lang.unknown;
					gui.mediaInfo.mtitle.children[1].innerHTML =  mediaInfo.tags.title || lang.unknown;
				} else {
					gui.mediaInfo.artist.children[1].innerHTML = lang.unknown;
					gui.mediaInfo.album.children[1].innerHTML = lang.unknown;
					gui.mediaInfo.mtitle.children[1].innerHTML = lang.unknown;
				}
			} else {
				gui.mediaInfo.style.display = "none";
			}
		}
	} else {
		gui.mediaInfo.style.display = "none";
	}
	let imgP = document.querySelector("#playback-img");
	gui.mediaInfo.table = gui.mediaInfo.querySelector("table");
	gui.mediaInfo.image = gui.mediaInfo.querySelector("img");
	if (imgP.naturalWidth / imgP.naturalHeight > innerWidth / innerHeight) {
		imgP.style.width = innerHeight / imgP.naturalHeight * imgP.naturalWidth + "px";
		imgP.style.height = "";
	} else {
		imgP.style.height = innerWidth / imgP.naturalWidth * imgP.naturalHeight + "px";
		imgP.style.width = "";
	}
	// Picture resize
	if (innerWidth < 635) {
		let autoResizeParam = [Math.floor((innerWidth - 10) * 0.4), innerHeight - gui.mediaInfo.table.clientHeight];
		gui.mediaInfo.image.style.height = Math.min(...autoResizeParam).toString() + "px";
		gui.mediaInfo.image.style.width = Math.min(...autoResizeParam).toString() + "px";
		gui.mediaInfo.table.style.maxWidth = Math.max(...autoResizeParam).toString() + "px";
		if (innerWidth < innerHeight) {
			gui.mediaInfo.table.style.maxWidth = Math.min(...autoResizeParam).toString() + "px";
		}
	} else {
		gui.mediaInfo.image.style.height = "";
		gui.mediaInfo.image.style.width = "";
		gui.mediaInfo.table.style.maxWidth = "";
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
		activeTileId = "";
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
		gui.mediaInfo = document.querySelector("#media-info");
		gui.mediaInfo.artist = document.querySelector("#media-info #media-info-artist");
		gui.mediaInfo.album = document.querySelector("#media-info #media-info-album");
		gui.mediaInfo.mtitle = document.querySelector("#media-info #media-info-title");
		gui.audioMenu = document.getElementById("audio-menu");
		gui.dcbtn = document.getElementById("dcshow");
		gui.audioMenuNodes = document.querySelectorAll("#audio-menu p");
		gui.audioMenuPublic = document.querySelector("#audio-menu input");
		gui.connectMic = document.querySelector("#connect-mic");
		mediaMode = "S";
		// Prepare for microphone connect
		gui.connectMic.innerHTML = lang.audioMenuStrings["connect-mic"];
		// Prepare for framerate monitoring
		fpsHistory = new Uint16Array(60);
		fpsHistoryWriterPin = 0;
		// Initialize audio environment
		audioCxt = new AudioContext();
		audioMedia = audioCxt.createMediaElementSource(audio);
		globalAudioSource = "media";
		audioBA = audioCxt.createBufferSource();
		audioAnl = audioCxt.createAnalyser();
		audioChannels = audioCxt.createChannelSplitter(2);
		audioMerger = audioCxt.createChannelMerger(2);
		audioGain = audioCxt.createGain();
		audioDC = audioCxt.createDynamicsCompressor();
		audioMSNoiseReducer = audioCxt.createBiquadFilter();
		audioMSGain = audioCxt.createGain();
		audioAnlArray = ["L", "R"];
		audioAnlArray.forEach((e, i, a) => {
			a[i] = audioCxt.createAnalyser();
			a[i].fftSize = 1024;
		});
		// Equalizer
		audioEQArray = [0, 312, 696, 1464, 3000];
		audioEQArray.forEach((e, i, a) => {
			a[i] = audioCxt.createBiquadFilter();
			if (i != 0) {
				a[i-1].connect(a[i]);
				if (i <= a.length - 1) {
					a[i].type = "peaking";
				} else {
					a[i].type = "highshelf";
				}
			} else {
				a[i].type = "lowshelf";
				a[i].frequency.setValueAtTime(312, audioCxt.currentTime);
			};
		});
		audioEQArray[1].frequency.setValueAtTime(504, audioCxt.currentTime);
		audioEQArray[1].Q.setValueAtTime(384, audioCxt.currentTime);
		audioEQArray[2].frequency.setValueAtTime(1080, audioCxt.currentTime);
		audioEQArray[2].Q.setValueAtTime(768, audioCxt.currentTime);
		audioEQArray[3].frequency.setValueAtTime(2232, audioCxt.currentTime);
		audioEQArray[3].Q.setValueAtTime(1536, audioCxt.currentTime);
		audioEQArray[4].frequency.setValueAtTime(3000, audioCxt.currentTime);
		// Microphone noise reduction
		audioMSNoiseReducer.frequency.setValueAtTime(1000, audioCxt.currentTime);
		audioMSNoiseReducer.type = "highshelf";
		audioMSNoiseReducer.gain.setValueAtTime(-16, audioCxt.currentTime);
		// Connects to unprocessed audio
		audioMedia.connect(audioDC);
		audioDC.connect(audioEQArray[0]);
		audioEQArray[audioEQArray.length - 1].connect(audioGain);
		audioGain.connect(audioCxt.destination);
		// Enables FFT and FFT-F visualizers
		audioEQArray[audioEQArray.length - 1].connect(audioAnl);
		// Enables OSC-XY
		audioMedia.connect(audioChannels);
		audioAnlArray.forEach((e, i) => {
			audioChannels.connect(e, i);
		});
		// Connect Microphone
		gui.connectMic.onclick = loadUserMedia;
		// Actions for audio menu
		document.querySelector("#audio-menu img.close-button").onclick = function () {
			this.parentElement.style.display = "none";
		}
		// Force zero volume
		video.muted = true;
		// Get volume buttons work!
		volumeBtnUp.onclick = () => {
			volume(2 + shift);
		};
		volumeBtnDown.onclick = () => {
			volume(1 + shift);
		};
		// Default visualizer
		visualizerMode = "empty";
		visualizerModeList = ["empty", "osc-xy", "fft", "osc"];
		// Data saving thread
		dataSaverThread = setInterval(dataSaverThreadFunc, 5000);
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
		};
		// When audio finished playing
		// Subtitles loader
		gui.sub.onclick = function() {
			gui.subfbtn.click();
		}
		gui.subfbtn.oninput = function() {
			loadBlobMedia(this.files);
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
		// Audio panel
		gui.dcbtn.addEventListener("click", function() {
			gui.audioMenu.style.display = "block";
		});
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
		audioPanelThread = setInterval(audioPanelThreadFunc, 1000/15);
		visualizerThread = setInterval(audioVisualizer, 1000/60);
		visualizerShiftingThread = setInterval(visualizerShiftingFunc, 500);
		visualizerFPS = 60;
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
			clearInterval(audioPanelThread);
			//clearInterval(visualizerThread);
			refresherThread = setInterval(refresherThreadFunc, 1000);
			audioPanelThread = setInterval(audioPanelThreadFunc, 1000);
			console.log(lang.resourceSlowed);
			window.inactive = true;
			document.body.onfocus = function() {
				window.inactive = false;
				clearInterval(refresherThread);
				clearInterval(audioPanelThread);
				refresherThread = setInterval(refresherThreadFunc, 33.3);
				audioPanelThread = setInterval(audioPanelThreadFunc, 1000/15);
				console.log(lang.resourceRegained);
			};
			canvasAddDisconnect();
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
			let keyReturn = false;
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
					};
					break;
				case 80:
					if (e.ctrlKey) {
						if (video.paused) {
							video.play();
							audio.play();
						}
						else {
							video.pause();
							audio.pause();
						};
					};
					break;
				case 13:
					// Enter
					gui.status.push(lang.useFs);
					notify.push("sound/notify.aac");
					window.parent.postMessage({
						"type": "fullSc"
					}, "*");
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
					// Ctrl + O
					if (e.ctrlKey) {
						gui.subfbtn.click();
					};
					break;
				case 85:
					// Ctrl + U
					if (e.ctrlKey) {
						audioGain.gain.setValueAtTime(1, audioCxt.currentTime);
					}
				case 73:
					// Ctrl + Shift + I
					if (e.ctrlKey && e.shiftKey) {
						keyReturn = true;
					}
					break;
				case 123:
					// F12
					keyReturn = true;
					break;
				case 77:
					// Ctrl + M
					if (e.ctrlKey) {
						audio.muted = !(audio.muted);
					};
					break;
				case 82:
					// Ctrl + R
					if (e.ctrlKey) {
						if (window.mediaInfo) {
							if (mediaInfo.tags) {
								if (mediaInfo.tags.picture) {
									let tempAnchor = document.createElement("a");
									tempAnchor.href = document.querySelector("div#media-info img").src;
									tempAnchor.download = mediaInfo.tags.artist + " - " + mediaInfo.tags.album + mediaInfo.tags.picture.format.replace("image/", ".");
									tempAnchor.click();
									tempAnchor.remove();
								}
							}
						}
					}
			};
			return keyReturn;
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
		if (audioGain.gain.value < 1.99) {
			audioGain.gain.setValueAtTime((parseInt(gui.volume.show.innerHTML) + 1) / 100, audioCxt.currentTime);
		}
		else {
			audioGain.gain.setValueAtTime(2, audioCxt.currentTime);
		}
	}
	else if (action == 1) {
		if (audioGain.gain.value > 0.01) {
			audioGain.gain.setValueAtTime((parseInt(gui.volume.show.innerHTML) - 1) / 100, audioCxt.currentTime);
		}
		else {
			audioGain.gain.setValueAtTime(0, audioCxt.currentTime);
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
// Load Microphone
function loadUserMedia() {
	if (window.navigator) {
		if (navigator.mediaDevices) {
			if (navigator.mediaDevices.getUserMedia) {
				navigator.mediaDevices.getUserMedia({
					audio: true,
					video: false
				}).then((mediaStream) => {
					audioMS = audioCxt.createMediaStreamSource(mediaStream);
					audioMS.connect(audioMSNoiseReducer);
					audioMSNoiseReducer.connect(audioMSGain);
					audioMSGain.connect(audioDC);
				}).catch((errorMsg) => {
					throw(errorMsg);
				});
			}
		} else if (navigator.getUserMedia) {
			navigator.getUserMedia({
				audio: true,
				video: false
			}).then((mediaStream) => {
				audioMS = audioCxt.createMediaStreamSource(mediaStream);
				audioMS.connect(audioMSNoiseReducer);
				audioMSNoiseReducer.connect(audioMSGain);
				audioMSGain.connect(audioDC);
			}).catch((errorMsg) => {
				throw(errorMsg);
			});
		}
	}
}
// Load Blob Media
function loadBlobMedia(files, isFromPlaylist = false, willPlayWhenFinish = false) {
	video.pause();
	audio.pause();
	info.file = null;
	let count = 0;
	while (count <files.length) {
		console.info(files[count]);
		if (files[count].type.indexOf("video") == 0 || files[count].type.indexOf("audio") == 0) {
			let fileNameArr = files[count].name.split(".");
			let fileName = "";
			let mediaNameArr = undefined;
			let mediaName = "";
			fileNameArr.forEach((e, i, a) => {
				if (i < a.length - 1) {
					if (i != 0) {
						fileName += ".";
					}
					fileName += e;
				}
			})
			if (window.blobMedia) {
				if (blobMedia.name) {
					mediaNameArr = blobMedia.name.split(".");
					mediaNameArr.forEach((e, i, a) => {
						if (i < a.length - 1) {
							if (i != 0) {
								mediaName += ".";
							}
							mediaName += e;
						}
					});
				}
			};
			if ((mediaName != fileName) || (mediaName == fileName && files[count].type.indexOf("video") == 0)) {
				if (window.blobURL) {
					// Clear previous blob
					URL.revokeObjectURL(blobURL);
					window.blobURL = undefined;
				} else if (audio.srcObject || video.srcObject) {
					video.srcObject = null;
					audio.srcObject = null;
				};
				if (window.blobAudioTrackURL) {
					URL.revokeObjectURL(blobAudioTrackURL);
					window.blobAudioTrackURL = undefined;
				};
				blobMedia = files[count];
				if (files[count].type.indexOf("video") == 0) {
					gui.ctx.clearRect(0, 0, gui.canvas.width, gui.canvas.height);
					document.querySelector("#media-info img").src = false;
					document.querySelector("#playback-img").src = false;
				}
				if (isFromPlaylist == false && files[count].type.indexOf("audio") == 0) {
					window.parent.postMessage({
						"type": "forward:playlist",
						"data": {
							"specify": "addBlobMedia",
							"data": blobMedia
						}
					}, "*");
				};
				blobURL = URL.createObjectURL(blobMedia);
				vcs = [blobMedia.name];
				video.src = blobURL;
				audio.src = blobURL;
				mediaInfo = undefined;
				if (willPlayWhenFinish) {
					video.play();
					audio.play();
				};
				window.subt = undefined;
				if (window.jsmediatags && files[count].type.indexOf("audio") == 0) {
					new jsmediatags.Reader(blobMedia).read({
						onSuccess: (e) => {
							mediaInfo = e;
							mediaPicture = undefined;
							if (e.tags.picture) {
								mediaPicture = "";
								e.tags.picture.data.forEach((f) => {
									mediaPicture += String.fromCharCode(f);
								});
								mediaPicture = "data:" + e.tags.picture.format + ";base64," + btoa(mediaPicture);
								document.querySelector("#media-info img").src = mediaPicture;
								document.querySelector("#playback-img").src = mediaPicture;
							} else {
								document.querySelector("#media-info img").src = "img/defaultIcon.png";
								document.querySelector("#playback-img").src = "img/defaultBackground.jpg";
							}
							console.log(e);
						},
						onError: (e) => {
							mediaInfo = undefined;
							console.error(e.stack);
							document.querySelector("#media-info img").src = "img/defaultIcon.png";
							document.querySelector("#playback-img").src = "img/defaultBackground.jpg";
						}
					});
				};
				if (files[count].name) {
					let historyItem = localStorage.getItem("WEBMPF:" + CryptoJS.SHA1(files[count].name));
					if (historyItem) {
						historyItem = JSON.parse(historyItem);
						if (historyItem.currentTime) {
							if (historyItem.mediaInfo) {
								if (historyItem < historyItem.mediaInfo.mediaDuration - 10 && historyItem < historyItem.mediaInfo.mediaDuration * 0.95) {
									audio.currentTime = historyItem.currentTime;
									video.currentTime = historyItem.currentTime;
								}
							}
						};
						if (historyItem.currentPlaybackRate) {
							video.playbackRate = historyItem.currentPlaybackRate;
							audio.playbackRate = historyItem.currentPlaybackRate;
						} else {
							video.playbackRate = 1;
							audio.playbackRate = 1;
						};
						if (historyItem.offset) {
							config.delay = historyItem.offset;
						} else {
							config.delay = 0;
						};
						if (historyItem.currentVolume) {
							if (historyItem.currentVolume > 1) {
								audioGain.gain.setValueAtTime(historyItem.currentVolume, audioCxt.currentTime);
							};
						};
						if (historyItem.subtitle) {
							if (historyItem.subtitleType) {
								subt = new Subtitles(historyItem.subtitle);
								subt.import[historyItem.subtitleType.toLowerCase()]();
							} else {
								subt = new Subtitles(historyItem.subtitle);
								try {
									subt.import.srt();
								} catch (error) {
									try {
										subt.import.vtt();
									} catch (error) {
										try {
											subt.import.lrc();
										} catch (error) {
											try {
												subt.import.ass();
											} catch (error) {
												console.error(lang.corruptedHistorySubtitle);
											};
										};
									};
								};
							};
						};
					};
				};
				analyzeAudio();
			} else {
				if (video.src != audio.src) {
					if (window.blobAudioTrackURL) {
						URL.revokeObjectURL(blobAudioTrackURL);
					};
				};
				blobAudioTrackURL = URL.createObjectURL(files[count]);
				audio.src = blobAudioTrackURL;
			};
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
				};
				case "ass":
				case "ssa": {
					let fileRead = new FileReader();
					fileRead.onloadend = function () {
						if (this.error) {
							notify.push("sound/error.aac");
							gui.status.push(lang.subReadError);
						}
						else {
							subt = new Subtitles(this.result);
							subt.import.ass();
							console.log(subt);
						}
					};
					fileRead.readAsText(files[count]);
					break;
				};
				case "lrc": {
					let fileRead = new FileReader();
					fileRead.onloadend = function () {
						if (this.error) {
							notify.push("sound/error.aac");
							gui.status.push(lang.subReadError);
						}
						else {
							subt = new Subtitles(this.result);
							subt.import.lrc();
							console.log(subt);
						}
					};
					fileRead.readAsText(files[count]);
					break;
				};
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
	} else if (audio.srcObject || video.srcObject) {
		video.srcObject = null;
		audio.srcObject = null;
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
				if (window.jsmediatags) {
					new jsmediatags.Reader(blobMedia).read({
						onSuccess: (e) => {
							mediaInfo = e;
							mediaPicture = undefined;
							if (e.tags.picture) {
								mediaPicture = "";
								e.tags.picture.data.forEach((f) => {
									mediaPicture += String.fromCharCode(f);
								});
								mediaPicture = "data:" + e.tags.picture.type + ";base64," + btoa(mediaPicture);
								document.querySelector("#media-info img").src = mediaPicture;
								document.querySelector("#playback-img").src = mediaPicture;
							} else {
								document.querySelector("#media-info img").src = "img/defaultIcon.png";
								document.querySelector("#playback-img").src = "img/defaultBackground.jpg";
							}
							console.log(e);
						},
						onError: (e) => {
							mediaInfo = undefined;
							console.error(e.stack);
							document.querySelector("#media-info img").src = "img/defaultIcon.png";
							document.querySelector("#playback-img").src = "img/defaultBackground.png";
						}
					});
				};
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
		// For future sound effects
		audioConnected = true;
	}
	visualizer = {};
	visualizerLastFrame = timeSt(new Date);
	visualizerCurrentFrame = timeSt(new Date);
}
// Audio Visualizer
function audioVisualizer () {
	if (!(window.inactive)) {
		switch (visualizerMode.toLowerCase()) {
			case "osc-xy": {
				// Rewritten output
				input = [];
				audioAnlArray.forEach((e, i) => {
					fad = new Float32Array(e.frequencyBinCount);
					e.getFloatTimeDomainData(fad);
					input[i] = fad;
				});
				// Visualizer core
				if (gui.canvas && video.videoHeight * video.videoWidth < 16 && audio.paused == false) {
					canvasCleared = false;
					gui.ctx.fillStyle = "rgba(0, 0, 0, 0.37)";
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
				};
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
					gui.ctx.clearRect(0, 0, gui.canvas.width, gui.canvas.height);
					audioFloatData = new Uint8Array(audioAnl.frequencyBinCount);
					audioAnl.getByteFrequencyData(audioFloatData);
					frequencyDivision = 2 ** Math.floor(Math.log2(gui.canvas.width / 8));
					frequencyWidth = audioAnl.frequencyBinCount / frequencyDivision;
					barWidth = gui.canvas.width / frequencyDivision;
					shrunkAudioData = [];
					for (let ze = 0; ze < frequencyDivision; ze ++) {
						shrunkAudioData[shrunkAudioData.length] = Math.round(Math.max(...Array.from(audioFloatData.slice(frequencyWidth * ze, frequencyWidth * (ze + 1) - 1))) / 255 * 1000) / 1000;
					}
					shrunkAudioData.forEach((e, i) => {
						gui.ctx.fillStyle = "#ff0";
						gui.ctx.fillRect(i * barWidth, gui.canvas.height * (1 - e), barWidth, gui.canvas.height * e);
					});
					gui.ctx.font = "16px Verdana";
					gui.ctx.textAlign = "end";
					gui.ctx.fillStyle = "#ff0";
					gui.ctx.fillText(audioAnl.frequencyBinCount.toString() + "-" + frequencyWidth.toString() + "Hz", gui.canvas.width - 1, 36);
					let thresholdDC = audioDC.threshold.value;
					if (thresholdDC <= -30) {
						if (thresholdDC >= -100) {
							gui.ctx.strokeStyle = "#f00";
							gui.ctx.beginPath();
							gui.ctx.moveTo(0, gui.canvas.height * (-30 - thresholdDC) / 70);
							gui.ctx.lineTo(gui.canvas.width, gui.canvas.height * (-30 - thresholdDC) / 70);
							gui.ctx.stroke();
						};
					};
				};
				break;
			};
			case "fft-f": {
				if (gui.canvas && video.videoHeight * video.videoWidth < 16 && audio.paused == false) {
					canvasCleared = false;
					gui.ctx.clearRect(0, 0, gui.canvas.width, gui.canvas.height);
					audioFloatData = new Float32Array(audioAnl.frequencyBinCount);
					audioAnl.getFloatFrequencyData(audioFloatData);
					frequencyDivision = 2 ** Math.floor(Math.log2(gui.canvas.width / 4));
					frequencyWidth = 1024 / frequencyDivision;
					barWidth = gui.canvas.width / frequencyDivision;
					shrunkAudioData = [];
					for (let ze = 0; ze < frequencyDivision; ze ++) {
						shrunkAudioData[shrunkAudioData.length] = Math.round((Math.max(...Array.from(audioFloatData.slice(frequencyWidth * ze, frequencyWidth * (ze + 1) - 1))) + 130) * 10) / 1000;
					}
					shrunkAudioData.forEach((e, i) => {
						if (e >= 0) {
							gui.ctx.fillStyle = "rgba(255, 255, 0, 1)";
							gui.ctx.fillRect(i * barWidth, gui.canvas.height * (1 - e), barWidth, gui.canvas.height * e);
						} else {
							gui.ctx.fillStyle = "rgba(0, 239, 0, 0.5)";
							gui.ctx.fillRect(i * barWidth, 0, barWidth, gui.canvas.height * (0 - e));
						};
					});
					gui.ctx.font = "16px Verdana";
					gui.ctx.textAlign = "end";
					gui.ctx.fillStyle = "#ff0";
					gui.ctx.fillText("1024-" + frequencyWidth.toString() + "Hz", gui.canvas.width - 1, 36);
					let thresholdDC = audioDC.threshold.value;
					if (thresholdDC <= -30) {
						if (thresholdDC >= -130) {
							gui.ctx.strokeStyle = "#f00";
							gui.ctx.beginPath();
							gui.ctx.moveTo(0, gui.canvas.height * (-30 - thresholdDC) / 100);
							gui.ctx.lineTo(gui.canvas.width, gui.canvas.height * (-30 - thresholdDC) / 100);
							gui.ctx.stroke();
						};
					};
				};
				break;
			};
		}
	}
}
function canvasAddDisconnect() {
	if (video.videoWidth == 0 && video.paused != true) {
		gui.ctx.clearRect(gui.canvas.width / 2 - 120, gui.canvas.height / 2 - 20, 240, 40);
		gui.ctx.strokeStyle = "#ff0";
		gui.ctx.strokeRect(gui.canvas.width / 2 - 120, gui.canvas.height / 2 - 20, 240, 40);
		gui.ctx.font = "16px Verdana";
		gui.ctx.textAlign = "start";
		gui.ctx.fillStyle = "#ff0";
		gui.ctx.fillText("DISCONNECTED", gui.canvas.width / 2 - 68, gui.canvas.height / 2 + 6);
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
					"choose2dVisualizer": "请选择2D可视化效果",
					"miArtist": "艺术家",
					"miAlbum": "专辑",
					"miTitle": "标题",
					"unknown": "未知",
					"visualizerFramerateShift": "可视化效果帧率已自动调整至%i",
					"audioMenuStrings": {
						"audio-menu-title": "混音板",
						"audio-menu-volume": "媒体音量：",
						"audio-menu-mic": "话筒音量：",
						"audio-menu-playback": "播放速度：",
						"audio-menu-dyncompr": "抑音极限：",
						"audio-menu-eqbass": "EQ-312：",
						"audio-menu-eqvocal": "EQ-696：",
						"audio-menu-eqtreble": "EQ-1464：",
						"audio-menu-eqstart": "EQ-0：",
						"audio-menu-eqstop": "EQ-3000：",
						"audio-menu-convolver": "回声强度：",
						"connect-mic": "连接麦克风"
					}
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
					"choose2dVisualizer": "請選擇2D可視化效果",
					"miArtist": "藝術家",
					"miAlbum": "專輯",
					"miTitle": "標題",
					"unknown": "未知",
					"visualizerFramerateShift": "可視化效果幀率已調整至%i",
					"audioMenuStrings": {
						"audio-menu-title": "調音板",
						"audio-menu-volume": "媒體音量：",
						"audio-menu-mic": "話筒音量：",
						"audio-menu-playback": "回放速度：",
						"audio-menu-dyncompr": "抑音極限：",
						"audio-menu-eqbass": "EQ-312：",
						"audio-menu-eqvocal": "EQ-696：",
						"audio-menu-eqtreble": "EQ-1464：",
						"audio-menu-eqstart": "EQ-0：",
						"audio-menu-eqstop": "EQ-3000：",
						"audio-menu-convolver": "回響強度：",
						"connect-mic": "連接話筒"
					}
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
					"choose2dVisualizer": "Please choose a 2D visualizer",
					"miArtist": "Artist",
					"miAlbum": "Album",
					"miTitle": "title",
					"unknown": "Unknown",
					"visualizerFramerateShift": "Framerate of the visualizer automatically changed to %i",
					"audioMenuStrings": {
						"audio-menu-title": "Audio Mixing Panel",
						"audio-menu-volume": "Media Vol：",
						"audio-menu-mic": "Mic Vol：",
						"audio-menu-playback": "Speed：",
						"audio-menu-dyncompr": "Muffler：",
						"audio-menu-eqbass": "EQ-312：",
						"audio-menu-eqvocal": "EQ-696：",
						"audio-menu-eqtreble": "EQ-1464：",
						"audio-menu-eqstart": "EQ-0：",
						"audio-menu-eqstop": "EQ-3000：",
						"audio-menu-convolver": "Spacing：",
						"connect-mic": "Connect Mic"
					}
				}
		}
	}
}