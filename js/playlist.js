// Translations
if (window.navigator) {
	if (window.navigator.language) {
		switch (navigator.language.toLowerCase()) {
			case "zh":
			case "zh-hans":
			case "zh-cn": {
				lang = {
					switchMode: {
						shuffle: "随机",
						order: "列表",
						single: "单曲",
						loop: "循环"
					},
					switchMediaRequired: "已收到切换媒体请求。",
					switchMediaMode: "使用$1$2模式切换媒体。",
				};
				break;
			};
			case "zh-tw":
			case "zh-hant":
			case "zh-hk": {
				lang = {
					switchMode: {
						shuffle: "隨機",
						order: "列表",
						single: "單曲",
						loop: "重複"
					},
					switchMediaRequired: "已收到切換媒體請求。",
					switchMediaMode: "使用$1$2模式切換媒體。"
				};
				break;
			};
			default: {
				lang = {
					switchMode: {
						shuffle: "Shuffle",
						order: "Order",
						single: "Single",
						loop: "Repeat"
					},
					switchMediaRequired: "Received media switching request.",
					switchMediaMode: "Switching media using $2 $1."
				};
				break;
			}
		}
	}
}

// Apply global debug message template
msgTp = {
	// Success messages
	"TEMP_FILE_SYSTEM_READY": "Temporary file system on worker is ready.",
	// Info messages
	"ADD_MEDIA_OPERATION_STARTED": "Add media operation started.",
	// Fail messages
	"TEMP_FILE_SYSTEM_FAILED_TO_LOAD": "Temporary file system failed to load: %s",
	"FILE_WRITE_ERROR_ALREADY_HAD_DATA": "Provided file path already had data inside. Delete it or cancel operation."
};

// Apply message receiver
addEventListener("message", (ev) => {
	granted = true;
	switch (ev.data.specify) {
		case "commonAnnounce": {
			switch (ev.data.data) {
				case "mediaEnded": {
					switchMedia();
					break;
				}
			};
			break;
		};
		case "addBlobMedia": {
			let status = true;
			play.list.forEach((e) => {
				if (e.name == ev.data.data.name && e.size == ev.data.data.size && e.type == ev.data.data.type) {
					status = false;
				};
			});
			if (status) {
				play.list.push(ev.data.data);
			}
			break;
		};
		case "nowPlayingMedia": {
			play.list.forEach((e, i) => {
				if (e.name == ev.data.data.name && e.size == ev.data.data.size && e.type == ev.data.data.type) {
					play.current = i;
				};
			});
			granted = false;
			break;
		};
	};
	if (window.debugMode && window.granted) {
		console.info(ev.data);
	};
});

// Operation Tracking System implemented
function OTS(workerURL = null) {
	if (workerURL.constructor == String) {
		this.worker = new Worker(workerURL);
	} else {
		throw(new Error("Empty worker URL."));
	};
	this.operations = [];
	this.pushJob = function (identifier = new Date().toJSON()) {
		let job = new OTSJob(identifier);
		this.operations.push(job);
		return job;
	};
	this.getJobByIdentifier = function () {};
	this.changeJobStatusByIndex = function () {};
};
function OTSJob(identifier = new Date().toJSON()) {
	this.WORKING = 0;
	this.FINISH_INFO = 1;
	this.FINISH_FAIL = 2;
	this.FINISH_DONE = 3;
	this.identifier = identifier;
	this.onworking = null;
	this.onended = null;
	this.onsuccess = null;
	this.onfail = null;
	this.index = -1;
	this.status = this.WORKING;
};

// Initialize
document.addEventListener("readystatechange", function () {
	if (this.readyState.toLowerCase() == "interactive") {
		play = {};
		play.list = [];
		play.current = -1;
		mode = {};
		mode.list = ["shuffle", "order", "loop"];
		mode.current = localStorage.getItem("WEBMPS:playlistMode");
		if (mode.current == "null" || mode.current == null) {
			mode.current = "order";
		};
		ots = new OTS("js/playlistWorker.js");
		// Try to use Web Worker to process playlist data
		ots.worker.onmessage = (e) => {
			// Message delivery
			switch (e.data.type) {
				case "notification/success": {
					let workerMsg = msgTp[e.data.message];
					if (!(workerMsg)) {
						workerMsg = e.data.message;
					};
					console.log(workerMsg);
					break;
				};
				case "notification/info": {
					let workerMsg = msgTp[e.data.message];
					if (!(workerMsg)) {
						workerMsg = e.data.message;
					};
					console.warn(workerMsg);
					break;
				}
				case "notification/fail": {
					let workerMsg = msgTp[e.data.message];
					if (!(workerMsg)) {
						workerMsg = e.data.message;
					};
					console.error(workerMsg, e.data.error || "No further information provided.");
					break;
				};
			};
		};
	};
});

// For switching media
function switchMedia() {
	console.warn(lang.switchMediaRequired);
	switch (mode.current) {
		case "shuffle": {
			play.current = Math.floor(Math.random() * play.list.length);
			window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:gui",
						"specify": "playBlobMedia",
						"data": play.list[play.current]
					}
				}, "*");
			console.log(lang.switchMediaMode.replace("$1",lang.switchMode.shuffle).replace("$2",""));
			break;
		};
		case "order": {
			if (play.current == play.list.length -1) {
				window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:gui",
						"specify": "playBlobMedia",
						"data": play.list[0]
					}
				}, "*");
			} else {
				play.current ++;
				window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:gui",
						"specify": "playBlobMedia",
						"data": play.list[play.current]
					}
				}, "*");
			};
			console.log(lang.switchMediaMode.replace("$1", lang.switchMode.order).replace("$2", lang.switchMode.loop));
			break;
		};
		case "loop": {
			window.parent.postMessage({
					"type": "forward:player-core",
					"data": {
						"type": "info:gui",
						"specify": "controlPlay"
					}
				}, "*");
			console.log(lang.switchMediaMode.replace("$1", lang.switchMode.single).replace("$2", lang.switchMode.loop));
			break;
		};
	};
};