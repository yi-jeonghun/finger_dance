$('document').ready(function(){
	window._drum_player = new DrumPlayer().Init();
	window._atlas = new Atlas().Init();
	window._yt_player = new YoutubePlayer().Init();
	window._timer = new Timer().Init();

	var game_width = 400;
	var game_height = 700;

	var screen_width = 400;
	var screen_height = 700;
	window._game_control = new GameControl(game_width, game_height).Init();
	window._renderer = new Renderer(game_width, game_height, screen_width, screen_height).Init();

	window._game_maker = new GameMaker().Init();

	window._edit_game_control = new EditGameControl().Init();
});

const EDIT_MODE = {
	NEW:0,
	UPDATE:1
};

function EditGameControl(){
	var self = this;
	this._mode = EDIT_MODE.NEW;
	this._game_id = '';
	this._video_id = '';
	this._sound_key_list = [
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY
	];

	this.Init = function(){
		self.InitLayout();
		
		_drum_player._onLoadingFinishedCallback = self.LoadDrumFinished;
		self._game_id = GetURLParam('id');
		console.log('self._game_id ' + self._game_id);
		if(self._game_id == null){
			self.ChangeEditMode(EDIT_MODE.NEW);
			self.LoadDrumList();
			self.LoadInitDrums();

			var v = GetURLParam('v');
			if(v != null){
				self._video_id = v;
				_yt_player._video_id = self._video_id;
				$('#id_text_video').val(self._video_id);
			}
		}else{
			self.ChangeEditMode(EDIT_MODE.UPDATE);
			self.GetGameData(function(game_data){
				self._video_id = game_data.video_id;
				_yt_player._video_id = self._video_id;
				self._sound_key_list = JSON.parse(game_data.sound_key_list);

				$('#id_text_artist').val(game_data.artist);
				$('#id_text_title').val(game_data.title);

				console.log('game_data.difficulty ' + game_data.difficulty);
				if(game_data.difficulty == 0){
					$('#id_easy').prop('checked', true);
				}else if(game_data.difficulty == 1){
					$('#id_normal').prop('checked', true);
				}else if(game_data.difficulty == 2){
					$('#id_hard').prop('checked', true);
				}
				$('#id_text_video').val(self._video_id);
				$('#id_text_created_time').html(game_data.timestamp_created);
				$('#id_text_modified_time').html(game_data.timestamp_modified);

				self.LoadDrumList();
				self.LoadInitDrums();

				// console.log('game_data.ball_list ' + game_data.ball_list);
				var wave_n_beat = JSON.parse(game_data._wave_n_beat);
				self.ApplyBallList(wave_n_beat);
			});
		}

		self.InitComponentHandle();
		return this;
	};

	this.ApplyBallList = function(wave_n_beat){
		self.DisplayBeginOffset(wave_n_beat);
		_game_maker.SetWaveNBeat(wave_n_beat);
		_game_maker.DisplayNodeList();
		_game_control.SetWaveNBeat(wave_n_beat);
		_game_control.PrepareGame();
	};

	this.DisplayBeginOffset = function(ball_list){
		// console.log('ball_list ' + ball_list);
		if(ball_list.length > 0){
			$('#id_txt_offset').html(ball_list[0].t);
		}
	};
	
	this.InitLayout = function(){
		var player_height = 120;
		self._ddr_player_height = window.innerHeight - player_height;

		$('#player').css('height', player_height + 'px');
		$('#ddr_player').css('height',  self._ddr_player_height + 'px');
		$('#rank_layer').css('height', self._ddr_player_height + 'px');

		self.ChangeLayout(LAYOUT.INFO);
	};

	this.InitComponentHandle = function(){
		$('#id_btn_back').on('click', function(){ window.history.back(); });

		$('#id_text_video').on('change', self.LoadVideo);
		// $('#id_btn_load_video').on('click', self.LoadVideo);
		$('#id_btn_save_game').on('click', self.SaveGame);
		$('#id_btn_update_game').on('click', self.UpdateGame);
		$('#id_btn_delete').on('click', self.DeleteGame);

		$('#id_btn_play').on('click', self.PlayGame);
		$('#id_btn_pause').on('click', self.PauseGame);
		$('#id_btn_stop').on('click', self.StopGame);

		$('#id_btn_start_record').on('click', self.StartRecord);
		$('#id_btn_stop_record').on('click', self.StopRecord);
		$('#id_btn_clear_record').on('click', self.ClearRecord);

		{
			$('#id_sel_sound-0').on('change', self.LoadDrum);
			$('#id_sel_sound-1').on('change', self.LoadDrum);
			$('#id_sel_sound-2').on('change', self.LoadDrum);
			$('#id_sel_sound-3').on('change', self.LoadDrum);
			$('#id_btn_drum_test-0').on('mousedown', function(){
				_drum_player.Hit(ARROW.LEFT);
			});
			$('#id_btn_drum_test-1').on('mousedown', function(){
				_drum_player.Hit(ARROW.DOWN);
			});
			$('#id_btn_drum_test-2').on('mousedown', function(){
				_drum_player.Hit(ARROW.UP);
			});
			$('#id_btn_drum_test-3').on('mousedown', function(){
				_drum_player.Hit(ARROW.RIGHT);
			});	
		}

		$('#id_btn_adjust_minus').on('click', self.AdjustMinus);
		$('#id_btn_adjust_plus').on('click', self.AdjustPlus);
	};

	this.AdjustMinus = function(){
		var ball_list = _game_maker._game_data._ball_list;
		for(var i=0 ; i<ball_list.length ; i++){
			ball_list[i].t -= 100;
		}
		self.ApplyBallList(ball_list);
	};

	this.AdjustPlus = function(){
		var ball_list = _game_maker._game_data._ball_list;
		for(var i=0 ; i<ball_list.length ; i++){
			ball_list[i].t += 100;
		}
		self.ApplyBallList(ball_list);
	};

	this.ChangeLayout = function(layout){
		switch (layout) {
			case LAYOUT.INFO:
				$('#info_layer').css('visibility', 'visible');
				$('#play_layer').css('visibility', 'hidden');
				$('#record_layer').css('visibility', 'hidden');
				break;
			case LAYOUT.PLAY:
				$('#info_layer').css('visibility', 'hidden');
				$('#play_layer').css('visibility', 'visible');
				$('#record_layer').css('visibility', 'hidden');
				break;
			case LAYOUT.RECORD:
				$('#info_layer').css('visibility', 'hidden');
				$('#play_layer').css('visibility', 'hidden');
				$('#record_layer').css('visibility', 'visible');
				break;
		}
	};

	this.ChangeEditMode = function(mode){
		if(mode == EDIT_MODE.NEW){
			$('#id_btn_save_game').css('display', '');
			$('#id_btn_update_game').css('display', 'none');
			$('#id_btn_delete').css('display', 'none');
		}else if(mode == EDIT_MODE.UPDATE){
			$('#id_btn_save_game').css('display', 'none');
			$('#id_btn_update_game').css('display', '');
			$('#id_btn_delete').css('display', '');
		}
	};

	this.GetGameData = function(cb){
		var data = {
			game_id:self._game_id
		};
		$.ajax({
			url: '/beat_api/get_game_data',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					if(cb){
						// console.log('res.game_data.sound_key_list ' + res.game_data.sound_key_list);
						cb(res.game_data);
					}
				}else{
					alert(res.err);
				}
			}
		});		
	};

	this.LoadInitDrums = function(){
		_drum_player.LoadDrum(0, self._sound_key_list[0]);
		_drum_player.LoadDrum(1, self._sound_key_list[1]);
		_drum_player.LoadDrum(2, self._sound_key_list[2]);
		_drum_player.LoadDrum(3, self._sound_key_list[3]);
	};

	this.LoadDrumList = function(){
		var ele_soule_list_0 = $('#id_sel_sound-0');
		var ele_soule_list_1 = $('#id_sel_sound-1');
		var ele_soule_list_2 = $('#id_sel_sound-2');
		var ele_soule_list_3 = $('#id_sel_sound-3');

		for(var i=0 ; i<DRUMS.length ; i++){
			var selected = '';
			if(self._sound_key_list[0] == DRUMS[i].file){
				selected = 'selected';
			}
			ele_soule_list_0.append('<option ' + selected + '>' + DRUMS[i].name + '</option>');
		}

		for(var i=0 ; i<DRUMS.length ; i++){
			var selected = '';
			if(self._sound_key_list[1] == DRUMS[i].file){
				selected = 'selected';
			}
			ele_soule_list_1.append('<option ' + selected + '>' + DRUMS[i].name + '</option>');
		}

		for(var i=0 ; i<DRUMS.length ; i++){
			var selected = '';
			if(self._sound_key_list[2] == DRUMS[i].file){
				selected = 'selected';
			}
			ele_soule_list_2.append('<option ' + selected + '>' + DRUMS[i].name + '</option>');
		}

		for(var i=0 ; i<DRUMS.length ; i++){
			var selected = '';
			if(self._sound_key_list[3] == DRUMS[i].file){
				selected = 'selected';
			}
			ele_soule_list_3.append('<option ' + selected + '>' + DRUMS[i].name + '</option>');
		}
	};

	this._loading_drum_idx = 0;
	this.LoadDrum = function(){
		var idx = this.id.split('-')[1];
		self._loading_drum_idx = idx;
		// console.log('idx ' + idx);
		$('#id_text_drum_loading-' + idx).html('loading');
		// console.log(this.value);
		var key = DRUM_GetDrumKeyByName(this.value);
		self._sound_key_list[idx] = key;
		_drum_player.LoadDrum(idx, key);
	};

	this.LoadDrumFinished = function(){
		$('#id_text_drum_loading-'+self._loading_drum_idx).html('');
	};

	this.LoadVideo = function(){
		var video_url = $('#id_text_video').val();
		self._video_id = GetVideoIDFromURL(video_url);

		if(self._video_id != ''){
			_game_maker.SetVideoID(self._video_id);
			_game_control.SetVideoID(self._video_id);
			_yt_player.LoadVideo(self._video_id);
		}
	};

	this.ValidateAndGetGameData = function(){
		if(self._video_id == ''){
			alert('Please input youtube video url');
			return false;
		}
		var ele_artist = $('#id_text_artist');
		ele_artist.val(ele_artist.val().trim());
		if(ele_artist.val() == ''){
			alert('Please input artist.');
			return false;
		}
		var ele_title = $('#id_text_title');
		ele_title.val(ele_title.val().trim());
		if(ele_title.val() == ''){
			alert('Please input title');
			return false;
		}

		var difficulty = 0;
		if($('#id_easy').prop('checked')){
			difficulty = 0;
		}else if($('#id_normal').prop('checked')){
			difficulty = 1;
		}else if($('#id_hard').prop('checked')){
			difficulty = 2;
		}

		var data = {
			video_id: self._video_id,
			artist: ele_artist.val(),
			title: ele_title.val(),
			difficulty: difficulty,
			sound_key_list: self._sound_key_list,
			ball_list: _game_maker._game_data._ball_list
		};

		return data;
	};

	this.SaveGame = function(){
		var data = self.ValidateAndGetGameData();
		if(data == false){
			return;
		}

		$.ajax({
			url: '/beat_api/register',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._game_id = res.game_id;
					$('#id_text_created_time').html(res.timestamp.timestamp_created);
					$('#id_text_modified_time').html(res.timestamp.timestamp_modified);
					self.ChangeEditMode(EDIT_MODE.UPDATE);
					alert('Saved Successfully');
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.UpdateGame = function(){
		var data = self.ValidateAndGetGameData();
		if(data == false){
			return;
		}
		data.game_id = self._game_id;

		$.ajax({
			url: '/beat_api/update',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					$('#id_text_created_time').html(res.timestamp.timestamp_created);
					$('#id_text_modified_time').html(res.timestamp.timestamp_modified);
					alert('Updated Successfully');
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.DeleteGame = function(){
		if(confirm('Delete Game?') == false){
			return;
		}

		var data = {
			game_id: self._game_id
		};

		$.ajax({
			url: '/beat_api/delete_game',
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					alert('Deleted Successfully');
					window.location.href = "/";
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.PlayGame = function() {
		if(self._video_id == null || self._video_id == ''){
			alert("Please input youtube URL");
			return;
		}

		self.ChangeLayout(LAYOUT.PLAY);
		_game_control.PlayGame();
	};

	this.PauseGame = function() {
		_game_control.PauseGame();
	};

	this.StopGame = function() {
		self.ChangeLayout(LAYOUT.INFO);
		_game_control.StopGame();
		_game_control.PrepareGame();
	};

	this.StartRecord = function(){
		if(self._video_id == null || self._video_id == ''){
			alert("Please input youtube URL");
			return;
		}

		self.ChangeLayout(LAYOUT.RECORD);
		_game_maker.StartRecord();
	};

	this.StopRecord = function(){
		self.ChangeLayout(LAYOUT.INFO);
		_game_maker.StopRecord();
		_game_control.SetWaveNBeat(_game_maker._game_data._wave_n_beat);
		_game_control.PrepareGame();
	};

	this.ClearRecord = function(){
		_game_maker.ClearRecord();
	};
}