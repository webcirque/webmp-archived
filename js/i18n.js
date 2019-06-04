"use strict";

//Automatically changes the language
addEventListener("languagechange", function () {
	requestLanguage();
});

// i18n
function requestLanguage() {
	let codeArray = navigator.languages;
	// Choose language based on preference
	let availableLanguages = [
		"zh-cn", 
		"zh-tw", 
		"zh", 
		"en-us", 
		"en-gb", 
		"en", 
		"ja-ja", 
		"ja"
	];
	let availableLanguagesNative = [
		"中文（中国）", 
		"中文（臺灣）", 
		"中文", 
		"English (United States)", 
		"English (United Kingdom)", 
		"English (Global)", 
		"日本语（日本）",
		"日本语"
	];
	let determined = false;
	let preferred = "en";
	let preferredIndex = 5;
	codeArray.forEach((e, i) => {
		if (availableLanguages.indexOf(e.toLowerCase()) != -1) {
			if (!(determined)) {
				preferred = e;
				preferredIndex = availableLanguages.indexOf(e.toLowerCase());
				determined = true;
				console.info("Detected language: $1".replace("$1", availableLanguagesNative[preferredIndex]));
			}
		}
	});
	console.info("Using language: $1".replace("$1", availableLanguagesNative[preferredIndex]));
	self.lang = {
		threadOnline: "Thread [$1] is activated, $2 operation(s) per second.",
		methodInvalid: "Method \"$1\" is invalid",
		mediaStartedLoading: "Media loading from [$1]",
		fileLoading: "Loading local file [$1]",
		formatDetected: "Detected file format as [$1], type as [$2].",
		unsupportedFileType: "File extension [$1] with type [$2] is not supported.",
		keyPressed: "Key [$1] is pressed by user."
	};
	switch (preferredIndex) {
		case 0: {
			lang.threadOnline = "已启动[$1]线程，每秒执行$2次";
			lang.methodInvalid = "方法\"$1\"不可用";
			break;
		};
		case 1:
		case 2: {
			break;
		};
		case 3:
		case 4:
		case 5: {
			break;
		};
		case 6:
		case 7: {
			break;
		};
	};
};

requestLanguage();