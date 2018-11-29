// Subtitle unit
if (!(window.Subtitle)) {
	Subtitle = function (start, end, text, prop) {
		if (start.constructor == Number) {
			if (start >= 0) {
				this.start = start;
			} else {
				throw(new RangeError("Invalid start time: $1 must be a positive number".replace("$1",start)));
			};
		} else {
			throw(new TypeError("Invalid start time: must be a number"));
		};
		if (end.constructor == Number) {
			if (end >= 0) {
				this.end = end;
			} else {
				throw(new RangeError("Invalid end time: $1 must be a positive number".replace("$1",end)));
			};
		} else {
			throw(new TypeError("Invalid end time: must be a number"));
		};
		if (text.constructor == String) {
			this.text = text;
		} else {
			throw(new TypeError("Invalid text: must be a string"));
		};
		if (prop.constructor == Object) {
			this.prop = prop;
		} else {
			throw(new TypeError("Invalid property: must be an object"));
		};
	};
};

// Subtitle list
class SubtitlesList extends Array {
	
}

// Subtitles container
if (!(window.Subtitles)) {
	Subtitles = function (text) {
		if (text) {
			// Support Windows
			while (text.search("\u000d\u000a") != -1) {
				text = text.replace("\u000d\u000a", "\n");
			}
			this.text = text;
		}
		this.import = {
			"srt": (text) => {
				let cmdBegin = new Date();
				text = text || this.text;
				this.text = text;
				if (text) {
					text = text.trim();
				} else {
					throw(new Error("Invalid SRT text"));
				}
				let list = text.split("\n\n");
				let count = 0;
				let donum = 0;
				while (donum < list.length) {
					list[donum] = list[donum].split("\n");
					// Test if the item has the ID
					if (parseInt(list[donum][0].trim()).toString() == list[donum][0].trim()) {
						// The item does have the ID
						shift = 1;
					} else {
						// The item does not have the ID
						shift = 0;
					};
					// Converting time
					list[donum][shift] = list[donum][shift].trim();
					if (list[donum][shift].search("-->") != -1) {
						list[donum][shift] = list[donum][shift].replace(" -->","-->");
						list[donum][shift] = list[donum][shift].replace("--> ","-->");
						while (list[donum][shift].search("  ") != -1) {
							list[donum][shift] = list[donum][shift].replace("  "," ");
						};
						let timeInfo = list[donum][shift].split(" ");
						let startT = list[donum][shift].split("-->")[0];
						let endT = list[donum][shift].split("-->")[1];
						while (startT.search(",") != -1) {
							startT = startT.replace(",",".");
						};
						while (endT.search(",") != -1) {
							endT = endT.replace(",",".");
						};
						startT = startT.split(":");
						endT = endT.split(":");
						let start = 0;
						count = 0;
						while (count < startT.length) {
							start += parseFloat(startT[startT.length - 1 - count]) * Math.pow(60, count);
							count ++;
						};
						start = Math.round(start * 100) / 100;
						let end = 0;
						count = 0;
						while (count < endT.length) {
							end += parseFloat(endT[endT.length - 1 - count]) * Math.pow(60, count);
							count ++;
						};
						end = Math.round(end * 100) / 100;
						let subtext = "";
						count = shift + 1;
						while (count < list[donum].length) {
							subtext += "\n" + list[donum][count];
							count ++;
						};
						subtext = subtext.replace("\n","");
						count = shift + 1;
						prop = {};
						while (count < timeInfo.length) {
							let propName = timeInfo[count].split(":")[0];
							let propValue = timeInfo[count].split(":")[1];
							prop[propName] = propValue;
							count ++;
						};
						this.list[this.list.length] = new Subtitle (start, end, subtext, prop);
						this.type = "SRT";
					} else {
						throw(new Error("Invalid SRT text: timeline not found at item $1".replace("$1",donum + 1)));
					}
					donum += 1;
				}
				let cmdEnd = new Date();
				if (window.debugMode) {
					console.log("SRT parsing took " + (cmdEnd.getMilliseconds() - cmdBegin.getMilliseconds()) + "ms.");
				}
				return this;
			},
			"lrc": (text) => {}
		};
		this.import.vtt = this.import.srt;
		this.export = {
			"srt": () => {},
			"lrc": () => {}
		};
		this.type = "";
		this.list = new SubtitlesList();
		this.lastMatches = new SubtitlesList();
		this.currentSub = (time) => {
			let cmdBegin = new Date();
			if (this.monitor) {
				time = this.monitor.time;
			} else {
				time = time || 0;
			};
			pos = 0;
			let bunch = this.list.length;
			let chunk = Math.round(Math.sqrt(bunch));
			let chunkL = Math.ceil(bunch / chunk);
			let match = new SubtitlesList();
			if (window.debugMode) {
				console.log("Seperated list search in $1 chunks, $2 elements in each chunk, $3 elements in the last chunk.".replace("$1",chunkL).replace("$2",chunk).replace("$3",(bunch - chunk * chunkL + chunk)));
			};
			let count = 0;
			while (count < this.lastMatches.length) {
				if (this.lastMatches[count].start <= time && this.lastMatches[count].end >= time) {
					match[match.length] = this.lastMatches[count];
				};
				if (this.lastMatches[count].end < time || this.lastMatches[count].start > time) {
					let expired = this.lastMatches.splice(count, 1);
					if (window.debugMode) {
						console.warn("Expired subtitle: %o", expired);
					};
				};
				count ++;
			};
			count = 0;
			while (count < chunkL) {
				if (time < this.list[0].start) {
					break;
				};
				if (count + 2 <= chunkL) {
					if (this.list[pos].start <= time && this.list[pos + chunk].start >= time) {
						break;
					};
				} else {
					break;
				};
				pos += chunk;
				count ++;
			};
			count = 0;
			while (count < chunk) {
				if (this.list[pos].start <= time && this.list[pos].end >= time) {
					if (match.indexOf(this.list[pos]) == -1) {
						match[match.length] = this.list[pos];
					};
				};
				if (pos + 1 < this.list.length) {
					pos ++;
				};
				count ++;
			};
			let cmdEnd = new Date();
			if (window.debugMode) {
				console.log("Searching took " + (cmdEnd.getMilliseconds() - cmdBegin.getMilliseconds()) + "ms.");
			}
			this.lastMatches = match;
			return match;
		};
	};
};
