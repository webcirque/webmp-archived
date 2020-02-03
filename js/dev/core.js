// Receive messages
addEventListener("message", function (msg) {
	switch (msg.data.spec) {
		case "info": {
			states[msg.data.data.type] = msg.data.data.context;
			fireCustomStates();
			break;
		};
		default: {
			console.warn(lang.noMsgSpec.replace("$1", msg.data.spec));
		};
	};
});
// When WebMP is ready
document.addEventListener("readystatechange", function () {
	if (this.readyState.toLowerCase() == "interactive") {
		//Initialize
		resizeAll();
		requestLanguage();
		themeIconChange("black");
		addEventListener("resize", resizeAll, true);
		//Global elements
		audio = document.querySelector("#wmp-audio");
		audioFallback = document.querySelector("#wmp-fallback");
		video = document.querySelector("#wmp-video");
		flvPlayer = null;
		flvPlayerAudio = null;
		//Forbids rightclick
		document.body.onauxclick = () => {return false;};
		//Video should not have sound
		video.muted = true;
		//Add basic functionality
		let element = getAll();
		element.controllers.progress.addEventListener("mousedown", function () {
			states.seek = true;
		});
		element.controllers.progress.addEventListener("pointerdown", function () {
			states.seek = true;
		});
		element.controllers.progress.addEventListener("pointerup", function () {
			states.seek = false;
			seekMedia(parseFloat(element.controllers.progress.value) * video.duration);
		});
		element.controllers.progress.addEventListener("mouseup", function () {
			states.seek = false;
			seekMedia(parseFloat(element.controllers.progress.value) * video.duration);
		});
		video.addEventListener("play", function () {
			element.controllers.play.children[0].style.display = "none";
			element.controllers.play.children[1].style.display = "none";
		});
		video.addEventListener("pause", function () {
			element.controllers.play.children[0].style.display = "inline";
			element.controllers.play.children[1].style.display = "none";
		});
		video.addEventListener("playing", function () {
			element.controllers.play.children[0].style.display = "none";
			element.controllers.play.children[1].style.display = "inline";
		});
		video.addEventListener("durationchange", function () {
			element.indicators.duration.innerHTML = nte(video.duration);
		});
		element.controllers.list.addEventListener("click", switchLibrary);
		element.controllers.fsc.addEventListener("click", reqFsc);
		video.addEventListener("readystatechange", function () {
			switch (this.readyState) {
				case video.HAVE_NOTHING: {
					break;
				};
				case video.HAVE_METADATA: {
					break;
				};
				case video.HAVE_CURRENT_DATA: {
					break;
				};
				case video.HAVE_FUTURE_DATA: {
					break;
				};
				case video.HAVE_ENOUGH_DATA: {
					break;
				};
			};
		});
		//Announce all contexts
		self.canvas = {
			buffer: element.indicators.buffer.getContext("2d"),
			visualizer: element.indicators.visualizer.getContext("2d")
		};
		//Announce threads in an object
		self.threads = {};
		//MediaSourceIndicator
		self.currentMedia = {};
		//Button reactions
		element.controllers.play.onclick = switchStatus;
		//Is the cover allowed to show
		video.addEventListener("loadstart", videoLoadStart);
		video.addEventListener("loadend", videoLoadEnd);
		//Event monitors
		self.states = {
			seek: false,
			playing: false
		};
		//Start the threads
		startThreads();
		//Get information via search
		if (self.TabSearch) {
			let actions = new TabSearch(location.search);
			for (let name in actions) {
				switch (name) {
					case "nowa": {
						if (actions[name] != "0") {
							console.info("WebAudio is disabled via search.");
						};
						break;
					};
					case "file": {
						playMedia(actions[name]);
						console.info("Queried file [$1] via search.".replace("$1", actions[name]));
						break;
					};
					case "start": {
						seekMedia(parseFloat(actions[name]));
						console.info("Scheduled file start point [$1] via search.".replace("$1", actions[name]));
						break;
					};
					case "shareid": {
						console.info("Queried shared file [$1] via search.".replace("$1", actions[name]));
						break;
					};
					case "theme": {
						themeIconChange(actions[name]);
						console.info("Changed theme to [$1] via search.".replace("$1", actions[name]));
						break;
					};
				};
			};
		};
		//Dragging
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
			let df = e.dataTransfer;
			loadFiles(df.files);
		}, true);
		//Get hotkeys function
		document.body.addEventListener("keydown", function (event) {
			console.info(lang.keyPressed.replace("$1", event.which));
			let allowDefault = false;
			switch (event.which) {
				case 32: {
					switchStatus();
					break;
				};
				case 37: {
					seekMedia(video.currentTime -= 10);
					break;
				};
				case 39: {
					seekMedia(video.currentTime += 10);
					break;
				};
				case 73: {
					if (event.ctrlKey) {
						allowDefault = true;
					};
					break;
				};
			};
			return allowDefault;
		});
	}
});

