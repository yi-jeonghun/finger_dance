'use strict';

function ThreeGameControl(){
	var self = this;
	this._video_id = '';
	this._game_data = null;
	this._game_started = false;
	this._is_playing = false;
	this._start_ts = 0;
	this._timelapse = 0;
	this._late_play = false;
	this._score = 0;
	this._combo = 0;
	this._id_text_score = null;
	this._id_text_combo = null;
	this._id_text_left = null;
	this._id_text_down = null;
	this._id_text_up = null;
	this._id_text_right = null;
	this._hit_display = {
		left: false,
		down: false,
		up: false,
		right: false,

		left_txt: '',
		down_txt: '',
		up_txt: '',
		right_txt: '',

		left_now: 0,
		down_now: 0,
		up_now: 0,
		right_now: 0,

		combo: false,
		combo_now: 0
	};

	self.Init = function(){
		{
			self._id_text_score = $('#id_text_score');
			self._id_text_combo = $('#id_text_combo');
			self._id_text_left = $('#id_text_left');
			self._id_text_down = $('#id_text_down');
			self._id_text_up = $('#id_text_up');
			self._id_text_right = $('#id_text_right');
		}

		_yt_player.SetEventListener(self.YT_OnYoutubeReady, self.YT_OnFlowEvent, self.YT_OnPlayerReady, self.YT_OnPlayerStateChange);

		self._game_data = new GameData(DIMENSION._3D);
		self.Update();
		self.MakeHome();

		self.InitComponentHandle();
		return this;
	};

	this.InitComponentHandle = function(){
		$('#id_btn_start').on('click', self.PlayGame);
		$('#3d_canvas').on('touchstart', self.OnTouchStart);
		self.InitKeyHandle();
	};

	this.OnTouchStart = function(e){
		console.log('touch ' );
		var one_area_width = window.innerWidth / 4;
		for(var i=0 ; i<e.originalEvent.touches.length ; i++){
			for(var a=1 ; a<=4 ; a++){
				if(e.originalEvent.touches[i].pageX < (one_area_width * a)){
					switch(a){
						case 1:
							self.Hit(ARROW.LEFT);
							break;
						case 2:
							self.Hit(ARROW.DOWN);
							break;
						case 3:
							self.Hit(ARROW.UP);
							break;
						case 4:
							self.Hit(ARROW.RIGHT);
							break;
					}
					break;
				}
			}
		}
	};

	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			// console.log(e.keyCode);
			switch(e.keyCode){
				case ARROW.LEFT:
				case 68:
					e.preventDefault();
					self.Hit(ARROW.LEFT);
					break;
				case ARROW.DOWN:
				case 70:
					e.preventDefault();
					self.Hit(ARROW.DOWN);
					break;
				case ARROW.UP:
				case 74:
					e.preventDefault();
					self.Hit(ARROW.UP);
					break;
				case ARROW.RIGHT:
				case 75:
					e.preventDefault();
					self.Hit(ARROW.RIGHT);
					break;
			}
		});
	};

	this.Hit = function(arrow){
		// console.log('arrow ' + arrow);
		if(self._is_playing == false){
			return;
		}

		return new Promise(function(resolve, reject){
			var go_to_hit = null;

			for(var i=0 ; i<self._game_data._game_objs.length ; i++){
				var go = self._game_data._game_objs[i];
				if(go.passed){
					continue;
				}
				if(go.arrow == arrow){
					go_to_hit = go;
					break;
				}
			}

			// console.log('go_to_hit ' + go_to_hit);
			var hit_result = null;
			if(go_to_hit == null){
				hit_result = {
					score:-10,
					text: 'Miss'
				};
				self._score += hit_result.score;
				// _renderer.Hit(arrow, hit_result);
			}else{
				hit_result = go_to_hit.Hit(arrow);
				self._score += hit_result.score;

				if(hit_result.text == 'Perfect'){
					self._combo++;
					if(self._combo > 1){
						var combo_score = 10 * (self._combo-1);
						self._score += combo_score;
						self._hit_display.combo = true;
						self._hit_display.combo_now = Date.now();
					}
				}else{
					self._combo = 0;
				}

				// _renderer.Hit(arrow, hit_result, self._combo);
			}

			if(hit_result != null){
				switch(arrow){
					case ARROW.LEFT:
						self._hit_display.left = true;
						self._hit_display.left_now = Date.now();
						self._hit_display.left_txt = hit_result.text + '<br>' + hit_result.score;
						break;
					case ARROW.DOWN:
						self._hit_display.down = true;
						self._hit_display.down_now = Date.now();
						self._hit_display.down_txt = hit_result.text + '<br>' + hit_result.score;
						break;
					case ARROW.UP:
						self._hit_display.up = true;
						self._hit_display.up_now = Date.now();
						self._hit_display.up_txt = hit_result.text + '<br>' + hit_result.score;
						break;
					case ARROW.RIGHT:
						self._hit_display.right = true;
						self._hit_display.right_now = Date.now();
						self._hit_display.right_txt = hit_result.text + '<br>' + hit_result.score;
						break;
				}
			}

			_drum_player.Hit(arrow);
			self.UpdateScore();
			resolve();
		});
	};

	this.UpdateScore = function(){
		self._id_text_score.html(self._score);
	};

	this.YT_OnYoutubeReady = function(){
		console.log('YT_OnYoutubeReady');
		if(self._video_id != ''){
			_yt_player.LoadVideo(self._video_id);
		}
	};

	this.YT_OnPlayerReady = function(pb_rates, duration){
		self._duration_sec = duration;
		console.log('YT_OnPlayerReady ' + duration);
		if(self._late_play == true){
			self._late_play = false;
			_yt_player.Play();
		}
	};
	
	this.YT_OnPlayerStateChange = function(is_play){
		console.log('is_play ' + is_play);
		if(is_play){
			self._timelapse = 0;
			self._start_ts = Date.now();
			self._is_playing = true;
		}else{
			console.log('self._cb_on_youtube_stopped ' + self._cb_on_youtube_stopped);
			if(self._cb_on_youtube_stopped){
				console.log('_cb_on_youtube_stopped ');
				self._cb_on_youtube_stopped();
			}
			self._is_playing = false;
		}
	};

	this.YT_OnFlowEvent = function(ms){
		ms = parseInt(ms * 1000);
		self._timelapse = ms;
	};

	this.MakeHome = function(){
		{
			var geometry = new THREE.BoxGeometry(0.9, 0.45, 0.9);
			var material = new THREE.MeshBasicMaterial( { color: 0xaaaaaa } );
			material.wireframe = true;
			var home1 = new THREE.Mesh( geometry, material );
			home1.position.x = -1.5;
	
			window._three_renderer.AddObject(home1);	
		}
		{
			var geometry = new THREE.BoxGeometry(0.9, 0.45, 0.9);
			var material = new THREE.MeshBasicMaterial( { color: 0xaaaaaa } );
			material.wireframe = true;
			var home1 = new THREE.Mesh( geometry, material );
			home1.position.x = -0.5;
	
			window._three_renderer.AddObject(home1);
		}
		{
			var geometry = new THREE.BoxGeometry(0.9, 0.45, 0.9);
			var material = new THREE.MeshBasicMaterial( { color: 0xaaaaaa } );
			material.wireframe = true;
			var home1 = new THREE.Mesh( geometry, material );
			home1.position.x = 0.5;
	
			window._three_renderer.AddObject(home1);	
		}
		{
			var geometry = new THREE.BoxGeometry(0.9, 0.45, 0.9);
			var material = new THREE.MeshBasicMaterial( { color: 0xaaaaaa } );
			material.wireframe = true;
			var home1 = new THREE.Mesh( geometry, material );
			home1.position.x = 1.5;
	
			window._three_renderer.AddObject(home1);	
		}
	};

	this.PlayGame = function(){
		console.log('play game ' );
		if(self._game_started == true){
			return;
		}

		window._three_renderer.ClearScene();
		self.MakeHome();

		self._game_started = true;
		{
			$('#id_btn_start').hide();
			// _renderer._base_line = self._base_line;
			// _renderer._render_mode = RenderMode.Play;	
		}

		// self._game_data._base_line = self._base_line;
		self._game_data.CreateGameObjects();

		// self._cur_idx = 0;
		self._timelapse = 0;
		self._score = 0;
		self._combo = 0;
		// self._begin_idx = 0;
		// self._finish_notified = false;
		// self._passed_cnt = 0;
	
		// _renderer._hit_combo = false;
		// self.UpdateScore();

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

	this.StopGame = function(){
		_yt_player.Stop();
		self._game_started = false;
		self._is_playing = false;
		// console.log('stop ' + self._is_playing);
	};

	this.Update = function(){
		if(self._is_playing){
			self._timelapse += _timer._delta;

			for(var i=0 ; i<self._game_data._game_objs.length ; i++){
				var go = self._game_data._game_objs[i];

				go.Update(self._timelapse);
			}

			var dur = 1000;
			{
				if(self._hit_display.combo){
					if( (Date.now() - self._hit_display.combo_now) > dur ){
						self._hit_display.combo = false;
						self._id_text_combo.html('');
					}else{
						self._id_text_combo.html('Combo ' + self._combo);
					}
				}

				if(self._hit_display.left){
					if( (Date.now() - self._hit_display.left_now) > dur ){
						self._hit_display.left = false;
						self._id_text_left.html('');
					}else{
						self._id_text_left.html(self._hit_display.left_txt);
					}
				}

				if(self._hit_display.down){
					if( (Date.now() - self._hit_display.down_now) > dur ){
						self._hit_display.down = false;
						self._id_text_down.html('');
					}else{
						self._id_text_down.html(self._hit_display.down_txt);
					}
				}

				if(self._hit_display.up){
					if( (Date.now() - self._hit_display.up_now) > dur ){
						self._hit_display.up = false;
						self._id_text_up.html('');
					}else{
						self._id_text_up.html(self._hit_display.up_txt);
					}
				}
				if(self._hit_display.right){
					if( (Date.now() - self._hit_display.right_now) > dur ){
						self._hit_display.right = false;
						self._id_text_right.html('');
					}else{
						self._id_text_right.html(self._hit_display.right_txt);
					}
				}
			}
		}

		requestAnimationFrame(self.Update);
	};

	this.SetWaveNBeat = function(wave_n_beat){
		self._game_data.SetWaveNBeat(wave_n_beat);
	};
};