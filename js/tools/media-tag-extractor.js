"use strict";

var gui = {};
var defaultMessage = "";
var fileBlob;

function readBlobMetaData() {
	new jsmediatags.Reader(fileBlob).read({
		onSuccess: (e) => {
			gui.ct.style.background = "rgba(0, 255, 0, 0.3)";
			gui.ct.style.color = "#0b0";
			gui.ct.innerHTML = "File [$1] has these properties: <br>".replace("$1", fileBlob.name);
			if (e.tags.picture) {
				let picURI = "data:";
				picURI += e.tags.picture.format;
				picURI += ";base64,";
				let picData = "";
				e.tags.picture.data.forEach(function (e) {
					picData += String.fromCharCode(e);
				});
				
			}
		},
		onError: (e) => {
			gui.ct.style.background = "rgba(255, 0, 0, 0.3)";
			gui.ct.style.color = "#b00";
			gui.ct.innerHTML = "Error $1 occured: $2".replace("$1", e.type).replace("$2", e.info);
		}
	});
}

document.onreadystatechange = function () {
	if (this.readyState.toLowerCase() == "interactive") {
		document.body.style.height = (innerHeight - parseInt(getComputedStyle(document.body).margin) * 2).toString() + "px";
		addEventListener("resize", function () {
			document.body.style.height = (innerHeight - parseInt(getComputedStyle(document.body).margin) * 2).toString() + "px";
		});
		document.body.addEventListener("dragenter", function (e) {
			e.preventDefault();
			e.stopPropagation();
			console.log("DRAG_ENTER");
		}, true);
		document.body.addEventListener("dragover", function (e) {
			e.preventDefault();
			e.stopPropagation();
			console.log("DRAG_OVER");
		}, true);
		document.body.addEventListener("dragleave", function (e) {
			e.preventDefault();
			e.stopPropagation();
			console.log("DRAG_LEAVE");
		}, true);
		document.body.addEventListener("drop", function (e) {
			e.preventDefault();
			e.stopPropagation();
			console.log("DROP");
			fileBlob = e.dataTransfer.files[0];
			readBlobMetaData();
		}, true);
		gui = {};
		gui.imbtn = document.querySelector("#file-input");
		gui.imbtn.oninput = function () {
			fileBlob = this.files[0];
			readBlobMetaData();
		};
		gui.imbtnc = document.querySelector("#file-button");
		gui.imbtnc.onclick = () => {
			gui.imbtn.click();
		};
		gui.clrbtn = document.querySelector("#clear-button");
		gui.ct = document.querySelector("#media-info");
		defaultMessage = gui.ct.innerHTML;
		gui.clrbtn.onclick = function () {
			gui.ct.innerHTML = defaultMessage;
			gui.ct.style.background = "";
			gui.ct.style.color = "";
		};
	}
}