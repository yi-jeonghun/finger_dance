function GameData(dimension, direction){
	var self = this;
	this._game_type = null;
	this._speed = 150;//pixel per second
	this._base_line = 100;
	this._beat_list = [
			/**
			 * ball_info(DDR)
			 * {
			 * 	t: timelapse_ms,
			 * 	m: mask
			 * }
			 * 
			 * ball_info(Dash)
			 * {
			 *  t: timelapse_ms,
			 *  n: number(beat type)
			 *  l: duration
			 * }
			 */
		];
	this._wave_list = [];
	this._game_objs = [];
	this._dimension = dimension;
	this._move_direction = direction;
	this._note_order = 0;

	this.Init = function(){
		return this;
	};

	this.SetGameType = function(game_type){
		self._game_type = game_type;
	};

	this.SetWaveNBeat = function(wave_n_beat){
		self._wave_list = wave_n_beat.wave_list;
		self._beat_list = wave_n_beat.beat_list;
	};

	this.GetWaveNBeat = function(){
		var wave_n_beat = {
			wave_list:self._wave_list,
			beat_list:self._beat_list
		};
		return wave_n_beat;
	};

	this.AddWave = function(time){
		self._wave_list.push(time);
		self.SortWaveList();
	};

	this.AddBall = function(ball_info){
		self._beat_list.push(ball_info);
		self.SortBeatList();
		self.CreateNotes(ball_info);
	};

	this.SortBeatList = function(){
		self._beat_list.sort(function(a, b){return a.t - b.t});
	};

	this.SortWaveList = function(){
		self._wave_list.sort(function(a, b){return a - b});
	};

	this.UpdateGameObject = function(ball_info){
		for(var i=self._game_objs.length-1 ; i>=0 ; i--){
			var go = self._game_objs[i];
			if(ball_info.t == go._offset_ms){
				self._game_objs.splice(i, 1);
			}
		}
		self.CreateNotes(ball_info);
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
		// console.log('org ' + org_ms + ' new ' + new_ms + ' cur ' + timelapse);
		for(var i=0 ; i<self._game_objs.length ; i++){
			// console.log('i ' + i + ' ' + self._game_objs[i]._offset_ms);
			if(self._game_objs[i]._offset_ms == org_ms){
				self._game_objs[i].ChangeOffset(new_ms);
				self._game_objs[i].Update(timelapse);
			}
		}
	};

	this.CreateGameObjects = function(game_level){
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

		self._note_order = 0;
		self._game_objs = [];
		for(var i=0 ; i<self._beat_list.length ; i++){
			self.CreateNotes(self._beat_list[i]);
		}
	};

	/**
	 * editor에서 특정 시간에서 부터 플레이를 할 때
	 * note를 주어진 시간 만큼 진행시켜놓기 위해 필요한 함수.
	 */
	this.CreateGameObjectsWithGivenTime = function(given_ms){
		self._note_order = 0;
		self._game_objs = [];
		for(var i=0 ; i<self._beat_list.length ; i++){
			self.CreateNotes(self._beat_list[i], given_ms);
		}
	};

	this.CreateNotes = function(ball_info, default_time_offset){
		if(self._game_type == GAME_TYPE.DDR){
			self.CreateNotes_DDR(ball_info, default_time_offset);
		}else if(self._game_type == GAME_TYPE.Dash){
			self.CreateNotes_Dash(ball_info, default_time_offset);
		}
		self._note_order++;
	};

	this.CreateNotes_DDR = function(ball_info, default_time_offset){
		if(ball_info.m & LEFT_BIT){
			var obj = null;

			if(self._dimension == DIMENSION._2D){
				obj = new Ball(self._game_type, ARROW.LEFT, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order).Init();
			}else if(self._dimension == DIMENSION._3D){
				obj = new ThreeNote(ARROW.LEFT, ball_info.t, self._speed, self._base_line).Init();
			}

			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._game_objs.push(obj);
		}
		if(ball_info.m & UP_BIT){
			var obj = null;

			if(self._dimension == DIMENSION._2D){
				obj = new Ball(self._game_type, ARROW.UP, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order).Init();
			}else if(self._dimension == DIMENSION._3D){
				obj = new ThreeNote(ARROW.UP, ball_info.t, self._speed, self._base_line).Init();
			}

			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._game_objs.push(obj);
		}
		if(ball_info.m & RIGHT_BIT){
			var obj = null;

			if(self._dimension == DIMENSION._2D){
				obj = new Ball(self._game_type, ARROW.RIGHT, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order).Init();
			}else if(self._dimension == DIMENSION._3D){
				obj = new ThreeNote(ARROW.RIGHT, ball_info.t, self._speed, self._base_line).Init();
			}

			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._game_objs.push(obj);
		}
		if(ball_info.m & DOWN_BIT){
			var obj = null;

			if(self._dimension == DIMENSION._2D){
				obj = new Ball(self._game_type, ARROW.DOWN, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order).Init();
			}else if(self._dimension == DIMENSION._3D){
				obj = new ThreeNote(ARROW.DOWN, ball_info.t, self._speed, self._base_line).Init();
			}

			if(default_time_offset != undefined){
				obj.UpdatePos(default_time_offset);
			}
			self._game_objs.push(obj);
		}
	};

	this.CreateNotes_Dash = function(ball_info, default_time_offset){
		var obj = new Ball(self._game_type, ARROW.LEFT, ball_info.t, self._speed, self._base_line, self._move_direction, self._note_order).Init();

		if(default_time_offset != undefined){
			obj.UpdatePos(default_time_offset);
		}
		self._game_objs.push(obj);
	};

	this.DeleteWave = function(idx){
		self._wave_list.splice(idx, 1);
	}

	this.DeleteBeat = function(idx){
		var beat_info = self._beat_list[idx];
		self._beat_list.splice(idx, 1);

		for(var i=self._game_objs.length-1 ; i>=0 ; i--){
			if(beat_info.t == self._game_objs[i]._offset_ms){
				self._game_objs.splice(i, 1);
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

			if(self._game_type == GAME_TYPE.DDR){
				beat_info = {
					t: self._beat_list[idx].t-diff,
					m: LEFT_BIT
				};
			}else if(self._game_type == GAME_TYPE.Dash){
				beat_info = {
					t: self._beat_list[idx].t-diff,
					n: 1
				};
			}
		}else{
			var half = (self._beat_list[idx-1].t - self._beat_list[idx].t)/2;
			half = Math.abs(half);
			half = Math.floor(half);
			console.log('half ' + half);

			if(self._game_type == GAME_TYPE.DDR){
				beat_info = {
					t: self._beat_list[idx].t - half,
					m: LEFT_BIT
				};
			}else if(self._game_type == GAME_TYPE.Dash){
				beat_info = {
					t: self._beat_list[idx].t - half,
					n: 1
				};
			}
			console.log('beat_info.t ' + beat_info.t);
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

		self.AddWave(self._beat_list[beat_idx].t);
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
}