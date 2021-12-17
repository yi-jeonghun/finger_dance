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
	window._game_control._is_excercise_mode = true;
	window._renderer = new Renderer(game_width, game_height, screen_width, screen_height).Init();
	window._renderer._show_index_number = true;

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
	this._game_type = GAME_TYPE.Dash;
	this._sound_key_list = [
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY,
		DEFAULT_SOUND_KEY
	];
	this._base_offset_ms = 0;
	this._level = 1;

	this.Init = function(){
		self.InitLayout();
		_drum_player._onLoadingFinishedCallback = self.LoadDrumFinished;
		self._game_id = GetURLParam('id');
		console.log('self._game_id ' + self._game_id);
		if(self._game_id == null){
			self.InitEditor_NewMode();
		}else{
			self.InitEditor_EditMode();
		}

		self.InitComponentHandle();
		return this;
	};

	this.InitEditor_NewMode = function(){
		self.ChangeEditMode(EDIT_MODE.NEW);
		self.LoadDrumList();
		self.LoadInitDrums();

		var v = GetURLParam('v');
		if(v != null){
			self._video_id = v;
			_yt_player._video_id = self._video_id;
			$('#id_text_video').val(self._video_id);
		}

		//게임 타입 : 기본 값은 Dash로 하자.
		var game_type = GetURLParam('game_type');
		{
			if(game_type == null){
				self._game_type = GAME_TYPE.Dash;
				$('#id_text_game_type').text("Dash");
			}else{
				self._game_type = game_type;
				if(self._game_type == GAME_TYPE.DDR){
					$('#id_text_game_type').text("DDR");
				}else if(self._game_type == GAME_TYPE.Dash){
					$('#id_text_game_type').text("Dash");
				}
			}
			window._game_maker.SetGameType(self._game_type);
			window._game_control.SetGameType(self._game_type);
		}

		{
			var video_id_param = GetURLParam('video_id');
			var artist_param = GetURLParam('artist');
			var title_param = GetURLParam('title');
			
			if(artist_param != null){
				$('#id_text_artist').val(artist_param);
				console.log('asdf 2 ');
			}
			if(title_param != null){
				$('#id_text_title').val(title_param);
				console.log('asdf 3 ');
			}
			if(video_id_param != null){
				$('#id_text_video').val(video_id_param);
				setTimeout(self.LoadVideo, 500);
			}
		}
	};

	this.InitEditor_EditMode = function(){
		self.ChangeEditMode(EDIT_MODE.UPDATE);
		self.GetGameData(function(game_data){
			self._video_id = game_data.video_id;
			_yt_player._video_id = self._video_id;
			self._sound_key_list = JSON.parse(game_data.sound_key_list);

			self._game_type = game_data.game_type;
			{
				if(self._game_type == GAME_TYPE.DDR){
					$('#id_text_game_type').text('DDR');
				}else if(self._game_type == GAME_TYPE.Dash){
					$('#id_text_game_type').text('Dash');
				}
				window._game_maker.SetGameType(self._game_type);
				window._game_control.SetGameType(self._game_type);
			}

			$('#id_text_artist').val(game_data.artist);
			$('#id_text_title').val(game_data.title);

			$('#id_text_video').val(self._video_id);
			$('#id_text_created_time').html(game_data.timestamp_created);
			$('#id_text_modified_time').html(game_data.timestamp_modified);

			self._base_offset_ms = game_data.base_offset_ms;
			$('#id_text_base_offset').text(self._base_offset_ms);

			console.log('game_data.is_public ' + game_data.is_public);
			if(game_data.is_public == '1'){
				$('#id_chk_is_public').prop('checked', 'true');
			}

			self._level = game_data.level;
			$('#id_text_level').text(game_data.level);
			
			self.LoadDrumList();
			self.LoadInitDrums();

			// console.log('game_data.ball_list ' + game_data.ball_list);
			var wave_n_beat = JSON.parse(game_data.wave_n_beat);
			_game_maker.SetWaveNBeat(wave_n_beat);
			_game_maker.DisplayNoteList();
			// _game_control._base_offset_ms = self._base_offset_ms;
			_game_control.SetWaveNBeat(wave_n_beat);
			_game_control.PrepareGame();
		});
	};

	this.InitLayout = function(){
		var width = (window.innerWidth - 410)/2;
		$('#id_lo_info').css('width', width + 'px');
		$('#lo_note_list').css('width', width + 'px');
	};
	
	this.InitComponentHandle = function(){
		console.log('InitComponentHandle ' );
		$('#id_text_video').on('change', self.LoadVideo);
		// $('#id_btn_load_video').on('click', self.LoadVideo);
		$('#id_btn_save_game').on('click', self.SaveGame);
		$('#id_btn_update_game').on('click', self.UpdateGame);
		$('#id_btn_delete').on('click', self.DeleteGame);
		$('#id_btn_new_versino').on('click', self.NewVersion);

		$('#id_btn_play').on('click', self.PlayGame);
		$('#id_btn_pause').on('click', self.PauseGame);
		$('#id_btn_stop').on('click', self.StopGame);

		$('#id_btn_start_record').on('click', self.StartRecord);
		$('#id_btn_stop_record').on('click', self.StopRecord);
		$('#id_btn_export').on('click', self.Export);

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

		$('#id_btn_calc_level').on('click', self.CalcLevel);
		$('#id_btn_minus_level').on('click', self.OnMinusLevel);
		$('#id_btn_plus_level').on('click', self.OnPlusLevel);
		$('#id_btn_minus_base_offset').on('click', self.OnMinusBaseOffset);
		$('#id_btn_plus_base_offset').on('click', self.OnPlusBaseOffset);
	};

	this.Export = function(){
		var obj = window._game_maker._game_data.GetWaveNBeat();
		var str = JSON.stringify(obj);
		$('#id_text_export').val(str);
	};

	this.OnMinusLevel = function(){
		if(self._level == 1){
			return;
		}
		self._level--;
		$('#id_text_level').html(self._level);
	};

	this.OnPlusLevel = function(){
		if(self._level == 7){
			return;
		}
		self._level++;
		$('#id_text_level').html(self._level);
	};

	this.OnMinusBaseOffset = function(){
		self._base_offset_ms -= 10;
		$('#id_text_base_offset').text(self._base_offset_ms);
		// _game_control._base_offset_ms = self._base_offset_ms;
		_game_control.PrepareGame();
	};

	this.OnPlusBaseOffset = function(){
		self._base_offset_ms += 10;
		$('#id_text_base_offset').text(self._base_offset_ms);
		// _game_control._base_offset_ms = self._base_offset_ms;
		_game_control.PrepareGame();
	};

	this.ChangeEditMode = function(mode){
		if(mode == EDIT_MODE.NEW){
			$('#id_btn_save_game').show();
			$('#id_btn_update_game').hide();
			$('#id_btn_delete').hide();
			$('#id_btn_new_versino').hide();
		}else if(mode == EDIT_MODE.UPDATE){
			$('#id_btn_save_game').hide();
			$('#id_btn_update_game').show();
			$('#id_btn_delete').show();
			$('#id_btn_new_versino').show();
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

		var is_public = $('#id_chk_is_public').prop('checked') ? 1 : 0;
		console.log('is_public ' + is_public);

		var data = {
			video_id: self._video_id,
			artist: ele_artist.val(),
			title: ele_title.val(),
			sound_key_list: self._sound_key_list,
			wave_n_beat: _game_maker._game_data.GetWaveNBeat(),
			base_offset_ms: self._base_offset_ms,
			is_public: is_public,
			level: self._level,
			game_type: self._game_type
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

	this.NewVersion = function(){
		var url = "/edit_game.vu?";
		url += "video_id=" + $('#id_text_video').val();
		url += "&artist=" + $('#id_text_artist').val();
		url += "&title=" + $('#id_text_title').val();
		window.location.href = url;
	};

	this.PlayGame = function() {
		if(self._video_id == null || self._video_id == ''){
			alert("Please input youtube URL");
			return;
		}

		self.ChangeMode('play');
		_game_control.PlayGame();
	};

	this.PauseGame = function() {
		self.ChangeMode('play');
		_game_control.PauseGame();
	};

	this.StopGame = function() {
		self.ChangeMode('all');
		_game_control.StopGame();
		_game_control.PrepareGame();
	};

	this.StartRecord = function(){
		if(self._video_id == null || self._video_id == ''){
			alert("Please input youtube URL");
			return;
		}

		self.ChangeMode('record');
		_game_maker.StartRecord();
	};

	this.StopRecord = function(){
		self.ChangeMode('all');
		_game_maker.StopRecord();
		_game_control.SetWaveNBeat(_game_maker._game_data.GetWaveNBeat());
		_game_control.PrepareGame();
	};

	this.ChangeMode = function(mode){
		if(mode == 'play'){
			$('#id_btn_start_record').prop('disabled', true);
			$('#id_btn_stop_record').prop('disabled', true);
			$('#id_btn_clear_record').prop('disabled', true);
		}else if(mode == 'record'){
			$('#id_btn_play').prop('disabled', true);
			$('#id_btn_pause').prop('disabled', true);
			$('#id_btn_stop').prop('disabled', true);
		}else if(mode == 'all'){
			$('#id_btn_play').prop('disabled', false);
			$('#id_btn_pause').prop('disabled', false);
			$('#id_btn_stop').prop('disabled', false);

			$('#id_btn_start_record').prop('disabled', false);
			$('#id_btn_stop_record').prop('disabled', false);
			$('#id_btn_clear_record').prop('disabled', false);
		}
	};

	this.CalcLevel = function(){
		var note_list = _game_maker._game_data._beat_list;

		var total_note_count = 0;

		for(var i=0 ; i<note_list.length ; i++){
			var note = note_list[i];
			if(note.m & LEFT_BIT){
				total_note_count++;
			}
			if(note.m & UP_BIT){
				total_note_count++;
			}
			if(note.m & RIGHT_BIT){
				total_note_count++;
			}
			if(note.m & DOWN_BIT){
				total_note_count++;
			}
		}

		var time_len = note_list[note_list.length-1].t;
		var npm = 0;//notes per minutes
		{
			npm = ((60*1000) / time_len) * total_note_count;
		}

		var score = npm;
		
		var min = 90;
		var increse = 10;
		var lv1 = min;//90
		var lv2 = min + (increse*1);//95
		var lv3 = min + (increse*2);//110
		var lv4 = min + (increse*3);//125
		var lv5 = min + (increse*4);//140
		var lv6 = min + (increse*5);//155
		var lv7 = min + (increse*6);

		var level = 1;
		if(score <= lv1){
			level = 1;
		}else if(lv1 < score && score <= lv2){
			level = 2;
		}else if(lv2 < score && score <= lv3){
			level = 3;
		}else if(lv3 < score && score <= lv4){
			level = 4;
		}else if(lv4 < score && score <= lv5){
			level = 5;
		}else if(lv5 < score && score <= lv6){
			level = 6;
		}else if(lv6 < score){
			level = 7;
		}

		self._level = level;
		$('#id_text_level').html(level);
	};
}