// Play and pause
function switchStatus(event = {}, forceStatus = 2, smartWait = false) {
	if (forceStatus == 2) {
		if (video.paused) {
			video.play();
			audio.play();
			if (!(smartWait)){
				states.playing = true;
			};
		} else {
			video.pause();
			audio.pause();
			if (!(smartWait)){
				states.playing = false;
			};
		};
	} else if (forceStatus == 0) {
		video.play();
		audio.play();
		if (!(smartWait)){
			states.playing = true;
		};
	} else if (forceStatus == 1) {
		video.pause();
		audio.pause();
		if (!(smartWait)){
			states.playing = false;
		};
	};
}
switchStatus.PLAY = 0;
switchStatus.PAUSE = 1;
switchStatus.AUTO = 2;

// Normalize time expression
function nte(time, float = false) {
	let timeArguments = [0, 0, 0];
	timeArguments[2] = time % 60;
	timeArguments[1] = Math.floor(time / 60) % 60;
	timeArguments[0] = Math.floor(time / 3600);
	if (!(float)) {
		timeArguments[2] = Math.floor(timeArguments[2]);
	};
	let hasHour = false;
	if (timeArguments[0] > 0) {
		hasHour = true;
	};
	timeArguments.forEach((e, i, a) => {
		if (e < 10) {
			a[i] = "0" + e;
		} else {
			a[i] = e.toString();
		};
	});
	let timeString = timeArguments[1] + ":" + timeArguments[2];
	if (hasHour) {
		timeString = timeArguments[0] + ":" + timeString;
	};
	return (timeString);
}

// Use closure and temporary variables to avoid memory leakage
function getControllers() {
	let controllers = {};
	controllers.progress = document.querySelector("#btn-progress");
	controllers.play = document.querySelector("#btn-play");
	controllers.fsc = document.querySelector("#btn-fsc");
	controllers.list = document.querySelector("#btn-list");
	controllers.prev = document.querySelector("#btn-prev");
	controllers.next = document.querySelector("#btn-next");
	controllers.amp = document.querySelector("#btn-vol");
	controllers.conf = document.querySelector("#btn-conf");
	return controllers;
}
function getIndicators() {
	let indicators = {};
	indicators.buffer = document.querySelector("#buffer-progress");
	indicators.visualizer = document.querySelector("#c-visualizer");
	indicators.currentTime = document.querySelector("#idct-curr");
	indicators.duration = document.querySelector("#idct-dura");
	return indicators;
}
function getWae() {
	let wae = {};
	wae.cover = document.querySelector("#wae-meta img");
	return wae;
}
function getAll() {
	let controllers = getControllers();
	let indicators = getIndicators();
	let wae = getWae();
	return {
		controllers: controllers,
		indicators: indicators,
		wae: wae
	};
}

// Resize the window
function resizeAll() {
	let element = getAll();
	element.controllers.progress.style.width = (innerWidth - 8).toString() + "px";
	element.indicators.buffer.width = innerWidth - 8;
}

