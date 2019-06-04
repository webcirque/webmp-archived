"use strict";
var globalEvent, globalButtonSet = {}, recoveryTabs = {}, forms = {}, element = {};
var currentTab = "tab-main", tabHistory = [], tabHistoryIndex = -1, sourceWindow;
var actions = [], finishedActs = 0;
addEventListener("message", (event) => {
	globalEvent = event;
	console.log("MSG_RCVED");
	switch (event.data.action.toLowerCase()) {
		case "update": {
			updateWebMP(event.source);
			break;
		};
		default: {
			//
		}
	};
});

function updateWebMP(source) {
	switchTo("tab-update");
	actions.push("update");
	sourceWindow = source;
};

function switchTo(target, dontAddToHistory) {
	Array.from(document.getElementsByClassName("tab")).forEach((e) => {
		if (e.id != target) {
			e.style.display = "";
		} else {
			e.style.display = "block";
		}
	});
	currentTab = target;
	if (!(dontAddToHistory)) {
		tabHistory.push(target);
		tabHistoryIndex ++;
	};
	if (tabHistoryIndex > 0) {
		globalButtonSet.prev.className = "universal-button";
	}
}
function switchBack(target) {
	if (tabHistoryIndex > 0) {
		Array.from(document.getElementsByClassName("tab")).forEach((e) => {
			if (e.id != tabHistory[tabHistoryIndex - 1]) {
				e.style.display = "";
			} else {
				e.style.display = "block";
			}
		});
		currentTab = tabHistory[tabHistoryIndex - 1];
		tabHistoryIndex --;
	}
	if (tabHistoryIndex <= 0) {
		globalButtonSet.prev.className = "universal-button-disabled";
	}
}

function actActions() {
	actions.forEach((e, i, a) => {
		switch (e) {
			case "update": {
				let keys = [];
				for (let c = 0; c < localStorage.length; c ++) {
					keys.push(localStorage.key(c));
				}
				keys.forEach((e) => {
					if (e.indexOf("WEBMPF:") == 0) {
						let object = JSON.parse(localStorage.getItem(e));
						if (object.currentVolume) {
							object.currentVolume = undefined;
						};
						localStorage.setItem(e, JSON.stringify(object));
					}
				});
				localStorage.setItem("WEBMPS:versionString","1.0");
				element.output.innerHTML += "Data structure update OK.<br/>";
				break;
			};
		};
		element.progress.style.width = ((100 / a.length) * (i + 1)).toString() + "%";
	});
	element.output.innerHTML += "Operations finished. Click next to close recovery and refresh WebMP.<br/>";
}

document.addEventListener("readystatechange", function () {
	if (this.readyState.toLowerCase() == "interactive") {
		// Get elements
		globalButtonSet.prev = document.querySelector("#btn-prev");
		globalButtonSet.next = document.querySelector("#btn-next");
		forms.mainAct = document.querySelector("#f-action");
		self.element.output = document.querySelector("#final-out");
		element.progress = document.querySelector(".progress-inner");
		// Switch to
		switchTo("tab-main");
		new Promise((resolve) => {
			globalButtonSet.next.onclick = function () {
				switch (currentTab) {
					case "tab-update": {
						switchTo("tab-finalize");
						actActions();
						break;
					};
					case "tab-main": {
						let chosenAction = null;
						Array.from(forms.mainAct.elements).forEach((e) => {
							if (e.checked) {
								chosenAction = e.id;
							}
						});
						switch (chosenAction) {
							case "i-main-update": {
								switchTo("tab-update");
								actions.push("update");
								break;
							};
						};
						break;
					};
					case "tab-finalize": {
						sourceWindow.postMessage({
							action: "reload"
						}, "*");
						window.close();
					};
				};
			};
			globalButtonSet.prev.onclick = switchBack;
			resolve();
		});
	}
});