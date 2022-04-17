function Atlas(image_path){
	var self = this;
	this._image_path = image_path;
	this._img = null;

	this._img_l = null;
	this._img_d = null;
	this._img_u = null;
	this._img_r = null;
	this._img_c = null;

	this._img_l_empty = null;
	this._img_d_empty = null;
	this._img_u_empty = null;
	this._img_r_empty = null;
	this._img_c_empty = null;

	this._img_l_particle = null;
	this._img_d_particle = null;
	this._img_u_particle = null;
	this._img_r_particle = null;
	this._img_c_particle = null;

	this._img_duration = null;

	this.Init = function(){
		self._img = new Image();
		self._img.src = self._image_path;//'img/atlas.png';
		// console.log('self._img.src ' + self._img.src);
		self.LoadSprite();
		return this;
	};

	this.LoadSprite = function(){
		var u = 140;
		self._img_l = {x:0,  y:0,w:u,h:u};
		self._img_d = {x:u,  y:0,w:u,h:u};
		self._img_u = {x:u*2,y:0,w:u,h:u};
		self._img_r = {x:u*3,y:0,w:u,h:u};
		self._img_c = {x:u*3,y:0,w:u,h:u};

		self._img_l_empty = {x:0,  y:u*1,w:u,h:u};
		self._img_d_empty = {x:u,  y:u*1,w:u,h:u};
		self._img_u_empty = {x:u*2,y:u*1,w:u,h:u};
		self._img_r_empty = {x:u*3,y:u*1,w:u,h:u};
		self._img_c_empty = {x:u*3,y:u*1,w:u,h:u};

		self._img_l_particle = {x:0,  y:u*2,w:u,h:u};
		self._img_d_particle = {x:u,  y:u*2,w:u,h:u};
		self._img_u_particle = {x:u*2,y:u*2,w:u,h:u};
		self._img_r_particle = {x:u*3,y:u*2,w:u,h:u};
		self._img_c_particle = {x:u*3,y:u*2,w:u,h:u};

		self._img_duration = {x:u*5, y:0, w:100, h:u*3};
	};
}