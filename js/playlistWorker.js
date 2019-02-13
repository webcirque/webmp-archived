"use strict";
// Initialize
var fS = null;
var fSMgr = null;
var unsavedPDir, unsavedPDirReader, unsavedPPath;
importScripts("../libs/crypto.js");
importScripts("../libs/sha1.js");

// Functions announce
// If tempStorage is finished
function tmpStoFinish() {
	fS.root.getDirectory("playlistMedia", {create: true}, (domDirectoryEntry) => {
		unsavedPDir = domDirectoryEntry;
		unsavedPDirReader = domDirectoryEntry.createReader();
		removeMediaFile();
	});
}
function refreshPDirReader() {
	unsavedPDirReader = unsavedPDir.createReader();
}

// Message fetcher
onmessage = (e) => {};

// Playlist functions for unsaved playlist
// Require subdirectory removal
// Require blank/useless file cleanage. Useless means the file is not either media (audio, video, subtitle, lyrics) file or JSON file
// Remove media files
function removeMediaFile(name, blob = null, identifier = new Date().toJSON()) {
	postMessage({
		"type": "notification/info",
		"message": "RMV_MEDIA_OPERATION_STARTED",
		"task": identifier
	});
	if (self.unsavedPDir) {
		if (self.unsavedPDirReader) {
			refreshPDirReader();
			unsavedPDirReader.readEntries((fileEntryList) => {
				if (fileEntryList.length == 0) {
					postMessage({
						"type": "notification/fail",
						"message": "RMV_MEDIA_OPERATION_EMPTY_DIR",
						"task": identifier
					});
				};
				fileEntryList.forEach((fileEntry, index) => {
					if (fileEntry.isFile) {
						if (index == 0) {
							unsavedPPath = [];
						};
						if (fileEntry.name == name) {
							fileEntry.remove(() => {
								postMessage({
									"type": "notification/success",
									"message": "RMV_MEDIA_OPERATION_SUCCEEDED",
									"task": identifier
								});
							}, (error) => {
								postMessage({
									"type": "notification/fail",
									"message": "RMV_MEDIA_OPERATION_FAILED",
									"error": error,
									"task": identifier
								});
							});
						} else {
							unsavedPPath.push(fileEntry.name);
						};
					} else if (fileEntry.isDirectory) {
						postMessage({
							"type": "notification/fail",
							"message": "TEMP_MEDIA_DIR_HAS_DIRECTORY",
							"error": {
								"stack": fileEntry.name
							},
							"task": identifier
						});
					} else {
						postMessage({
							"type": "notification/fail",
							"message": "TEMP_MEDIA_DIR_UNKNOWN_OBJECT",
							"object": fileEntry,
							"task": identifier
						});
						console.log("你遇到了千年难得一遇的奇观，赶紧去买彩票吧！");
					};
					if (index == fileEntryList.length - 1) {
						postMessage({
							"type": "notification/info",
							"message": "TEMP_MEDIA_REMOVAL_ENDED",
							"task": identifier
						});
					};
				});
			}, (error) => {
				postMessage({
					"type": "notification/fail",
					"message": "TEMP_MEDIA_DIR_READER_ENTRY_ERROR",
					"error": error,
					"task": identifier
				});
			})
		} else {
			tmpStoFinish();
			postMessage({
				"type": "notification/fail",
				"message": "TEMP_MEDIA_DIR_READER_NOT_READY",
				"task": identifier
			});
		};
	} else {
		postMessage({
			"type": "notification/fail",
			"message": "TEMP_FILE_SYSTEM_NOT_READY",
			"task": identifier
		});
	};
};
// Add media files
function addMediaFile(blob, name = null, identifier = new Date().toJSON()) {
	postMessage({
		"type": "notification/info",
		"message": "ADD_MEDIA_OPERATION_STARTED",
		"task": identifier
	});
	if (self.unsavedPDir) {
		if (name == null || name == undefined) {
			if (self.CryptoJS) {
				name = CryptoJS.SHA1(blob.name);
			} else {
				postMessage({
					"type": "notification/fail",
					"message": "NO_FILENAME_PROVIDED",
					"task": identifier
				});
			}
		};
		if (blob != null) {
			unsavedPDir.getFile(name, {create: true}, (fileEntry) => {
				if (unsavedPPath.indexOf(name) == -1) {
					unsavedPPath.push(name);
				};
				fileEntry.createWriter((writer) => {
					if (writer.length <= 0) {
						writer.onwritestart = function () {
							postMessage({
								"type": "notification/info",
								"message": "FILE_WRITE_STARTED",
								"task": identifier
							});
						};
						writer.onwriteend = function () {
							postMessage({
								"type": "notification/success",
								"message": "FILE_WRITE_SUCCESS",
								"task": identifier
							});
						};
						writer.onerror = function (e) {
							postMessage({
								"type": "notification/error",
								"message": "FILE_WRITE_ERROR",
								"task": identifier,
								"error": e
							});
						};
						writer.onabort = function () {
							postMessage({
								"type": "notification/error",
								"message": "FILE_WRITE_ABORTED",
								"task": identifier
							});
						};
						writer.write(blob);
					} else {
						postMessage({
							"type": "notification/fail",
							"message": "FILE_WRITE_ERROR_ALREADY_HAD_DATA",
							"task": identifier
						});
					};
				}, (error) => {
					postMessage({
						"type": "notification/fail",
						"message": "FILE_WRITE_ERROR_CREATION",
						"error": error,
						"task": identifier
					});
				});
			}, (error) => {
				postMessage({
					"type": "notification/fail",
					"message": "FILE_FETCH_ERROR",
					"error": error,
					"task": identifier
				});
			});
		} else {
			postMessage({
				"type": "notification/fail",
				"message": "NO_DATA_PROVIDED",
				"task": identifier
			});
		};
	} else {
		postMessage({
			"type": "notification/fail",
			"message": "TEMP_FILE_SYSTEM_NOT_READY",
			"task": identifier
		});
	};
};

