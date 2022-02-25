class DrawBeat extends DrawObject{
	_atlas;
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
	#draw_text = null;

	constructor(context, atlas, arrow_or_num, offset_ms, speed_pps, base_line, move_direction, order){
		super(context);

		this._atlas = atlas;
		this.#atlas_img = atlas._img;
		this.#arrow_or_num = arrow_or_num;
		this.#speed = speed_pps;//pps
		this.#offset_ms = offset_ms;
		this.#base_line_px = base_line;
		this.#move_direction = move_direction;
		this.#order = order;
	
		if(this.#order > 0){
			this.#draw_text = new DrawText(context, this.#order, this.#x, this.#y, 25, 'RED', true, 'white', 3, -1);
		}

		{
			var img = null;
			if(this.#arrow_or_num == ARROW.LEFT){
				img = this._atlas._img_l;
			}else if(this.#arrow_or_num == ARROW.DOWN){
				img = this._atlas._img_d;
			}else if(this.#arrow_or_num == ARROW.UP){
				img = this._atlas._img_u;
			}else if(this.#arrow_or_num == ARROW.RIGHT){
				img = this._atlas._img_r;
			}else if(this.#arrow_or_num == ARROW.CENTER){
				img = this._atlas._img_c;
			}

			this.#sx = img.x;
			this.#sy = img.y;
			this.#sw = img.w;
			this.#sh = img.h;
		}

		this.CalcOffsetPixel();
	};

	SetXBase(x_base){
		this.#x_base = x_base;
		this.#x = this.#x_base - this.#w/2;
	}

	GetHitPosition(){
		return {
			x: this.#x + this.#w/2,
			y: this.#y + this.#h/2
		};
	}

	CalcOffsetPixel(){
		if(this.#move_direction == MOVE_DIRECTION.UPWARD){
			this.#offset_px_init = (this.#offset_ms/1000) * this.#speed;
			this.#offset_px_init = this.#base_line_px + this.#offset_px_init;
			this.#offset_px_init = this.#offset_px_init - (this.#h/2);
		}else if(this.#move_direction == MOVE_DIRECTION.DOWNWARD){
			this.#offset_px_init = (this.#offset_ms/1000) * this.#speed;
			this.#offset_px_init = this.#base_line_px - this.#offset_px_init;
			this.#offset_px_init = this.#offset_px_init - (this.#h/2);				
		}
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
			if(this.#base_line_px + 50 < this.#hit_y){
				this.#passed = true;
			}
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

	/**
	 * DDR, PIANO_TILE
	 * 레인을 따라 움직이는 비트를
	 * 시간 기준으로 HIT 처리하는 함수.
	 */
	HitByArrowAndTime(arrow, time){
		var res = {
			hit:false,
			score:0,
			text:''
		};

		if(this.#arrow_or_num != arrow){
			return res;
		}

		res = this._CheckHitByTime(time);
		return res;
	};

	HitByXAndTime(x_tap, time){
		var res = {
			hit:false,
			score:0,
			text:''
		};

		var x_beat = this.#x + this.#w/2;
		var diff = Math.abs(x_beat - x_tap);

		if(diff > 50){
			res.hit = false;
			res.score = -10;
			res.text = 'Miss';
			return res;
		}

		res = this._CheckHitByTime(time);
		return res;
	};

	/**
	 * GUN_FIRE
	 * Random 위치로 움직이는 비트를
	 * X 좌표만으로 HIT 처리하는 함수
	 */
	HitByTouchPosition(touch_position){
		// console.log(this.#order + ' this.#hit_y ' + this.#hit_y + ' this.#base_line_px ' + this.#base_line_px);
		//아직 다 내려오지 않았으면 return
		if(this.#hit_y < this.#base_line_px -15){
			return;
		}

		// console.log('HitByTouchPosition ' + this.#order);

		// var y_diff = Math.abs(this.#hit_y - touch_position.y);
		var x_diff = Math.abs(this.#x_base - touch_position.x)

		if(x_diff <= 50){
			var res = {
				hit:true,
				score: 10,
				text: 'Perfect'
			};

			if(x_diff < 15){
				res.score = 10;
				res.text = 'Perfect';	
			}else if(15 < x_diff && x_diff <= 20){
				res.score = 9;
				res.text = 'Excellent';	
			}else if(20 < x_diff && x_diff <= 25){
				res.score = 8;
				res.text = 'Very Good';
			}else if(25 < x_diff && x_diff <= 35){
				res.score = 7;
				res.text = 'Good';
			}else if(35 < x_diff && x_diff <= 50){
				res.score = 6;
				res.text = 'Not Bad';
			}

			this.#is_hit = true;
			// console.log('HIT ' + this.#order);
			return res;
		}
		return null;
	}

	_CheckHitByTime(time){
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

	/*
	_CheckHitByPixel(){
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
	*/

	Update(){
		this._ctx.drawImage(this.#atlas_img,
			this.#sx, this.#sy, this.#sw, this.#sh,
			this.#x, this.#y, this.#w, this.#h);
		
		if(this.#draw_text != null){
			var fx = this.#x + this.#w/2;
			var fy = this.#y + this.#h/2;
			this.#draw_text.SetPosition(fx, fy);
			this.#draw_text.Update();
		}
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
		if(this.#passed){
			return false;
		}
		return true;
	}
}
