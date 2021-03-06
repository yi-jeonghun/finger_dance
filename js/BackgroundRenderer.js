function BackgroundRenderer(){
	var self = this;
	this._layer_id;
	this._ctx1;
	this._ctx2;
	this._ctx3;
	this._game_width;
	this._game_height;
	this._screen_width;
	this._screen_height;
	this._layer1 = null;
	this._layer2 = null;
	this._layer3 = null;
	this._SPEED = 0.005;
	this._effected = false;
	this._effect_time = 0;
	this._effect_size = 1;

	this._effect1 = {
		active: false,
		time: 0,
		size: 1100
	};
	this._effect2 = {
		active: false,
		time: 0,
		size: 1100
	};
	this._effect3 = {
		active: false,
		time: 0,
		size: 1100
	};

	this.Init = function(layer_id, game_width, game_height, screen_width, screen_height){
		self._layer_id = layer_id;
		self._game_width = game_width;
		self._game_height = game_height;
		self._screen_width = screen_width;
		self._screen_height = screen_height;
		self._InitCanvas();
		return this;
	};

	this.Effect = function(){
		var size = 1100;
		if(self._layer1.hit != 'none'){
			self._effect1.active = true;
			self._effect1.size = size;
		}

		if(self._layer2.hit != 'none'){
			self._effect2.active = true;
			self._effect2.size = size;
		}

		if(self._layer3.hit != 'none'){
			self._effect3.active = true;
			self._effect3.size = size;
		}
	};

	this._InitCanvas = function(){
		var scale_width = self._screen_width / self._game_width;
		var scale_height = self._screen_height / self._game_height;

		var canvas1 = document.getElementById(self._layer_id + '1');
		{
			canvas1.width = self._screen_width;
			canvas1.height = self._screen_height;	
			self._ctx1 = canvas1.getContext('2d');
			self._ctx1.scale(scale_width, scale_height);
		}
		var canvas2 = document.getElementById(self._layer_id + '2');
		{
			canvas2.width = self._screen_width;
			canvas2.height = self._screen_height;	
			self._ctx2 = canvas2.getContext('2d');
			self._ctx2.scale(scale_width, scale_height);
		}
		var canvas3 = document.getElementById(self._layer_id + '3');
		{
			canvas3.width = self._screen_width;
			canvas3.height = self._screen_height;	
			self._ctx3 = canvas3.getContext('2d');
			self._ctx3.scale(scale_width, scale_height);
		}
	};

	this.Clear = function(){
		self._layer1 = null;
		self._layer2 = null;
		self._layer3 = null;
		self.ClearScreen();
	};

	this.ClearScreen = function(){
		if(self._ctx1)
			self._ctx1.clearRect(0, 0, self._game_width, self._game_height);
		if(self._ctx2)
			self._ctx2.clearRect(0, 0, self._game_width, self._game_height);
		if(self._ctx3)
			self._ctx3.clearRect(0, 0, self._game_width, self._game_height);
	};

	this.SetBackground = function(background){
		self._layer1 = {
			color: background.layer1_color,
			image_path: background.layer1_image_path,
			action: background.layer1_action,
			speed: background.layer1_speed,
			hit: background.layer1_hit,
			image: null,
			image_w: 0,
			image_h: 0,
			image_ready: false,
			move_x: 0,
			move_y: 0,
			move_x2: 0,
			move_y2: 0,
			left_right: 'left',
			up_down: 'up'
		};
		self._layer2 = {
			color: background.layer2_color,
			image_path: background.layer2_image_path,
			action: background.layer2_action,
			speed: background.layer2_speed,
			hit: background.layer2_hit,
			image: null,
			image_w: 0,
			image_h: 0,
			image_ready: false,
			move_x: 0,
			move_y: 0,
			move_x2: 0,
			move_y2: 0,
			left_right: 'left',
			up_down: 'up'
		};
		self._layer3 = {
			color: background.layer3_color,
			image_path: background.layer3_image_path,
			action: background.layer3_action,
			speed: background.layer3_speed,
			hit: background.layer3_hit,
			image: null,
			image_w: 0,
			image_h: 0,
			image_ready: false,
			move_x: 0,
			move_y: 0,
			move_x2: 0,
			move_y2: 0,
			left_right: 'left',
			up_down: 'up'
		};
		// console.log('layer1 ' + JSON.stringify(self._layer1));
		// console.log('layer2 ' + JSON.stringify(self._layer2));
		// console.log('layer3 ' + JSON.stringify(self._layer3));

		// console.log('layer1.hit ' + self._layer1.hit);
		// console.log('layer2.hit ' + self._layer2.hit);
		// console.log('layer3.hit ' + self._layer3.hit);

		if(self._layer1.image_path != ''){
			self._layer1.image = new Image();
			self._layer1.image.src = self._layer1.image_path;
			self._layer1.image.onload = function(){
				self._layer1.image_ready = true;
				self._layer1.image_w = this.naturalWidth;
				self._layer1.image_h = this.naturalHeight;
				self._ctx1.drawImage(self._layer1.image, 
					0, 0, self._layer1.image_w, self._layer1.image_h,
					0, 0, self._layer1.image_w, self._layer1.image_h);
			}
		}

		if(self._layer2.image_path != ''){
			self._layer2.image = new Image();
			self._layer2.image.src = self._layer2.image_path;
			self._layer2.image.onload = function(){
				self._layer2.image_ready = true;
				self._layer2.image_w = this.naturalWidth;
				self._layer2.image_h = this.naturalHeight;
				self._ctx2.drawImage(self._layer2.image, 
					0, 0, self._layer2.image_w, self._layer2.image_h,
					0, 0, self._layer2.image_w, self._layer2.image_h);
			}
		}

		if(self._layer3.image_path != ''){
			self._layer3.image = new Image();
			self._layer3.image.src = self._layer3.image_path;
			self._layer3.image.onload = function(){
				self._layer3.image_ready = true;
				self._layer3.image_w = this.naturalWidth;
				self._layer3.image_h = this.naturalHeight;
				self._ctx3.drawImage(self._layer3.image, 
					0, 0, self._layer3.image_w, self._layer3.image_h,
					0, 0, self._layer3.image_w, self._layer3.image_h);
			}
		}
	};

	this.Update = function(){
		if(self._layer1 && self._layer1.image_ready){
			if(self._layer1.action == 'fixed'){
				if(self._layer1.hit != 'none'){
					self.LayerEffect(self._layer1, self._effect1, self._ctx1);
				}
			}else{
				self.LayerAction(self._layer1, self._ctx1);
			}
		}

		if(self._layer2 && self._layer2.image_ready){
			if(self._layer2.action == 'fixed'){
				if(self._layer2.hit != 'none'){
					self.LayerEffect(self._layer2, self._effect2, self._ctx2);
				}
			}else{
				self.LayerAction(self._layer2, self._ctx2);
			}
		}

		if(self._layer3 && self._layer3.image_ready){
			if(self._layer3.action == 'fixed'){
				if(self._layer3.hit != 'none'){
					self.LayerEffect(self._layer3, self._effect3, self._ctx3);
				}
			}else{
				self.LayerAction(self._layer3, self._ctx3);
			}
		}
	};

	this.LayerEffect = function(l, e, c){
		if(e.active == false){
			return;
		}

		e.time += window._timer._delta;
		e.size -= window._timer._delta;
		if(e.size < 1000){
			e.active = false;
			e.time = 0;
			e.size = 1000;
		}

		var w = l.image_w * (e.size/1000);
		var h = l.image_h * (e.size/1000);
		var x = 0;
		var y = 0;

		if(l.hit == 'center'){
			x = (w - l.image_w) / -2;
			y = (h - l.image_h) / -2;	
		}else if(l.hit == 'top'){
			x = (w - l.image_w) / -2;
			y = 0;
		}else if(l.hit == 'bottom'){
			x = (w - l.image_w) / -2;
			y = l.image_h - h;	
		}

		c.clearRect(0, 0, self._game_width, self._game_height);
		c.drawImage(l.image, 
			0, 0, l.image_w, l.image_h,
			x, y, w, h);
	};

	this.LayerAction = function(l, c){
		if(l.action == 'left'){
			l.move_x -= (window._timer._delta * self._SPEED * l.speed);
			if(l.move_x < -(l.image_w)){
				l.move_x = l.move_x + l.image_w;
			}
			l.move_x2 = l.move_x + l.image_w;
		}else if(l.action == 'right'){
			l.move_x += (window._timer._delta * self._SPEED * l.speed);
			if(l.move_x > l.image_w){
				l.move_x = l.move_x - l.image_w;
			}
			l.move_x2 = l.move_x - l.image_w;
		}else if(l.action == 'up'){
			l.move_y -= (window._timer._delta * self._SPEED * l.speed);
			if(l.move_y < -(l.image_h)){
				l.move_y = l.move_y + l.image_h;
			}
			l.move_y2 = l.move_y + l.image_h;
		}else if(l.action == 'down'){
			l.move_y += (window._timer._delta * self._SPEED * l.speed);
			if(l.move_y > l.image_h){
				l.move_y = l.move_y - l.image_h;
			}
			l.move_y2 = l.move_y - l.image_h;
		}else if(l.action == 'left_right'){
			if(l.left_right == 'left'){
				l.move_x -= (window._timer._delta * self._SPEED * l.speed);
				if(l.move_x < -(l.image_w)){
					l.move_x = l.move_x + l.image_w;
					l.left_right = 'right';
				}
				l.move_x2 = l.move_x + l.image_w;	
			}else if(l.left_right == 'right'){
				l.move_x += (window._timer._delta * self._SPEED * l.speed);
				if(l.move_x > l.image_w){
					l.move_x = l.move_x - l.image_w;
					l.left_right = 'left';
				}
				l.move_x2 = l.move_x - l.image_w;
			}
		}else if(l.action == 'up_down'){
			if(l.up_down == 'up'){
				l.move_y -= (window._timer._delta * self._SPEED * l.speed);
				if(l.move_y < -(l.image_h)){
					l.move_y = l.move_y + l.image_h;
					l.up_down = 'down';
				}
				l.move_y2 = l.move_y + l.image_h;	
			}else if(l.up_down == 'down'){
				l.move_y += (window._timer._delta * self._SPEED * l.speed);
				if(l.move_y > l.image_h){
					l.move_y = l.move_y - l.image_h;
					l.up_down = 'up';
				}
				l.move_y2 = l.move_y - l.image_h;	
			}
		}

		c.clearRect(0, 0, self._game_width, self._game_height);
		c.drawImage(l.image, 
			0, 0, l.image_w, l.image_h,
			l.move_x, l.move_y, l.image_w, l.image_h);
		c.drawImage(l.image, 
			0, 0, l.image_w, l.image_h,
			l.move_x2, l.move_y2, l.image_w, l.image_h);	
	};
};