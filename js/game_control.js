function GameControl(width, height, is_show_beat_order, game_type){
	var self = this;
	this._width = width;
	this._height = height;
	// this._base_line = 100;
	this._game_type = game_type;
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
	this._progress_percent = 0;
	this._draw_progress_bar = null;
	this._draw_text_combo = null;
	this._draw_text_score = null;
	this._is_show_beat_order = is_show_beat_order;
	this._atlas = null;

	this.Init = function(){
		// console.log('GameControl Init');
		self._id_debug_ele = $('#id_debug');
		window._input_control = new InputControl('ddr_player_layer1', self._game_type, self._width).Init();

		_yt_player.SetEventListener(self.YT_OnYoutubeReady, self.YT_OnFlowEvent, self.YT_OnPlayerReady, self.YT_OnPlayerStateChange);
		self._game_data = new GameData(self._is_show_beat_order, self._game_type).Init();

		self.Update();
		return this;
	};

	this.SetVideoID = function(video_id){
		self._video_id = video_id;
	};

	this.YT_OnYoutubeReady = function(){
		// console.log('YT_OnYoutubeReady');
		
		//https://www.youtube.com/watch?v=-tJYN-eG1zk
		// _yt_player.LoadVideo('V1bFr2SWP1I');
		// _yt_player.LoadVideo('MhURDZVpnZ8');
		// console.log('self._video_id ' + self._video_id);
		if(self._video_id != ''){
			_yt_player.LoadVideo(self._video_id);
		}
	};

	this.YT_OnPlayerReady = function(pb_rates, duration){
		self._duration_sec = duration;
		// _game_maker._duration_sec = duration;
		// console.log('YT_OnPlayerReady ' + duration);

		if(self._cb_on_youtube_video_ready_to_play != null){
			self._cb_on_youtube_video_ready_to_play();
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

	this._hit_queue = [
		//{
		// 	arrow:0,
		// 	hit_result:{
		//		score:0,
		// 		text:''
		//	},
		//	hit_position:{
		//		x: 100,
		//		y: 100
		//	}
		//}
	];

	this.HitByXAndTime = async function(x_position){
		if(self._is_playing == false){
			return;
		}
		var timelapse = self._timelapse + self._base_offset_ms;
		// console.log('x_position ' + x_position + ' timelapse ' + timelapse);

		return new Promise(function(resolve, reject){
			var draw_beat_to_hit = null;

			for(var k=0 ; k<self._game_data._draw_beat_list.length ; k++){
				var draw_beat = self._game_data._draw_beat_list[k];
				if(draw_beat.IsHit() || draw_beat.Passed()){
					continue;
				}
				draw_beat_to_hit = draw_beat;
				break;
			}
			var hit_result = draw_beat_to_hit.HitByXAndTime(x_position, timelapse);

			{
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
					arrow: draw_beat_to_hit.GetArrowOrNum(),
					hit_result: hit_result,
					hit_position: draw_beat_to_hit.GetHitPosition()
				});

				if(hit_result.hit == true){
					self._total_hit_count++;
				}
			}
		});
	};

	this.HitByLaneAndTime = async function(arrow_list){
		if(self._is_playing == false){
			return;
		}
		var timelapse = self._timelapse + self._base_offset_ms;

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
				var hit_result = draw_beat_to_hit_list[0].HitByArrowAndTime(arrow_list[0], timelapse);
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
						hit_result: hit_result,
						hit_position: draw_beat_to_hit_list[0].GetHitPosition()
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
							hit_result: hit_result,
							hit_position: draw_beat_to_hit.GetHitPosition()
						});
					}else{
						var hit_result = draw_beat_to_hit.HitByArrowAndTime(arrow, timelapse);
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
							hit_result: hit_result,
							hit_position: draw_beat_to_hit_list[0].GetHitPosition()
						});

						if(hit_result.hit == true){
							self._total_hit_count++;
						}
					}
				}
			}
		});
	};

	//TODO : promose를 사용하는 게 더 나을수도 있을 듯. 검토해볼것.
	this.TouchDetect = function(){
		var touch_position = window._input_control._position;
		var count = 0;
		for(var k=0 ; k<self._game_data._draw_beat_list.length ; k++){
			var db = self._game_data._draw_beat_list[k];
			if(db.IsHit() || db.Passed()){
				continue;
			}

			//약간 지나쳐 버린 Beat에 대해서도 처리를 하기 위해
			//총 4개의 Beat에 대해 Hit 처리를 시도한다.
			count++;
			if(count <= 4){
				var hit_result = db.HitByTouchPosition(touch_position);
				if(hit_result != null){
					if(hit_result.text == 'Perfect'){
						self._combo++;
						if(self._combo > 1){
							var combo_score = 10 * (self._combo-1);
							self._score += combo_score;
						}
					}else{
						self._combo = 0;
					}

					self._score += hit_result.score;
					self._hit_queue.push({
						arrow: db.GetArrowOrNum(),
						hit_result: hit_result,
						hit_position: db.GetHitPosition()
					});
					self._total_hit_count++;
				}		
			}
		}
	};

	this.SetGameData = function(game_data){
		self._game_data.SetGameData(game_data);
	};

	this.PrepareGame = function(){
		window._renderer.ClearScreen();
		window._renderer.ClearDrawObject();
		window._background_renderer.ClearScreen();
		// console.log('self._game_data._beat_atlas_image_path ' + self._game_data._beat_atlas_image_path);
		self._atlas = new Atlas(self._game_data._beat_atlas_image_path).Init();
		// console.log('self._atlas._img.src ' + self._atlas._img.src);

		var profile = new GameProfiles(window._renderer._ctx, self._atlas, self._width, self._height, self._game_data._base_line, self._game_data._font_info);
		{
			profile.LoadStaticAssets(self._game_type);
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

		if(self._game_type == GAME_TYPE.GUN_FIRE){
			window._input_control.InitHandle(200, self._game_data._base_line);
			self._game_level = 7;
		}

		self._game_data.CreateDrawBeatList(self._game_level);
		for(var i=0 ; i<self._game_data._draw_beat_list.length ; i++){
			window._renderer.AddDrawObject(6, self._game_data._draw_beat_list[i]);
		}
		self._particles_list = [];

		self._cur_wave_idx = 0;
		self._wave_sequence_idx = 0;
		self.ShowBackground(0);
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

		// self._game_data._base_line = self._base_line;

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

			if(self._game_type == GAME_TYPE.GUN_FIRE){
				self.TouchDetect();
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
					// console.log('\n\n\n\n ');
					// console.log('combo ');
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
			_background_renderer.Update();

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
			window._background_renderer.Update();
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
			new DrawText(ctx, 'Congraturations!', 200, 300, 50, self._game_data._font_info.result.fill_color, self._game_data._font_info.result.use_stroke, self._game_data._font_info.result.stroke_color, self._game_data._font_info.result.line_width, -1).Update();
			new DrawText(ctx, 'Your New Score', 200, 350, 33, self._game_data._font_info.result.fill_color, self._game_data._font_info.result.use_stroke, self._game_data._font_info.result.stroke_color, self._game_data._font_info.result.line_width, -1).Update();
			new DrawText(ctx, "Score " + self._score, 200, 400, 33, self._game_data._font_info.result.fill_color, self._game_data._font_info.result.use_stroke, self._game_data._font_info.result.stroke_color, self._game_data._font_info.result.line_width, -1).Update();
		}else{
			new DrawText(ctx, "Oops!", 200, 300, 50, self._game_data._font_info.result.fill_color, self._game_data._font_info.result.use_stroke, self._game_data._font_info.result.stroke_color, self._game_data._font_info.result.line_width, -1).Update();
		}
	};

	this._particles_list = [];
	this.CreateHitEffect = function(hit){
		var hp = hit.hit_position;

		switch(hit.arrow){
			case ARROW.LEFT:
				if(self._particles_list[0] == undefined){
					if(self._game_data._particle_list[0] != null){
						var img_path = self._game_data._particle_list[0].image_path;
						self._particles_list[0] = new Particles(window._renderer._ctx, hp.x, hp.y, img_path);
						window._renderer.AddDrawObject(5, self._particles_list[0]);
					}
				}
				self._particles_list[0].Reset(hp.x, hp.y);
				break;
			case ARROW.DOWN:
				if(self._particles_list[1] == undefined){
					if(self._game_data._particle_list[1] != null){
						var img_path = self._game_data._particle_list[1].image_path;
						self._particles_list[1] = new Particles(window._renderer._ctx, hp.x, hp.y, img_path);
						window._renderer.AddDrawObject(5, self._particles_list[1]);
					}
				}
				self._particles_list[1].Reset(hp.x, hp.y);
				break;
			case ARROW.UP:
				if(self._particles_list[2] == undefined){
					if(self._game_data._particle_list[2] != null){
						var img_path = self._game_data._particle_list[2].image_path;
						self._particles_list[2] = new Particles(window._renderer._ctx, hp.x, hp.y, img_path);
						window._renderer.AddDrawObject(5, self._particles_list[2]);
					}
				}
				self._particles_list[2].Reset(hp.x, hp.y);
				break;
			case ARROW.RIGHT:
				if(self._particles_list[3] == undefined){
					if(self._game_data._particle_list[3] != null){
						var img_path = self._game_data._particle_list[3].image_path;
						self._particles_list[3] = new Particles(window._renderer._ctx, hp.x, hp.y, img_path);
						window._renderer.AddDrawObject(5, self._particles_list[3]);
					}
				}
				self._particles_list[3].Reset(hp.x, hp.y);
				break;
			case ARROW.CENTER:
				if(self._particles_list[4] == undefined){
					if(self._game_data._particle_list[4] != null){
						var img_path = self._game_data._particle_list[4].image_path;
						self._particles_list[4] = new Particles(window._renderer._ctx, hp.x, hp.y, img_path);
						window._renderer.AddDrawObject(5, self._particles_list[4]);
					}
				}
				self._particles_list[4].Reset(hp.x, hp.y);
				break;	
			}
		
		var text_x = hp.x;
		var text_y = hp.y;
		var text_y_text;
		var text_y_score;

		if(self._game_type == GAME_TYPE.DDR || self._game_type == GAME_TYPE.PUMP){
			text_y_text = text_y + 50;
			text_y_score = text_y + 80;
		}else if(self._game_type == GAME_TYPE.GUN_FIRE || self._game_type == GAME_TYPE.PIANO_TILE || self._game_type == GAME_TYPE.CRASH_NUTS){
			text_y_text = text_y - 80;
			text_y_score = text_y - 50;
		}

		var draw_text_obj = new DrawText(window._renderer._ctx, hit.hit_result.text, text_x, text_y_text, 26, 
			self._game_data._font_info.hit.fill_color, 
			self._game_data._font_info.hit.use_stroke, 
			self._game_data._font_info.hit.stroke_color, 
			self._game_data._font_info.hit.line_width, 
			300);
		var draw_score_obj = new DrawText(window._renderer._ctx, hit.hit_result.score, text_x, text_y_score, 26, 
			self._game_data._font_info.hit.fill_color, 
			self._game_data._font_info.hit.use_stroke, 
			self._game_data._font_info.hit.stroke_color, 
			self._game_data._font_info.hit.line_width, 
			300);
		window._renderer.AddDrawObject(2, draw_text_obj);
		window._renderer.AddDrawObject(2, draw_score_obj);
	};

	this._cur_wave_idx = 0;
	this._wave_sequence_idx = 0;
	this.UpdateWave = function(){
		if(self._cur_wave_idx >= self._game_data._wave_list.length - 1){
			return;
		}

		var next_wave_idx = self._cur_wave_idx + 1;

		if(self._timelapse < self._game_data._wave_list[next_wave_idx].t){
			return;
		}
		self._cur_wave_idx++;
		self.ShowBackground(self._cur_wave_idx);
	};

	this.ShowBackground = function(idx){
		// console.log('ShowBackground ' + idx);
		// console.log('self._game_data._wave_list.length ' + self._game_data._wave_list.length);
		if(idx > self._game_data._wave_list.length -1){
			return;
		}

		var wave = self._game_data._wave_list[idx];
		var background = null;
		// console.log('wave.type ' + wave.type);
		switch(wave.type){
			case BG_SELECT_TYPE.FIXED:
				background = self._game_data.GetBackground(wave.background_uid);
				break;
			case BG_SELECT_TYPE.RANDOM:
				var min = 0;
				var max = self._game_data._background_list.length - 1;
				var random_idx = Math.random() * (max - min) + min;
				if(random_idx < self._game_data._background_list.length){
					background = self._game_data._background_list[random_idx];
				}
				break;
			case BG_SELECT_TYPE.SEQUENCE:
				if(self._wave_sequence_idx < self._game_data._background_list.length){
					background = self._game_data._background_list[self._wave_sequence_idx];
					self._wave_sequence_idx++;
					if(self._wave_sequence_idx >= self._game_data._background_list.length){
						self._wave_sequence_idx = 0;
					}
				}
				break;
		}

		// console.log('background ' + JSON.stringify(background));
		if(background != null){
			window._background_renderer.SetBackground(background);
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