$('document').ready(function(){
	window._drum_player = null;//new DrumPlayer().Init();
	window._atlas = new Atlas().Init();
	window._timer = new Timer().Init();

	window._play_game_control = new PlayGameControl().Init();
});

function PlayGameControl(){
	var self = this;
	this._game_id = null;
	this._video_id = null;
	this._sound_key_list = [
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY
	];
	this._i_like = false;
	this._my_score = -1;
	this._my_rank = -1;
	this._ddr_player_height = 0;
	this._is_fullscreen = false;
	this._is_mobile_device = false;
	this._is_embedded = false;
	this._level_allowed_to_play = true;

	this.Init = function(){
		var md = new MobileDetect(window.navigator.userAgent);
		if(md.mobile()) {
			self._is_mobile_device = true;
		}else{ 
			self._is_mobile_device = false;
		}
		console.log('self._is_mobile_device ' + self._is_mobile_device);
		$('#id_txt_debug').html('md ' + self._is_mobile_device);

		_auth_control._cb_on_login = self.OnLogin;
		_auth_control._cb_on_logout = self.OnLogOut;
		_auth_control._cb_on_login_fail = self.OnLoginFail;

		self.InitLayout();
		self.InitComponentHandle();
		self.InitGameModules();
		self._game_id = GetURLParam('id');
		self._is_embedded = GetURLParam('e') != null ? true : false;

		console.log('_game_id ' + self._game_id);

		if(self._game_id != null){
			var path = `db/${self._game_id}.json`;
			$.getJSON(path, function(json) {
				console.log('json loaded ');
				window._game_data = json;
				// console.log(json); // this will show the info it in firebug console
				self.DisplayGameData(window._game_data);

				{
					console.log('SEND Message to CORDOVA ');
					const message = 'message';
					const messageObj = {message: message};
					const stringifiedMessageObj = JSON.stringify(messageObj);
					// console.log('window.webkit ' + window.webkit);
					// console.log('window.webkit.messageHandlers ' + window.webkit.messageHandlers);
					// if (window.webkit && window.webkit.messageHandlers) {
					// 	console.log('postmessage call on webkit');
					// 	window.webkit.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj);
					// }
					webkit.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj);
				}
			});
	
			// self.DisplayGameData(window._game_data);
			// self.GetLike();
			// self.GetRanking();
		}

		window.addEventListener('resize', function(){
			console.log('resize');
			self.InitLayout();
		});
	};

	this.InitLayout = function(){
		if(self._is_mobile_device){
			var player_height = 120;
			self._ddr_player_height = window.innerHeight - player_height;
	
			$('#ddr_player').css('height',  self._ddr_player_height + 'px');
			$('#rank_layer').css('height', self._ddr_player_height + 'px');
			$('#player').css('height', player_height + 'px');
	
			self.ChangeLayout(LAYOUT.INFO);
		}else{
			var width = window.innerWidth;
			var canvas_width = 400;
			self._ddr_player_height = 700;
			var w1 = (width - canvas_width)/2;//canvas가 들어가고 남는 부분을 2분할
			var ddr_player_width = canvas_width + w1;
			
			$('#player').css('width', w1);
			$('#player').css('left', 0);
			$('#player').css('top', 450);
			
			// console.log('height ' + $('#player').innerHeight());

			$('#ddr_player').css('left', w1 + 'px');
			$('#ddr_player').css('width', ddr_player_width + 'px');

			$('#ddr_player_bg_layer').css('left', w1 + 'px');
			$('#ddr_player_bg_layer').css('width', canvas_width + 'px');
			$('#ddr_player_bg_layer').css('height', self._ddr_player_height + 'px');

			$('#ddr_player_layer1').css('left', w1 + 'px');
			$('#ddr_player_layer1').css('width', canvas_width + 'px');
			$('#ddr_player_layer1').css('height', self._ddr_player_height + 'px');

			$('#info_layer').css('left', 0 + 'px');
			$('#info_layer').css('width', w1 + 'px');
			$('#info_layer').css('height', 450 + 'px');

			$('#rank_layer').css('left', w1 + canvas_width);
			$('#rank_layer').css('width', w1);
			$('#rank_layer').css('height', window.innerHeight);

			self.ChangeLayout(LAYOUT.INFO);
		}
	};

	this.InitComponentHandle = function(){
		$('#id_btn_play').on('click', self.PlayGame);

		$('#id_btn_like').on('click', self.Like);
		$('#id_btn_back').on('click', function(){ window.history.back(); });
		$('#id_btn_home').on('click', function(){ document.location.href = 'https://beatmaster.me'; });
		$('#id_btn_rank').on('click', self.OnRankBtnClick);
		$('#id_btn_rank_hide').on('click', self.OnRankHideClick);
		$('#id_btn_stop_small').on('click', self.OnStopBtnClick);
		$('#id_btn_fullscreen').on('click', self.OnFullScreenBtnClick);
		$('#id_img_vibration').on('click', self.OnVibrationClick);
		$('#id_btn_stop').on('click', self.OnStopBtnClick);
		$('#id_btn_retry').on('click', self.RetryGame);
	};

	this.RetryGame = function(){
		$('#id_retry_area').css('display', 'none');
		// window._game_control.StopGame();
		window._game_control.PrepareGame();
		window._game_control.PlayGame();
	}

	this.OnVibrationClick = function(){
		_game_control._vibration_on_off = !_game_control._vibration_on_off;
		if(_game_control._vibration_on_off){
			$('#id_txt_vibration').html('ON');
			$('#id_img_vibration').attr('src', 'img/vibration_on.png');
		}else{
			$('#id_txt_vibration').html('OFF');
			$('#id_img_vibration').attr('src', 'img/vibration_off.png');
		}
	};

	this.OnFullScreenBtnClick = function(){
		var elem = document.getElementById("lo_play");
		if(self._is_fullscreen == true){
			self._is_fullscreen = false;
			$('#id_icon_fullscreen').removeClass('fa-compress');
			$('#id_icon_fullscreen').removeClass('fa-expand');
			$('#id_icon_fullscreen').addClass('fa-compress');

		  if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) { /* Firefox */
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
				document.webkitExitFullscreen();
			} else if (document.msExitFullscreen) { /* IE/Edge */
				document.msExitFullscreen();
			}
		}else{
			self._is_fullscreen = true;
			$('#id_icon_fullscreen').removeClass('fa-compress');
			$('#id_icon_fullscreen').removeClass('fa-expand');
			$('#id_icon_fullscreen').addClass('fa-compress');

			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.mozRequestFullScreen) { /* Firefox */
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
				elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) { /* IE/Edge */
				elem.msRequestFullscreen();
			}
		}
		setTimeout(self.InitLayout, 300);
	};

	this.OnRankBtnClick = function(){
		self.RankingLayerShowHide(true);
	};

	this.OnRankHideClick = function(){
		self.RankingLayerShowHide(false);
	};

	this.ShowHidePlayStopButton = function(show_play, show_stop){
		if(show_play){
			if(self._level_allowed_to_play == true){
				$('#id_btn_play').css('display', '');
			}
		}else{
			$('#id_btn_play').css('display', 'none');
		}

		if(show_stop){
			$('#id_btn_stop').css('display', '');	
		}else{
			$('#id_btn_stop').css('display', 'none');	
		}
	};

	this.OnStopBtnClick = function(){
		console.log('OnStopBtnClick ');
		window._game_control.StopGame();

		self.ShowHidePlayStopButton(true, false);

		self.ChangeLayout(LAYOUT.INFO);
		/* stop하고 나서 다시 play를 할 수 있도록 하기 위해서 prepare를 해 둬야 한다. */
		window._game_control.PrepareGame();
	};

	this.ChangeLayout = function(layout){
		switch (layout) {
			case LAYOUT.INFO:
				$('#info_layer').css('visibility', 'visible');
				$('#play_layer').css('visibility', 'hidden');
				break;
			case LAYOUT.PLAY:
				$('#info_layer').css('visibility', 'hidden');
				$('#play_layer').css('visibility', 'visible');
				break;
		}
	};

	this.RankingLayerShowHide = function(is_show){
		if(is_show){
			$('#rank_layer').css('visibility', 'visible');
			self.GetRanking();
		}else{
			$('#rank_layer').css('visibility', 'hidden');
		}
	};

	this.PlayGame = function(){
		if(self._is_mobile_device){
			self.ChangeLayout(LAYOUT.PLAY);
		}

		self.ShowHidePlayStopButton(false, true);
		$('#id_retry_area').css('display', 'none');

		self.UpdatePlayCount();
		window._game_control.PlayGame();
	};

	this.UpdatePlayCount = function(){
		var data = {
			game_id:self._game_id
		};
		$.ajax({
			url: '/beat_api/update_play_count',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					console.log('updated ');
					self._play_count++;
					$('#id_text_play_count').html(self._play_count);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnYoutubeStopped = function(){
		console.log('OnYoutubeStopped ' );
		if(_game_control._is_playing){
			// self.OnStopBtnClick();
		}
	};

	this.ShowRetryButton = function(){
		$('#id_retry_area').css('display', '');
	};

	this.OnGameFinished = function(is_complete){
		console.log('OnGameFinished ' + is_complete);

		if(_game_control._is_playing){
			self.SaveGameResult(is_complete);
			if(is_complete == true){
				if(_auth_control._user_info == null){
					// self.ShowHideLogin(true);
					// self._need_to_save_score = true;
				}else{
					if(self._my_score < _game_control._score){
						self.SaveScore();
					}
				}
			}else{
				setTimeout(self.ShowRetryButton, 500);
				window._game_control.StopGame();
			}
		}
	};

	this.SaveGameResult = function(is_complete){
		var str = JSON.stringify({
			game_id: self._game_id,
			is_complete: is_complete
		});
		localStorage.setItem('game_result', str);
	};

	this.InitGameModules = function(){
		var game_width = 400;
		var game_height = 700;
		var screen_width = game_width;
		var screen_height = game_height;

		if(self._is_mobile_device){
			screen_width = window.innerWidth;
			screen_height = self._ddr_player_height;
		}

		window._yt_player = new YoutubePlayer().Init();
		window._game_control = new GameControl(game_width, game_height).Init();
		window._renderer = new Renderer(game_width, game_height, screen_width, screen_height).Init();
	};

	this.DisplayGameData = function(game_data){
		self._video_id = game_data.video_id;
		console.log('self._video_id ' + self._video_id);
		self._sound_key_list = JSON.parse(game_data.sound_key_list);
		// self.LoadInitDrums();

		// console.log('self._video_id ' + self._video_id);
		_game_control.SetGameType(game_data.game_type);
		_game_control._video_id = self._video_id;

		if(self._is_mobile_device){
			_game_control._base_offset_ms = window._game_data.base_offset_ms;
		}
		_game_control._cb_on_youtube_stopped = self.OnYoutubeStopped;
		_game_control._cb_on_game_finished = self.OnGameFinished;
		_game_control._cb_on_youtube_video_ready_to_play = self.OnYoutubeVideoReadyToPlay();

		var wave_n_beat = JSON.parse(game_data.wave_n_beat);
		_game_control._game_level = game_data.level;
		_game_control.SetWaveNBeat(wave_n_beat);
		_game_control.PrepareGame();

		$('#id_text_level').html(game_data.level);
	};

	this.OnYoutubeVideoReadyToPlay = function(){
		console.log('OnYoutubeVideoReadyToPlay ');
		$('#id_loading').css('display', 'none');
		self.ShowHidePlayStopButton(true, false);
	};

	this.LoadInitDrums = function(){
		_drum_player.LoadDrum(0, self._sound_key_list[0]);
		_drum_player.LoadDrum(1, self._sound_key_list[1]);
		_drum_player.LoadDrum(2, self._sound_key_list[2]);
		_drum_player.LoadDrum(3, self._sound_key_list[3]);
	};

	this.GetLike = function(){
		var data = {
			game_id:self._game_id
		};
		$.ajax({
			url: '/beat_api/get_like',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.UpdateLikeButton(res.like_data);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.Like = function(){
		if(_auth_control._user_info == null){
			alert('login');
			return;
		}
		var data = {
			game_id: self._game_id,
			like: (self._i_like == true ? false : true)
		};
		$.ajax({
			url: '/beat_api/like',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					console.log('res.like_data ' + res.like_data);					
					self.UpdateLikeButton(res.like_data);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.UpdateLikeButton = function(like_data){
		console.log('like_data.total ' + like_data.total);
		console.log('like_data.i_like ' + like_data.i_like);
		$('#id_text_like_count').html(like_data.total);
		$('#id_btn_like').removeClass('btn-secondary');
		$('#id_btn_like').removeClass('btn-danger');
		if(like_data.i_like == 0){
			self._i_like = false;
			$('#id_btn_like').addClass('btn-secondary');
		}else{
			self._i_like = true;
			$('#id_btn_like').addClass('btn-danger');	
		}
	};

	this.GetMyScoreAndRank = function(first){
		var data = {
			game_id:self._game_id
		};
		$.ajax({
			url: '/beat_api/get_my_score_rank',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					if(first == false){
						console.log('self._my_score ' + self._my_score);
						console.log('res.data.score ' + res.data.score);
						if(self._my_score < res.data.score){
							console.log('new high ' );
							// self.ShowHideResult(true);
							// $('#id_text_new_score').html(res.data.score);
							var plus_minus = '';
							if(self._my_rank != -1){
								var diff = self._my_rank - res.data.my_rank;
								if(diff > 0){
									plus_minus = '+';
								}else if(diff < 0){
									plus_minus = '-';
								}
							}
							// $('#id_text_new_rank').html(plus_minus + res.data.my_rank);
						}
					}

					self._my_score = res.data.score;
					self._my_rank = res.data.rank;
					$('#id_text_my_score').html(res.data.score);
					$('#id_text_my_rank').html(res.data.my_rank);
				}else{
					$('#id_text_my_score').html('-');
					$('#id_text_my_rank').html('-');
				}
			}
		});
	};

	this.OnLogin = function(){
		self.GetMyScoreAndRank(true/*first*/);
		console.log('level ' + _auth_control._user_info.level);
		
		//FIXME 향후 user level upgrade 기능 만들고 나면
		//아래 접근 제한 기능을 활성화 해야 함.
		// if(_game_data.level > _auth_control._user_info.level){
		// 	self._level_allowed_to_play = false;
		// 	self.ShowHidePlayStopButton(false, false);
		// 	$('#id_txt_check_level').html('You can not play <br>Game Level ' + _game_data.level);
		// }else{
			self._level_allowed_to_play = true;
			self.ShowHidePlayStopButton(true, false);
			$('#id_txt_check_level').html('');
		// }
	};

	this.OnLogOut = function(){
		self.OnLoginFail();
	}

	this.OnLoginFail = function(){
		//proc guest permission
		console.log('_game_data.level ' + _game_data.level);
		// if(_game_data.level == 1){
		// 	self._level_allowed_to_play = true;
		// 	self.ShowHidePlayStopButton(true, false);
		// 	$('#id_txt_check_level').html('');
		// }else{
		// 	self._level_allowed_to_play = false;
		// 	self.ShowHidePlayStopButton(false, false);
		// 	$('#id_txt_check_level').html('Guest user can play only<br> Game Level 1.');
		// }
	};

	this.GetRanking = function(){
		var data = {
			game_id:self._game_id
		};
		console.log('self._game_id ' + self._game_id);
		$.ajax({
			url: '/beat_api/get_ranking',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DisplayRanking(res.ranking);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.DisplayRanking = function(ranking){
		console.log('ranking ' + ranking.length);
		var ele_table_ranking = $('#id_table_ranking');
		ele_table_ranking.empty();
		var cnt = 0;

		var txt = '';
		ranking.forEach(function(r){
			txt += '<tr>';
			txt += '<td>' + new Number(cnt+1) + '</td>';
			txt += '<td>';
			txt += '<image src="' + r.image_url + '" style="width:20px; height:20px"></image> &nbsp';
			txt += r.name;
			txt += '</td>';
			txt += '<td>' + r.score + '</td>';
			txt += '</tr>';
			cnt++;

			console.log('cnt ' + cnt);

			if(cnt == ranking.length){
				ele_table_ranking.append($(txt));
			}
		});
	};

	this.SaveScore = function(){
		if(self._is_embedded){
			console.log('is embedded not save score. ');
			return;
		}

		if(_auth_control._user_info == null){
			return;
		}

		var data = {
			game_id:self._game_id,
			score: _game_control._score
		};
		$.ajax({
			url: '/beat_api/save_score',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					console.log('saved ');
					self.GetRanking();
					self.GetMyScoreAndRank(false/*not first*/);
				}else{
					alert(res.err);
				}
			}
		});
	};
}