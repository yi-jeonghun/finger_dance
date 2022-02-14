class DrawTouchHandle extends DrawObject {
	#sx;
	#sy;
	#size;
	#life_ms;
	#start_ms = Date.now();

	constructor(context, sx, sy, size, life_ms){
		super(context);
		this.#sx = sx;
		this.#sy = sy;
		this.#size = size;
		this.#life_ms = life_ms;
	}

	Move(x){
		this.#sx = x;
	}

	Update(){
		this._ctx.beginPath(); 
		this._ctx.arc(this.#sx, this.#sy, this.#size, 0, 2 * Math.PI);		
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