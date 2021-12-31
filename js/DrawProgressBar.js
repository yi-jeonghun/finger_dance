class DrawProgressBar extends DrawObject {
	#sx;
	#sy;
	#ex;
	#ey;
	#style;
	#line_width;
	#progress = 0;

	constructor(context, sx, sy, ex, ey, line_width, style){
		super(context);
		this.#sx = sx;
		this.#sy = sy;
		this.#ex = ex;
		this.#ey = ey;
		this.#line_width = line_width;
		this.#style = style;
	}

	SetProgress(progress){
		this.#progress = progress;
	}

	Update(){
		this._ctx.beginPath(); 
		this._ctx.moveTo(this.#sx, this.#sy);
		var percent = this.#ex * this.#progress;
		this._ctx.lineTo(percent, this.#ey);
		this._ctx.lineWidth = this.#line_width;
		this._ctx.strokeStyle = this.#style;
		this._ctx.stroke();
	}

	NeedDelete(){
		return false;
	};
}