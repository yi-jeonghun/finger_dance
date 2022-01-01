class DrawBeat extends DrawObject{
	#atlas_img;
	#img;
	#sx;
	#sy;
	#sw;
	#sh;
	#arrow_or_num;
	#x = 0;
	#y = -990;
	#w = 50;
	#h = 50;
	#speed;
	#offset_ms;
	#offset_px_init = 0;//최초 시작한 offset
	#base_line_px;
	#passed = false;
	#hit_y = 0;
	#x_base = 0;
	#is_hit = false;
	#move_direction;
	#is_fail_cause = false;
	#order;

	constructor(context, arrow_or_num, offset_ms, speed_pps, base_line, move_direction, order){
		super(context);

		this.#atlas_img = _atlas._img;
		this.#arrow_or_num = arrow_or_num;
		this.#speed = speed_pps;//pps
		this.#offset_ms = offset_ms;
		this.#base_line_px = base_line;
		this.#move_direction = move_direction;
		this.#order = order;
	
		var quarter_x = 400 / 4;
		var first_x = quarter_x / 2;

		{
			var img = null;
			if(this.#arrow_or_num == ARROW.LEFT){
				img = _atlas._img_l;
				this.#x_base = first_x;
			}else if(this.#arrow_or_num == ARROW.DOWN){
				img = _atlas._img_d;
				this.#x_base = first_x + quarter_x;
			}else if(this.#arrow_or_num == ARROW.UP){
				img = _atlas._img_u;
				this.#x_base = first_x + quarter_x*2;
			}else if(this.#arrow_or_num == ARROW.RIGHT){
				img = _atlas._img_r;
				this.#x_base = first_x + quarter_x*3;
			}

			this.#sx = img.x;
			this.#sy = img.y;
			this.#sw = img.w;
			this.#sh = img.h;
	}

		this.#x = this.#x_base - this.#w/2;
		this.CalcOffsetPixel();
		// {
		// 	this.#offset_px_init = (this.#offset_ms/1000) * this.#speed;
		// 	this.#offset_px_init = this.#base_line_px + this.#offset_px_init;
		// 	this.#offset_px_init = this.#offset_px_init - (this.#h/2);
		// }
	};

	CalcOffsetPixel(){
		this.#offset_px_init = (this.#offset_ms/1000) * this.#speed;
		this.#offset_px_init = this.#base_line_px + this.#offset_px_init;
		this.#offset_px_init = this.#offset_px_init - (this.#h/2);
	};

	ChangeOffset(offset_ms){
		this.#offset_ms = offset_ms;
		this.CalcOffsetPixel();
	};

	Move(ms){
		if(this.#passed){
			return;
		}

		var diff = Math.abs(ms - this.#offset_ms);
		if(diff > 5000){
			return false;
		}

		this.UpdatePos(ms);

		if(this.#move_direction == MOVE_DIRECTION.UPWARD){
			if(this.#hit_y < 40){
				this.#passed = true;
			}
		}else if(this.#move_direction == MOVE_DIRECTION.DOWNWARD){
			// if(this.#base_line_px + 200 < this.#hit_y){
			// 	this.#passed = true;
			// }	
		}

		return true;
	};

	UpdatePos(pt){
		var offset_playtime_px = (pt/1000) * this.#speed;
		if(this.#move_direction == MOVE_DIRECTION.DOWNWARD){
			this.#y = this.#offset_px_init + offset_playtime_px;
		}else{
			this.#y = this.#offset_px_init - offset_playtime_px;
		}
		this.#hit_y = this.#y + (this.#h/2);
	};

	HitNote(arrow, time){
		var res = {
			hit:false,
			score:0,
			text:''
		};

		if(this.#arrow_or_num != arrow){
			return res;
		}

		res = this.CheckHitByTime(time);
		return res;
	};

	CheckHitByTime(time){
		var res = {
			hit:false,
			score:0,
			text:''
		};
		var time_diff_ms = Math.abs(time - this.#offset_ms);

		if(0 <= time_diff_ms && time_diff_ms <= 300){
			this.#is_hit = true;
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

	CheckHitByPixel(){
		var res = {
			hit:false,
			score:0,
			text:''
		};

		var pixel_diff = Math.abs(this.#base_line_px - this.#hit_y);
		var hit_range = 60;

		if(pixel_diff < hit_range){
			res.hit = true;

			this.#w = this.#w * 2;
			this.#h = this.#h * 2;
			this.#x = this.#x_base - this.#w/2;

			if(this.#arrow_or_num == ARROW.LEFT){
				this.#img = _atlas._img_l_hit;
			}else if(this.#arrow_or_num == ARROW.DOWN){
				this.#img = _atlas._img_d_hit;
			}else if(this.#arrow_or_num == ARROW.UP){
				this.#img = _atlas._img_u_hit;
			}else if(this.#arrow_or_num == ARROW.RIGHT){
				this.#img = _atlas._img_r_hit;
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
			
			this.#is_hit = true;
		}else{
			res.score = -10;
			res.text = 'Miss';
		}

		return res;
	};

	Update(){
		this._ctx.drawImage(this.#atlas_img,
			this.#sx, this.#sy, this.#sw, this.#sh,
			this.#x, this.#y, this.#w, this.#h);
		
		// if(self._show_index_number){
		// 	var fx = go._x + go._w/2;
		// 	var fy = go._y + go._h/2;
		// 	self.DrawText(go._order+1, fx, fy, 25);
		// }
	}

	NeedDelete(){
		if(this.#is_hit){
			return true;			
		}
		return false;
	}

	IsHit(){
		return this.#is_hit;
	}

	Passed(){
		return this.#passed;
	}

	GetY(){
		return this.#y;
	}

	GetArrowOrNum(){
		return this.#arrow_or_num;
	}

	SetIsFailCause(){
		this.#is_fail_cause = true;
	}

	SetPassed(passed){
		this.#passed = passed;
	}

	IsVisible(){
		if(this.#y < -100 || this.#y > 700){
			return false;
		}
		return true;
	}
}
