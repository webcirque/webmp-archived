"use strict";

document.addEventListener("readystatechange", function () {
	if (this.readyState.toLowerCase() == "interactive") {
		self.area = {};
		self.area.menu = document.querySelector("div#menu");
		self.area.tabs = document.querySelector("div#tabs");
		self.area.operation = document.querySelector("div#operation");
		self.tabs = {};
		self.lfworker = new Worker("js/libraryFileWorker.js");
		addEventListener("resize", resizeWindow);
		themeIconChange("black");
		resizeWindow();
		requestLanguage();
		if (self.TabSearch) {
			let actions = new TabSearch(location.search);
			for (let name in actions) {
				switch (name) {
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
	}
});

function resizeWindow() {
	if (self.area) {
		if (innerWidth > 480) {
			area.tabs.style.width = (innerWidth - 200).toString() + "px";
		}
	}
}

function getFilesFromFolder(path, callback = function (files) {
	console.log(files);
}) {
	let localInfo = new XMLHttpRequest;
	if (path.indexOf("file:///") != 0) {
		path = "file:///" + path;
		path = path.replace("file:////", "file:///");
	};
	while (path.indexOf("\\") >= 0) {
		path = path.replace("\\", "/");
	};
	localInfo.open("GET", path);
	localInfo.onreadystatechange = function () {
		if (this.readyState == 4) {
			let infoP = new DOMParser;
			let infoDoc = infoP.parseFromString(this.responseText, "text/html");
			let infoAr = Array.from(infoDoc.getElementsByTagName("script"));
			let array = [];
			infoAr.forEach((e) => {
				if (e.innerText.indexOf("addRow(") == 0) {
					let text = e.innerText.replace("addRow(", "[").replace(");", "]");
					let infoarr = JSON.parse(text);
					if (infoarr[2] == 1) {
						array.push(new lfw.Folder(infoarr[0], infoarr[5]));
					} else if (infoarr[2] == 0) {
						array.push(new lfw.File(infoarr[0], infoarr[5], infoarr[3]));
					};
				};
			});
			callback(array);
		};
	};
	localInfo.send();
}

self.lfw = {
	Folder: function (name, date) {
		this.name = name;
		this.date = new Date(date * 1000);
		this.isFile = false;
		this.isFolder = true;
	},
	File: function (name, date, size) {
		this.name = name;
		this.date = new Date(Date * 1000);
		this.isFile = true;
		this.isFolder = false;
		this.size = size;
	}
};

function replaceAttr(nodes, attr, text) {
	if (nodes.constructor != Array) {
		nodes = Array.from(nodes);
	};
	nodes.forEach((e) => {
		e[attr] = text;
	});
}
function updateLanguageAssets() {
	replaceAttr(document.getElementsByClassName("input-text-search"), "placeholder", lang.search);
}
