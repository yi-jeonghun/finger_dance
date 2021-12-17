$('document').ready(function(){
	new Test().Init();
});

function Test(){
	var self = this;
	this._is_playing = false;
	this._timelapse = 0;
	this._timelapse_youtube = 0;
	this._src_ms = [];
	this._user_ms = [];
	this._ele_latency = null;

	this.Init = function(){
		{
			var start_ms = 3650;
			for(var i=0 ; i<60 ; i++){
				self._src_ms.push(start_ms + i*1000);
				self._user_ms.push(-1);
			}
		}
		self._ele_latency = $('#id_txt_latency');
		window._yt_player = new YoutubePlayer().Init();

		_yt_player.SetEventListener(self.YT_OnYoutubeReady, self.YT_OnFlowEvent, self.YT_OnPlayerReady, self.YT_OnPlayerStateChange);

		self.InitComponentHandle();
		self.Update();
		return this;
	};

	this.InitComponentHandle = function(){
		$('#id_btn_start').on('click', self.OnClickStart);
		$('#id_btn_stop').on('click', self.OnClickStop);
		$('#id_btn_tab').on('touchstart', self.OnTab);
	};

	this.OnClickStart = function(){
		_yt_player.Play();
	};

	this.OnClickStop = function(){
		self._is_playing = false;
		_yt_player.Stop();
	};

	this.OnTab = function(){
		// console.log('self._timelapse ' + self._timelapse);
		for(var i=0 ; i<self._src_ms.length ; i++){
			var diff = Math.abs(self._src_ms[i] - self._timelapse);
			if(diff < 100){
				self._user_ms[i] = self._timelapse;
				console.log('i ' + i + ' ' + self._timelapse);
				break;
			}
		}

		var cnt = 0;
		var sum = 0;
		for(var i=0 ; i<self._src_ms.length ; i++){
			if(self._user_ms[i] != -1){
				cnt++;
				sum += self._src_ms[i] - self._user_ms[i];
			}
		}

		console.log('sum ' + sum);
		console.log('cnt ' + cnt);
		var average = sum / cnt;
		console.log('averate ' + average);
		self._ele_latency.html(average);
	}

	this.YT_OnYoutubeReady = function(){
		_yt_player.LoadVideo('ucZl6vQ_8Uo');

	};

	this.YT_OnFlowEvent = function(ms){
		ms = parseInt(ms * 1000);
		self._timelapse_youtube = ms;
	};

	this.YT_OnPlayerReady = function(pb_rates, duration){
	};

	this.YT_OnPlayerStateChange = function(is_play){
		if(is_play){
			self._timelapse = 0;
			self._timelapse_youtube = 0;
			self._is_playing = true;
		}else{
			self._is_playing = false;
		}
	};

	this._delta = 0;
	this._tick = 0;
	this.Update = function(){
		{
			var now = Date.now();
			self._delta = now - self._tick;
			self._tick = now;
		}

		if(self._is_playing){
			//youtube와 시간차 보정
			{
				if(self._timelapse > self._timelapse_youtube){
					var diff = self._timelapse - self._timelapse_youtube;
					self._timelapse -= diff / 20;
				}else if(self._timelapse < self._timelapse_youtube){
					var diff = self._timelapse_youtube - self._timelapse;
					self._timelapse += diff / 20;
				}
			}
		}
		requestAnimationFrame(self.Update);
	};
}
