function InputControl(layer_id, game_type, screen_width){
	self = this;
	this._layer_id = layer_id;
	this._game_type = game_type;
	this._screen_width = screen_width;
	this._position;
	this._offset;
	this._handle = null;
	this._key_down_array = [];
	this._touch_start_array = [];

	this.Init = function(){
		var layer = $('#'+self._layer_id);
		self._offset = layer.offset();

		if(self._game_type == GAME_TYPE.DDR || self._game_type == GAME_TYPE.PIANO_TILE || self._game_type == GAME_TYPE.PUMP){
			document.addEventListener('keydown', self.PCKeyDown);
			document.addEventListener('keyup', self.PCKeyUp);
			layer.on('touchmove', function(e){
				e.preventDefault();
			});
			layer.on('touchstart', self.SmartDeviceTouchStart);
			layer.on('touchend', self.SmartDeviceTouchEnd);
		}else if(self._game_type == GAME_TYPE.GUN_FIRE){
			document.onmousemove = self.PCMouseMove;
			layer.on('touchmove', self.SmartDeviceTouchMove)
		}else if(self._game_type == GAME_TYPE.CRASH_NUTS){
			layer.on('mousedown', self.PCMouseDown);
		}

		return this;
	};

	this.InitHandle = function(center, base_line){
		self._handle = new DrawTouchHandle(window._renderer._ctx, center, base_line, 30, -1);
		window._renderer.AddDrawObject(9, self._handle);
	};

	this._prev_pc_key = 0;
	this._prev_pc_key_time = 0;
	this.PCKeyDown = function(e){
		var key_code = -1;

		if(e.keyCode == self._prev_pc_key){
			if((Date.now() - self._prev_pc_key_time) < 100){
				return;
			}
			self._prev_pc_key_time = Date.now();
		}
		self._prev_pc_key = e.keyCode;

		if(self._key_down_array[e.key] == true){
			return;
		}else{
			self._key_down_array[e.key] = true;
		}

		if(self._game_type == GAME_TYPE.DDR || self._game_type == GAME_TYPE.PIANO_TILE){
			// console.log('e.key ' + e.key);
			switch(e.keyCode){
				case 49://숫자1
				case 68://d
					key_code = ARROW.LEFT;
					break;
				case 50://숫자2
				case 70://f
					key_code = ARROW.DOWN;
					break;
				case 51://숫자3
				case 74://j
					key_code = ARROW.UP;
					break;
				case 52://숫자4
				case 75://k
					key_code = ARROW.RIGHT;
					break;
			}	
		}else if(self._game_type == GAME_TYPE.PUMP){
			switch(e.keyCode){
				case 49://숫자1
				case 71://g
					key_code = ARROW.LEFT;
					break;
				case 50://숫자2
				case 72://h
					key_code = ARROW.DOWN;
					break;
				case 51://숫자3
				case 74://j
					key_code = ARROW.CENTER;
					break;
				case 52://숫자4
				case 75://k
					key_code = ARROW.UP;
					break;
				case 52://숫자5
				case 76://l
					key_code = ARROW.RIGHT;
					break;
			}	
		}

		if(key_code != -1){
			e.preventDefault();
			// console.log('key_code ' + key_code);
			var arrows = [key_code];
			window._game_control.HitByLaneAndTime(arrows);
		}
	};

	this.PCKeyUp = function(e){
		var key_code = -1;
		self._key_down_array[e.key] = false;

		if(self._game_type == GAME_TYPE.DDR || self._game_type == GAME_TYPE.PIANO_TILE){
			switch(e.keyCode){
				case 49://숫자1
				case 68://d
					key_code = ARROW.LEFT;
					break;
				case 50://숫자2
				case 70://f
					key_code = ARROW.DOWN;
					break;
				case 51://숫자3
				case 74://j
					key_code = ARROW.UP;
					break;
				case 52://숫자4
				case 75://k
					key_code = ARROW.RIGHT;
					break;
			}	
		}else if(self._game_type == GAME_TYPE.PUMP){
			switch(e.keyCode){
				case 49://숫자1
				case 71://g
					key_code = ARROW.LEFT;
					break;
				case 50://숫자2
				case 72://h
					key_code = ARROW.DOWN;
					break;
				case 51://숫자3
				case 74://j
					key_code = ARROW.CENTER;
					break;
				case 52://숫자4
				case 75://k
					key_code = ARROW.UP;
					break;
				case 52://숫자5
				case 76://l
					key_code = ARROW.RIGHT;
					break;
			}	
		}
		if(key_code != -1){
			e.preventDefault();
			// console.log('key up code ' + key_code);
			var key_code_arr = [];
			key_code_arr.push(key_code);
			window._game_control.KeyUpProcess(key_code_arr);
		}
	};

	this._prev_left_time = 0;
	this._prev_down_time = 0;
	this._prev_center_time = 0;
	this._prev_up_time = 0;
	this._prev_right_time = 0;
	this.SmartDeviceTouchStart = function(e){
		// console.log('SmartDeviceTouchStart ');
		var beat_count = BEAT_TYPE_COUNT[self._game_type];
		var one_area_width = window.innerWidth / beat_count;
		var arrow_list = [];

		if(self._game_type == GAME_TYPE.PUMP){
			for(var i=0 ; i<e.originalEvent.touches.length ; i++){
				var x = e.originalEvent.touches[i].pageX;
				var key = null;

				if(0 < x && x <= one_area_width){
					if((Date.now() - self._prev_left_time) < 100){
						continue;
					}
					self._pref_left_time = Date.now();
					key = ARROW.LEFT;
				}else if(one_area_width < x && x <= one_area_width*2){
					if((Date.now() - self._prev_down_time) < 100){
						continue;
					}
					self._pref_down_time = Date.now();
					key = ARROW.DOWN;
				}else if(one_area_width*2 < x && x <= one_area_width*3){
					if((Date.now() - self._prev_center_time) < 100){
						continue;
					}
					self._pref_center_time = Date.now();
					key = ARROW.CENTER;
				}else if(one_area_width*3 < x && x <= one_area_width*4){
					if((Date.now() - self._prev_up_time) < 100){
						continue;
					}
					self._pref_up_time = Date.now();
					key = ARROW.UP;
				}else if(one_area_width*4 < x && x <= one_area_width*5){
					if((Date.now() - self._prev_right_time) < 100){
						continue;
					}
					self._pref_right_time = Date.now();
					key = ARROW.RIGHT;
				}

				if(key != null){
					if(self._touch_start_array[key] == true){
						continue;
					}else{
						arrow_list.push(key);
						self._touch_start_array[key] = true;
					}	
				}
			}	
		}else{
			for(var i=0 ; i<e.originalEvent.touches.length ; i++){
				var x = e.originalEvent.touches[i].pageX;
				var key = null;

				if(0 < x && x <= one_area_width){
					if((Date.now() - self._prev_left_time) < 100){
						continue;
					}
					self._pref_left_time = Date.now();
					key = ARROW.LEFT;
				}else if(one_area_width < x && x <= one_area_width*2){
					if((Date.now() - self._prev_down_time) < 100){
						continue;
					}
					self._pref_down_time = Date.now();
					key = ARROW.DOWN;
				}else if(one_area_width*2 < x && x <= one_area_width*3){
					if((Date.now() - self._prev_up_time) < 100){
						continue;
					}
					self._pref_up_time = Date.now();
					key = ARROW.UP;
				}else if(one_area_width*3 < x && x <= one_area_width*4){
					if((Date.now() - self._prev_right_time) < 100){
						continue;
					}
					self._pref_right_time = Date.now();
					key = ARROW.RIGHT;
				}

				if(key != null){
					if(self._touch_start_array[key] == true){
						continue;
					}else{
						arrow_list.push(key);
						self._touch_start_array[key] = true;
					}	
				}
			}
		}
		
		if(arrow_list.length > 0){
			window._game_control.HitByLaneAndTime(arrow_list);
		}
	};

	this.SmartDeviceTouchEnd = function(e){
		var beat_count = BEAT_TYPE_COUNT[self._game_type];
		var one_area_width = window.innerWidth / beat_count;
		var arrow_list = [];

		if(self._game_type == GAME_TYPE.PUMP){
			for(var i=0 ; i<e.originalEvent.changedTouches.length ; i++){
				var x = e.originalEvent.changedTouches[i].pageX;
				var key = null;

				if(0 < x && x <= one_area_width){
					key = ARROW.LEFT;
				}else if(one_area_width < x && x <= one_area_width*2){
					key = ARROW.DOWN;
				}else if(one_area_width*2 < x && x <= one_area_width*3){
					key = ARROW.CENTER;
				}else if(one_area_width*3 < x && x <= one_area_width*4){
					key = ARROW.UP;
				}else if(one_area_width*4 < x && x <= one_area_width*5){
					key = ARROW.RIGHT;
				}

				if(key != null){
					self._touch_start_array[key] = false;
					arrow_list.push(key);
				}
			}	
		}else{
			for(var i=0 ; i<e.originalEvent.changedTouches.length ; i++){
				var x = e.originalEvent.changedTouches[i].pageX;
				var key = null;

				if(0 < x && x <= one_area_width){
					key = ARROW.LEFT;
				}else if(one_area_width < x && x <= one_area_width*2){
					key = ARROW.DOWN;
				}else if(one_area_width*2 < x && x <= one_area_width*3){
					key = ARROW.UP;
				}else if(one_area_width*3 < x && x <= one_area_width*4){
					key = ARROW.RIGHT;
				}

				if(key != null){
					self._touch_start_array[key] = false;
					arrow_list.push(key);
				}
			}
		}
		
		if(arrow_list.length > 0){
			window._game_control.KeyUpProcess(arrow_list);
		}
	};

	this.PCMouseMove = function(event){
		var dot, eventDoc, doc, body, pageX, pageY;
		event = event || window.event; // IE-ism
		if (event.pageX == null && event.clientX != null) {
				eventDoc = (event.target && event.target.ownerDocument) || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY +
					(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
					(doc && doc.clientTop  || body && body.clientTop  || 0 );
		}

		self._position = {
				x: event.pageX - self._offset.left,
				y: event.pageY
		};

		if(self._position.x >= 0 && self._position.x <= self._screen_width){
			if(self._handle != null){
				self._handle.Move(self._position.x);
			}
		}
	};

	this.SmartDeviceTouchMove = function(e){
		e.preventDefault();
		for(var i=0 ; i<e.originalEvent.touches.length ; i++){
			self._position = {
				x: e.originalEvent.touches[i].pageX,
				y: e.originalEvent.touches[i].pageY
			};

			if(self._position.x >= 0 && self._position.x <= self._screen_width){
				if(self._handle != null){
					self._handle.Move(self._position.x);
				}
			}
		}
	};

	this.PCMouseDown = function(event){
		var dot, eventDoc, doc, body, pageX, pageY;
		event = event || window.event; // IE-ism
		if (event.pageX == null && event.clientX != null) {
				eventDoc = (event.target && event.target.ownerDocument) || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY +
					(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
					(doc && doc.clientTop  || body && body.clientTop  || 0 );
		}

		self._position = {
			x: event.pageX - self._offset.left,
			y: event.pageY - self._offset.top,
		};
		// console.log('position ' + self._position.x + ' ' + self._position.y);
		window._game_control.HitByXAndTime(self._position.x);
	};
}