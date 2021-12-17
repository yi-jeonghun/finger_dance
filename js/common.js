

function GetURLParam(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null) {
		return null;
	}
	return decodeURI(results[1]) || 0;
}

function ConvertSecondsForDiaplsy(secs){
	var min = parseInt(secs / 60);
	var sec = secs % 60;
	var sec_str = '';
	if(sec < 10)
		sec_str = '0' + sec;
	else
		sec_str = sec;
	return min + ':' + sec_str;
}

function GetVideoIDFromURL(video_url){
	var video_id = '';
	if(video_url.startsWith('https://www.youtube.com/watch?')){
		var query_str = video_url.split('?')[1];
		var query_list = query_str.split('&');

		for(var i=0 ; query_list.length ; i++){
			var key = query_list[i].split('=')[0];
			var val = query_list[i].split('=')[1];
			if(key == 'v'){
				video_id = val;
				break;
			}
		}
	}else if(video_url.startsWith('https://youtu.be/')){
		var str = 'https://youtu.be/';
		video_id =  video_url.substring(str.length);
	}else{
		video_id = video_url;
	}
	return video_id;
}