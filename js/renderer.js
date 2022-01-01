function Renderer(game_width, game_height, screen_width, screen_height){
	var self = this;
	this._canvas = null;
	this._ctx = null;
	this._base_line = 600;
	this._debug = false;
	this._render_mode = RENDER_MODE.RECORD;
	this._game_width = game_width;
	this._game_height = game_height;
	this._screen_width = screen_width;
	this._screen_height = screen_height;
	this._show_index_number = false;
	this._draw_object_list_1 = [];
	this._draw_object_list_2 = [];
	this._draw_object_list_3 = [];
	this._draw_object_list_4 = [];
	this._draw_object_list_5 = [];
	this._draw_object_list_6 = [];
	this._draw_object_list_7 = [];
	this._draw_object_list_8 = [];
	this._draw_object_list_9 = [];
	this._draw_object_list_10 = [];

	this.Init = function(){
		self._canvas = document.getElementById('ddr_player_layer1');
		self._canvas.width = self._screen_width;
		self._canvas.height = self._screen_height;

		console.log('self._canvas ' +self._canvas);
		self._ctx = self._canvas.getContext('2d');

		var scale_width = self._screen_width / self._game_width;
		var scale_height = self._screen_height / self._game_height;
		console.log('scale_width ' + scale_width);
		console.log('scale_height ' + scale_height);

		self._ctx.scale(scale_width, scale_height);
		return this;
	};

	this.Update = function(){
		self._ctx.clearRect(0, 0, self._game_width, self._game_height);

		//Layer 1
		for(var i=self._draw_object_list_1.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_1[i].NeedDelete()){
				self._draw_object_list_1.splice(i, 1);
				continue;
			}
			self._draw_object_list_1[i].Update();
		}

		//Layer 2
		for(var i=self._draw_object_list_2.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_2[i].NeedDelete()){
				self._draw_object_list_2.splice(i, 1);
				continue;
			}
			self._draw_object_list_2[i].Update();
		}

		//Layer 3
		for(var i=self._draw_object_list_3.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_3[i].NeedDelete()){
				self._draw_object_list_3.splice(i, 1);
				continue;
			}
			self._draw_object_list_3[i].Update();
		}
		
		//Layer 4
		for(var i=self._draw_object_list_4.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_4[i].NeedDelete()){
				self._draw_object_list_4.splice(i, 1);
				continue;
			}
			self._draw_object_list_4[i].Update();
		}

		//Layer 5
		for(var i=self._draw_object_list_5.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_5[i].NeedDelete()){
				self._draw_object_list_5.splice(i, 1);
				continue;
			}
			self._draw_object_list_5[i].Update();
		}

		//Layer 6
		for(var i=self._draw_object_list_6.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_6[i].NeedDelete()){
				self._draw_object_list_6.splice(i, 1);
				continue;
			}
			if(self._draw_object_list_6[i].IsVisible()){
				self._draw_object_list_6[i].Update();
			}
		}

		//Layer 7
		for(var i=self._draw_object_list_7.length-1 ; i>=0 ; i--){
			if(self._draw_object_list_7[i].NeedDelete()){
				self._draw_object_list_7.splice(i, 1);
				continue;
			}
			self._draw_object_list_7[i].Update();
		}
	};

	this.ClearDrawObject = function(){
		self._draw_object_list_1 = [];
		self._draw_object_list_2 = [];
		self._draw_object_list_3 = [];
		self._draw_object_list_4 = [];
		self._draw_object_list_5 = [];
		self._draw_object_list_6 = [];
		self._draw_object_list_7 = [];
		self._draw_object_list_8 = [];
		self._draw_object_list_9 = [];
		self._draw_object_list_10 = [];
	};

	this.AddDrawObject = function(layer, draw_object){
		if(layer < 1 || layer > 10){
			console.log('Layer Range Error');
			return;
		}
		switch(layer){
			case 1:
				self._draw_object_list_1.push(draw_object);
				break;
			case 2:
				self._draw_object_list_2.push(draw_object);
				break;
			case 3:
				self._draw_object_list_3.push(draw_object);
				break;
			case 4:
				self._draw_object_list_4.push(draw_object);
				break;
			case 5:
				self._draw_object_list_5.push(draw_object);
				break;
			case 6:
				self._draw_object_list_6.push(draw_object);
				break;
			case 7:
				self._draw_object_list_7.push(draw_object);
				break;
			case 8:
				self._draw_object_list_8.push(draw_object);
				break;
			case 9:
				self._draw_object_list_9.push(draw_object);
				break;
			case 10:
				self._draw_object_list_10.push(draw_object);
				break;
		}
	};
}