// Load temporary storage
{
	let reqFS = null;
	let success = false;
	if (self.requestFileSystem) {
		reqFS = requestFileSystem;
	} else if (self.webkitRequestFileSystem) {
		reqFS = webkitRequestFileSystem;
	};
	if (reqFS) {
		// Requires 2G, 1G, 0.5G or 256MB
		reqFS(0, 1024 * 1024 * 2048, (fileSystem) => {
			fS = fileSystem;
			tmpStoFinish();
			console.log("No problem with fetching 2GB storage.");
		}, (error) => {
			console.error("Having problem with fetching 2GB storage: %s. Changing to 1GB...", error.stack);
			reqFS(0, 1024 * 1024 * 1024, (fileSystem) => {
				fS = fileSystem;
				tmpStoFinish();
				console.log("No problem with fetching 1GB storage.");
			}, (error) => {
				console.error("Having problem with fetching 1GB storage: %s. Changing to 0.5GB...", error.stack);
				reqFS(0, 1024 * 1024 * 512, (fileSystem) => {
					fS = fileSystem;
					tmpStoFinish();
					console.log("No problem with fetching 0.5GB storage.");
				}, (error) => {
					console.error("Having problem with fetching 0.5GB storage: %s. Changing to 256MB...", error.stack);
					reqFS(0, 1024 * 1024 * 256, (fileSystem) => {
						fS = fileSystem;
						tmpStoFinish();
						console.log("No problem with fetching 256MB storage.");
					}, (error) => {
						console.error("Having problem with fetching 0.5GB storage: %s. Gave up.", error.stack);
					})
				});
			});
		});
	} else {
		console.log("No file system available.");
	};
	if (self.navigator) {
		if (navigator.storage) {
			if (navigator.storage.estimate) {
				navigator.storage.estimate().then((storageInfo) => {
				fSMgr = storageInfo;
				postMessage({
					"type": "notification/success",
					"message": "TEMP_FILE_SYSTEM_READY"
				});
			}).catch((error) => {
				console.error(error.stack);
				postMessage({
					"type": "notification/fail",
					"message": "TEMP_FILE_SYSTEM_FAILED_TO_LOAD",
					"error": error
				});
			});
			};
		};
	};
};