"use strict";
var recoveryWindow;

// Receive messages

// Automatic detects recovery usage
let versionString = localStorage.getItem("WEBMPS:versionString");
if (versionString == null || versionString != "1.0") {
	recoveryWindow = window.open("recovery.htm");
	setTimeout(() => {
		recoveryWindow.postMessage({
			refferedURL: location.href,
			action: "update"
		}, "*");
		addEventListener("message", (event) => {
			console.log("MSG_RCVED");
			if (event.data.action = "reload") {
				location.reload();
			};
		});
	}, 600);
} else {
	// Normal actions
	document.addEventListener("readystatechange", function () {
		if (this.readyState.toLowerCase() == "interactive") {
			// Get the framed windows
			self.frames = {};
			self.frames.core = document.querySelector("iframe#tab-core");
			self.frames.list = document.querySelector("iframe#tab-list");
			self.frames.conf = document.querySelector("iframe#tab-conf");
			self.frames.container = document.querySelector("div#container");
			resizeWindow();
			// Auto resizing
			addEventListener("resize", resizeWindow);
			if (self.TabSearch) {
				let actions = new TabSearch(location.search);
				let appendString = "?";
				for (let name in actions) {
					switch (name) {
						case "nowa": {
							if (actions[name] != "0") {
								appendString += "&nowa=1";
								console.info("WebAudio is disabled via search.");
							};
							break;
						};
						case "file": {
							appendString += "&file=$1".replace("$1", actions[name]);
							console.info("Queried file [$1] via search.".replace("$1", actions[name]));
							break;
						};
						case "start": {
							appendString += "&start=$1".replace("$1", actions[name]);
							console.info("Scheduled file start point [$1] via search.".replace("$1", actions[name]));
							break;
						};
						case "shareid": {
							appendString += "&shareid=$1".replace("$1", actions[name]);
							console.info("Queried shared file [$1] via search.".replace("$1", actions[name]));
							break;
						};
						case "debug": {
							switchTab(actions[name]);
							console.info("Debugging [$1] tab interface.".replace("$1", actions[name]));
							break;
						};
						case "theme": {
							appendString += "&theme=$1".replace("$1", actions[name]);
							console.info("Required theme [$1] via search.".replace("$1", actions[name]));
							break;
						};
					};
				};
				appendString = appendString.replace("&", "");
				self.frames.core.src = "core.htm" + appendString;
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
			}, true);
		}
	});
}

function switchTab(tabName) {
	for (let name in frames) {
		if (name == tabName) {
			frames[name].style.display = "block";
		} else if (name != "core" && name != "container") {
			frames[name].style.display = "none";
		};
	};
	if (tabName != "core") {
		if (self.globalConfig) {
			if (globalConfig.aero) {
				frames.core.style.filter = "blur(4px)";
			} else {
				frames.core.style.display = "none";
			};
		};
	} else {
		frames.core.style.filter = "";
		frames.core.style.display = "";
	};
};
function resizeWindow() {
	if (self.frames) {
		frames.container.style.height = (innerHeight - 24).toString() + "px";
		frames.list.style.height = (innerHeight - 96).toString() + "px";
	};
};