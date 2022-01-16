class Particles {
	#particle_list = [];
	#start_ms = Date.now();
	#life_ms = 500;

	constructor(context, x, y, count){
		for(var i=0 ; i<count ; i++){
			var particle = new Particle(context, x, y);
			this.#particle_list.push(particle);
		}
	}

	Update(){
		for(var i=0 ; i<this.#particle_list.length ; i++){
			this.#particle_list[i].Update();
		}
	}

	NeedDelete(){
		var now = Date.now();
		var diff = now - this.#start_ms;
		if( diff > this.#life_ms){
			return true;
		}
		return false;
	};

	IsVisible(){
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


/*
function Particle(x, y){
	var self = this;
	this._ctx = null;
	this._x = x;
	this._y = y;
	this._w = 10;
	this._h = 10;
	this._rotate_speed = 1;
	this._move_x = 1;
	this._move_y = 1;
	this._degree = 0;
	this._alpha = 1;
	this._start_ms = Date.now();
	this._life_ms = 500;

	this.Init = function(){
		self._rotate_speed = self.Random(-30, 30);

		var width = self.Random(10, 30);
		self._w = self._h = width;

		self._move_x = self.Random(-10, 10);
		self._move_y = self.Random(-10, 10);

		return this;
	}

	this.Random = function(min, max){
		return Math.random() * (max - min) + min;;
	};

	this.Update = function(){
		self._degree += self._rotate_speed;
		self._x += self._move_x;
		self._y += self._move_y;		
		self._alpha -= 0.03;
		if(self._alpha < 0){
			self._alpha = 0;
		}

		self.Draw();
	};

	this.Draw = function(){
		var cx = self._x + self._w/2;
		var cy = self._y + self._h/2;

		self._ctx.save();

		self._ctx.translate(cx, cy);
		self._ctx.rotate(self._degree * Math.PI/180);
		self._ctx.translate(-cx, -cy);

		self._ctx.lineWidth = 1;
		self._ctx.fillStyle = 'white';
		self._ctx.strokeStyle = 'black';
		self._ctx.globalAlpha = self._alpha;
		self._ctx.fillRect(self._x, self._y, self._w, self._h);
		self._ctx.strokeRect(self._x, self._y, self._w, self._h);

		self._ctx.restore();
	};

	this.IsEnd = function(){
		var now = Date.now();
		var diff = now - self._start_ms;
		if( diff > self._life_ms){
			return true;
		}
		return false;
	};
}
*/