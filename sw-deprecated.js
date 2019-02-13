"use strict";

importScripts("libs/cache-polyfill.js");

var mainCache, rscCache;

self.addEventListener("install", function (eventA) {
	eventA.waitUntil(
		caches.open("webmp").then((cache) => {
			mainCache = cache;
			return cache.addAll([
				"./",
				"index.htm",
				"core.htm",
				"settings.htm",
				"js/index.js",
				"js/support.js",
				"js/core.js",
				"js/settings.js",
				"css/index.css",
				"css/core.css",
				"css/settings.css",
				"css/font/Verdana_r.ttf",
				"libs/elsl.pre1.js",
				"libs/elsl.media.subtitles.js",
				"libs/crypto.js",
				"libs/sha1.js",
				"libs/base64.min.js",
				"libs/jsmediatags.min.js"
			]);
		})
	);
});

/* self.addEventListener("install", function (eventA) {
	eventA.waitUntil(
		caches.open("app-resources").then((cache) => {
			return cache.addAll([
				"sound/error.aac",
				"sound/lowBattery.aac",
				"sound/notify.aac",
				"img/close.png",
				"img/defaultBackground.jpg",
				"img/defaultIcon.png",
				"img/dynamicCompressor.png",
				"img/icon.png",
				"img/icon32.png",
				"img/icon64.png",
				"img/icon128.png",
				"img/icon256.png",
				"img/icon512.png",
				"img/muted.png",
				"img/pause.png",
				"img/play.png",
				"img/playlistBig.png",
				"img/playbackSpeed.png",
				"img/settings.png",
				"img/volumeDown.png",
				"img/volumeUp.png"
			]);
		})
	);
}); */

self.addEventListener("fetch", function (event) {
	if (event.request.url.indexOf("blob:" != 0)) {
		event.respondWith(caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		}));
	}
});