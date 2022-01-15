function GameData(direction, is_show_beat_order){
	var self = this;
	this._speed = 150;//pixel per second
	this._base_line = 100;

	// Beat 정보
	/*{
		t: timelapse_ms,
		m: mask
	}*/
	this._beat_list = [];

	//움직이는 Beat 객체
	this._draw_beat_list = [];

	//play 중에 사용되는 background rule
	/*{
		t: timelapse_ms,
		type: BG_SELECT_TYPE[FIXED, RANDOM, SEQUENCE],
		background_uid: ''
	}*/
	this._wave_list = [];

	// 이 게임에서 사용하는 전체의 background
	/*{
		background:uid: '',
		name:'',
		type: BG_TYPE[IMG, STYLE],
		image_path: '',
		style: ''
	}*/
	this._background_list = [];

	this._move_direction = direction;
	this._note_order = 0;
	this._is_show_beat_order = is_show_beat_order;

	this.Init = function(){
		return this;
	};

	this.SetWaveNBeat = function(wave_n_beat, background_list){
		self._wave_list = wave_n_beat.wave_list;
		self._beat_list = wave_n_beat.beat_list;
		self._background_list = background_list;
	};

	this.GetWaveNBeat = function(){
		var wave_n_beat = {
			wave_list:self._wave_list,
			beat_list:self._beat_list
		};
		return wave_n_beat;
	};

	this.AddWave = function(time){
		var wave = {
			t: time,
			type: BG_SELECT_TYPE.RANDOM,
			background_uid: null
		};
		self._wave_list.push(wave);
		self.SortWaveList();
	};

	this.AddBall = function(ball_info){
		self._beat_list.push(ball_info);
		self.SortBeatList();
		self.CreateDrawBeat(ball_info);
	};

	this.SortBeatList = function(){
		self._beat_list.sort(function(a, b){return a.t - b.t});
	};

	this.SortWaveList = function(){
		self._wave_list.sort(function(a, b){return a.t - b.t});
	};

	this.SortBackgroundList = function(){
		self._background_list.sort(function(a, b){return a.display_order - b.display_order});
	};

	this.UpdateGameObject = function(ball_info){
		for(var i=self._draw_beat_list.length-1 ; i>=0 ; i--){
			var go = self._draw_beat_list[i];
			if(ball_info.t == go._offset_ms){
				self._draw_beat_list.splice(i, 1);
			}
		}
		self.CreateDrawBeat(ball_info);
	};
	
	//DDR용으로만 사용되는 함수임.
	//FIXME : Dash용으로 사용되는 함수 추가로 만들어야 함.
	this.AddOrRemoveBall = function(idx, arrow){
		var ball_info = self._beat_list[idx];
		
		var cnt = 0;
		if(ball_info.m & LEFT_BIT){
			cnt++;
		}
		if(ball_info.m & UP_BIT){
			cnt++;
		}
		if(ball_info.m & RIGHT_BIT){
			cnt++;
		}
		if(ball_info.m & DOWN_BIT){
			cnt++;
		}

		switch(arrow){
			case 1:
				if(ball_info.m & LEFT_BIT){
					ball_info.m ^= LEFT_BIT;
				}else{
					if(cnt < 2){
						ball_info.m |= LEFT_BIT;
					}					
				}
				break;
			case 2:
				if(ball_info.m & DOWN_BIT){
					ball_info.m ^= DOWN_BIT;
				}else{
					if(cnt < 2){
						ball_info.m |= DOWN_BIT;
					}					
				}
				break;
			case 3:
				if(ball_info.m & UP_BIT){
					ball_info.m ^= UP_BIT;
				}else{
					if(cnt < 2){
						ball_info.m |= UP_BIT;
					}					
				}
				break;
			case 4:
				if(ball_info.m & RIGHT_BIT){
					ball_info.m ^= RIGHT_BIT;
				}else{
					if(cnt < 2){
						ball_info.m |= RIGHT_BIT;
					}					
				}
				break;
		}
		self.UpdateGameObject(ball_info);
	};

	this.UpdateGameObjectOffset = function(org_ms, new_ms, timelapse){
		for(var i=0 ; i<self._draw_beat_list.length ; i++){
			if(self._draw_beat_list[i]._offset_ms == org_ms){
				self._draw_beat_list[i].ChangeOffset(new_ms);
				self._draw_beat_list[i].Move(timelapse);
			}
		}
	};

	this.CreateDrawBeatList = function(game_level){
		switch(game_level){
			case 1:
				self._speed = 150;
				break;
			case 2:
				self._speed = 160;
				break;
			case 3:
				self._speed = 170;
				break;
			case 4:
				self._speed = 180;
				break;
			case 5:
				self._speed = 190;
				break;
			case 6:
				self._speed = 200;
				break;
			case 7:
				self._speed = 210;
				break;
		}

		console.log('self._is_show_beat_order ' + self._is_show_beat_order);
		self._note_order = 0;
		self._draw_beat_list = [];
		for(var i=0 ; i<self._beat_list.length ; i++){
			if(self._is_show_beat_order){
				self._note_order++;
			}
			self.CreateDrawBeat(self._beat_list[i]);
		}
	};

	/**
	 * editor에서 특정 시간에서 부터 플레이를 할 때
	 * note를 주어진 시간 만큼 진행시켜놓기 위해 필요한 함수.
	 */
	this.CreateDrawBeatListWithGivenTime = function(given_ms){
		self._note_order = 0;
		self._draw_beat_list = [];
		for(var i=0 ; i<self._beat_list.length ; i++){
			if(self._is_show_beat_order){
				self._note_order++;
			}
			self.CreateDrawBeat(self._beat_list[i], given_ms);
		}
	};

	this.CreateDrawBeat = function(ball_info, default_time_offset){
		if(ball_info.m & LEFT_BIT){
			var obj = new DrawBeat(window._renderer._ctx, ARROW.LEFT, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order);
			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._draw_beat_list.push(obj);
		}
		if(ball_info.m & UP_BIT){
			var obj = new DrawBeat(window._renderer._ctx, ARROW.UP, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order);
			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._draw_beat_list.push(obj);
		}
		if(ball_info.m & RIGHT_BIT){
			var obj = new DrawBeat(window._renderer._ctx, ARROW.RIGHT, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order);
			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._draw_beat_list.push(obj);
		}
		if(ball_info.m & DOWN_BIT){
			var obj = new DrawBeat(window._renderer._ctx, ARROW.DOWN, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order);
			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._draw_beat_list.push(obj);
		}
	};

	this.DeleteWave = function(idx){
		self._wave_list.splice(idx, 1);
	}

	this.DeleteBeat = function(idx){
		var beat_info = self._beat_list[idx];
		self._beat_list.splice(idx, 1);

		for(var i=self._draw_beat_list.length-1 ; i>=0 ; i--){
			if(beat_info.t == self._draw_beat_list[i]._offset_ms){
				self._draw_beat_list.splice(i, 1);
			}
		}
	};

	this.PrependBeat = function(idx){
		if(idx >= self._beat_list.length || idx < 0){
			console.log(idx + ' out of range');
			return;
		}

		var beat_info = null;
		if(idx == 0){
			var diff = self._beat_list[idx+1].t - self._beat_list[idx].t;
			beat_info = {
				t: self._beat_list[idx].t-diff,
				m: LEFT_BIT
			};
		}else{
			var half = (self._beat_list[idx-1].t - self._beat_list[idx].t)/2;
			half = Math.abs(half);
			half = Math.floor(half);
			beat_info = {
				t: self._beat_list[idx].t - half,
				m: LEFT_BIT
			};
		}

		if(beat_info != null){
			self.AddBall(beat_info);
		}
	};

	this.PrependWave = function(beat_idx){
		if(beat_idx >= self._beat_list.length || beat_idx < 0){
			console.log(beat_idx + ' out of range');
			return;
		}

		//첫번째 비트로 선택하여 Wave를 추가하는 경우에는
		//time을 항상 0으로 함.
		//게임 시작과 함께 백그라운드가 나오게 하기 위함.
		var time_ms = self._beat_list[beat_idx].t;
		if(beat_idx == 0){
			time_ms = 0;
		}
		self.AddWave(time_ms);
	}

	this.Shift = function(offset){
		for(var i=0 ; i<self._beat_list.length ; i++){
			self._beat_list[i].t += offset;
		}
	};

	this.DeleteFrom = function(idx){
		self._beat_list.splice(idx, self._beat_list.length);
	};

	this.ClearNoteList = function(){
		self._wave_list = [];
		self._beat_list = [];
	};

	// BACKGROUND =============================================

	this.AddBackground = function(background){
		for(var i=0 ; i<self._background_list.length ; i++){
			if(self._background_list[i].background_uid == background.background_uid){
				alert('already edded');
				return false;
			}
		}
		self._background_list.push(background);
		return true;
	};

	this.DeleteBackground = function(background_uid){
		for(var i=0 ; i<self._background_list.length ; i++){
			if(self._background_list[i].background_uid == background_uid){
				self._background_list.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	this.ChangeOrderBackground = function(idx, plus_minus){
		if(plus_minus == 'minus'){
			if(idx == 0){
				return false;
			}	
			self._background_list[idx].display_order--;
			self._background_list[idx-1].display_order++;
		}else if(plus_minus == 'plus'){
			if(idx == self._background_list.length-1){
				return false;
			}
			self._background_list[idx].display_order++;
			self._background_list[idx+1].display_order--;
		}
		self.SortBackgroundList();
		return true;
	};

	this.GetBackground = function(background_uid){
		for (let i = 0; i < self._background_list.length; i++) {
			const bg = self._background_list[i];
			if(bg.background_uid == background_uid){
				return bg;
			}
		}
	};
	return null;
}