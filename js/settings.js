// Forbids context menu
document.oncontextmenu = () => {
	return false;
}

// Loads document
document.onreadystatechange = function () {
	switch (this.readyState.toLowerCase()) {
		case "interactive": {
			// When the document has finished framework loading
			settingTabs = {};
			settingTabs.main = document.getElementById("settings-main");
			settingTabs.playback = document.getElementById("settings-playback");
			settingTabs.misc = document.getElementById("settings-misc");
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