// Subtitle unit
if (!(window.Subtitle)) {
	Subtitle = function (start = 0, end = 0, text = "") {
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
		if (text.constructor == SubtitleContent) {
			this.text = text;
		} else {
			throw(new TypeError("Invalid text: must be a SubtitleContent"));
		};
	};
};

// Subtitle list
class SubtitlesList extends Array {}
class SubtitleContent extends Array {}
function SubtitleUnit (text = "", prop = {}) {
	this.text = text;
	this.prop = prop;
};

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
		this.metaInfo = {};
		this.globalStyles = {};
		this.import = {
			"srt": (text) => {
				// Restore
				this.metaInfo = {};
				this.type = "";
				this.globalStyles = {};
				this.list = new SubtitlesList();
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
						let subCont = new SubtitleContent;
						subCont.push(new SubtitleUnit(subtext, prop));
						this.list[this.list.length] = new Subtitle (start, end, subCont);
						this.type = "srt";
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
		this.import.vtt = (text) => {
			text = text.replace("WEBVTT\n","");
			this.import.srt(text);
		}
		this.import.ass = (text) => {
			// Restore
			this.metaInfo = {};
			this.type = "";
			this.globalStyles = {};
			text = text || this.text;
			let assSturcture = {};
			let assTotal = text.split("\n");
			let assMode = "";
			let assBlankLine = 0;
			let assFormat = [];
			let assEventFormat = [];
			assTotal.forEach((e, i) => {
				let assText = e.trim();
				if (assText == "") {
					assBlankLine ++;
				} else {
					switch (assText.toLowerCase()) {
						case "[script info]": {
							assSturcture.scriptInfo = i;
							assMode = "info";
							break;
						};
						case "[v4 styles]":
						case "[v4+ styles]": {
							assSturcture.styles = i;
							assMode = "styles";
							break;
						};
						case "[events]": {
							assSturcture.events = i;
							assMode = "events";
							break;
						};
						case "[fonts]": {
							assSturcture.fonts = i;
							assMode = "fonts";
							break;
						};
						case "[graphics]": {
							assSturcture.graphics = i;
							assMode = "graphics"
							break;
						};
						default: {
							switch (assMode) {
								case "info": {
									if (assText[0] != ";") {
										let assDeclare = assText.split(":");
										assDeclare.forEach((e, i) => {
											assDeclare[i] = e.trim();
										});
										this.metaInfo[assDeclare[0]] = assDeclare[1];
									}
									break;
								};
								case "styles": {
									if (assText[0] != ";") {
										let assDeclare = assText.split(":");
										assDeclare.forEach((e, i) => {
											assDeclare[i] = e.trim();
										});
										if (assDeclare[0] == "Format") {
											assFormat = assDeclare[1].split(",");
											assFormat.forEach((e, i) => {
												assFormat[i] = e.trim();
											});
										} else if (assDeclare[0] == "Style") {
											// Style declaration
										}
									}
									break;
								};
								case "events": {
									if (assText[0] != ";") {
										let assDeclare = assText.split(":");
										assDeclare.forEach((e, i) => {
											assDeclare[i] = e.trim();
										});
										if (assDeclare[0] == "Format") {
											assEventFormat = assDeclare[1].split(",");
											assEventFormat.forEach((e, i) => {
												assEventFormat[i] = e.trim();
											});
										} else if (assDeclare[0] == "Dialogue") {
											let assTrueText = assText.replace("Dialogue:", "");
											let assTrueDialogue = "";
											let assTrueComma = assTrueText.split(",");
											let assTrueStart = 0;
											let assTrueEnd = 0;
											assTrueComma.forEach((e, i) => {
												// Parse dialogue
												if (i >= assEventFormat.length) {
													assTrueDialogue += "," + e;
												} else {
													switch (assEventFormat[i].toLowerCase()) {
														case "start": {
															assTrueStart = 0;
															e.split(":").forEach((e, i, a) => {
																assTrueStart += parseFloat(e) * (60 ** (a.length - 1 - i));
															});
															break;
														};
														case "end": {
															assTrueEnd = 0;
															e.split(":").forEach((e, i, a) => {
																assTrueEnd += parseFloat(e) * (60 ** (a.length - 1 - i));
															});
															break;
														};
														case "text": {
															assTrueDialogue = e;
															break;
														};
													}
												}
											});
											while (assTrueDialogue.indexOf("\\N") > -1) {
												assTrueDialogue = assTrueDialogue.replace("\\N","\n");
											};
											let tempSubCon = new SubtitleContent;
											tempSubCon.push(new SubtitleUnit(assTrueDialogue, {}));
											this.list[this.list.length] = new Subtitle(assTrueStart, assTrueEnd, tempSubCon);
										};
									}
									break;
								};
							}
						}
					};
				}
			});
			if (window.debugMode) {
				console.info("Structure: %o", assSturcture);
			};
			this.type = "ass";
		};
		this.import.lrc = (text) => {
			if (text == null || text == undefined) {
				text = this.text;
			};
			this.list = new SubtitlesList();
			// Restore
			this.metaInfo = {};
			this.type = "";
			this.globalStyles = {};
			let lrcLines = text.split("\n");
			let tempLyrics = [];
			lrcLines.forEach((e, i) => {
				let realLrcLine = Array.from(e.trim());
				if (realLrcLine[0] = "[") {
					// Valid line
					let lyrics = "";
					let announce = "";
					let lyricsStarted = 0;
					realLrcLine.forEach((char) => {
						if (char == "]") {
							lyricsStarted --;
						} else if (char == "[") {
							lyricsStarted ++;
						} else if (lyricsStarted == 0) {
							lyrics += char;
						} else {
							announce += char;
						};
					});
					if (announce.search(/[A-Za-z,;! ]/) == -1) {
						// Annouce time
						let timeArr = announce.split(":");
						let timeStart = 0;
						timeArr.forEach((n, p) => {
							let num = parseInt(n);
							timeStart += n * (60 ** (timeArr.length - 1 - p));
						});
						tempLyrics.push(new Subtitle(timeStart, 0, new SubtitleContent(new SubtitleUnit(lyrics, {}))));
					} else {
						// Anounce information
					};
					tempLyrics.forEach((unit, index, origin) => {
						if (index < origin.length - 1) {
							unit.end = origin[index + 1].start;
						} else {
							unit.end = Infinity;
						};
						this.list.push(unit);
					});
					this.type = "lrc";
				} else {
					throw(new Error("Invalid LRC declare at line $1".replace("$1", i + 1)));
				};
			});
		};
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
