function Timer(){
	var self = this;
	this._tick = null;
	this._delta = 0;
	this.Init = function(){
		self._tick = Date.now();
		self.Update();
		return this;
	};

	this.Update = function(){
		var now = Date.now();
		self._delta = now - self._tick;
		self._tick = now;
		requestAnimationFrame(self.Update);
	};
}