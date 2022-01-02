function GameControl(width, height){
	var self = this;
	this._width = width;
	this._height = height;
	this._base_line = 100;
	this._timelapse = 0;
	this._timelapse_youtube = 0;
	this._game_started = false;
	this._is_playing = false;
	this._duration_sec = 0;
	this._score = 0;
	this._game_data = null;
	this._video_id = '';
	this._cb_on_youtube_stopped = null;
	this._cb_on_game_finished = null;
	this._cb_on_youtube_video_ready_to_play = null;
	this._late_play = false;
	this._combo = 0;
	this._gameobj_begin_idx = 0;
	this._finish_notified = false;
	this._id_debug_ele = null;
	this._vibration_on_off = false;
	this._base_offset_ms = 0;
	this._game_level = 1;
	this._is_complete = false;
	this._is_excercise_mode = false;
	this._total_hit_count = 0;
	this._cur_wave_idx = 0;
	this._progress_percent = 0;
	this._draw_progress_bar = null;
	this._draw_text_combo = null;
	this._draw_text_score = null;

	this.Init = function(){
		console.log('GameControl Init');
		self._id_debug_ele = $('#id_debug');
		
		_yt_player.SetEventListener(self.YT_OnYoutubeReady, self.YT_OnFlowEvent, self.YT_OnPlayerReady, self.YT_OnPlayerStateChange);

		self._game_data = new GameData(MOVE_DIRECTION.UPWARD);
		self.InitKeyHandle();
		self.Update();
		return this;
	};

	this.SetVideoID = function(video_id){
		self._video_id = video_id;
	};

	this.YT_OnYoutubeReady = function(){
		console.log('YT_OnYoutubeReady');
		
		//https://www.youtube.com/watch?v=-tJYN-eG1zk
		// _yt_player.LoadVideo('V1bFr2SWP1I');
		// _yt_player.LoadVideo('MhURDZVpnZ8');
		console.log('self._video_id ' + self._video_id);
		if(self._video_id != ''){
			_yt_player.LoadVideo(self._video_id);
		}
	};

	this.YT_OnPlayerReady = function(pb_rates, duration){
		self._duration_sec = duration;
		// _game_maker._duration_sec = duration;
		console.log('YT_OnPlayerReady ' + duration);

		if(self._cb_on_youtube_video_ready_to_play != null){
			saelf._cb_on_youtube_video_ready_to_play();
		}

		_yt_player.SetPlaybackQuality();

		if(self._late_play == true){
			self._late_play = false;
			_yt_player.Play();
		}
	};
	
	this.YT_OnPlayerStateChange = function(is_play){
		console.log('is_play ' + is_play);
		if(is_play){
			self._timelapse = 0;
			self._timelapse_youtube = 0;
			self._is_playing = true;
			self._is_complete = false;
			self._total_hit_count = 0;
		}else{
			// console.log('self._cb_on_youtube_stopped ' + self._cb_on_youtube_stopped);
			if(self._cb_on_youtube_stopped){
				console.log('_cb_on_youtube_stopped ');
				self._cb_on_youtube_stopped();
			}
			self._is_playing = false;
		}
	};

	this.YT_OnFlowEvent = function(ms){
		ms = parseInt(ms * 1000);
		self._timelapse_youtube = ms;
	};

	this._touch_count = 0;
	this._prev_left_touch_ts = 0;
	this._prev_down_touch_ts = 0;
	this._prev_up_touch_ts = 0;
	this._prev_right_touch_ts = 0;
	
	this.InitKeyHandle = function(){
		$('#ddr_player_layer1').on('touchmove', function(e){
			e.preventDefault();
		});

		$('#ddr_player_layer1').on('touchstart', function(e){
			if(self._is_playing == false){
				return;
			}
			var one_area_width = window.innerWidth / 4;
			var arrow_list = [];
			for(var i=0 ; i<e.originalEvent.touches.length ; i++){
				for(var a=1 ; a<=4 ; a++){
					if(e.originalEvent.touches[i].pageX < (one_area_width * a)){
						switch(a){
							case 1:
								if( (Date.now() - self._prev_left_touch_ts) > 100){
									arrow_list.push(ARROW.LEFT);
								}
								self._prev_left_touch_ts = Date.now();
								break;
							case 2:
								if( (Date.now() - self._prev_down_touch_ts) > 100){
									arrow_list.push(ARROW.DOWN);
								}
								self._prev_down_touch_ts = Date.now();
								break;
							case 3:
								if( (Date.now() - self._prev_up_touch_ts) > 100){
									arrow_list.push(ARROW.UP);
								}
								self._prev_up_touch_ts = Date.now();
								break;
							case 4:
								if( (Date.now() - self._prev_right_touch_ts) > 100){
									arrow_list.push(ARROW.RIGHT);
								}
								self._prev_right_touch_ts = Date.now();
								break;
						}
						break;
					}
				}
			}
			
			self._touch_count += arrow_list.length;
			if(arrow_list.length > 0){
				self.Hit(arrow_list, self._timelapse);
			}
		});

		document.addEventListener('keydown', function(e){
			// console.log(e.keyCode);
			switch(e.keyCode){
				case ARROW.LEFT:
				case ARROW.UP:
				case ARROW.RIGHT:
				case ARROW.DOWN:
					e.preventDefault();
					var arrows = [e.keyCode];
					self.Hit(arrows, self._timelapse);
					break;
			}
		});
	};

	this._hit_queue = [
		// {
		// 	arrow:0,
		// 	hit_result:{
		//		score:0,
		// 		text:''
		//	}
		// }
	];

	this.Hit = async function(arrow_list, timelapse){
		if(self._is_playing == false){
			return;
		}
		timelapse += self._base_offset_ms;

		return new Promise(function(resolve, reject){
			var draw_beat_to_hit_list = [];
			for(var i=0 ; i<arrow_list.length ; i++){
				for(var k=0 ; k<self._game_data._draw_beat_list.length ; k++){
					var draw_beat = self._game_data._draw_beat_list[k];
					if(draw_beat.IsHit() || draw_beat.Passed()){
						continue;
					}
					if(draw_beat.GetArrowOrNum() == arrow_list[i]){
						draw_beat_to_hit_list[i] = draw_beat;
						break;
					}
				}
			}

			var is_multi_hit = false;
			if(arrow_list.length == 2){
				if(draw_beat_to_hit_list.length == 2){
					if(draw_beat_to_hit_list[0]._offset_ms == draw_beat_to_hit_list[1]._offset_ms){
						is_multi_hit = true;
					}
				}
			}

			if(is_multi_hit){
				var hit_result = draw_beat_to_hit_list[0].HitNote(arrow_list[0], timelapse);
				for(var i=0 ; i<arrow_list.length ; i++){
					self._score += hit_result.score;
	
					if(hit_result.text == 'Perfect'){
						self._combo++;
						if(self._combo > 1){
							var combo_score = 10 * (self._combo-1);
							self._score += combo_score;
						}
					}else{
						self._combo = 0;
					}
	
					self._hit_queue.push({
						arrow: arrow,
						hit_result: hit_result
					});

					if(hit_result.hit == true){
						self._total_hit_count += 2;
					}
				}
			}else{
				for(var i=0 ; i<arrow_list.length ; i++){
					var arrow = arrow_list[i];
					var draw_beat_to_hit = draw_beat_to_hit_list[i];
					if(draw_beat_to_hit == null || draw_beat_to_hit == undefined){

						var hit_result = {
							hit:false,
							score: -10,
							text: 'Miss'
						};
						self._score += hit_result.score;
						self._combo = 0;
						self._hit_queue.push({
							arrow: arrow,
							hit_result: hit_result
						});
					}else{		
						var hit_result = draw_beat_to_hit.HitNote(arrow, timelapse);
						self._score += hit_result.score;
		
						if(hit_result.text == 'Perfect'){
							self._combo++;
							if(self._combo > 1){
								var combo_score = 10 * (self._combo-1);
								self._score += combo_score;
							}
						}else{
							self._combo = 0;
						}
		
						self._hit_queue.push({
							arrow: arrow,
							hit_result: hit_result
						});

						if(hit_result.hit == true){
							self._total_hit_count++;
						}
					}
				}
			}
		});
	};

	this.SetWaveNBeat = function(wave_n_beat){
		self._game_data.SetWaveNBeat(wave_n_beat);
	};

	this.PrepareGame = function(){
		window._renderer.ClearScreen();
		window._renderer.ClearDrawObject();

		var profile = new GameProfiles(window._renderer._ctx, self._width, self._height, self._base_line);
		{
			profile.PLAY_LoadStaticAssets();
			{//progress bar
				self._draw_progress_bar = profile.GetProgressBar();
				window._renderer.AddDrawObject(3, self._draw_progress_bar);
			}
			{//combo text
				self._draw_text_combo = profile.GetComboText();
				self._draw_text_combo.Update();
				window._renderer.AddDrawObject(7, self._draw_text_combo);
			}
			{//score text
				self._draw_text_score = profile.GetScoreText();
				self._draw_text_score.Update();
				window._renderer.AddDrawObject(7, self._draw_text_score);
			}
		}

		self._game_data.CreateGameObjects(self._game_level);
		for(var i=0 ; i<self._game_data._draw_beat_list.length ; i++){
			window._renderer.AddDrawObject(6, self._game_data._draw_beat_list[i]);
		}
	};

	this.PlayGame = function(){
		console.log('play game ' );
		if(self._game_started == true){
			return;
		}

		self._game_started = true;
		{
			_renderer._render_mode = RENDER_MODE.PLAY;	
			console.log('_renderer._render_mode  ' + _renderer._render_mode);
		}

		self._game_data._base_line = self._base_line;

		self._timelapse = 0;
		self._timelapse_youtube = 0;
		self._score = 0;
		self._combo = 0;
		self._gameobj_begin_idx = 0;
		self._finish_notified = false;
	
		self._draw_text_score.SetText(self._score);

		{
			_yt_player.SetEventListener(self.YT_OnYoutubeReady, self.YT_OnFlowEvent, self.YT_OnPlayerReady, self.YT_OnPlayerStateChange);

			if(_yt_player._is_player_ready == false){
				_yt_player.LoadVideo(self._video_id);
				self._late_play = true;
			}else{
				_yt_player.Play();
			}
		}
	};

	this.PauseGame = function(){
		_yt_player.Pause();
	};

	this.StopGame = function(){
		console.log('StopGame ');
		_yt_player.Stop();
		self._game_started = false;
		self._is_playing = false;
		self._finish_notified = true;
		// console.log('stop ' + self._is_playing);
	};

	this._delta = 0;
	this._tick = 0;
	this._failed_gameobj_list = [];
	this.Update = function(){
		{
			var now = Date.now();
			self._delta = now - self._tick;
			self._tick = now;
		}

		if(self._is_playing){
			self._timelapse += self._delta;
			self._timelapse_youtube += self._delta;

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

			for(var i=self._gameobj_begin_idx ; i<self._game_data._draw_beat_list.length ; i++){
				var draw_beat = self._game_data._draw_beat_list[i];
				if(draw_beat.Passed()){
					self._gameobj_begin_idx = i+1;

					if(self._is_excercise_mode == false){
						//놓치면 게임 종료
						if(draw_beat.IsHit() == false){
							{
								draw_beat.SetIsFailCause();
								draw_beat.SetPassed(false);
							}
							self._finish_notified = true;
							self._failed_gameobj_list = [];
							self._failed_gameobj_list = self._game_data._draw_beat_list;

							//실패의 원인을 표시하기 위해
							//passed가 아닌 것으로 한다.
							if(self._cb_on_game_finished){
								self._cb_on_game_finished(self._is_complete, self._progress_percent, self._score);
							}
							break;
						}
					}
				}
				if(draw_beat.Move(self._timelapse + self._base_offset_ms) == false){
					break;
				}
			}

			if(self._hit_queue.length > 0){
				var hit = self._hit_queue[0];
				self.CreateHitEffect(hit);
				if(self._combo > 1){
					var txt = self._combo-1 + " COMBO";
					txt += "\n +" + (10 * (self._combo-1));
					self._draw_text_combo.SetText(txt);
				}else{
					self._draw_text_combo.SetText('');
				}

				if(self._is_excercise_mode == false){
					//실패하는 경우 게임 종료하기.
					if(hit.hit_result.hit == false){
						self._finish_notified = true;
						self._failed_gameobj_list = [];
						self._failed_gameobj_list = self._game_data._draw_beat_list;
						if(self._cb_on_game_finished){
							self._cb_on_game_finished(self._is_complete, self._progress_percent, self._score);
						}
						console.log('FAILED GAME ' );
					}
				}

				if(self._hit_queue.length == 1){
					if(self._vibration_on_off){
						self.VibrateAsync(hit.hit_result.score);
					}
				}
				self._hit_queue.splice(0, 1);
			}

			{
				self._progress_percent = self._total_hit_count / self._game_data._draw_beat_list.length;
				self._draw_progress_bar.SetProgress(self._progress_percent);
			}

			self._draw_text_score.SetText(self._score);
			_renderer.Update();

			if(self._game_data._draw_beat_list.length == self._total_hit_count){
				if(self._finish_notified == false){
					self._finish_notified = true;
					self._is_complete = true;
					if(self._cb_on_game_finished){
						self._cb_on_game_finished(self._is_complete, self._progress_percent, self._score);
					}
				}
			}

			self.UpdateWave();
		}

		if(self._finish_notified){
			self._draw_text_score.SetText(self._score);
			// console.log('gameobj_begin_idx ' + self._gameobj_begin_idx);
			if(self._is_complete == false){
				_renderer.Update();
			}
			self.DisplayResult();
		}

		requestAnimationFrame(self.Update);
	};

	this.DisplayResult = function(){
		var ctx = window._renderer._ctx;
		if(self._is_complete){
			new DrawTextShadow(ctx, 'Congraturations!', 200, 300, 50, 'Red', -1).Update();
			new DrawTextShadow(ctx, 'Your New Score', 200, 350, 33, 'Red', -1).Update();
			new DrawTextShadow(ctx, "Score " + self._score, 200, 400, 33, 'Blue', -1).Update();
		}else{
			new DrawTextShadow(ctx, "Oops!", 200, 300, 50, 'Red', -1).Update();
		}
	};

	this.CreateHitEffect = function(hit){
		var text_y = self._base_line;
		var one_width = 400 / 5;
		var text_x = 0;
		var quarter_x = self._width / 4;
		var first_x = quarter_x / 2;
		var particle_x = 0;

		switch(hit.arrow){
			case ARROW.LEFT:
				text_x = one_width;
				particle_x = first_x;
				break;
			case ARROW.DOWN:
				text_x = one_width * 2;
				particle_x = quarter_x+first_x;
				break;
			case ARROW.UP:
				text_x = one_width * 3;
				particle_x = quarter_x*2+first_x;
				break;
			case ARROW.RIGHT:
				text_x = one_width * 4;
				particle_x = quarter_x*3+first_x;
				break;
		}
		var draw_text_obj = new DrawText(window._renderer._ctx, hit.hit_result.text, text_x, text_y+50, 26, 'blue', 200);
		var draw_score_obj = new DrawText(window._renderer._ctx, hit.hit_result.score, text_x, text_y+80, 26, 'blue', 200);
		window._renderer.AddDrawObject(2, draw_text_obj);
		window._renderer.AddDrawObject(2, draw_score_obj);
		self.CreateParticles(particle_x, self._base_line);
	};

	this.CreateParticles = function(x, y){
		for(var i=0 ; i<30 ; i++){
			var particle = new Particle(window._renderer._ctx, x, y);
			window._renderer.AddDrawObject(5, particle);
		}
	};

	this._color_table = ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#84a59d', '#00b4d8', '#f1c453', '#e6beae'];
	this.UpdateWave = function(){
		if(self._cur_wave_idx >= self._game_data._wave_list.length){
			return;
		}

		var idx = parseInt(Math.random() * (self._color_table.length));

		if(self._timelapse >= self._game_data._wave_list[self._cur_wave_idx]){
			$('#ddr_player_bg_layer').css('background-color', self._color_table[idx]);
			self._cur_wave_idx++;
		}
	};

	this.VibrateAsync = function(score){
		return new Promise(function(){
			var dur = score;
			switch(score){
				case 6:
					dur = 20;
					break;
				case 7:
					dur = 30;
					break;
				case 8:
					dur = 50;
					break;
				case 9:
					dur = 80;
					break;
				case 10:
					dur = 100;
					break;
			}
			if(self._combo > 1){
				dur += self._combo * 10;				
				if(dur > 200){
					dur = 200;
				}
			}

			window.navigator.vibrate(dur);
		});
	};
}