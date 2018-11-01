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
		count ++;
	};
	wmpPlayerCore.style.display = "";
	wmpPlayerCore.style.filter = "blur(2px)";
}

// Load document
document.onreadystatechange = function () {
	if (this.readyState.toLowerCase() == "interactive") {
		// Load elements
		wmpMenuBar = document.getElementById("menubar");
		wmpMenuBar.btnList = Array.from(wmpMenuBar.getElementsByTagName("div"));
		wmpDisplay = document.getElementById("display");
		wmpPlayerCore = document.getElementById("player-core");
		window.onresize = wmpResizeWindow;
		wmpResizeWindow();
		// Receive data
		addEventListener("message", function (ev) {
			if (ev.data.type == "playerCore") {
				coreData = ev.data;
				document.title = coreData.title;
			}
		});
		// Actions for items
		let wmpMenuBarCount = 0;
		while (wmpMenuBarCount < wmpMenuBar.btnList.length) {
			wmpMenuBar.btnList[wmpMenuBarCount].addEventListener("mouseup", function () {
				let count = 0;
				while (count < wmpMenuBar.btnList.length) {
					wmpMenuBar.btnList[count].className = "tab-item";
					count ++;
				};
				this.className = "tab-item-active";
			});
			wmpMenuBarCount ++;
		}
		wmpMenuBar.btnList[0].addEventListener("mouseup", function () {
			hideAllTabs();
			document.getElementById("start-tab").style.display = "";
		});
		wmpMenuBar.btnList[wmpMenuBar.btnList.length - 1].addEventListener("mouseup", function () {
			hideAllTabs();
			document.getElementById("info-tab").style.display = "";
		});
		wmpMenuBar.btnList[1].addEventListener("mouseup", function () {
			hideAllTabs();
			wmpPlayerCore.style.filter = "";
		});
		// Pass parameters to core
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
			wmpPlayerCore.src = wmpPlayerCorePath;
		}
	}
}