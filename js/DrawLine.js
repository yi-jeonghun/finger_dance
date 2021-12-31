class DrawLine extends DrawObject {
	#sx;
	#sy;
	#ex;
	#ey;
	#style;
	#line_width;
	#life_ms;
	#start_ms = Date.now();

	constructor(context, sx, sy, ex, ey, line_width, style, life_ms){
		super(context);
		this.#sx = sx;
		this.#sy = sy;
		this.#ex = ex;
		this.#ey = ey;
		this.#line_width = line_width;
		this.#style = style;
		this.#life_ms = life_ms;
	}

	Update(){
		this._ctx.beginPath(); 
		this._ctx.moveTo(this.#sx, this.#sy);
		this._ctx.lineTo(this.#ex, this.#ey);
		this._ctx.lineWidth = this.#line_width;
		this._ctx.strokeStyle = this.#style;
		this._ctx.stroke();
	}

	NeedDelete(){
		if(this.#life_ms < 0)
			return false;

		var diff = Date.now() - this.#start_ms;
		if( diff > this.#life_ms){
			return true;
		}
		return false;
	};
}