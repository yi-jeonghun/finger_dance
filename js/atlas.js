function Atlas(image_path){
	var self = this;
	this._image_path = image_path;
	this._img = null;

	this._img_l = null;
	this._img_d = null;
	this._img_u = null;
	this._img_r = null;

	this._img_l_hit = null;
	this._img_d_hit = null;
	this._img_u_hit = null;
	this._img_r_hit = null;

	this._img_l_empty = null;
	this._img_d_empty = null;
	this._img_u_empty = null;
	this._img_r_empty = null;

	this.Init = function(){
		self._img = new Image();
		self._img.src = self._image_path;//'img/atlas.png';
		// console.log('self._img.src ' + self._img.src);
		self.LoadSprite();
		return this;
	};

	this.LoadSprite = function(){
		var u = 50;
		self._img_l = {x:0,  y:0,w:u,h:u};
		self._img_d = {x:u,  y:0,w:u,h:u};
		self._img_u = {x:u*2,y:0,w:u,h:u};
		self._img_r = {x:u*3,y:0,w:u,h:u};

		self._img_l_hit = {x:0,  y:u,w:u,h:u};
		self._img_d_hit = {x:u,  y:u,w:u,h:u};
		self._img_u_hit = {x:u*2,y:u,w:u,h:u};
		self._img_r_hit = {x:u*3,y:u,w:u,h:u};

		self._img_l_empty = {x:0,  y:u*2,w:u,h:u};
		self._img_d_empty = {x:u,  y:u*2,w:u,h:u};
		self._img_u_empty = {x:u*2,y:u*2,w:u,h:u};
		self._img_r_empty = {x:u*3,y:u*2,w:u,h:u};
	};
}