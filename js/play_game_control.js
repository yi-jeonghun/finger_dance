$('document').ready(function(){
	window._timer = new Timer().Init();
	window._resource_loader = new ResourceLoader();
	window._play_game_control = new PlayGameControl().Init();
});

function PlayGameControl(){
	var self = this;
	this._game_id = null;
	this._video_id = null;
	this._i_like = false;
	this._my_score = -1;
	this._my_rank = -1;
	this._ddr_player_height = 0;
	this._is_fullscreen = false;
	this._is_mobile_device = false;
	this._is_embedded = false;

	this.Init = function(){
		$('#id_div_difficulty').hide();
		var md = new MobileDetect(window.navigator.userAgent);
		if(md.mobile()) {
			self._is_mobile_device = true;
		}else{ 
			self._is_mobile_device = false;
		}
		// console.log('self._is_mobile_device ' + self._is_mobile_device);

		self.InitLayout();
		self.InitComponentHandle();
		self.InitGameModules();
		self._game_id = GetURLParam('id');
		self._is_embedded = GetURLParam('e') != null ? true : false;

		// console.log('_game_id ' + self._game_id);
		window._resource_loader.SetCallback(self.OnResourceLoaded);

		if(self._game_id != null){
			var path = `db/${self._game_id}.json`;
			$.getJSON(path, function(json) {
				// console.log('json loaded ');
				window._game_data = json;
				// console.log(json); // this will show the info it in firebug console
				self.DisplayGameData(window._game_data);
				self.DISP_HowTo(window._game_data.game_type);
				self.DISP_PrevGameResult();
			});
	
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
		$('#id_btn_back').on('click', function(){ 
			console.log('back button clicked ');
			if(typeof webkit !== 'undefined'){
				var message = {
					command: "close_iab"
				};
				webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify(message));	
			}else{
				window.history.back();
			}
		});
		$('#id_btn_home').on('click', function(){ document.location.href = 'https://beatmaster.me'; });
		$('#id_btn_stop_small').on('click', self.OnStopBtnClick);
		$('#id_img_vibration').on('click', self.OnVibrationClick);
		$('#id_btn_stop').on('click', self.OnStopBtnClick);
		$('#id_btn_retry').on('click', self.RetryGame);
		$('#id_span_difficulty_easy').on('click', self.OnClick_ChangeDifficulty);
		$('#id_span_difficulty_normal').on('click', self.OnClick_ChangeDifficulty);
		$('#id_span_difficulty_hard').on('click', self.OnClick_ChangeDifficulty);
	};

	this.OnClick_ChangeDifficulty = function(){
		$('#id_span_difficulty_easy').removeClass('badge-primary');
		$('#id_span_difficulty_normal').removeClass('badge-primary');
		$('#id_span_difficulty_hard').removeClass('badge-primary');
		switch(this.id){
			case 'id_span_difficulty_easy':
				$('#id_span_difficulty_easy').addClass('badge-primary');
				window._game_control._game_data.SwitchDifficulty(DIFFICULTY.EASY);
				break;
			case 'id_span_difficulty_normal':
				$('#id_span_difficulty_normal').addClass('badge-primary');
				window._game_control._game_data.SwitchDifficulty(DIFFICULTY.NORMAL);
				break;
			case 'id_span_difficulty_hard':
				$('#id_span_difficulty_hard').addClass('badge-primary');
				window._game_control._game_data.SwitchDifficulty(DIFFICULTY.HARD);
				break;
		}
	};

	this.OnResourceLoaded = function(percent){
		var pstr = Math.floor(percent * 100);
		pstr += "%";
		$('#id_span_percent').html(pstr);
		// console.log('pstr ' + pstr);
		if(percent == 1){
			$('#id_loading').css('display', 'none');
			$('#id_div_difficulty').show();
			self.ShowHidePlayStopButton(true, false);
		}
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

	this.ShowHidePlayStopButton = function(show_play, show_stop){
		console.log('ShowHidePlayStopButton play[' + show_play + '] stop[' + show_stop + ']');
		if(show_play){
			$('#id_btn_play').css('display', '');
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

	this.PlayGame = function(){
		if(self._is_mobile_device){
			self.ChangeLayout(LAYOUT.PLAY);
		}

		self.ShowHidePlayStopButton(false, true);
		$('#id_retry_area').css('display', 'none');

		_game_control.PrepareGame();
		window._game_control.PlayGame();
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

	this.OnGameFinished = function(difficulty, is_complete, progress_percent, score){
		console.log('OnGameFinished ' + is_complete);
		console.log('progress_percent ' + progress_percent);
		console.log('score ' + score);

		if(_game_control._is_playing){
			self.SaveGameResult(difficulty, is_complete, progress_percent, score);
			if(is_complete == true){
			}else{
				setTimeout(self.ShowRetryButton, 500);
				window._game_control.StopGame();
			}
		}
	};

	this.SaveGameResult = function(difficulty, is_complete, progress_percent, score){
		var message = {
			command: "game_result",
			game_result: {
				game_id: self._game_id,
				difficulty: difficulty,
				is_complete: is_complete,
				progress_percent: progress_percent,
				score: score
			}
		}

		if(typeof webkit !== 'undefined'){
			webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify(message));
		}else{
			window._db_control.SaveGameResult(message.game_result);
		}
	};

	this._game_width = 400;
	this._game_height = 700;
	this._screen_width = 400;
	this._screen_height = 700;
	this.InitGameModules = function(){
		if(self._is_mobile_device){
			screen_width = window.innerWidth;
			screen_height = self._ddr_player_height;
		}

		// window._yt_player = new YoutubePlayer().Init();
		window._renderer = new Renderer(self._game_width, self._game_height, self._screen_width, self._screen_height).Init();
		window._background_renderer = new BackgroundRenderer().Init('bg_layer', self._game_width, self._game_height, self._screen_width, self._screen_height);
	};

	this.DisplayGameData = function(game_data){
		console.log('DisplayGameData ');
		var is_show_beat_order = false;

		window._yt_player = new YoutubePlayer().Init();
		window._game_control = new GameControl(self._game_width, self._game_height, is_show_beat_order, game_data.game_type).Init();
		// window._game_control._is_excercise_mode = true;

		self._video_id = game_data.video_id;
		// console.log('self._video_id ' + self._video_id);

		$('title').html(`${game_data.title} - ${game_data.artist} | Beat Monster`);
		$("meta[name='description']").prop('content', `Rythm Game for ${game_data.title} - ${game_data.artist}`);
		$("meta[name='keywords']").prop('content', `${game_data.title}, ${game_data.artist}, Rhythm Game, Beat Game, Youtube, Music, Popsong, Popular song`);
		$("meta[property='og:title']").prop('content', `${game_data.title} - ${game_data.artist} | Beat Monster`);
		$("meta[property='og:description']").prop('content', `Rythm Game for ${game_data.title} - ${game_data.artist}`);
		$("meta[property='og:image']").prop('content', `https://img.youtube.com/vi/${game_data.video_id}/0.jpg`);

		$('#id_label_title').html(game_data.title);
		$('#id_label_artist').html(game_data.artist);

		{
			var img = '';
			switch(game_data.game_type){
				case GAME_TYPE.DDR:
					img = `<img class="border" src="../img/icon_game_type_ddr.png" style="width:50px; height:auto">`;
					break;
				case GAME_TYPE.PUMP:
					img = `<img class="border" src="../img/icon_game_type_pump.png" style="width:50px; height:auto">`;
					break;
				case GAME_TYPE.PIANO_TILE:
					img = `<img class="border" src="../img/icon_game_type_tile.png" style="width:50px; height:auto">`;
					break;
				case GAME_TYPE.GUN_FIRE:
					img = `<img class="border" src="../img/icon_game_type_fire.png" style="width:50px; height:auto">`;
					break;
			}
			$('#id_div_game_type_img').html(img);
		}

		// console.log('self._video_id ' + self._video_id);
		_game_control._video_id = self._video_id;

		if(self._is_mobile_device){
			_game_control._base_offset_ms = window._game_data.base_offset_ms;
		}
		_game_control._cb_on_youtube_stopped = self.OnYoutubeStopped;
		_game_control._cb_on_game_finished = self.OnGameFinished;
		_game_control._cb_on_youtube_video_ready_to_play = self.OnYoutubeVideoReadyToPlay;

		var wave_n_beat_1 = JSON.parse(game_data.wave_n_beat_1);
		var wave_n_beat_2 = JSON.parse(game_data.wave_n_beat_2);
		var wave_n_beat_3 = JSON.parse(game_data.wave_n_beat_3);
		var background_list = JSON.parse(game_data.background_list);
		var particle_list = JSON.parse(game_data.particle_list);

		{//hide difficulty button
			if(wave_n_beat_1.beat_list.length == 0){
				$('#id_span_difficulty_easy').hide();
			}
			if(wave_n_beat_2.beat_list.length == 0){
				$('#id_span_difficulty_normal').hide();
			}
			if(wave_n_beat_3.beat_list.length == 0){
				$('#id_span_difficulty_hard').hide();
			}

			if(wave_n_beat_1.beat_list.length == 0 && wave_n_beat_2.beat_list.length > 0){
				$('#id_span_difficulty_normal').addClass('badge-primary');
				window._game_control._game_data.SwitchDifficulty(DIFFICULTY.NORMAL);
			}
		}

		{//Update Image Path
			for(var i=0 ; i<background_list.length ; i++){
				if(background_list[i].layer1_image_path != ''){
					background_list[i].layer1_image_path = '.' + background_list[i].layer1_image_path;
					window._resource_loader.AddImage(background_list[i].layer1_image_path);
				}
				if(background_list[i].layer2_image_path != ''){
					background_list[i].layer2_image_path = '.' + background_list[i].layer2_image_path;
					window._resource_loader.AddImage(background_list[i].layer2_image_path);
				}
				if(background_list[i].layer3_image_path != ''){
					background_list[i].layer3_image_path = '.' + background_list[i].layer3_image_path;
					window._resource_loader.AddImage(background_list[i].layer3_image_path);
				}
			}

			// console.log('PARTICLE image path ');
			// console.log('particle_list ' + JSON.stringify(particle_list));
			// for(var i=0 ; i<particle_list.length ; i++){
			// 	if(particle_list[i]){
			// 		particle_list[i].image_path = '.' + particle_list[i].image_path;
			// 		window._resource_loader.AddImage(particle_list[i].image_path);
			// 	}
			// }
			if(game_data.beat_atlas_image_path){
				// console.log('game_data.beat_atlas_image_path ' + game_data.beat_atlas_image_path);
				game_data.beat_atlas_image_path = '.' + game_data.beat_atlas_image_path;
				window._resource_loader.AddImage(game_data.beat_atlas_image_path);
				// console.log('game_data.beat_atlas_image_path ' + game_data.beat_atlas_image_path);
			}
		}

		var converted_data = {
			beat_list_1: wave_n_beat_1.beat_list,
			wave_list_1: wave_n_beat_1.wave_list,
			beat_list_2: wave_n_beat_2.beat_list,
			wave_list_2: wave_n_beat_2.wave_list,
			beat_list_3: wave_n_beat_3.beat_list,
			wave_list_3: wave_n_beat_3.wave_list,
			background_list: background_list,
			particle_list: particle_list,
			beat_atlas_uid: game_data.beat_atlas_uid,
			beat_atlas_image_path: game_data.beat_atlas_image_path,
			font_info: {
				score:{
					fill_color: game_data.score_fill_color,
					use_stroke: game_data.score_use_stroke,
					stroke_color: game_data.score_stroke_color,
					line_width: game_data.score_line_width
				},
				hit:{
					fill_color: game_data.hit_fill_color,
					use_stroke: game_data.hit_use_stroke,
					stroke_color: game_data.hit_stroke_color,
					line_width: game_data.hit_line_width
				},
				combo:{
					fill_color: game_data.combo_fill_color,
					use_stroke: game_data.combo_use_stroke,
					stroke_color: game_data.combo_stroke_color,
					line_width: game_data.combo_line_width
				},
				result:{
					fill_color: game_data.result_fill_color,
					use_stroke: game_data.result_use_stroke,
					stroke_color: game_data.result_stroke_color,
					line_width: game_data.result_line_width
				}
			}
		};

		//wave list가 0이면 background_list의 첫번째 것 기본 사용하도록함.
		if(background_list.length > 0){
			if(converted_data.wave_list_1.length == 0){
				converted_data.wave_list_1.push({
					t:0,
					type:BG_SELECT_TYPE.FIXED,
					background_uid:background_list[0].background_uid
				});
			}	
			if(converted_data.wave_list_2.length == 0){
				converted_data.wave_list_2.push({
					t:0,
					type:BG_SELECT_TYPE.FIXED,
					background_uid:background_list[0].background_uid
				});
			}	
			if(converted_data.wave_list_3.length == 0){
				converted_data.wave_list_3.push({
					t:0,
					type:BG_SELECT_TYPE.FIXED,
					background_uid:background_list[0].background_uid
				});
			}

			window._background_renderer.SetBackground(background_list[0]);
		}

		_game_control.SetGameData(converted_data);
	};

	this.OnYoutubeVideoReadyToPlay = function(){
		console.log('OnYoutubeVideoReadyToPlay ');
		window._resource_loader.OnYoutubeLoaded();
	};

	this.Like = function(){
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

	this.DISP_PrevGameResult = function(){
		window._db_control.LoadGameResultList();
		var game_result = window._db_control.GetGameResult(self._game_id);	
		if(game_result != null){
			var percent = game_result.progress_percent * 100;
			var percent_str = Math.round(percent, 1) + '%';
			var h = `${game_result.score} (${percent_str}) [${game_result.difficulty}]`;
			$('#id_text_my_score').html(h);
		}
	};

	this.DISP_HowTo = function(game_type){
		if(game_type == GAME_TYPE.DDR || game_type == GAME_TYPE.PIANO_TILE){
			$('#id_div_how_to_ddr').show();
		}else if(game_type == GAME_TYPE.PUMP){
			$('#id_div_how_to_pump').show();
		}else if(game_type == GAME_TYPE.GUN_FIRE){
			$('#id_div_how_to_gun').show();
		}else if(game_type == GAME_TYPE.CRASH_NUTS){
			
		}
	};
}