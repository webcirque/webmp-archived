"use strict";
var themeBody, themeName = ["black", "white", "greend", "blued", "greenb", "blueb"];
var imagePaths = {
	"album": "defaultIcon.svg",
	"cc": "subtitles.svg",
	"close": "close.svg",
	"conf": "settings.svg",
	"download": "download.svg",
	"dcn": "dynamicCompressor.svg",
	"forward": "forward.svg",
	"fsc": "fullscreen.svg",
	"fsc-exit": "fullscreenExit.svg",
	"history": "history.svg",
	"info": "info.svg",
	"list": "playlist.svg",
	"media-spotify": "media_spotify.svg",
	"media-youtube": "media_youtube.svg",
	"muted": "muted.svg",
	"next": "next.svg",
	"open": "open.svg",
	"pause": "pause.svg",
	"play": "play.svg",
	"pbsp": "playbackSpeed.svg",
	"plus": "plus.svg",
	"prev": "prev.svg",
	"repeat": "repeat.svg",
	"replay": "replay.svg",
	"rewind": "rewind.svg",
	"search": "search.svg",
	"share": "share.svg",
	"shuffle": "shuffle.svg",
	"stream": "stream.svg",
	"vol-de": "volumeDown.svg",
	"vol-hi": "volumeHigh.svg",
	"vol-in": "volumeUp.svg",
	"vol-lo": "volumeLow.svg",
	"vol-me": "volumeMed.svg"
}
document.addEventListener("readystatechange", function () {
	if (this.readyState.toLowerCase() == "interactive") {
		themeBody == document.body;
	}
});

function themeIconChange(theme) {
	let themeIndex = themeName.indexOf(theme.toLowerCase());
	let iconDir = "error";
	switch (themeIndex) {
		// Plain icons
		case 0:
		case 1:
		case 2:
		case 3:{
			iconDir = "plain-pure";
			document.body.className = "theme-" + theme;
			break;
		};
		// Colored icons
		case 4:
		case 5: {
			iconDir = "plain-colored";
			document.body.className = "theme-" + theme;
			break;
		};
		default: {
			throw(new Error("Not the right theme!"));
			break;
		};
	};
	if (iconDir != "error") {
		for (let imgClass in imagePaths) {
			Array.from(document.getElementsByClassName("img-$1".replace("$1", imgClass))).forEach((e) => {
				e.src = "img/$1/$2".replace("$1", iconDir).replace("$2", imagePaths[imgClass]);
			});
		};
	};
}
