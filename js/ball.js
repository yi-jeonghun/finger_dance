function Ball(game_type, arrow_or_num, offset_ms, speed_pps, base_line, move_direction, order){
	var self = this;
	this._game_type = game_type;
	this._arrow_or_num = arrow_or_num;
	this._img = null;
	this._x = 0;
	this._y = -990;
	this._w = 50;
	this._h = 50;
	this._speed = speed_pps;//pps
	this._offset_ms = offset_ms;
	this._offset_px_init = 0;//최초 시작한 offset
	this._base_line_px = base_line;
	this._passed = false;
	this._hit_y = 0;
	this._x_base = 0;
	this._is_hit = false;
	this._move_direction = move_direction;
	this._is_fail_cause = false;
	this._order = order;

	this.Init = function(){
		// console.log(self._arrow_or_num + ' self._offset_ms ' + self._offset_ms);
		//| . . . . |
		// var one_width = 400 / 5;
		var quarter_x = 400 / 4;
		var first_x = quarter_x / 2;

		if(self._game_type == GAME_TYPE.DDR)
		{
			if(self._arrow_or_num == ARROW.LEFT){
				self._img = _atlas._img_l;
				self._x_base = first_x;
			}else if(self._arrow_or_num == ARROW.DOWN){
				self._img = _atlas._img_d;
				self._x_base = first_x + quarter_x;
			}else if(self._arrow_or_num == ARROW.UP){
				self._img = _atlas._img_u;
				self._x_base = first_x + quarter_x*2;
			}else if(self._arrow_or_num == ARROW.RIGHT){
				self._img = _atlas._img_r;
				self._x_base = first_x + quarter_x*3;
			}
		}
		else if(self._game_type == GAME_TYPE.Dash)
		{
			self._img = _atlas._img_l;
			self._x_base = first_x;
		}

		self._x = self._x_base - self._w/2;
		self.CalcOffsetPixel();

		return this;
	};

	this.CalcOffsetPixel = function(){
		// console.log('org ' + self._offset_px);
		self._offset_px_init = (self._offset_ms/1000) * self._speed;
		self._offset_px_init = self._base_line_px + self._offset_px_init;
		self._offset_px_init = self._offset_px_init - (self._h/2);
		// console.log('new ' + self._offset_px);
	};

	this.ChangeOffset = function(offset_ms){
		// console.log('offset_ms ' + offset_ms);
		self._offset_ms = offset_ms;
		self.CalcOffsetPixel();
	};

	this.Update = function(ms){
		if(self._passed){
			return;
		}

		var diff = Math.abs(ms - self._offset_ms);
		if(diff > 5000){
			return false;
		}

		self.UpdatePos(ms);

		if(self._move_direction == MOVE_DIRECTION.UPWARD){
			if(self._hit_y < 40){
				self._passed = true;
			}
		}else if(self._move_direction == MOVE_DIRECTION.DOWNWARD){
			// if(self._base_line_px + 200 < self._hit_y){
			// 	self._passed = true;
			// }	
		}

		return true;
	};

	this.UpdatePos = function(pt){
		// console.log('speed ' + self._speed);
		var offset_playtime_px = (pt/1000) * self._speed;
		// console.log('offset_playtime_px ' + offset_playtime_px);
		// console.log('self._offset_px ' + self._offset_px);
		if(self._move_direction == MOVE_DIRECTION.DOWNWARD){
			self._y = self._offset_px_init + offset_playtime_px;
		}else{
			self._y = self._offset_px_init - offset_playtime_px;
		}
		self._hit_y = self._y + (self._h/2);
		// console.log('self._hit_y ' + self._hit_y);
	};

	this.Destroy = function(){
		// console.log('destroy');
	};

	this.HitNote = function(arrow, time){
		var res = {
			hit:false,
			score:0,
			text:''
		};

		if(self._arrow_or_num != arrow){
			return res;
		}

		// res = self.CheckHitByPixel();
		res = self.CheckHitByTime(time);
		return res;
	};

	this.CheckHitByTime = function(time){
		var res = {
			hit:false,
			score:0,
			text:''
		};
		var time_diff_ms = Math.abs(time - self._offset_ms);

		if(0 <= time_diff_ms && time_diff_ms <= 300){
			self._is_hit = true;
		}

		if(0 <= time_diff_ms && time_diff_ms < 100){//perfect
			res.score = 10;
			res.text = 'Perfect';
			res.hit = true;
		}else if(100 <= time_diff_ms && time_diff_ms < 150){//excent
			res.score = 9;
			res.text = 'Excellent';
			res.hit = true;
		}else if(150 <= time_diff_ms && time_diff_ms < 200){//very good
			res.score = 8;
			res.text = 'Very Good';
			res.hit = true;
		}else if(200 <= time_diff_ms && time_diff_ms < 250){//good
			res.score = 7;
			res.text = 'Good';
			res.hit = true;
		}else if(250 <= time_diff_ms && time_diff_ms <= 300){//not bad
			res.score = 6;
			res.text = 'Not Bad';
			res.hit = true;
		}else if(300 < time_diff_ms){
			res.score = -10;
			res.text = 'Miss';
			res.hit = false;
		}

		return res;
	};

	this.CheckHitByPixel = function(){
		var res = {
			hit:false,
			score:0,
			text:''
		};

		var pixel_diff = Math.abs(self._base_line_px - self._hit_y);
		var hit_range = 60;

		if(pixel_diff < hit_range){
			res.hit = true;

			self._w = self._w * 2;
			self._h = self._h * 2;
			self._x = self._x_base - self._w/2;

			if(self._arrow_or_num == ARROW.LEFT){
				self._img = _atlas._img_l_hit;
			}else if(self._arrow_or_num == ARROW.DOWN){
				self._img = _atlas._img_d_hit;
			}else if(self._arrow_or_num == ARROW.UP){
				self._img = _atlas._img_u_hit;
			}else if(self._arrow_or_num == ARROW.RIGHT){
				self._img = _atlas._img_r_hit;
			}

			if(0 <= pixel_diff && pixel_diff < 15){//perfect
				res.score = 10;
				res.text = 'Perfect';
			}else if(15 <= pixel_diff && pixel_diff < 20){//excelent
				res.score = 9;
				res.text = 'Excellent';
			}else if(20 <= pixel_diff & pixel_diff < 25){//very good
				res.score = 8;
				res.text = 'Very Good';
			}else if(25 <= pixel_diff & pixel_diff < 30){//good
				res.score = 7;
				res.text = 'Good';
			}else if(30 <= pixel_diff & pixel_diff <= 60){//not bad
				res.score = 6;
				res.text = 'Not Bad';
			}
			
			self._is_hit = true;
		}else{
			res.score = -10;
			res.text = 'Miss';
		}

		return res;
	};
}
