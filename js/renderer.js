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
	this._draw_object_list_1 = [];
	this._draw_object_list_2 = [];
	this._draw_object_list_3 = [];
	this._draw_object_list_4 = [];
	this._draw_object_list_5 = [];
	this._draw_object_list_6 = [];
	this._draw_object_list_7 = [];
	this._draw_object_list_8 = [];
	this._draw_object_list_9 = [];
	this._draw_object_list_10 = [];

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
			self.DrawEmpty();
			self.DrawScore();
		}else if(self._render_mode == RENDER_MODE.RECORD){
			self.DrawEmpty();
		}

		return this;
	};

	this.Update = function(game_objs, gameobj_begin_idx){
		self._ctx.clearRect(0, 0, self._game_width, self._game_height);

		//Layer 1
		for(var i=self._draw_object_list_1.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_1[i].NeedDelete()){
				self._draw_object_list_1.splice(i, 1);
				continue;
			}
			self._draw_object_list_1[i].Update();
		}

		// self.DrawVerticalLine();

		//Layer 2
		for(var i=self._draw_object_list_2.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_2[i].NeedDelete()){
				self._draw_object_list_2.splice(i, 1);
				continue;
			}
			self._draw_object_list_2[i].Update();
		}
		
		if(self._render_mode == RENDER_MODE.PLAY){
			self.DrawProgress();
		}
		self.DrawEmpty();

		//Layer 5
		for(var i=self._draw_object_list_5.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_5[i].NeedDelete()){
				self._draw_object_list_5.splice(i, 1);
				continue;
			}
			self._draw_object_list_5[i].Update();
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

			self._ctx.drawImage(_atlas._img,
				go._img.x, go._img.y, go._img.w, go._img.h,
				go._x, go._y, go._w, go._h);
			
			if(self._show_index_number){
				var fx = go._x + go._w/2;
				var fy = go._y + go._h/2;
				self.DrawText(go._order+1, fx, fy, 25);
			}
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

	this.ClearDrawObject = function(){
		self._draw_object_list_1 = [];
		self._draw_object_list_2 = [];
		self._draw_object_list_3 = [];
		self._draw_object_list_4 = [];
		self._draw_object_list_5 = [];
		self._draw_object_list_6 = [];
		self._draw_object_list_7 = [];
		self._draw_object_list_8 = [];
		self._draw_object_list_9 = [];
		self._draw_object_list_10 = [];
	};

	this.AddDrawObject = function(layer, draw_object){
		if(layer < 1 || layer > 10){
			console.log('Layer Range Error');
			return;
		}
		switch(layer){
			case 1:
				self._draw_object_list_1.push(draw_object);
				break;
			case 2:
				self._draw_object_list_2.push(draw_object);
				break;
			case 3:
				self._draw_object_list_3.push(draw_object);
				break;
			case 4:
				self._draw_object_list_4.push(draw_object);
				break;
			case 5:
				self._draw_object_list_5.push(draw_object);
				break;
			case 6:
				self._draw_object_list_6.push(draw_object);
				break;
			case 7:
				self._draw_object_list_7.push(draw_object);
				break;
			case 8:
				self._draw_object_list_8.push(draw_object);
				break;
			case 9:
				self._draw_object_list_9.push(draw_object);
				break;
			case 10:
				self._draw_object_list_10.push(draw_object);
				break;
		}
	};

	this._hit_combo = false;
	this._hit_combo_dur = 0;
	this._hit_combo_count = 0;
	
	this.Hit = function(combo){
		if(combo > 1){
			self._hit_combo = true;
			self._hit_combo_dur = Date.now();
			self._hit_combo_count = combo;
		}else{
			self._hit_combo = false;
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