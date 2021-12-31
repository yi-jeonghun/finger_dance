class DrawText extends DrawObject {
	#text;
	#x;
	#y;
	#font_size;
	#color;
	#life_ms;
	#start_ms = Date.now();

	constructor(context, text, x, y, font_size, color, life_ms){
		super(context);
		this.#text = text;
		this.#x = x;
		this.#y = y;
		this.#font_size = font_size;
		this.#color = color;
		this.#life_ms = life_ms;
	}

	SetText(text){
		this.#text = text;
	}

	Update(){
		if(this.#text == ''){
			return;
		}
		
		this._ctx.textBaseline = "middle";
		// var border_size = font_size + 2;
		// this._ctx.font = border_size + "px Arial";
		// this._ctx.textAlign = "center";
		// this._ctx.fillStyle = "white";
		// this._ctx.fillText(txt, x, y);

		this._ctx.font = this.#font_size + "px Arial";
		this._ctx.textAlign = "center";
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