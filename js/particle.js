class Particles {
	#particle_list = [];
	#start_ms = Date.now();
	#life_ms = 500;

	constructor(context, x, y, img_obj, coordination){
		for(var i=0 ; i<15 ; i++){
			// var particle = new Particle(context, x, y);
			var particle = new ParticleImage(context, x, y, img_obj, coordination);
			this.#particle_list.push(particle);
		}
	}

	Update(){
		for(var i=0 ; i<this.#particle_list.length ; i++){
			this.#particle_list[i].Update();
		}
	}

	NeedDelete(){
		return false;
	};

	IsVisible(){
		var now = Date.now();
		var diff = now - this.#start_ms;
		if( diff > this.#life_ms){
			return false;
		}
		return true;
	}

	Reset(x, y){
		this.#start_ms = Date.now();
		for(var i=0 ; i<this.#particle_list.length ; i++){
			this.#particle_list[i].Reset(x, y);
		}
	}
}

class Particle extends DrawObject {
	#x;
	#y;
	#w = 10;
	#h = 10;
	#rotate_speed = 1;
	#move_x = 1;
	#move_y = 1;
	#degree = 0;
	#alpha = 1;
	#start_ms = Date.now();
	#life_ms = 500;

	constructor(context, x, y){
		super(context);
		this.Reset();
	}

	Reset(x, y){
		this.#x = x;
		this.#y = y;
		this.#alpha = 1;
		this.#rotate_speed = this.#Random(-30, 30);
		var width = this.#Random(10, 30);
		this.#w = this.#h = width;
		this.#move_x = this.#Random(-50, 100);
		this.#move_y = this.#Random(-50, 100);
	}

	#Random(min, max){
		return Math.random() * (max - min) + min;;
	};

	Update(){
		this.#degree += this.#rotate_speed;
		this.#x += this.#move_x;
		this.#y += this.#move_y;		
		this.#alpha -= 0.03;
		if(this.#alpha < 0){
			this.#alpha = 0;
		}

		this.#Draw();
	}

	#Draw(){
		var cx = this.#x + this.#w/2;
		var cy = this.#y + this.#h/2;

		this._ctx.save();

		this._ctx.translate(cx, cy);
		this._ctx.rotate(this.#degree * Math.PI/180);
		this._ctx.translate(-cx, -cy);

		this._ctx.lineWidth = 1;
		this._ctx.fillStyle = 'white';
		this._ctx.strokeStyle = 'black';
		this._ctx.globalAlpha = this.#alpha;
		this._ctx.fillRect(this.#x, this.#y, this.#w, this.#h);
		this._ctx.strokeRect(this.#x,this.#y, this.#w, this.#h);

		this._ctx.restore();
	};

	NeedDelete(){
		var now = Date.now();
		var diff = now - this.#start_ms;
		if( diff > this.#life_ms){
			return true;
		}
		return false;
	};
}

class ParticleImage extends DrawObject {
	#x;
	#y;
	#w = 10;
	#h = 10;
	#rotate_speed = 1;
	#move_x = 1;
	#move_y = 1;
	#degree = 0;
	#alpha = 1;
	#start_ms = Date.now();
	#life_ms = 500;
	#img;
	#coordination = null;

	constructor(context, x, y, img_ogj, coordination){
		super(context);

		this.#img = img_ogj;//window._resource_loader.GetImage(img_path);
		this.#coordination = coordination;
		// this.#img = new Image();
		// this.#img.src = img_path;
		this.Reset(x, y);
	}

	Reset(x, y){
		this.#x = x;
		this.#y = y;
		this.#alpha = 1;
		this.#rotate_speed = this.#Random(-30, 30);
		var width = this.#Random(20, 50);
		this.#w = this.#h = width;
		this.#x -= this.#w/2;
		this.#y -= this.#w/2;
		this.#move_x = this.#Random(-10, 10);
		this.#move_y = this.#Random(-10, 10);
	}

	#Random(min, max){
		return Math.random() * (max - min) + min;;
	};

	Update(){
		this.#degree += this.#rotate_speed;
		this.#x += this.#move_x;
		this.#y += this.#move_y;		
		this.#alpha -= 0.03;
		if(this.#alpha < 0){
			this.#alpha = 0;
		}

		this._Draw();
	}

	_Draw(){
		var cx = this.#x + this.#w/2;
		var cy = this.#y + this.#h/2;

		this._ctx.save();

		this._ctx.translate(cx, cy);
		this._ctx.rotate(this.#degree * Math.PI/180);
		this._ctx.translate(-cx, -cy);
		this._ctx.globalAlpha = this.#alpha;

		this._ctx.drawImage(this.#img,
			//0, 0, 50, 50,
			this.#coordination.x, this.#coordination.y, this.#coordination.w, this.#coordination.h,
			this.#x, this.#y, this.#w, this.#h);
	
		this._ctx.restore();
	};

	NeedDelete(){
		var now = Date.now();
		var diff = now - this.#start_ms;
		if( diff > this.#life_ms){
			return true;
		}
		return false;
	};
}
