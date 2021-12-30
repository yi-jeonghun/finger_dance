function Renderer(game_width, game_height, screen_width, screen_height){
	var self = this;
	this._canvas = null;
	this._ctx = null;
	this._base_line = 600;
	this._debug = false;
	this._score = 0;
	this._render_mode = RENDER_MODE.RECORD;
	this._game_width = game_width;
	this._game_height = game_height;
	this._screen_width = screen_width;
	this._screen_height = screen_height;
	this._show_index_number = false;
	this._progress_percent = 0;
	this._particle_list = [];

	this.Init = function(){
		self._canvas = document.getElementById('ddr_player_layer1');
		self._canvas.width = self._screen_width;
		self._canvas.height = self._screen_height;

		console.log('self._canvas ' +self._canvas);
		self._ctx = self._canvas.getContext('2d');

		var scale_width = self._screen_width / self._game_width;
		var scale_height = self._screen_height / self._game_height;
		console.log('scale_width ' + scale_width);
		console.log('scale_height ' + scale_height);

		self._ctx.scale(scale_width, scale_height);

		if(self._render_mode == RENDER_MODE.PLAY){
			self.DrawBaseLine();
			self.DrawVerticalLine();
			self.DrawEmpty();
			self.DrawScore();
		}else if(self._render_mode == RENDER_MODE.RECORD){
			// self._base_line = 100;
			self.DrawBaseLine();
			self.DrawVerticalLine();
			self.DrawEmpty();
			// self.DrawScore();
		}

		return this;
	};

	// this.StartGame = function(){
	// 	self.Update();
	// };

	this.Update = function(game_objs, gameobj_begin_idx){
		// console.log('game_objs len ' + game_objs.length);
		self._ctx.clearRect(0, 0, self._game_width, self._game_height);
		self.DrawBaseLine();
		self.DrawVerticalLine();

		if(self._render_mode == RENDER_MODE.PLAY){
			self.DrawHit();
			self.DrawProgress();
		}
		self.DrawEmpty();

		{
			for(var i=self._particle_list.length-1 ; i>=0 ; i--){
				if(self._particle_list[i].NeedDelete()){
					self._particle_list.splice(i, 1);
					// console.log('del ' );
					continue;
				}
				self._particle_list[i].Update();
			}
		}

		self.DrawObjs(game_objs, gameobj_begin_idx);

		if(self._render_mode == RENDER_MODE.PLAY){
			self.DrawScore();
		}
	};

	this.UpdateScore = function(score){
		self._score = score;
	};

	this.UpdateProgress = function(pr){
		self._progress_percent = pr;
	};

	this.DrawProgress = function(){
		var line_size = self._game_width * self._progress_percent;
		self.DrawLineWidth(0, 0, line_size, 0, 'red', 20);
	};

	this.DrawObjs = function(game_objs, gameobj_begin_idx){
		for(var i=gameobj_begin_idx ; i<game_objs.length ; i++){
			var go = game_objs[i];

			if(go._is_hit || go._passed){
				continue;
			}

			if(go._y < -100 || go._y > 700){
				continue;
			}

			self.DrawLine(0, go._y+go._h/2, self._game_width, go._y+go._h/2, '#aaa');

			// drawed_cnt++;
			// console.log('y ' + go._y);
			self._ctx.drawImage(_atlas._img,
				go._img.x, go._img.y, go._img.w, go._img.h,
				go._x, go._y, go._w, go._h);
			
			if(self._show_index_number){
				var fx = go._x + go._w/2;
				var fy = go._y + go._h/2;
				self.DrawText(go._order+1, fx, fy, 25);
			}
		}
		// console.log('drawed_cnt ' + drawed_cnt);
	};

	this.DrawBaseLine = function(){
		if(self._render_mode == RENDER_MODE.PLAY){
			if(self._debug){
				self.DrawLine(0, 100, self._game_width, 100, '#aaa');
				self.DrawLine(0, 200, self._game_width, 200, '#aaa');
				self.DrawLine(0, 300, self._game_width, 300, '#aaa');
				self.DrawLine(0, 400, self._game_width, 400, '#aaa');
				self.DrawLine(0, 500, self._game_width, 500, '#aaa');
			}	
			self.DrawLine(0, self._base_line, self._game_width, self._base_line, 'RED');	
		}else if(self._render_mode == RENDER_MODE.RECORD){
			if(self._debug){
				self.DrawLine(0, 200, self._game_width, 200, '#aaa');
				self.DrawLine(0, 300, self._game_width, 300, '#aaa');
				self.DrawLine(0, 400, self._game_width, 400, '#aaa');
				self.DrawLine(0, 500, self._game_width, 500, '#aaa');
				self.DrawLine(0, 600, self._game_width, 600, '#aaa');
			}	
			self.DrawLine(0, self._base_line, self._game_width, self._base_line, 'RED');	
		}
	};

	this.DrawLine = function(sx, sy, ex, ey, style){
		self._ctx.beginPath(); 
		self._ctx.moveTo(sx, sy);
		self._ctx.lineTo(ex, ey);
		self._ctx.lineWidth = 1;
		self._ctx.strokeStyle = style;
		self._ctx.stroke();
	};

	this.DrawLineWidth = function(sx, sy, ex, ey, style, width){
		self._ctx.beginPath(); 
		self._ctx.moveTo(sx, sy);
		self._ctx.lineTo(ex, ey);
		self._ctx.lineWidth = 1;
		self._ctx.strokeStyle = style;
		self._ctx.lineWidth = width;
		self._ctx.stroke();
	};

	this.DrawVerticalLine = function(){
		var quarter_x = self._game_width / 4;
		self.DrawLine(quarter_x, 0, quarter_x, self._game_height, '#aaa');
		self.DrawLine(quarter_x*2, 0, quarter_x*2, self._game_height, '#aaa');
		self.DrawLine(quarter_x*3, 0, quarter_x*3, self._game_height, '#aaa');
	};

	this.DrawEmpty = function(){
		var quarter_x = self._game_width / 4;
		var first_x = quarter_x / 2;

		var dw = 65;
		var dh = 65;
		

		self._ctx.drawImage(_atlas._img, 
			_atlas._img_l_empty.x, _atlas._img_l_empty.y, _atlas._img_l_empty.w, _atlas._img_l_empty.h, 
			(first_x - dw/2), self._base_line - dh/2, dw, dh);

		self._ctx.drawImage(_atlas._img, 
			_atlas._img_d_empty.x, _atlas._img_d_empty.y, _atlas._img_d_empty.w, _atlas._img_d_empty.h, 
			((first_x + quarter_x) - dw/2), self._base_line - dh/2, dw, dh);
				
		self._ctx.drawImage(_atlas._img, 
			_atlas._img_u_empty.x, _atlas._img_u_empty.y, _atlas._img_u_empty.w, _atlas._img_u_empty.h, 
			((first_x + quarter_x*2) - dw/2), self._base_line - dh/2, dw, dh);

		self._ctx.drawImage(_atlas._img, 
			_atlas._img_r_empty.x, _atlas._img_r_empty.y, _atlas._img_r_empty.w, _atlas._img_r_empty.h, 
			((first_x + quarter_x*3) - dw/2), self._base_line - dh/2, dw, dh);
	};

	this._hit_left = false;
	this._hit_up = false;
	this._hit_right = false;
	this._hit_down = false;
	this._hit_step_left = 0;
	this._hit_step_up = 1;
	this._hit_step_right = 1;
	this._hit_step_down = 1;
	this._hit_left_dur = 0;
	this._hit_up_dur = 0;
	this._hit_right_dur = 0;
	this._hit_down_dur = 0;
	this._hit_result_left = null;
	this._hit_result_up = null;
	this._hit_result_right = null;
	this._hit_result_dopwn = null;
	this._hit_combo = false;
	this._hit_combo_dur = 0;
	this._hit_combo_count = 0;
	
	this.Hit = function(arrow, hit_result, combo){
		var quarter_x = self._game_width / 4;
		var first_x = quarter_x / 2;

		if(arrow == ARROW.LEFT){
			self._hit_left = true;
			console.log('HIT LEFT ' + true);
			self._hit_left_dur = Date.now();
			self._hit_result_left = hit_result;
			self._hit_step_left = 1.3;
			self.CreateParticles(first_x, self._base_line);
		}
		if(arrow == ARROW.UP){
			self._hit_up = true;
			self._hit_up_dur = Date.now();
			self._hit_result_up = hit_result;
			self._hit_step_up = 1;
			self.CreateParticles(quarter_x*2+first_x, self._base_line);
		}
		if(arrow == ARROW.RIGHT){
			self._hit_right = true;
			self._hit_right_dur = Date.now();
			self._hit_result_right = hit_result;
			self._hit_step_right = 1;
			self.CreateParticles(quarter_x*3+first_x, self._base_line);
		}
		if(arrow == ARROW.DOWN){
			self._hit_down = true;
			self._hit_down_dur = Date.now();
			self._hit_result_down = hit_result;
			self._hit_step_down = 1;
			self.CreateParticles(quarter_x+first_x, self._base_line);
		}

		if(combo > 1){
			self._hit_combo = true;
			self._hit_combo_dur = Date.now();
			self._hit_combo_count = combo;
		}else{
			self._hit_combo = false;
		}
	};

	this.CreateParticles = function(x, y){
		for(var i=0 ; i<30 ; i++){
			var particle = new Particle(self._ctx, x, y)
			// particle._ctx = self._ctx;
			self._particle_list.push(particle);
		}
	}

	this.DrawHit = function(){
		var quarter_x = self._game_width / 4;
		var first_x = quarter_x / 2;

		var one_width = 400 / 5;
		var dur = 200;
		var step = 0.12;
		var color = 'blue';

		if(self._hit_left){
			var dw = _atlas._img_l_hit.w * self._hit_step_left;
			var dh = _atlas._img_l_hit.h * self._hit_step_left;
			var dx = first_x - dw/2;//one_width - dw/2;
			var dy = self._base_line - dh/2;
			self._hit_step_left = self._hit_step_left + step;

			// self._ctx.drawImage(_atlas._img, 
			// 	_atlas._img_l_hit.x, _atlas._img_l_hit.y, _atlas._img_l_hit.w, _atlas._img_l_hit.h, 
			// 	dx, dy, dw, dh);
			
			var fx = one_width;
			var fy = self._base_line;
			self.DrawText(self._hit_result_left.text, fx, fy+50, 26, color);
			self.DrawText(self._hit_result_left.score, fx, fy+80, 26, color);

			if((Date.now() - self._hit_left_dur) > dur){
				self._hit_left = false;
			}
		}

		if(self._hit_down){
			var dw = _atlas._img_d_hit.w * self._hit_step_down;
			var dh = _atlas._img_d_hit.h * self._hit_step_down;
			var dx = first_x + quarter_x - dw/2;//one_width*2 - dw/2;
			var dy = self._base_line - dh/2;
			self._hit_step_down = self._hit_step_down + step;

			// self._ctx.drawImage(_atlas._img, 
			// 	_atlas._img_d_hit.x, _atlas._img_d_hit.y, _atlas._img_d_hit.w, _atlas._img_d_hit.h, 
			// 	dx, dy, dw, dh);

			var fx = one_width*2;
			var fy = self._base_line;
			self.DrawText(self._hit_result_down.text, fx, fy+50, 26, color);
			self.DrawText(self._hit_result_down.score, fx, fy+80, 26, color);

			if((Date.now() - self._hit_down_dur) > dur){
				self._hit_down = false;
			}
		}
		
		if(self._hit_up){
			var dw = _atlas._img_u_hit.w * self._hit_step_up;
			var dh = _atlas._img_u_hit.h * self._hit_step_up;
			var dx = first_x + quarter_x*2 - dw/2;//one_width*3 - dw/2;
			var dy = self._base_line - dh/2;
			self._hit_step_up = self._hit_step_up + step;

			// self._ctx.drawImage(_atlas._img, 
			// 	_atlas._img_u_hit.x, _atlas._img_u_hit.y, _atlas._img_u_hit.w, _atlas._img_u_hit.h, 
			// 	dx, dy, dw, dh);

			var fx = one_width*3;
			var fy = self._base_line;	
			self.DrawText(self._hit_result_up.text, fx, fy+50, 26, color);
			self.DrawText(self._hit_result_up.score, fx, fy+80, 26, color);

			if((Date.now() - self._hit_up_dur) > dur){
				self._hit_up = false;
			}
		}

		if(self._hit_right){
			var dw = _atlas._img_r_hit.w * self._hit_step_right;
			var dh = _atlas._img_r_hit.h * self._hit_step_right;
			var dx = first_x + quarter_x*3 - dw/2;//one_width*4 - dw/2;
			var dy = self._base_line - dh/2;
			self._hit_step_right = self._hit_step_right + step;

			// self._ctx.drawImage(_atlas._img, 
			// 	_atlas._img_r_hit.x, _atlas._img_r_hit.y, _atlas._img_r_hit.w, _atlas._img_r_hit.h, 
			// 	dx, dy, dw, dh);

			var fx = one_width*4;
			var fy = self._base_line;
			self.DrawText(self._hit_result_right.text, fx, fy+50, 26, color);
			self.DrawText(self._hit_result_right.score, fx, fy+80, 26, color);
	
			if((Date.now() - self._hit_right_dur) > dur){
				self._hit_right = false;
			}
		}
	};

	this.DrawText = function(txt, x, y, size, color){
		var font_size = new Number(size) 
		self._ctx.textBaseline = "middle";
		// var border_size = font_size + 2;
		// self._ctx.font = border_size + "px Arial";
		// self._ctx.textAlign = "center";
		// self._ctx.fillStyle = "white";
		// self._ctx.fillText(txt, x, y);

		self._ctx.font = font_size + "px Arial";
		self._ctx.textAlign = "center";
		self._ctx.fillStyle = color;
		self._ctx.fillText(txt, x, y);
	};

	this.DrawScore = function(){
		self.DrawText(self._score, 200, 50, 50, 'red');

		if(self._hit_combo){
			var txt = self._hit_combo_count-1 + " COMBO";
			txt += "\n +" + (10 * (self._hit_combo_count-1));

			self.DrawText(txt, 200, 220, 25, 'blue');
		}
	};

	this.DisplayResult = function(is_complete){
		// console.log('DisplayResult ' + score);
		if(is_complete){
			self.DrawText("Congraturations!", 202, 302, 50, 'White');
			self.DrawText("Congraturations!", 200, 300, 50, 'Red');
	
			self.DrawText("Your New Score", 202, 352, 33, 'White');
			self.DrawText("Your New Score", 200, 350, 33, 'Red');
	
			self.DrawText("Score " + self._score, 202, 402, 33, 'White');
			self.DrawText("Score " + self._score, 200, 400, 33, 'Blue');
		}else{
			self.DrawText("Oops!", 202, 302, 50, 'White');
			self.DrawText("Oops!", 200, 300, 50, 'Red');
		}
	};
}