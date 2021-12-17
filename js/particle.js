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