// ELSL
try {
	function _import(osrc, mime) {
		let src = osrc;
		let loader = document.createElement("script");
		if (!(mime == undefined || mime == null)) {
			if (mime.__proto__.constructor == String) {
				loader.type = mime;
			}
			else {
				loader.type = "text/javascript";
			}
		}
		switch (src) {
			case ":jquery":
				loader.src = "https://elsl.mwashcdn.ml/predef/jquery.js";
				break;
			case ":bootstrap":
				loader.src = "https://elsl.mwashcdn.ml/predef/bootstrap.js";
				break;
			case ":crypto":
				loader.src = "https://elsl.mwashcdn.ml/dependencies/crypto.js";
				break;
			case ":base64":
				loader.src = "https://elsl.mwashcdn.ml/dependencies/base64.js";
				break;
			default:
				loader.src = src;
		}
		loader.addEventListener("load", function() {
			try {
				loader.main();
			}
			catch (err) {
				console.log("No MAIN method defined.");
			}
			console.log("Loaded script from source [" + src + "].");
		});
		document.head.appendChild(loader);
		return loader;
	}

	function _istyle(osrc) {
		let src = osrc;
		let loader = document.createElement("link");
		loader.rel = "stylesheet";
		switch (src) {
			case ":bootstrap":
				loader.href = "https://elsl.mwashcdn.ml/predef/bootstrap.css";
				break;
			default:
				loader.href = src;
		}
		document.head.appendChild(loader);
		loader.addEventListener("load", function() {
			try {
				loader.main();
			}
			catch (err) {
				console.log("No MAIN method defined.");
			}
			console.log("Loaded script from source [" + src + "].");
		});
		return loader;
	}
	_ecma6_ = true;
	console.log("ELSL will be loaded in ECMA6 mode.");
}
catch (err) {
	function _import(osrc, mime) {
		src = osrc;
		loader = document.createElement("script");
		if (!(mime == undefined || mime == null)) {
			if (mime.__proto__.constructor == String) {
				loader.type = mime;
			}
			else {
				loader.type = "text/javascript";
			}
		}
		switch (src) {
			case ":jquery":
				loader.src = "https://elsl.mwashcdn.ml/predef/jquery.js";
				break;
			case ":bootstrap":
				loader.src = "https://elsl.mwashcdn.ml/predef/bootstrap.js";
				break;
			case ":crypto":
				loader.src = "https://elsl.mwashcdn.ml/dependencies/crypto.js";
				break;
			case ":base64":
				loader.src = "https://elsl.mwashcdn.ml/dependencies/base64.js";
				break;
			default:
				loader.src = src;
		}
		document.head.appendChild(loader);
		loader.addEventListener("load", function() {
			try {
				loader.main();
			}
			catch (err) {
				console.log("No MAIN method defined.");
			}
			console.log("Loaded script from source [" + src + "].");
		});
		return loader;
		src = undefined;
		loader = undefined;
	}

	function _istyle(osrc) {
		src = osrc;
		loader = document.createElement("link");
		loader.rel = "stylesheet";
		switch (src) {
			case ":bootstrap":
				loader.href = "https://elsl.mwashcdn.ml/predef/bootstrap.css";
				break;
			default:
				loader.href = src;
		}
		document.head.appendChild(loader);
		loader.addEventListener("load", function() {
			try {
				loader.main();
			}
			catch (err) {
				console.log("No MAIN method defined.");
			}
			console.log("Loaded script from source [" + src + "].");
		});
		return loader;
		src = undefined;
		loader = undefined;
	}
	_ecma6_ = false;
	console.log("ELSL will be loaded in compatible mode.");
}
//elsl.ext.tab.search
TabSearch = function(apply) {
	let text = apply.replace("?", "");
	if (text == undefined) {
		let text = location.search.replace("?", "");
	}
	console.log(text);
	let form = [];
	let output = {};
	form = text.split("&");
	console.warn(form);
	let count = 0;
	while (count < form.length) {
		form[count] = form[count].split("=");
		while (form[count].length > 2) {
			form[count].pop();
		}
		console.log("[elsl.ext.tab.search] Assigned item " + form[count][0] + " with value " + decodeURI(form[count][1]) + " inside table.");
		count++;
	}
	console.warn(form);
	if (_ecma6_) {
		count = 0;
		while (count < form.length) {
			output[decodeURI(form[count][0])] = decodeURI(form[count][1]);
			count++;
		}
	}
	else {
		console.error("[elsl.ext.tab.search] Does not support ECMA6.");
		output = new Error();
		output.message = "[elsl.ext.tab.search] Unsupported browser.";
	}
	console.warn(output);
	return output;
};