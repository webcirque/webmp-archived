// Media APIs
mediaUrl = {};
searchUrl = {};
lyricsUrl = {};
albumCoverUrl = {};

// mediaUrls
mediaUrl.qq = (id) => {
	return "http://dl.stream.qqmusic.qq.com/M800" + id + ".mp3?vkey=75542A364A8732491EFA2A2639A5EECA4065E2EE55A26262A9371E2A5E8FD37C03DB0BEF4F289D1429968BD8F9765DBE5A8BF76598DC5EA4&guid=5150825362&fromtag=1";
};
mediaUrl.netease = (id) => {
	return "http://music.163.com/song/media/outer/url?id=" + id + ".mp3";
};