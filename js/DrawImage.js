class DrawImage extends DrawObject {
	#atlas_img;
	#sx;
	#sy;
	#sw;
	#sh;
	#dx;
	#dy;
	#dw;
	#dh;
	#life_ms;
	#start_ms = Date.now();

	constructor(context, atlas_img, sx, sy, sw, sh, dx, dy, dw, dh, life_ms){
		super(context);
		this.#atlas_img = atlas_img;
		this.#sx = sx;
		this.#sy = sy;
		this.#sw = sw;
		this.#sh = sh;
		this.#dx = dx;
		this.#dy = dy;
		this.#dw = dw;
		this.#dh = dh;
		this.#life_ms = life_ms;
	}

	Update(){
		this._ctx.drawImage(this.#atlas_img, 
			this.#sx, this.#sy, this.#sw, this.#sh, 
			this.#dx, this.#dy, this.#dw, this.#dh);
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