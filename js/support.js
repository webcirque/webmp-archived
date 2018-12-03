document.addEventListener("readystatechange", function () {
	if (this.readyState.toLowerCase() == "interactive") {
		let unsupported = document.getElementById("unsupported");
		let firefox = document.getElementById("firefox-notice");
		if (window.navigator) {
			if (window.chrome || window.opera) {
				unsupported.remove();
				firefox.remove();
			} else if (window.firefox || navigator.userAgent.search("Firefox") != -1) {
				unsupported.remove();
				firefox.style = "display:block";
				document.querySelector("#firefox-notice button").onclick = () => {
					firefox.remove();
				}
			} else {
				if (navigator.userAgent.search("MSIE") == -1 && navigator.userAgent.search("Netscape") == -1) {
					unsupported.remove();
					firefox.remove();
				}
			}
		}
	}
});