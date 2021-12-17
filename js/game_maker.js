function GameMaker() {
	var self = this;
	this._is_playing = false;
	this._duration_sec = 0;
	this._base_line = 600;
	this._timelapse = 0;
	this._game_data = null;
	this._video_id = '';
	this._selected_note_idx = -1;
	this._is_jump_play = false;
	this._game_type = null;

	this.Init = function () {
		_yt_player.SetEventListener(self.YT_OnYoutubeReady, self.YT_OnFlowEvent, self.YT_OnPlayerReady, self.YT_OnPlayerStateChange);
		
		self.InitKeyHandle();
		self.InitTouchHandle();
		self.InitComponentHandle();
		self.Update();

		self._game_data = new GameData(DIMENSION._2D, MOVE_DIRECTION.UPWARD);
		self._game_data._base_line = self._base_line;

		return this;
	};

	this.SetGameType = function(game_type){
		self._game_type = game_type;
		self._game_data.SetGameType(game_type);
	};

	this.InitKeyHandle = function () 
	{
		document.addEventListener('keydown', function (e) 
		{
			console.log('e.keyCode ' + e.keyCode);
			if(self._game_type == GAME_TYPE.Dash)
			{
				switch (e.keyCode) 
				{
					case 96://0
					case 97://1
					case 98://2
					case 99://3
					case 100://4
					case 101://5
					case 102://6
						self.Dash_Record(e.keyCode, self._timelapse);
						break;
				}

			}
			else if(self._game_type == GAME_TYPE.DDR)
			{
				switch (e.keyCode) 
				{
					case 48://0
						self.DDR_RecordRandom(2, self._timelapse);
						break;
					case 74://j
						self.DDR_Record(ARROW.LEFT, self._timelapse);
						break;
					case 75://k
						self.DDR_Record(ARROW.DOWN, self._timelapse);
						break;
					case 76://l
						self.DDR_Record(ARROW.UP, self._timelapse);
						break;
					case 186://
						self.DDR_Record(ARROW.RIGHT, self._timelapse);
						break;
					default:
						self.DDR_RecordRandom(1, self._timelapse);
						break;
				}
			}
		});
	};

	this._touch_count = 0;
	this._prev_left_touch_ts = 0;
	this._prev_down_touch_ts = 0;
	this._prev_up_touch_ts = 0;
	this._prev_right_touch_ts = 0;
	this.InitTouchHandle = function(){
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
			if(arrow_list.length == 1){
				self.DDR_Record(arrow_list[0]);
			}else if(arrow_list.length == 2){
				self.DDR_Record(arrow_list[0]);
				self.DDR_Record(arrow_list[1]);
			}
		});
	};

	this.InitComponentHandle = function(){
		$('#id_btn_prepend_beat').on('click', self.PrependBeat);
		$('#id_btn_prepend_wave').on('click', self.PrependWave);
		$('#id_btn_del_from').on('click', self.DeleteFrom);
		$('#id_btn_shift_100_plus').on('click', self.Shift100Plus);
		$('#id_btn_shift_100_minus').on('click', self.Shift100Minus);
		$('#id_btn_shift_10_plus').on('click', self.Shift10Plus);
		$('#id_btn_shift_10_minus').on('click', self.Shift10Minus);
		$('#id_btn_clear').on('click', self.ClearNoteList);
	};

	this.SetVideoID = function(video_id){
		self._video_id = video_id;
	};

	this.YT_OnYoutubeReady = function(){
		console.log('YT_OnYoutubeReady');
	};
	
	this.YT_OnFlowEvent = function(ms){
		ms = parseInt(ms * 1000);
		self._timelapse_youtube = ms;
	};
	
	this.YT_OnPlayerReady = function(){
		if(self._late_play == true){
			self._late_play = false;
			_yt_player.Play();
		}
	};
	
	this.YT_OnPlayerStateChange = function(is_play){
		console.log('is_play ' + is_play);
		if(is_play){
			if(self._is_jump_play == false){
				self._timelapse = 0;
				self._timelapse_youtube = 0;
			}
			self._is_playing = true;
		}else{
			self._is_playing = false;
		}
	};

	this.SetWaveNBeat = function(wave_n_beat){
		self._game_data.SetWaveNBeat(wave_n_beat);
	};

	this.StartRecord = function () {
		self._is_jump_play = false;
		// self.DisplayNoteList();
		console.log('StartRecord');
		{
			_renderer._base_line = self._base_line;
			_renderer._render_mode = RENDER_MODE.RECORD;
		}

		self._timelapse = 0;
		self._timelapse_youtube = 0;

		self._game_data._base_line = self._base_line;
		self._game_data.CreateGameObjects();

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

	this.StartRecordWithOffset = function(ms){
		self._is_jump_play = true;
		_edit_game_control.ChangeMode('record');

		{
			_renderer._base_line = self._base_line;
			_renderer._render_mode = RENDER_MODE.RECORD;
		}

		self._timelapse = ms;
		self._timelapse_youtube = ms;

		self._game_data._base_line = self._base_line;
		self._game_data.CreateGameObjectsWithGivenTime(ms);

		{
			_yt_player.SetEventListener(self.YT_OnYoutubeReady, self.YT_OnFlowEvent, self.YT_OnPlayerReady, self.YT_OnPlayerStateChange);
			_yt_player.SeekAndPlay(ms);
		}
	};

	this.StopRecord = function () {
		_yt_player.Stop();
		self._is_playing = false;
		self._game_data.SortBeatList();
		self._game_data.SortWaveList();
		self.DisplayNoteList();
	};

	this.Jump = function (idx) {
		var ball_info = self._game_data._beat_list[idx];
		console.log('ms ' + ball_info.t);
		self.StartRecordWithOffset(ball_info.t);
	};

	this._delta = 0;
	this._tick = 0;
	this.Update = function () {
		{
			var now = Date.now();
			self._delta = now - self._tick;
			self._tick = now;
		}

// console.log('self._is_playing ' + self._is_playing);

		if(self._is_playing){
			self._timelapse += self._delta;
			self._timelapse_youtube += self._delta;

			//youtube와 시간차 보정
			{
				if(self._timelapse > self._timelapse_youtube){
					var diff = self._timelapse - self._timelapse_youtube;
					self._timelapse -= parseInt(diff / 10);
				}else if(self._timelapse < self._timelapse_youtube){
					var diff = self._timelapse_youtube - self._timelapse;
					self._timelapse += parseInt(diff / 10);
				}
			}

			for(var i=0 ; i<self._game_data._game_objs.length ; i++){
				var go = self._game_data._game_objs[i];

				go.Update(self._timelapse);
			}

			_renderer.Update(self._game_data._game_objs, 0);
		}

		requestAnimationFrame(self.Update);
	};

	this.AdjustBeat = function (idx, adjust) {
		var val = 0;
		switch (adjust) {
			case 0:
				val = -100;
				break;
			case 1:
				val = 100;
				break;
			case 2:
				val = -10;
				break;
			case 3:
				val = 10;
				break;
		}

		var org_ms = self._game_data._beat_list[idx].t;
		var new_ms = self._game_data._beat_list[idx].t + val;
		self._game_data._beat_list[idx].t = new_ms;
		self.DisplayNoteList();
		if(self._is_playing == false){
			self._game_data.UpdateGameObjectOffset(org_ms, new_ms, self._timelapse);
			_renderer.Update(self._game_data._game_objs);
		}
	};

	this.AdjustWave = function(idx, adjust){
		console.log('idx ' + idx + ' ' + adjust);
		var val = 0;
		switch (adjust) {
			case 0:
				val = -100;
				break;
			case 1:
				val = 100;
				break;
			case 2:
				val = -10;
				break;
			case 3:
				val = 10;
				break;
		}

		var org_ms = self._game_data._wave_list[idx];
		var new_ms = self._game_data._wave_list[idx] + val;
		self._game_data._wave_list[idx] = new_ms;
		self.DisplayNoteList();
		if(self._is_playing == false){
			self._game_data.UpdateGameObjectOffset(org_ms, new_ms, self._timelapse);
			_renderer.Update(self._game_data._game_objs);
		}
	};

	this.GetRandomKey = function(){
		var min = 37;
		var max = 41;
		var r = Math.random() * (max - min) + min;
		return parseInt(r);
	};

	this.DDR_RecordRandom = function(count, time){
		if(count == 1){
			var r = self.GetRandomKey();
			self.DDR_Record(parseInt(r), time);
		}else if(count == 2){
			var min = 0;
			var max = 4;
			var r = parseInt(Math.random() * (max - min) + min);
			console.log('r ' + r);
			/**
			 *          LDUR
			 * case 0 - X_X_
			 * case 1 - X__X
			 * case 2 - _XX_
			 * case 3 - _X_X
			 */
			switch(r){
				case 0:
					self.DDR_Record(ARROW.LEFT, time);
					self.DDR_Record(ARROW.UP, time);
					break;
				case 1:
					self.DDR_Record(ARROW.LEFT, time);
					self.DDR_Record(ARROW.RIGHT, time);
					break;
				case 2:
					self.DDR_Record(ARROW.DOWN, time);
					self.DDR_Record(ARROW.UP, time);
					break;
				case 3:
					self.DDR_Record(ARROW.DOWN, time);
					self.DDR_Record(ARROW.RIGHT, time);
					break;
			}
		}
	};

	this.DDR_Record = function (arrow, time) {
		if (self._is_playing == false) {
			return;
		}

		// console.log('record ' + arrow + ' time ' + self._timelapse);

		// var timelapse_ms = Date.now() - self._start_time_ms;
		var ball_info = null;

		//처음 등록하는 것은 그냥 입력
		if(self._game_data._beat_list.length == 0){
			var mask = 0;
			mask |= (arrow == ARROW.LEFT  ? LEFT_BIT  : 0);
			mask |= (arrow == ARROW.UP    ? UP_BIT    : 0);
			mask |= (arrow == ARROW.RIGHT ? RIGHT_BIT : 0);
			mask |= (arrow == ARROW.DOWN  ? DOWN_BIT  : 0);
			ball_info = {
				t: time,
				m: mask
			};
			self._game_data.AddBall(ball_info);
			// self.DisplayNoteListAddedKey(self._game_data._beat_list.length - 1);
		}else{
			ball_info = self._game_data._beat_list[self._game_data._beat_list.length - 1];
			var diff = Math.abs(ball_info.t - time);

			// console.log('diff ' + diff);
			//마지막 입력이 0.1초 이내라면 키만 추가
			if(diff < 100){
				if(arrow == ARROW.LEFT){
					ball_info.m |= LEFT_BIT;
				}else if(arrow == ARROW.UP){
					ball_info.m |= UP_BIT;
				}else if(arrow == ARROW.RIGHT){
					ball_info.m |= RIGHT_BIT;
				}else if(arrow == ARROW.DOWN){
					ball_info.m |= DOWN_BIT;
				}
				self._game_data.UpdateGameObject(ball_info);
				// self.DisplayNoteListUpdatedKey(self._game_data._beat_list.length - 1);
			}else{
				var mask = 0;
				mask |= (arrow == ARROW.LEFT  ? LEFT_BIT  : 0);
				mask |= (arrow == ARROW.UP    ? UP_BIT    : 0);
				mask |= (arrow == ARROW.RIGHT ? RIGHT_BIT : 0);
				mask |= (arrow == ARROW.DOWN  ? DOWN_BIT  : 0);
				ball_info = {
					t: time,
					m: mask
				};
				self._game_data.AddBall(ball_info);
				// self.DisplayNoteListAddedKey(self._game_data._beat_list.length - 1);
			}
		}
	};

	this.Dash_Record = function(key, time){
		var n = null;
		switch (key) 
		{
			case 96://shift
				self._game_data.AddWave(time);
				break;
			case 97://1
			case 98://2
			case 99://3
			case 100://4
			case 101://5
			case 102://6
				n = key - 96;
				var ball_info = {
					t: time,
					n: n
				};
				self._game_data.AddBall(ball_info);
				break;
		}
	};

	this.DeleteWave = function(idx){
		self._game_data.DeleteWave(idx);
		self.DisplayNoteList();

		if(self._is_playing == false){
			_renderer.Update(self._game_data._game_objs);
		}
	};

	this.DeleteBeat = function(idx){
		if(idx == self._selected_note_idx){
			self._selected_note_idx = -1;
		}
		self._game_data.DeleteBeat(idx);
		self.DisplayNoteList();

		if(self._is_playing == false){
			_renderer.Update(self._game_data._game_objs);
		}
	};

	this.ms_2_min_sec_str = function(ms){
		var seconds = parseInt(ms / 1000);
		var min = parseInt(seconds/60);
		var sec = seconds%60;
		var ms_str = ms % 1000;

		var str = '';

		if(min < 10){
			str += '0' + min + ':';
		}else{
			str += min + ':';
		}

		if(sec < 10){
			str += '0' + sec;
		}else{
			str += sec;
		}

		str += '.' + ms_str;
		return str;
	};

	this.ms_2_sec_str = function(ms){
		var seconds = parseInt(ms / 1000);
		var sec = seconds%60;
		var ms_str = ms % 1000;

		var str = '';
		str += sec;
		str += '.' + ms_str;
		return str;
	};

	this._temp_note_and_wave_merged_list = [];

	this.MergeNoteListAndWaveList = function(){
		self._temp_note_and_wave_merged_list = [];

		//note list 전체를 merged list에 집어 넣기.
		for(var n=0 ; n<self._game_data._beat_list.length ; n++){
			self._temp_note_and_wave_merged_list.push({
				type:'note',
				time:self._game_data._beat_list[n].t,
				org_idx:n
			});
		}

		//wave list를 note들 사이에 끼워넣기.
		for(var w=0 ; w<self._game_data._wave_list.length ; w++){
			var wave_time = self._game_data._wave_list[w];
			for(var i=0 ; i<self._temp_note_and_wave_merged_list.length ; i++){
				if(self._temp_note_and_wave_merged_list[i].type == 'note'){
					var note_time = self._temp_note_and_wave_merged_list[i].time;
					if(wave_time <= note_time){
						self._temp_note_and_wave_merged_list.splice(i, 0, {
							type:'wave',
							time:self._game_data._wave_list[w],
							org_idx:w
						});
						break;
					}
				}
			}
		}

		for(var i=0 ; i<self._temp_note_and_wave_merged_list.length ; i++){
			var m = self._temp_note_and_wave_merged_list[i];
		}
	};

	this.DisplayNoteList = function () {
		self.MergeNoteListAndWaveList();

		var ele_show = $('#id_div_record');
		ele_show.empty();
		var txt = '';

		txt += '<table class="table table-sm table-dark" id="id_table">';
		txt += '	<thead>';
		txt += '		<tr>';
		txt += '			<td>Order</td>';
		txt += '			<td>Time</td>';
		txt += '			<td>Diff</td>';

		if(self._game_type == GAME_TYPE.DDR){
			txt += '			<td><i class="fas fa-arrow-left"></i></td>';
			txt += '			<td><i class="fas fa-arrow-down"></i></td>';
			txt += '			<td><i class="fas fa-arrow-up"></i></td>';
			txt += '			<td><i class="fas fa-arrow-right"></i></td>';	
		}else{
			txt += '			<td></td>';	
		}
		txt += '			<td>0.1</td>';
		txt += '			<td>0.01</td>';
		txt += '			<td>Del</td>';
		txt += '		</tr>';
		txt += '	</thead>';


		for (var i = self._temp_note_and_wave_merged_list.length-1; i>=0 ; i--) {
			if(self._temp_note_and_wave_merged_list[i].type == 'note'){
				txt += self.GetRowString(self._temp_note_and_wave_merged_list[i].org_idx);
			}else if(self._temp_note_and_wave_merged_list[i].type == 'wave'){
				txt += self.GetWaveRowString(self._temp_note_and_wave_merged_list[i].org_idx);
			}
		}
		txt += '</table>';
		ele_show.html(txt);
	};

	this.GetWaveRowString = function(wave_idx){
		txt = '';
		txt += '<tr>';
		txt += '	<td>Wave ' + wave_idx + '</td>';
		txt += '	<td>' + self.ms_2_min_sec_str(self._game_data._wave_list[wave_idx]) + '</td>';
		txt += '	<td></td>';
		txt += '	<td></td>';
		txt += '	<td>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustWave(' + wave_idx + ', 0)">-</div>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustWave(' + wave_idx + ', 1)">+</div>';
		txt += '	</td>';
		txt += '	<td>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustWave(' + wave_idx + ', 2)">-</div>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustWave(' + wave_idx + ', 3)">+</div>';
		txt += '	</td>';
		txt += '	<td>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.DeleteWave(' + wave_idx + ')">X</div>';
		txt += '	</td>';
		txt += '</tr>';
		return txt;
	};

	this.GetRowString = function(idx){
		var diff = 0;
		if (idx > 0) {
			diff = self._game_data._beat_list[idx].t - self._game_data._beat_list[idx-1].t;
		}

		var order = new Number(idx) + 1;
		var txt = '';
		txt += '<tr>';

		if(self._selected_note_idx == idx){
			txt += '	<td id="id_note_'+idx+'" class="note_order note_selected" onclick="_game_maker.OnNoteClick('+idx+')">' + order + '</td>';
		}else{
			txt += '	<td id="id_note_'+idx+'" class="note_order" onclick="_game_maker.OnNoteClick('+idx+')">' + order + '</td>';
		}
		txt += '	<td style="cursor:pointer" onclick="_game_maker.Jump('+idx+')">' + self.ms_2_min_sec_str(self._game_data._beat_list[idx].t) + '</td>';
		txt += '	<td>' + self.ms_2_sec_str(diff) + '</td>';

		if(self._game_type == GAME_TYPE.DDR){
			var left = '';
			var down = '';
			var up = '';
			var right = '';
			if(self._game_data._beat_list[idx].m & LEFT_BIT){
				left = '<i class="fas fa-arrow-left"></i>';
			}
			if(self._game_data._beat_list[idx].m & DOWN_BIT){
				down = '<i class="fas fa-arrow-down"></i>';
			}
			if(self._game_data._beat_list[idx].m & UP_BIT){
				up = '<i class="fas fa-arrow-up"></i>';
			}
			if(self._game_data._beat_list[idx].m & RIGHT_BIT){
				right = '<i class="fas fa-arrow-right"></i>';
			}
	
			txt += '	<td id="id_'+idx+'_l" style="cursor:pointer" onclick="_game_maker.AddOrRemoveBall('+idx+',1)">' + left + '</td>';
			txt += '	<td id="id_'+idx+'_d" style="cursor:pointer" onclick="_game_maker.AddOrRemoveBall('+idx+',2)">' + down + '</td>';
			txt += '	<td id="id_'+idx+'_u" style="cursor:pointer" onclick="_game_maker.AddOrRemoveBall('+idx+',3)">' + up + '</td>';
			txt += '	<td id="id_'+idx+'_r" style="cursor:pointer" onclick="_game_maker.AddOrRemoveBall('+idx+',4)">' + right + '</td>';
		}else{
			txt += '	<td id="id_'+idx+'_l">' + self._game_data._beat_list[idx].n + '</td>';	
		}
		txt += '	<td>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustBeat(' + idx + ', 0)">-</div>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustBeat(' + idx + ', 1)">+</div>';
		txt += '	</td>';
		txt += '	<td>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustBeat(' + idx + ', 2)">-</div>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.AdjustBeat(' + idx + ', 3)">+</div>';
		txt += '	</td>';
		txt += '	<td>';
		txt += '		<div class="badge badge-success" style="cursor:pointer" onclick="_game_maker.DeleteBeat(' + idx + ')">X</div>';
		txt += '	</td>';
		txt += '</tr>';
		return txt;
	};

	this.OnNoteClick = function(idx){
		// console.log('idx ' + idx);
		if(idx == self._selected_note_idx){
			$('#id_note_'+idx).removeClass('note_selected');
		}else{
			$('#id_note_'+self._selected_note_idx).removeClass('note_selected');
			$('#id_note_'+idx).addClass('note_selected');
		}
		self._selected_note_idx = idx;
		$('#id_selected_idx').text(self._selected_note_idx+1);
	};

	this.AddOrRemoveBall = function(idx, arrow){
		self._game_data.AddOrRemoveBall(idx, arrow);
		self.DisplayNoteListUpdatedKey(idx);
		if(self._is_playing == false){
			_renderer.Update(self._game_data._game_objs, 0);
		}
	};

	this.DisplayNoteListAddedKey = function(idx){
		var ele_table = $('#id_table');
		var ele_row = $(self.GetRowString(idx));
		ele_table.prepend(ele_row);
	};

	this.DisplayNoteListUpdatedKey = function(idx){
		var left = '';
		var down = '';
		var up = '';
		var right = '';
		if(self._game_data._beat_list[idx].m & LEFT_BIT){
			left = '<i class="fas fa-arrow-left"></i>';
		}
		if(self._game_data._beat_list[idx].m & DOWN_BIT){
			down = '<i class="fas fa-arrow-down"></i>';
		}
		if(self._game_data._beat_list[idx].m & UP_BIT){
			up = '<i class="fas fa-arrow-up"></i>';
		}
		if(self._game_data._beat_list[idx].m & RIGHT_BIT){
			right = '<i class="fas fa-arrow-right"></i>';
		}
		$('#id_'+idx+'_l').html(left);
		$('#id_'+idx+'_d').html(down);
		$('#id_'+idx+'_u').html(up);
		$('#id_'+idx+'_r').html(right);
	};

	this.PrependBeat = function(){
		if(self._selected_note_idx == -1){
			alert('Select ID');
			return;
		}
		self._game_data.PrependBeat(self._selected_note_idx);
		self.DisplayNoteList();
	};

	this.PrependWave = function(){
		if(self._selected_note_idx == -1){
			alert('Select ID');
			return;
		}
		self._game_data.PrependWave(self._selected_note_idx);
		self.DisplayNoteList();
	};

	this.DeleteFrom = function(){
		if(self._selected_note_idx == -1){
			alert('Select ID');
			return;
		}
		self._game_data.DeleteFrom(self._selected_note_idx);
		self._selected_note_idx = -1;
		self.DisplayNoteList();
	};

	this.ClearNoteList = function(){
		self._game_data.ClearNoteList();
		self._selected_note_idx = -1;
		self.DisplayNoteList();
	};

	this.Shift100Plus = function(){
		self._game_data.Shift(100);
		self.DisplayNoteList();
	};

	this.Shift100Minus = function(){
		self._game_data.Shift(-100);
		self.DisplayNoteList();
	};

	this.Shift10Plus = function(){
		self._game_data.Shift(10);
		self.DisplayNoteList();
	};

	this.Shift10Minus = function(){
		self._game_data.Shift(-10);
		self.DisplayNoteList();
	};
}