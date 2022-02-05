class DrawText extends DrawObject {
	#text;
	#x;
	#y;
	#font_size;
	#color;
	#life_ms;
	#use_stroke = false;
	#stroke_color = 'white';
	#line_width = 0;
	#start_ms = Date.now();

	constructor(context, text, x, y, font_size, color, use_stroke, stroke_color, line_width, life_ms){
		super(context);
		this.#text = text;
		this.#x = x;
		this.#y = y;
		this.#font_size = font_size;
		this.#color = color;
		this.#use_stroke = use_stroke;
		this.#stroke_color = stroke_color;
		this.#line_width = line_width;
		this.#life_ms = life_ms;
	}

	SetText(text){
		this.#text = text;
	}

	SetPosition(x, y){
		this.#x = x;
		this.#y = y;
	}

	Update(){
		if(this.#text == ''){
			return;
		}

		this._ctx.textBaseline = "middle";
		this._ctx.font = this.#font_size + "px Arial";
		this._ctx.textAlign = "center";

		if(this.#use_stroke){
			this._ctx.strokeStyle = this.#stroke_color;
			this._ctx.lineWidth = this.#line_width;
			this._ctx.strokeText(this.#text, this.#x, this.#y);
		}

		this._ctx.fillStyle = this.#color;
		this._ctx.fillText(this.#text, this.#x, this.#y);
	}

	NeedDelete(){
		if(this.#life_ms < 0){
			return false;
		}

		var diff = Date.now() - this.#start_ms;
		if( diff > this.#life_ms){
			return true;
		}
		return false;
	};
}