// Load files
function loadFiles(files) {
	Array.from(files).forEach((e) => {
		console.log(lang.fileLoading.replace("$1", e.name));
		let nameArr = e.name.toLowerCase().split(".");
		switch (nameArr[nameArr.length - 1]) {
			case "flv": {
				console.log(lang.formatDetected
					.replace("$1", "FLV")
					.replace("$2", "video/flv"));
				if (currentMedia.vidurl) {
					if (currentMedia.vidurl.indexOf("blob:") < 1) {
						URL.revokeObjectURL(currentMedia.vidurl);
						currentMedia.audblob = null;
					};
					if (currentMedia.audurl) {
						if (currentMedia.audurl != currentMedia.vidurl) {
							if (currentMedia.vidurl.indexOf("blob:") < 1) {
								URL.revokeObjectURL(currentMedia.audurl);
							}
						};
					};
					currentMedia.audurl = null;
					currentMedia.vidurl = null;
					currentMedia.vidname = null;
				};
				currentMedia.vidurl = URL.createObjectURL(e);
				currentMedia.vidname = e;
				currentMedia.audurl = currentMedia.vidurl;
				if (flvPlayer) {
					flvPlayer.unload();
					flvPlayer = null;
				};
				if (flvPlayerAudio) {
					flvPlayerAudio.unload();
					flvPlayerAudio = null;
				};
				flvPlayer = flvjs.createPlayer({type: "flv", url: currentMedia.vidurl});
				flvPlayer.attachMediaElement(video);
				flvPlayer.load();
				flvPlayerAudio = flvjs.createPlayer({type: "flv", url: currentMedia.vidurl});
				flvPlayerAudio.attachMediaElement(audio);
				flvPlayerAudio.load();
				break;
			};
			default: {
				if (flvPlayer) {
					flvPlayer.unload();
					flvPlayer = null;
				};
				if (flvPlayerAudio) {
					flvPlayerAudio.unload();
					flvPlayerAudio = null;
				};
				console.log(lang.formatDetected
					.replace("$1", nameArr[nameArr.length - 1].toUpperCase())
					.replace("$2", e.type));
				if (e.type.indexOf("video") == 0 || e.type.indexOf("audio") == 0) {
					playMedia(e);
				} else {
					console.log(lang.unsupportedFileType
						.replace("$1", nameArr[nameArr.length - 1].toUpperCase())
						.replace("$2", e.type));
				};
			}
		};
	});
}

// Jump to
function seekMedia(time) {
	if (time.constructor == Number) {
		video.currentTime = time;
		audio.currentTime = time;
		console.info(lang.seekMedia);
	};
};

// Load blob or urls
function playMedia(source, start = 0, audioOnly = false, format = "auto") {
	if (currentMedia.vidurl) {
		if (currentMedia.vidurl.indexOf("blob:") < 1) {
			URL.revokeObjectURL(currentMedia.vidurl);
			currentMedia.audblob = null;
		};
		if (currentMedia.audurl) {
			if (currentMedia.audurl != currentMedia.vidurl) {
				if (currentMedia.vidurl.indexOf("blob:") < 1) {
					URL.revokeObjectURL(currentMedia.audurl);
				}
			};
		};
		currentMedia.audurl = null;
		currentMedia.vidurl = null;
		currentMedia.vidname = null;
	};
	if (source.constructor == String) {
		if (!(audioOnly)) {
			video.src = source;
			currentMedia.vidurl = source;
			seekMedia(start);
		};
		audio.src = source;
		currentMedia.audurl = source;
	} else {
		if (!(audioOnly)) {
			currentMedia.vidurl = URL.createObjectURL(source);
			currentMedia.vidname = source.name;
			currentMedia.audurl = currentMedia.vidurl;
			currentMedia.audblob = source;
			video.src = currentMedia.vidurl;
			audio.src = currentMedia.audurl;
		} else {
			currentMedia.audurl = URL.createObjectURL(source);
			currentMedia.audblob = source;
			audio.src = currentMedia.audurl;
		}
	}
};

