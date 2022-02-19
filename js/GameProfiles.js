class GameProfiles{
	#ctx;
	#width;
	#height;
	#base_line;
	#font_info;
	_atlas = null;

	constructor(ctx, atlas, width, height, base_line, font_info){
		this.#ctx = ctx;
		this._atlas = atlas;
		this.#width = width;
		this.#height = height;
		this.#base_line = base_line;
		this.#font_info = font_info;
	}

	LoadStaticAssets(game_type){
		if(game_type == GAME_TYPE.DDR || game_type == GAME_TYPE.PIANO_TILE){
			this.LoadStaticAssets_DDR();
		}else if(game_type == GAME_TYPE.GUN_FIRE || game_type == GAME_TYPE.CRASH_NUTS){
			this.LoadStaticAssets_GUN_FIRE();
		}
	}

	LoadStaticAssets_DDR(){
		var quarter_x = this.#width / 4;
		var first_x = quarter_x / 2;
		var life_ms = -1;

		{//guide lines
			var line_width = 1;
			var base_line_draw_obj = new DrawLine(this.#ctx, 0, this.#base_line, this.#width, this.#base_line, line_width, 'RED', life_ms);

			var vertical_line1 = new DrawLine(this.#ctx, quarter_x, 0, quarter_x, this.#height, line_width, '#aaa', life_ms);
			var vertical_line2 = new DrawLine(this.#ctx, quarter_x*2, 0, quarter_x*2, this.#height, line_width, '#aaa', life_ms);
			var vertical_line3 = new DrawLine(this.#ctx, quarter_x*3, 0, quarter_x*3, this.#height, line_width, '#aaa', life_ms);

			base_line_draw_obj.Update();
			vertical_line1.Update();
			vertical_line2.Update();
			vertical_line3.Update();
			window._renderer.AddDrawObject(1, base_line_draw_obj);
			window._renderer.AddDrawObject(1, vertical_line1);
			window._renderer.AddDrawObject(1, vertical_line2);
			window._renderer.AddDrawObject(1, vertical_line3);
		}

		{//empty guide
			var dw = 65;
			var dh = 65;
			
			// console.log('this._atlas._img.src ' + this._atlas._img.src);
			var di_l = new DrawImage(this.#ctx, this._atlas._img, 
				this._atlas._img_l_empty.x, this._atlas._img_l_empty.y, this._atlas._img_l_empty.w, this._atlas._img_l_empty.h, 
				(first_x - dw/2), this.#base_line - dh/2, dw, dh, life_ms);
			di_l.Update();
			window._renderer.AddDrawObject(4, di_l);
			
			var di_d = new DrawImage(this.#ctx, this._atlas._img, 
				this._atlas._img_d_empty.x, this._atlas._img_d_empty.y, this._atlas._img_d_empty.w, this._atlas._img_d_empty.h, 
				((first_x + quarter_x) - dw/2), this.#base_line - dh/2, dw, dh, life_ms);
			di_d.Update();
			window._renderer.AddDrawObject(4, di_d);

			var di_u = new DrawImage(this.#ctx, this._atlas._img, 
				this._atlas._img_u_empty.x, this._atlas._img_u_empty.y, this._atlas._img_u_empty.w, this._atlas._img_u_empty.h, 
				((first_x + quarter_x*2) - dw/2), this.#base_line - dh/2, dw, dh, life_ms);
			di_u.Update();
			window._renderer.AddDrawObject(4, di_u);
	
			var di_r = new DrawImage(this.#ctx, this._atlas._img, 
				this._atlas._img_r_empty.x, this._atlas._img_r_empty.y, this._atlas._img_r_empty.w, this._atlas._img_r_empty.h, 
				((first_x + quarter_x*3) - dw/2), this.#base_line - dh/2, dw, dh, life_ms);
			di_r.Update();
			window._renderer.AddDrawObject(4, di_r);
		}
	}

	LoadStaticAssets_GUN_FIRE(){
		var line_width = 1;
		var life_ms = -1;
		var base_line_draw_obj = new DrawLine(this.#ctx, 0, this.#base_line, this.#width, this.#base_line, line_width, 'RED', life_ms);
		base_line_draw_obj.Update();
		window._renderer.AddDrawObject(1, base_line_draw_obj);
	}

	GetProgressBar(){
		return new DrawProgressBar(this.#ctx, 0, 0, this.#width, 0, 20, 'RED');
	}

	GetComboText(){		
		return new DrawText(this.#ctx, '', 200, 220, 25, 
		this.#font_info.combo.fill_color, 
		this.#font_info.combo.use_stroke, 
		this.#font_info.combo.stroke_color, 
		this.#font_info.combo.line_width, 
		-1);
	}

	GetScoreText(){
		return new DrawText(this.#ctx, '', 200, 50, 50, 
		this.#font_info.score.fill_color, 
		this.#font_info.score.use_stroke, 
		this.#font_info.score.stroke_color, 
		this.#font_info.score.line_width, 
		-1);
	}
}