// Start the threads
function startThreads() {
	let elements = getAll();
	threads.progress = {
		func: function () {
			if (!(states.seek)) {
				if (video.duration > 0) {
					elements.controllers.progress.value = video.currentTime / video.duration;
				} else {
					elements.controllers.progress.value = 0;
				};
			} else {
				elements.indicators.currentTime.innerHTML = nte(parseFloat(elements.controllers.progress.value) * video.duration);
			};
			if (states.seek) {
				elements.indicators.currentTime.style.fontWeight = "bold";
				//elements.indicators.currentTime.innerHTML = nte(parseFloat(elements.controllers.progress.value) * video.duration);
			} else {
				elements.indicators.currentTime.style.fontWeight = "normal";
			};
			elements.indicators.currentTime.innerHTML = nte(video.currentTime);
			let ctx = canvas.buffer;
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			switch (document.body.className) {
				case "theme-greenb": {
					ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
					break;
				};
				case "theme-blueb": {
					ctx.fillStyle = "rgba(16, 160, 255, 0.5)";
					break;
				};
				default: {
					ctx.fillStyle = "rgba(160, 160, 160, 0.5)";
				};
			};
			ctx.fillRect(0, 5, Math.floor(ctx.canvas.width * elements.controllers.progress.value), 4);
			let videoBuffer = video.buffered;
			let audioBuffer = audio.buffered;
			for (let t = 0; t < videoBuffer.length; t ++) {
				ctx.fillRect(Math.round(ctx.canvas.width * (videoBuffer.start(t) / video.duration)), 0, Math.round(ctx.canvas.width * ((videoBuffer.end(t) - videoBuffer.start(t)) / video.duration)), 4);
			};
			for (let t = 0; t < audioBuffer.length; t ++) {
				ctx.fillRect(Math.round(ctx.canvas.width * (audioBuffer.start(t) / audio.duration)), 10, Math.round(ctx.canvas.width * ((audioBuffer.end(t) - audioBuffer.start(t)) / audio.duration)), 4);
			};
		},
		focus: 30,
		blur: 6,
		hidden: 0,
		thread: -1
	};
	for (let name in threads) {
		threads[name].thread = setInterval(threads[name].func, 1000 / threads[name].focus);
		console.info(lang.threadOnline.replace("$1", name).replace("$2", threads[name].focus));
	};
}

function videoLoadStart() {
	let wae = getWae();
	wae.cover.style.display = "none";
	console.log(lang.mediaStartedLoading.replace("$1", video.src));
}
function videoLoadEnd() {
	let wae = getWae();
	if (this.readyState == 0 || this.videoHeight > 0) {
		wae.cover.style.display = "none";
	} else {
		wae.cover.style.display = "";
	};
	changeTitle("mediaName", currentMedia.vidname);
}

function changeTitle(type, context) {
	top.postMessage({
		spec: "change-title",
		data: {
			type: type,
			context: context
		}
	}, "*");
}

function switchLibrary() {
	if (self.states.list == undefined) {
		states.list = false;
	};
	if (states.list) {
		top.postMessage({
			spec: "switchTab",
			data: {
				context: "core"
			}
		}, "*");
	} else {
		top.postMessage({
			spec: "switchTab",
			data: {
				context: "list"
			}
		}, "*");
	};
	states.list = !(states.list);
}
function reqFsc() {
	top.postMessage({
		spec: "fullscreen"
	}, "*");
}

function fireCustomStates() {
	let element = getAll();
	if (states.fullscreen) {
		element.controllers.fsc.children[0].style.display = "none";
		element.controllers.fsc.children[1].style.display = "";
	} else {
		element.controllers.fsc.children[1].style.display = "none";
		element.controllers.fsc.children[0].style.display = "";
	};
}
